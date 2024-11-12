
import { Request, Response } from "express";
import { S3_BUCKET } from "@/lib/config/s3.config";
import s3 from "@/lib/config/s3.config";
import pusherServer from "@/lib/config/pusher.config";
import mongoose from "mongoose";
import { s3GetURL } from '@/lib/utils/s3utils';
import s3paths from '@/lib/constants/s3paths';
import {
  findConversationById,
  updateMessage,
  getMessagesCount,
  getMessagesWithUser,
  createMessage,
  findConversationByParticipants,
  createParticipants,
  findMessageById,
  getRecentConversations,
  updateOffer,
  markAllMessagesRead,
  getParticipipantDetails,
} from "@/lib/services/chat.services";
import { sendSuccessResponse } from "@/lib/utils/responses/success.handler";
import { OFFER_STATUSES } from "@/lib/constants/constants";
import conversation, { IParticipant } from "@/lib/schemas/conversation";
import { BadRequestError } from "@/lib/utils/errors/errors";
import { createS3FileKey } from "@/lib/utils/fileHelper";
import { ParticipantRequestData } from "@/lib/types/chat.interface";

export const createChat = async (req: Request, res: Response) => {
  try {
    const body = req.body;
    const userId: string = req?.user?._id;
    const {
      message,
      type,
      socketId,
      channel,
      reply_id,
      index,
      file,
      chat_id,
      participants,
      offer,
      updateOfferId,
      campaignId,
    } = body;
    if (!chat_id && !participants) {
      return res.status(400).json("Please include the reciever");
    }
    if (participants && !campaignId) {
      return res.status(400).json("Invalid campaignId");
    }

    const participantsArray = participants?.map(
      (participant: ParticipantRequestData) => ({
        id: new mongoose.Types.ObjectId(participant?.id),
        type: participant?.type,
      })
    );

    if (updateOfferId) {
      await updateOffer(updateOfferId, "UPDATED");
    }
    let key;
    let presignedPUTURL = "";
    let uploaded = false;
    if (file) {
      const module = "chat";
      key = createS3FileKey(module, userId, file?.file_name);
      presignedPUTURL = s3.getSignedUrl("putObject", {
        Bucket: S3_BUCKET,
        Key: key, //path
        Expires: 10000, //time to expire in seconds,
        ContentType: file?.file_type,
      });

      uploaded = false;
    }
    let chatId = chat_id;
    //if no chat id provided
    if (!chat_id) {
      // check conversation using paticipant ids

      const conversation =
        await findConversationByParticipants(participantsArray);

      if (conversation) {
        chatId = conversation._id;
      } else {
        const data = {
          participants: participantsArray,
          name: null,
          type: "one-to-one",
          campaignId: campaignId,
        };
        const createdParticipants = await createParticipants(data);
        chatId = createdParticipants?.id;
      }
    }
    const createData = {
      chat_id: chatId,
      message,
      type,
      sender_id: new mongoose.Types.ObjectId(userId),
      file: key || "",
      file_type: type || null,
      reply_To: reply_id || null,
      is_uploaded: uploaded,
      video_url: null,
      stream_url: null,
      offer: offer,
      parentOfferId: updateOfferId || null,
    };

    const chatCreated = await createMessage(createData);

    const latestMessageId = chatCreated?.id;
    if (type !== "Video") {
      await conversation.findOneAndUpdate(
        { _id: chatId },
        {
          $set: {
            latestMessageId: latestMessageId,
          },
        },
        { upsert: true }
      );
    }

    const chatRes = await findMessageById(chatCreated?.id);
    if (!chatRes) {
      throw new Error("Chat message not found"); // or handle it appropriately
    }

    const sendData = {
      id: chatCreated?.id,
      message: chatCreated?.message,
      file_type: chatCreated?.file_type,
      seen: chatCreated?.seen,
      sender_id: chatRes.sender_id,
      sender: chatRes.sender,
      chat_id: chatId,
      parent: chatRes.parent || null,
      file: chatRes?.file,
      socketId,
      createdAt: chatCreated?.createdAt,
      thumbnail_url: chatRes.thumbnail_url || null,
      video_url: chatRes.video_url || null,
      stream_url: chatRes.stream_url || null,
      index: index ? index : 0,
    };
    res
      .status(201)
      .send({ url: presignedPUTURL, data: sendData, fileKey: key });

    //removing users deletedStatus

    //sending pusher events
    const conversationDetails = await findConversationById(chatId);

    const participantUserIds = conversationDetails?.participants?.map(
      (user: IParticipant) => {
        return user?.id;
      }
    );

    if (type !== "Video") {
      participantUserIds.map(async (user_id: string) => {
        await pusherServer
          .trigger(channel, "new_message", sendData)
          .catch((err: any) => console.log("pusher error🛑", err));
        let newChatChannelName = `new-chat-${user_id}`;
        await pusherServer
          .trigger(newChatChannelName, "new-contact", { userId: user_id })
          .catch((err: any) =>
            console.log({ location: "previous chat event trigger", err })
          );
        // }
        const unreadChannel = `server-${user_id}`;

        await pusherServer
          .trigger(unreadChannel, "unread_message", { unreadCount: 1 })
          .catch((err: any) => console.log("unread message event error", err));
      });
    }
  } catch (error) {
    console.log("ERROR at chat controller::", error);

    throw new BadRequestError("Something went wrong");
  }
};
export const listConversations = async (req: Request, res: Response) => {
  try {
    const userId = req?.user?._id;


    const page: number = Number(req.query.page) || 1;
    const size: number = Number(req.query.size) || 15;
    const query = (req.query.query as string) || undefined;
    const roleName: string = req?.user?.role?.name;
    let actualUserId: string;


    if (roleName === "Brand" && req?.user?.brandId) {
      actualUserId = req.user.brandId.toString();
    } else {
      actualUserId = userId;
    }
    let { conversations, totalPages } = await getRecentConversations(
      userId,
      actualUserId,
      page,
      size,
      query,
    );

    const updatedConversation = conversations?.map((conversation: any) => {
      if (conversation?.participants?.type === "Creator") {

        const profileImage = s3GetURL(s3paths.userProfileImage + conversation?.participants?.id)
        conversation.participants.profileImageOriginal = profileImage
      }
      if (conversation?.campaign?.logo_image_key) {
        conversation.campaignImageUrl = s3GetURL(conversation?.campaign?.logo_image_key)
      }
      return conversation
    })


    res.status(200).json({
      data: updatedConversation,
      meta: {
        page,
        size,
        totalPages: totalPages,
      },
    });
  } catch (error) {
    console.log("ERROR at chat controller::", error);
    throw new BadRequestError("Something went wrong");
  }
};
export const listMessages = async (req: Request, res: Response) => {
  try {
    const page: number = Number(req.query.page) || 1;
    const size: number = Number(req.query.size) || 30;
    const chat_id = (req.query.chat_id as string) || undefined;
    const body = req.body;

    const data = body?.data;
    const participants = data?.participants;
    if (!chat_id && !participants) {
      return res.status(400).json("Please include the reciever");
    }

    const participantsArray = participants?.map(
      (participant: ParticipantRequestData) => ({
        id: new mongoose.Types.ObjectId(participant?.id),
        type: participant?.type,
      })
    );

    let chatId = chat_id;

    if (!chat_id) {
      // check conversation using paticipant ids

      const conversation =
        await findConversationByParticipants(participantsArray);

      if (conversation) {
        chatId = conversation._id;
      }
    }
    if (!chatId) {
      throw new BadRequestError("invalid chat Id");
    }
    const chats = await getMessagesWithUser(chatId, page, size);
    const getTotalCount = await getMessagesCount(chatId);

    const totalPages = Math.ceil(getTotalCount / size);
    return res
      .status(200)
      .json({ data: chats, meta: { page, size, totalPages } });
  } catch (error) {
    console.log("ERROR at chat controller::", error);
    throw new BadRequestError("Something went wrong");
  }
};
export const updateChat = async (req: Request, res: Response) => {
  try {
    const { is_uploaded, channel, socketId } = req.body;
    const { id } = req.params;
    const body = req.body;
    const updateData = {
      is_uploaded,
      thumbnail_url: body?.thumbnailUrl,
      video_url: body?.videoUrl,
      stream_url: body?.streamUrl,
    };

    await updateMessage(updateData, id);
    const chatRes = await findMessageById(id);
    if (!chatRes) {
      return res.status(404).json({ message: "Message not found." }); // Handle the error appropriately
    }
    const latestMessageId = chatRes?.id;
    await conversation.findOneAndUpdate(
      { _id: chatRes?.chat_id },
      {
        $set: {
          latestMessageId: latestMessageId,
        },
      },
      { upsert: true }
    );
    const sendData = {
      id: chatRes?.id,
      message: chatRes?.message,
      file_type: chatRes?.file_type,
      seen: chatRes?.seen,
      sender_id: chatRes.sender,
      sender: chatRes.sender,
      chat_id: chatRes.chat_id,
      parent: chatRes.parent || null,
      file: chatRes?.file,
      socketId,
      createdAt: chatRes?.createdAt,
      thumbnail_url: chatRes.thumbnail_url || null,
      video_url: chatRes.video_url || null,
      stream_url: chatRes.stream_url || null,
    };
    const responseData = { ...sendData, ...updateData };
    res.send(responseData);

    await pusherServer
      .trigger(channel, "new_message", responseData)
      .catch((err: any) => console.log(err, "update chat controller"));
    // if (!checkHavePreviousChat) {
    let newChatChannelName = `new-chat-${chatRes?.chat_id}`;
    await pusherServer
      .trigger(newChatChannelName, "new-contact", {
        chatId: chatRes?.chat_id,
      })
      .catch((err: any) =>
        console.log({ location: "previous chat event trigger", err })
      );
    // }
    const unreadChannel = `server-${chatRes?.chat_id}`;
    await pusherServer
      .trigger(unreadChannel, "unread_message", { unreadCount: 1 })
      .catch((err: any) => console.log("unread message event error", err));
  } catch (error) {
    console.log("ERROR at chat controller::", error);
    throw new BadRequestError("Something went wrong");
  }
};

export const updateOfferStatus = async (req: Request, res: Response) => {
  try {
    const { messageId, status } = req?.body;
    const messageDetails = await findMessageById(messageId);
    if (!messageDetails) {
      throw new BadRequestError("Message not found");
    }
    if (!OFFER_STATUSES.includes(status)) {
      throw new BadRequestError("Invalid status option");
    }
    await updateOffer(messageId, status);
    sendSuccessResponse(res, "Offer status updated succesefully");
  } catch (error) {
    console.log("ERROR at chat controller::", error);
    throw new BadRequestError("Something went wrong");
  }
};

export const markAllRead = async (req: Request, res: Response) => {
  try {
    const userId = req?.user?._id;
    const chat_id = req?.query?.chat_id as string;
    if (!chat_id) {
      throw new BadRequestError("Invalid conversation id");
    }

    await markAllMessagesRead(chat_id, userId);
    sendSuccessResponse(res, "Message mark as read succesfully");
  } catch (error) {
    throw new BadRequestError("something went wrong");
  }
};
export const getParticipant = async (req: Request, res: Response) => {
  try {
    const userId = req.user._id;
    const chatId = req.query.chatId as string;
    // check conversation exist 
    const conversationDetails = await findConversationById(chatId);
    if (!conversationDetails) {
      throw new BadRequestError("Conversation not found");
    }
    //get participant
    const otherParticipant = await getParticipipantDetails(userId, chatId);

    sendSuccessResponse(res, 'Participant details fetched succesfully',
      otherParticipant,

    );
  } catch (error) {
    console.log("ERROR at chat controller", error);
  }
};
export const checkConversationExist = async (req: Request, res: Response) => {
  try {

    const id = req?.user?._id
    const roleName: string = req?.user?.role?.name;
    const userId = id
    const actualUserId = roleName === "Brand" ? req.user.brandId : userId;

    if (!actualUserId) {
      throw new Error("User ID is undefined");
    }
    const { participant, chatId } = req.body

    if (chatId) {
      const conversationDetails = await findConversationById(chatId);
      if (!conversationDetails) {
        throw new BadRequestError("Conversation not found");
      }
      const data = await getOtherParticipantData(conversationDetails?._id, actualUserId, roleName)
      const participant = data?.participant
      const campaign = data?.campaign
      if (participant?.type === "Creator") {
        const profileImage = s3GetURL(s3paths.userProfileImage + participant?.id)
        data.participant.profileImageOriginal = profileImage
      }
      if (campaign?.logo_image_key) {
        data.campaign.campaignImageUrl = s3GetURL(campaign?.logo_image_key)
      }
      return sendSuccessResponse(res, 'Participant details fetched succesfully',
        data,)

    }
    // Create participants array
    const participantsArray = [
      { id: actualUserId, type: roleName },
      { id: new mongoose.Types.ObjectId(participant?.id), type: participant?.role }
    ];
    const conversation = await findConversationByParticipants(participantsArray)

    if (conversation) {
      const data = await getOtherParticipantData(conversation?._id, actualUserId, roleName)
      const participant = data?.participant
      const campaign = data?.campaign
      if (participant?.type === "Creator") {
        const profileImage = s3GetURL(s3paths.userProfileImage + participant?.id)
        data.participant.profileImageOriginal = profileImage
      }
      if (campaign?.logo_image_key) {
        data.campaign.campaignImageUrl = s3GetURL(campaign?.logo_image_key)
      }

      return sendSuccessResponse(res, 'Participant details fetched succesfully',
        data,)
    }
    else {
      const newParticipant = await getNewParticipant(participant?.id)
      const participantData = newParticipant?.participant
      const campaign = newParticipant?.campaign
      if (participant?.type === "Creator") {
        const profileImage = s3GetURL(s3paths.userProfileImage + participantData?.id)
        newParticipant.participant.profileImageOriginal = profileImage
      }
      if (campaign?.logo_image_key) {
        newParticipant.campaign.campaignImageUrl = s3GetURL(campaign?.logo_image_key)
      }
      return sendSuccessResponse(res, 'Participant details fetched succesfully',
        newParticipant,)
    }

  } catch (error) {
    console.log(error);

  }
}