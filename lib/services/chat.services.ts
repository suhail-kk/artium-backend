import Messages, { MessageAttributes } from "@/lib/schemas/messages";
import ConversationModel, {
  conversationsAttributes,
} from "@/lib/schemas/conversation";
import mongoose from "mongoose";
import messages from "@/lib/schemas/messages";
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
  participant_ids: Array<mongoose.Schema.Types.ObjectId>
) => {
  try {
    const conversation = await ConversationModel.findOne({
      participants: {
        $all: participant_ids,
      },
    })
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
        foreignField: "_id",
      })
      .exec();

    return conversation;
  } catch (error) {
    console.error(error, "error:Message service");
    return null;
  }
};

export const findMessageById = async (message_id: string) => {
  try {
    const messageDetails: any = await Messages.findOne({ _id: message_id })
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
      .exec();

    const { _id, reply_To, sender_id, ...rest } = messageDetails.toJSON();
    const parent = reply_To
      ? { id: reply_To._id, sender: reply_To.sender_id, ...reply_To }
      : null;

    return {
      id: _id,
      sender: sender_id,
      sender_id: sender_id.userId,
      parent,
      ...rest,
    };
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
  page: number,
  pageSize: number,
  searchValue: string
) => {
  try {
    const pipeline = [
      {
        $match: {
          participants: new mongoose.Types.ObjectId(userId),
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "participants",
          foreignField: "_id",
          as: "participantsData",
        },
      },
      {
        $unwind: {
          path: "$participantsData",
          preserveNullAndEmptyArrays: true,
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
        $match: {
          "participantsData.firstName": {
            $regex: new RegExp(searchValue, "i"),
          },
        },
      },
      {
        $project: {
          participants: "$participantsData",
          latestMessage: {
            $cond: {
              if: { $eq: ["$latestMessageData.isDeleted", true] },
              then: {}, // Empty object if isDeleted is true
              else: "$latestMessageData", // Otherwise, use the latestMessageData
            },
          },
          _id: 1,
          latestMessageCreatedAt: 1,
          conversation_name: 1,
          type: 1,
          unreadBy: 1,
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
      },
    ];
    // Execute the pipeline
    const result = await ConversationModel.aggregate(pipeline);
    return {
      conversations: result[0]?.documents || [],
      totalPages: result[0]?.total || 0,
    };
  } catch (error) {
    console.log(error);
  }
};

export const findConversationById = async (chat_id: string) => {
  try {
    return await ConversationModel.findById({ _id: chat_id })
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
      {
        $match: {
          $or: [
            {
              file_type: { $in: [null, "Text", "text", "offer"] },
              is_uploaded: false,
            },
            {
              file_type: { $in: ["video"] },
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
export const updateMessage = async (data: any, id: any) => {
  return await messages.updateOne(
    { _id: new mongoose.Types.ObjectId() },
    { $set: data }
  );
};
