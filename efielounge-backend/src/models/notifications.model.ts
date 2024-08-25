import mongoose from "mongoose";
const notificationStates = ["PENDING", "DELIVERED", "READ"];

export enum Priority {
  LOW = "low",
  HIGH = "high",
  MEDIUM = "medium",
  URGENT = "urgent",
}

export enum NotificationType {
  PUSH = "Push",
  SOCKET = "Socket",
}

const Schema = mongoose.Schema;

const NotificationSchema = new Schema({
  recordId: {
    type: String,
    required: false,
  },
  actor: {
    type: Schema.Types.ObjectId,
    ref: "accounts",
    required: false,
  },
  message: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    required: true,
    ddefault: notificationStates[0],
    enum: notificationStates,
  },
  title: {
    type: String,
    required: false,
  },
  notificationClass: {
    type: String,
    required: false,
    default: "activity",
  },
  priority: {
    type: String,
    enum: Priority,
    default: Priority.HIGH,
  },
  notificationType: {
    type: String,
    enum: NotificationType,
    default: NotificationType.SOCKET,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Notification = mongoose.model("Notification", NotificationSchema);
export default Notification;
