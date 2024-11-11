import Messages, { MessageAttributes } from "@/lib/schemas/messages";
import ConversationModel, {conversationsAttributes
} from "@/lib/schemas/conversation";
import mongoose from "mongoose";
import messages from "@/lib/schemas/messages";

import { s3GetURL } from '../utils/s3utils';
import s3paths from '../constants/s3paths';
import user from "../schemas/user";


export const createMessage = async (data: MessageAttributes) => {
  return await Messages.create(data);
};
export const findParticipant = async (chat_id: string) => {
  return await ConversationModel.findOne({
    _id: chat_id,
  }).populate("participants");
};
export const createParticipants = async (data: conversationsAttributes) => {
  return await ConversationModel.create(data);
};
export const findConversationByParticipants = async (
  participant_ids: any
) => {

  try {
    const pipeline=[
      {
        $match: {
          participants: {
            $all: participant_ids.map((participant:any) => ({
              $elemMatch: {
                id: participant.id,
                type: participant.type
              }
            }))
          }
        }
      }
    ]

    
    const conversation = await ConversationModel.aggregate(pipeline);

    // Return the first conversation if any
    return conversation.length > 0 ? conversation[0] : null;

  } catch (error) {
    console.error(error, "error:Message service");
    return null;
  }
};

export const findMessageById = async (message_id: string) => {
  try {
    const messageDetails:  MessageAttributes = await Messages.findOne({ _id: message_id })
      .populate({
        path: "sender_id",
        model: "users",
        foreignField: "_id",
        options: { as: "sender" },
      })
      .populate({
        path: "reply_To",
        options: { as: "parent" },
        populate: {
          path: "sender_id",
          model: "users",
          foreignField: "_id",
        },
      })
      .lean() 
      .exec();
  
    const { _id, reply_To, sender_id, ...rest } = messageDetails
    const parent = reply_To
      ? { id: reply_To._id, sender: reply_To.sender_id, ...reply_To }
      : null;

    return {
      id: _id,
      sender: sender_id,
      sender_id: reply_To?.sender_id,
      parent,
      ...rest,
    } 
  } catch (error) {
    console.log(error, "error");
  }
};
export const removeUsersFromDeletedBy = async (chatId: string) => {
  try {
    await ConversationModel.updateOne(
      { _id: chatId },
      { $set: { "deletedBy.$[].deletedStatus": false } }
    );
  } catch (error) {
    console.log(error, "error");
  }
};
export const getUnreadCount = async (chatId: string, userId: string) => {
  const unreadCount = await Messages.countDocuments({
    chat_id: chatId,
    sender_id: { $ne: userId },
    seen: false,
  });
  return unreadCount > 0 ? true : false;
};
export const getRecentConversations = async (
  userId: string,
  actualUserId:string,
  page: number,
  pageSize: number,
  searchValue: string|undefined
) => {

  try {

    const pipeline: any = [
      {
        $match: {
          participants: {
            $elemMatch: {
              id:  new mongoose.Types.ObjectId(actualUserId),
            },
          },
        },
      },
    
  {
    $lookup: {
      from: "users",
      localField: "participants.id",
      foreignField: "_id",
      as: "userParticipants",
    },
  },

  {
    $lookup: {
      from: "brands",
      localField: "participants.id",
      foreignField: "_id",
      as: "brandParticipants",
    },
  },
  {
    $lookup: {
      from: "messages",
      let: { chatId: "$_id" },
      pipeline: [
        {
          $match: {
            $expr: {
              $and: [
                { $eq: ["$chat_id", "$$chatId"] },
                { $eq: ["$seen", false] },
                { $ne: ["$sender_id", new mongoose.Types.ObjectId(userId)] },
              ],
            },
          },
        },
        { $count: "unreadCount" },
      ],
      as: "unreadMessages",
    },
  },
  {
    $addFields: {
      unreadCount: { $ifNull: [{ $arrayElemAt: ["$unreadMessages.unreadCount", 0] }, 0] }
    },
  },
  {
    $addFields: {
      participantsData: {
        $map: {
          input: {
            $filter: {
              input: "$participants",
              as: "participant",
              cond: { $ne: ["$$participant.id", new mongoose.Types.ObjectId(actualUserId)] },
            },
          },
          as: "participant",
          in: {
            $mergeObjects: [
              "$$participant",
              {
                $arrayElemAt: [
                  {
                    $filter: {
                      input: {
                        $cond: {
                          if: { $eq: ["$$participant.type", "Brand"] },
                          then: "$brandParticipants",
                          else: "$userParticipants",
                        },
                      },
                      as: "details",
                      cond: { $eq: ["$$details._id", "$$participant.id"] },
                    },
                  },
                  0,
                ],
              },
              {

                  unreadCount: { $arrayElemAt: ["$unreadMessages.unreadCount", 0] 
                },
              },
            ],
          },
        },
      },
    },
  },
      {
        $lookup: {
          from: "messages",
          localField: "latestMessageId",
          foreignField: "_id",
          as: "latestMessageData",
        },
      },
      {
        $unwind: {
          path: "$latestMessageData",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "campaigns",
          localField: "campaignId",
          foreignField: "_id",
          as: "campaign",
        },
      },
      {
        $unwind:{
          path:'$participantsData',
          preserveNullAndEmptyArrays: true,
        }
      },
  
    {
        $unwind:{
          path:'$campaign',
          preserveNullAndEmptyArrays: true,
        }
      },
    ];

    //  search 
    if (searchValue) {
      pipeline.push({
        
          $match: {
            $or: [
              { "participantsData.firstName": { $regex: new RegExp(searchValue, "i") } },
              { "participantsData.title": { $regex: new RegExp(searchValue, "i") } },
            ],
          },

      },
      );
    }

    //  projection, grouping, and pagination stages
    pipeline.push(
      {
        $project: {
          participants: "$participantsData",
          campaign:"$campaign",
          unreadCount:'$unreadCount',
          latestMessage: {
            $cond: {
              if: { $eq: ["$latestMessageData.isDeleted", true] },
              then: {}, 
              else: "$latestMessageData",
            },
          },
          _id: 1,
          latestMessageCreatedAt: 1,
          type: 1,
          unreadBy: 1,
        },
      },
      {
        $sort: {
          latestMessageCreatedAt: -1, 
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          documents: { $push: "$$ROOT" },
        },
      },
      {
        $project: {
          _id: 0,
          total: 1,
          documents: {
            $slice: ["$documents", (page - 1) * pageSize, pageSize],
          },
        },
      }
    );

    // Execution 

    
    const result = await ConversationModel.aggregate(pipeline);
    return {
      conversations: result[0]?.documents || [],
      totalPages: Math.ceil((result[0]?.total || 0) / pageSize),
    };

    
  } catch (error) {
    console.log("Error in getRecentConversations:", error);
    throw new Error("Failed to fetch recent conversations.");
  }
};


export const findConversationById = async (chat_id: string) => {
  try {
    return await ConversationModel.findOne({ _id: new mongoose.Types.ObjectId(chat_id) })
      .populate({
        path: "participants",
        model: "users",
        localField: "participants",
        foreignField: "_id",
      })
      .populate({
        path: "latestMessageId",
        model: "messages",
        localField: "latestMessageId",
      })
      .populate({
        path: "latestMessageId",
        model: "messages",
        localField: "latestMessageId",
        foreignField: "_id",
      });
  } catch (error) {
    console.log(error);
  }
};

export const getMessagesWithUser = async (
  chatId: string,
  page: number,
  size: number
) => {
  try {
    const chatObjectId = new mongoose.Types.ObjectId(chatId);
    const pipeline: any[] = [
      {
        $match: {
          chat_id: chatObjectId,
          isDeleted: false,
        },
      },

      { $sort: { createdAt: -1 } },
      {
        $lookup: {
          from: "users",
          localField: "sender_id",
          foreignField: "_id",
          as: "sender",
        },
      },
      {
        $lookup: {
          from: "roles", 
          localField: "sender.role",
          foreignField: "_id",
          as: "roleDetails",
        },
      },
      {
        $lookup:{
          from: "conversations", 
          localField: "chat_id",
          foreignField: "_id",
          as: "conversation",
        }
      },
      { $unwind: { path: "$conversation", preserveNullAndEmptyArrays: true } },
      { $unwind: { path: "$roleDetails", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "messages",
          localField: "reply_To",
          foreignField: "_id",
          as: "parent",
          pipeline: [
            {
              $lookup: {
                from: "users",
                localField: "sender_id",
                foreignField: "userId",
                as: "sender",
              },
            },
          ],
        },
      },
      { $unwind: { path: "$sender", preserveNullAndEmptyArrays: true } },
      { $unwind: { path: "$parent", preserveNullAndEmptyArrays: true } },
      { $unwind: { path: "$parent.sender", preserveNullAndEmptyArrays: true } },
      
        // {
        //   $addFields: {
        //     senderImage: {
        //       $cond: [
        //         { $eq: ['$roleDetails.name', 'Creator'] },
        //         {
        //           $concat: [
        //             s3GetURL(s3paths.userProfileImage),
        //             { $toString: "$sender._id" } 
        //           ]
        //         },
        //         {
        //           $concat: [
        //             s3GetURL(s3paths.campaignLogoImage),
        //             { $toString: "$conversation.campaignId" } 
        //           ]
        //         }
        //       ]
        //     }
        //   }
        // },
      {
        $match: {
          $or: [
            {
              file_type: { $in: [null, "Text", "Offer"] },
              is_uploaded: false,
            },
            {
              file_type: { $in: ["Video"] },
              is_uploaded: true,
            },
          ],
        },
      },
      {
        $addFields: {
          id: "$_id",
        },
      },
      {
        $project: {
          parentMessages: 0,
          parentSenders: 0,
          roleDetails:0
        },
      },
      {
        $skip: (page - 1) * size,
      },
      {
        $limit: size,
      },
    ];

    
    const messagesWithParentField = await messages.aggregate(pipeline);
    return messagesWithParentField;
  } catch (error) {
    console.error(error);
  }
};

export const getMessagesCount = async (chatId: string) => {
  try {
    const pipeline: any[] = [
      {
        $match: {
          chat_id: new mongoose.Types.ObjectId(chatId),
          isDeleted: false,
        },
      },
      {
        $match: {
          $or: [
            {
              file_type: { $in: ["Text", "Offer"] },
              is_uploaded: false,
            },
            {
              file_type: { $in: ["Video"] },
              is_uploaded: true,
            },
          ],
        },
      },
    ];

    const count = await messages.aggregate(pipeline).count("count").exec();
    return count.length > 0 ? count[0].count : 0;
  } catch (error) {
    console.error("Error while getting message count:", error);
    return 0;
  }
};
export const updateMessage = async (data: MessageAttributes, id: string) => {
  return await messages.updateOne(
    { _id: new mongoose.Types.ObjectId(id) },
    { $set: data }
  );
};
export const updateOffer=async(id:string,status:string)=>{
  return await messages.updateOne({_id:new mongoose.Types.ObjectId(id)},{
    $set:{"offer.status":status}
  })
}
export const getUnreadMessagesCount = async (chatId: string,userId:string) => {
  try {
    const pipeline = [
      {
        $match: {
          "chat_id": new mongoose.Types.ObjectId(chatId),
          "seen": false,
          "sender_id":{$ne:new mongoose.Types.ObjectId(userId)}
        },
      },
      {
        $count: "unreadCount",
      },
    ];

    const result = await Messages.aggregate(pipeline);
    return result[0]?.unreadCount || 0;
  } catch (error) {
    console.error("Error fetching unread messages count:", error);
    throw new Error("Failed to fetch unread messages count.");
  }
};

export const markAllMessagesRead = async (chatId:string,userId:string) => {

    return await messages.updateMany(
      {
        chat_id: new mongoose.Types.ObjectId(chatId),
        seen: false,
        sender_id: { $ne: new mongoose.Types.ObjectId(userId) },
      },
      { $set: { seen: true } }
    );

  }
  export const getParticipipantDetails = async (
    userId: string,
    chatId:string
  ) => {
  
    try {
  
      //aggrgation pipeline
      const pipeline: any = [
        {
          $match: {
            _id:new mongoose.Types.ObjectId(chatId)
          },
        },
      
    {
      $lookup: {
        from: "users",
        localField: "participants.id",
        foreignField: "_id",
        as: "userParticipants",
      },
    },
  
    {
      $lookup: {
        from: "brands",
        localField: "participants.id",
        foreignField: "_id",
        as: "brandParticipants",
      },
    },
    {
      $addFields: {
        participantsData: {
          $map: {
            input: {
              $filter: {
                input: "$participants",
                as: "participant",
                cond: { $ne: ["$$participant.id", new mongoose.Types.ObjectId(userId)] },
              },
            },
            as: "participant",

            in: {
              $mergeObjects: [
                "$$participant",
                {
                  $arrayElemAt: [
                    {
                      $filter: {
                        input: {
                          $cond: {
                            if: { $eq: ["$$participant.type", "Brand"] },
                            then: "$brandParticipants",
                            else: "$userParticipants",
                          },
                        },
                        as: "details",
                        cond: { $eq: ["$$details._id", "$$participant.id"] },
                      },
                    },
                    0,
                  ],
                },
                {
                  profileImageOriginal: {
                    $cond: {
                      if: { $eq: ["$$participant.type", "Creator"] }, 
                      then: {
                        $concat: [
                          s3GetURL(s3paths.userProfileImage), 
                          { $toString: "$$participant.id" }
                        ]
                      },
                      else: null,
                    },
                  },
                }
               
              ],
            },
          },
        },
      },
    },
    {
      $lookup: {
        from: "campaigns",
        localField: "campaignId",
        foreignField: "_id",
        as: "campaign",
      },
    },
  {
      $unwind:{
        path:'$campaign',
        preserveNullAndEmptyArrays: true,
      }
    },
    
    {
      $addFields: {
        "campaign.campaignImageUrl": {
          $concat: [s3GetURL(s3paths.campaignLogoImage), { $toString: "$campaignId" }]
        }
      }
    }
     ];

  
      //  projection
      pipeline.push(
        {
          $project: {
            participants: "$participantsData",
            campaign:'$campaign',
            _id: 1,
            type: 1,
          },
        }
      );
  
      // Execution 

      
      const result = await ConversationModel.aggregate(pipeline);
      return result.length > 0 ? result[0] : null;
  
      
    } catch (error) {
      console.log("Error in getRecentConversations:", error);
      throw new Error("Failed to fetch recent conversations.");
    }
  };
  
  
  export const getOtherParticipantData=async(chatId:string,id:string|mongoose.Schema.Types.ObjectId,type:string)=>{
    
    const pipeline=[
          {
            $match:{
            _id: new mongoose.Types.ObjectId(chatId)
            }
          },
          {
            $lookup:{
              from:'users',
              localField:'participants.id',
              foreignField:'_id',
              as:'userParticipants'
            }
          },
          {
            $lookup:{
              from:'brands',
              localField:'participants.id',
              foreignField:'_id',
              as:'brandParticipants'
            }
          },
          {
            $addFields: {
              participantsData: {
                $map: {
                  input: {
                    $filter: {
                      input: "$participants",
                      as: "participant",
                      cond: { $ne: ["$$participant.id", id] },
                    },
                  },
                  as: "participant",
                  in: {
                    $mergeObjects: [
                      "$$participant",
                      {
                        $arrayElemAt: [
                          {
                            $filter: {
                              input: {
                                $cond: {
                                  if: { $eq: ["$$participant.type", "Brand"] },
                                  then: "$brandParticipants",
                                  else: "$userParticipants",
                                },
                              },
                              as: "details",
                              cond: { $eq: ["$$details._id", "$$participant.id"] },
                            },
                          },
                          0,
                        ],
                      },
                      {
                        profileImageOriginal: {
                          $cond: {
                            if: { $eq: ["$$participant.type", "Creator"] }, 
                            then: {
                              $concat: [
                                s3GetURL(s3paths.userProfileImage), 
                                { $toString: "$$participant.id" } 
                              ]
                            },
                            else: null,
                          },
                        },
                      },
                    ],
                  },
                },
              },
            },
          },
          {
            $lookup: {
              from: "campaigns",
              localField: "campaignId",
              foreignField: "_id",
              as: "campaign",
            },
          },
          {
            $addFields: {
              "campaign.campaignImageUrl": {
                $concat: [s3GetURL(s3paths.campaignLogoImage), { $toString: "$campaignId" }]
              }
            }
          },
          {
            $unwind: {
              path: '$participantsData',
              preserveNullAndEmptyArrays: true,
            }
          },
          {
            $unwind: {
              path: '$campaign',
              preserveNullAndEmptyArrays: true,
            }
          },
          {
            $project: {
              participants: "$participantsData",
              campaign: "$campaign",
              _id: 1,
              chat_id:'$_id'
            },
          },
          {
            $group: {
              _id: "$_id",
              participant: { $first: "$participants" }, 
              campaign: { $first: "$campaign" } ,
              chat_id: { $first: "$chat_id" },
            }
          },
          {
            $project: {
              _id: 1,
              participant: 1,
              campaign: 1,
              chat_id:1
            }
          }
    ]

    
    const result = await ConversationModel.aggregate(pipeline);
    
return result.length > 0 ? result[0] : null;
  }

export const getNewParticipant=async(userId:string)=>{
  const pipeline = [
    {
      $match: {
        _id: new mongoose.Types.ObjectId(userId),
      },
    },
    {
      $addFields: {
          profileImageOriginal: {
            $concat: [
              s3GetURL(s3paths.userProfileImage),
              { $toString: "$_id" },
            ],
          },
          // Include other fields as needed from userDetails

      },
    },
  ];


  const result = await user.aggregate(pipeline);
  return result.length > 0 ? result[0] : null;
}