import { Socket } from "socket.io";
import { getUserProfileSockets } from "../sockets/socketsStore.service";
import {
  authenticateChatToken,
  getChatSubscriber,
} from "../../../middlewares/chatAuth";
import Chatroom from "../../../models/Chats/chatroom.model";
import Chatmessage from "../../../models/Chats/chatmessages.model";
import Xrequest from "../../../interfaces/extensions.interface";
import utils from "../../../helpers/misc";
import Accounts from "../../../models/Accounts/accounts.model";
import { NotificationService } from "../notifications/notification.service";

function findObjectById(arr: any, id: string) {
  return arr.find((chat: any) => chat?.room.toString() === id?.toString());
}

function isValidHexString(str: string) {
  return /^[0-9A-Fa-f]+$/.test(str);
}

interface Iattachment {
  type?: string;
  url?: string;
}

export class RtmRoomService {
  public static async joinChatRoomAuth(data: any) {
    try {
      const { token, uid, room } = data;
      const getUserSocket: Socket = getUserProfileSockets(uid)!;
      if (!getUserSocket) {
        return {
          status: false,
          message: "User has not connected to the socket service",
        };
      }
      const rtmRoom = await Chatroom.findOne({ _id: room });
      if (!rtmRoom) {
        return {
          status: false,
          message: "Chat does not exist",
        };
      }
      const chatAuthStatus = await authenticateChatToken();
      return chatAuthStatus;
    } catch (error: any) {
      return {
        status: false,
        message: "Something went wrong while authenticating room join request",
      };
    }
  }

  public static async sendMessage(
    req: Xrequest,
    attachments: Iattachment[] = []
  ) {
    try {
      const data = req.body;
      const { message, publisher, room, token } = data;
      const socket: Socket = getUserProfileSockets(publisher)!;
      const chatAuthStatus = await authenticateChatToken();
      if (chatAuthStatus?.status) {
        data.subscriber = getChatSubscriber(publisher, token);
        data.createdAt = new Date();
      }

      console.log("New message data ", data);
      let actor;
      const chatMessage = await Chatmessage.create(data);
      const _message: any = await chatMessage.populate("publisher");
      const roomObj = await Chatroom.findOne({ _id: room })!;
      if (socket) {
        let account: any;
        let notificationData: any;
        socket.to(room).emit("message", JSON.stringify(_message));

        try {
          account = await Accounts.findOne({ _id: publisher });
        } catch {
          account = null;
        }

        if (!account) {
          actor = data.subscriber;
        } else {
          actor = account?._id;
        }
        notificationData = {
          actorIdentity: actor,
          recordId: chatMessage._id,
          message: message,
          identity: _message.publisher.firstName || publisher,
        };

        let notification: any = await NotificationService.buildNotification(
          notificationData,
          "You have a new message"
        );

        notification = JSON.parse(JSON.stringify(notification));

        notification.chatPreview = await RtmRoomService.getChatPreview(
          actor,
          roomObj,
          message
        );
        notification.chatPreview.account = account;
        notification.chatPreview.messages = chatMessage;
        notification.chatPreview.unreadChatsCount =
          await Chatmessage.countDocuments({
            room: roomObj!._id,
            isAdminRead: false,
            subscriber: data.subscriber,
          });

        await NotificationService.sendNotificationToUser(
          data.subscriber,
          notification
        );
      }

      return {
        status: true,
        message: "Message was sent",
        chatMessage,
        publisher,
      };
    } catch (error: any) {
      throw error;
    }
  }

  public static async markChatsAsRead(roomId: string) {
    try {
      const unreadChats = await Chatmessage.find({
        room: roomId,
        isAdminRead: false,
      });
      for (let unreadChat of unreadChats) {
        unreadChat.isAdminRead = true;
        await unreadChat.save();
      }
      return {
        status: true,
        message: "",
        data: true,
        code: 200,
      };
    } catch (error: any) {
      throw error;
    }
  }

  public static async getChatPreview(
    actor: string,
    room: any,
    message: string
  ) {
    try {
      room.messages = message;
      const account = await Accounts.findOne({ _id: actor });
      if (!account) {
      }
      if (account && account.role !== "ADMIN") {
        room.account = account;
      }
      return JSON.parse(JSON.stringify(room));
    } catch (error) {
      return null;
    }
  }

  public static async fetchRoomMesages(req: Xrequest) {
    try {
      let filter: any = {};
      await utils.delay(3000);
      const page = Number((req.query.page! as string) || 1);
      const limit = Number((req.query.limit! as string) || 10);
      const roomId: any = req.query.roomId;
      if (!roomId) {
        return { success: false, message: "No chat identity provided" };
      }

      const chatAuthStatus = await authenticateChatToken();

      if (!chatAuthStatus?.status) {
        return {
          status: false,
          message: "You are not a participant in this chat",
        };
      }

      filter = RtmRoomService.buildRoomChatFilter(req);
      console.log("filter ", filter);
      const skip = (page - 1) * limit;

      const options = { skip: skip, limit: limit, sort: {} };

      const [messages, total]: any = await Promise.all([
        Chatmessage.find(filter, null, options)
          .select({ token: 0 })
          .sort({ createdAt: -1 }),
        Chatmessage.countDocuments(filter),
      ]);

      const totalPages = Math.ceil(total / limit);
      return {
        status: true,
        data: messages,
        total: total,
        totalPages: totalPages,
        currentPage: page,
        limit: limit,
        message: "Messages were fetched successfully",
        code: 200,
      };
    } catch (error: any) {
      throw error;
    }
  }

  public static async fetchRooms(req: Xrequest) {
    try {
      let filter: any = {};
      const page = Number((req.query.page! as string) || 1);
      const limit = Number((req.query.limit! as string) || 10);

      filter = {
        $or: [{ publisher: req.accountId }, { subscriber: req.accountId }],
      };
      const skip = (page - 1) * limit;

      const options = { skip: skip, limit: limit, sort: {} };

      const [rooms, total]: any = await Promise.all([
        Chatroom.find(filter, null, options)
          .select("_id")
          .sort({ createdAt: -1 }),
        Chatroom.countDocuments(filter),
      ]);

      const totalPages = Math.ceil(total / limit);
      return {
        status: true,
        data: rooms,
        total: total,
        totalPages: totalPages,
        currentPage: page,
        limit: limit,
        message: "Rooms were fetched successfully",
        code: 200,
      };
    } catch (error: any) {
      throw error;
    }
  }

  public static async fetchChatsPreview(req: Xrequest) {
    try {
      const page = Number(req.query.page || 1);
      const limit = Number(req.query.limit || 10);
      const skip = (page - 1) * limit;

      const filter = RtmRoomService.buildFilter(req);
      const options = { skip, limit, sort: { createdAt: -1 } };
      const admin = req.accountId!;
      let [rooms, total] = await Promise.all([
        Chatroom.find({
          $or: [{ publisher: admin }, { subscriber: admin }],
        }).sort({ createdAt: -1 }),
        Chatroom.countDocuments(filter),
      ]);
      let roomsClone: any = JSON.parse(JSON.stringify(rooms));

      const getOtherUser = (msg: any, userId: string) => {
        if (msg.publisher === userId) {
          return msg.subscriber;
        } else {
          return msg.publisher;
        }
      };

      for (let room of roomsClone) {
        try {
          const lastMessage = await Chatmessage.findOne({
            room: room._id,
          }).sort({ createdAt: -1 });
          room.messages = lastMessage;
          const otherUser = getOtherUser(lastMessage, admin);
          try {
            const account = await Accounts.findOne({ _id: otherUser });
            console.log("account ", account);
            if (!account) {
            }
            if (account && account.role !== "ADMIN") {
              room.account = account;
            }
          } catch {}

          console.log("Unread filter ", {
            room: room._id,
            isAdminRead: false,
            subscriber: admin,
          });
          room.unreadChatsCount = await Chatmessage.countDocuments({
            room: room._id,
            isAdminRead: false,
            subscriber: admin,
          });
        } catch (error) {
          console.error("Error fetching last message:", error);
        }
      }

      // Organize messages into previews by user
      const previewsAll: any = roomsClone; //await RtmRoomService.organizeChatByUser(req, messages, true);
      const paginatedPreviews = previewsAll.slice(skip, skip + limit);
      const totalPages = Math.ceil(previewsAll.length / limit);

      console.log("rooms ===> ", roomsClone);

      return {
        status: true,
        data: paginatedPreviews,
        total: previewsAll.length,
        totalPages,
        currentPage: page,
        limit,
        message: "Messages fetched successfully",
        code: 200,
      };
    } catch (error) {
      console.error("Error fetching chat previews:", error);
      throw error;
    }
  }

  private static buildFilter(req: Xrequest) {
    try {
      const uid = req.accountId! as string;
      const searchInChatText = req.query.q! as string;
      let filter: any = {
        $or: [{ publisher: uid }, { subscriber: uid }],
      };
      if (searchInChatText) {
        filter.$and = [
          {
            $or: [
              { message: { $regex: `.*${searchInChatText}.*`, $options: "i" } },
            ],
          },
        ];
      }
      return filter;
    } catch (error) {
      throw error;
    }
  }

  private static buildRoomChatFilter(req: Xrequest) {
    const roomId = req.query.roomId! as string;
    let filter: any = { room: roomId };
    return filter;
  }
}
