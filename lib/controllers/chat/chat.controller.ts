import { v4 as uuidv4 } from "uuid";
import { S3_BUCKET } from "@/lib/config/s3.config";
import s3 from "@/lib/config/s3.config";
import pusherServer from "@/lib/config/pusher.config";
import mongoose from "mongoose";
import {
  findConversationById,
  updateMessage,
  getMessagesCount,
  getMessagesWithUser,
  createMessage,
  findConversationByParticipants,
  findParticipant,
  createParticipants,
  removeUsersFromDeletedBy,
  findMessageById,
  getRecentConversations,
} from "@/lib/services/chat.services";
import conversation from "@/lib/schemas/conversation";
import { BadRequestError } from "@/lib/utils/errors/errors";
import userServices from "@/lib/services/user.services";
export const createChat = async (req: any, res: any) => {
  try {
    const body = req.body;
    const data = JSON.parse(body.data);
    const userId: any = req?.user?._id;
    const {
      message,
      type,
      socketId,
      channel,
      reply_id,
      index,
      file,
      chat_type,
      chat_id,
      participant_ids,
      offer,
    } = data;
    if (!chat_id && !participant_ids) {
      return res.status(400).json("Please include the reciever");
    }
    const participantIds = participant_ids?.map((participant: any) => {
      return new mongoose.Types.ObjectId(participant);
    });

    const upload_file: any = req.file;
    let key;
    let presignedPUTURL = "";
    let uploaded = false;
    const uuid = uuidv4();
    if (file) {
      key = `chat/${userId}/${uuid}${file?.file_name}`;

      const compressKey = `optimizedV2/chat/${userId}/${uuid}${file?.file_name}`;
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
      const participants = [...participantIds, userId];

      const conversation: any =
        await findConversationByParticipants(participants);

      if (conversation) {
        chatId = conversation._id;
      } else {
        const data = {
          participants: participants,
          name: null,
          type: "one-to-one",
        };
        const createdParticipants: any = await createParticipants(data);
        chatId = createdParticipants?.id;
      }
    }
    const createData = {
      chat_id: chatId,
      message,
      type,
      sender_id: userId,
      file: key || "",
      file_type: type || null,
      reply_To: reply_id || null,
      is_uploaded: uploaded,
      video_url: null,
      stream_url: null,
      offer: offer,
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

    const chatRes: any = await findMessageById(chatCreated?.id);

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
      url: chatRes.url,
      compressed_url: chatRes.compressed_url,
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
    const participants: any = await findConversationById(chatId);

    const participantUserIds = participants?.participants?.map((user: any) => {
      return user._id;
    });

    if (type !== "Video") {
      participantUserIds.map(async (user_id: any) => {
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
    throw new BadRequestError("Something went wrong");
  }
};
export const listConversations = async (req: any, res: any) => {
  try {
    const userId = req?.user?._id;

    const page: number = Number(req.query.page) || 1;
    const size: number = Number(req.query.size) || 15;
    const query: any = req.query.query || "";
    let { conversations, totalPages }: any = await getRecentConversations(
      userId,
      page,
      size,
      query
    );
    res.status(200).json({
      data: conversations,
      meta: {
        page,
        size,
        totalPages: totalPages,
      },
    });
  } catch (error) {
    throw new BadRequestError("Something went wrong");
  }
};
export const listMessages = async (req: any, res: any) => {
  try {
    const userId = req.user?._id;
    const page: number = Number(req.query.page) || 1;
    const size: number = Number(req.query.size) || 30;
    const chat_id: any = req.query?.chat_id;
    const participant_id: any = req.query?.participant_id;

    let chatId = chat_id;

    if (!chat_id) {
      const participants = [participant_id, userId];
      const conversation = await findConversationByParticipants(participants);

      if (!conversation) {
        const data = {
          participants: participants,
          name: null,
          type: "one-to-one",
        };
        const createdParticipants = await createParticipants(data);
        chatId = createdParticipants._id;
      } else {
        chatId = conversation._id;
      }
    }
    const chats = await getMessagesWithUser(chatId, page, size);
    const getTotalCount: any = await getMessagesCount(chatId);

    const totalPages = Math.ceil(getTotalCount / size);
    return res
      .status(200)
      .json({ data: chats, meta: { page, size, totalPages } });
  } catch (error) {
    throw new BadRequestError("Something went wrong");
  }
};
export const updateChat = async (req: any, res: any) => {
  try {
    const { is_uploaded, channel, socketId, index } = req.body;
    const { id }: any = req.params;
    const body = req.body;
    const updateData = {
      is_uploaded,
      thumbnail_url: body?.thumbnailUrl,
      video_url: body?.videoUrl,
      stream_url: body?.streamUrl,
    };

    await updateMessage(updateData, id);
    const chatRes: any = await findMessageById(id);
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
      sender_id: chatRes.sender_id,
      sender: chatRes.sender,
      chat_id: chatRes.chat_id,
      parent: chatRes.parent || null,
      file: chatRes?.file,
      socketId,
      createdAt: chatRes?.createdAt,
      url: chatRes.url,
      compressed_url: chatRes.compressed_url,
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
    throw new BadRequestError("Somthing went wrong");
  }
};
