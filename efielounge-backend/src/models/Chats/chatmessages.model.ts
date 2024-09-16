import mongoose from "mongoose";
import { isReadable } from "stream";
const Schema = mongoose.Schema;

const ChatMessageSchema = new Schema({
  publisher: {
    type: Schema.Types.Mixed, // Allows ObjectId or String
    required: true,
  },
  subscriber: {
    type: Schema.Types.Mixed, // Allows ObjectId or String
    required: true,
  },
  type: {
    type: String,
    required: true,
    default: "text",
    enum: ["text", "image"],
  },
  message: {
    type: String,
    required: false,
  },
  room: {
    type: Schema.Types.ObjectId,
    ref: "chatroom",
    required: true,
  },
  isAdminRead: {
    type: Boolean,
    default: false,
  },
  isCustomerRead: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Chatmessage = mongoose.model(
  "chatmessage",
  ChatMessageSchema
);
export default Chatmessage;
