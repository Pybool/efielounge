
import express from "express";
import { decode, decodeExt, ensureAdmin } from "../../middlewares/jwt";
import chatController from "../../controllers/v1/chat.controller";

const chatRouter = express.Router();

chatRouter.get(
  "/get-chats",
  decodeExt,
  chatController.fetchChats
);

chatRouter.post(
  "/join-chatroom",
  decodeExt,
  chatController.joinChatRoomAuth
);

chatRouter.post(
  "/send-message",
  decodeExt,
  chatController.sendMessage
);

chatRouter.get(
  "/fetch-chats-preview",
  decode,
  // ensureAdmin,
  chatController.fetchChatsPreview
);

chatRouter.get(
  "/fetch-rooms",
  decode,
  ensureAdmin,
  chatController.fetchRooms
);


chatRouter.post(
  "/read-chats",
  decode,
  ensureAdmin,
  chatController.markChatsAsRead
);






export default chatRouter;
