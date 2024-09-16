import mongoose from "mongoose";
const Schema = mongoose.Schema;

const ChatroomSchema = new Schema({
  publisher: {
    type: String,
    required: true,
  },
  subscriber: {
    type: String,
    required: true,
  },
  token:{
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    required: false
  },
  updatedAt: {
    type: Date,
    required: false
  },
});

const Chatroom = mongoose.model("chatroom", ChatroomSchema);
export default Chatroom;
