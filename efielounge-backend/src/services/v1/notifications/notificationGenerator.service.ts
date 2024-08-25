import { Types } from "mongoose";
import Notification from "../../../models/notifications.model";

export class NotificationGenerator {
  static async createNotification(notification: any): Promise<any> {
    try {
      console.log("Creating new notification ");
      notification.recordId = notification.recordId;
      const newNotification = await Notification.create(notification);
      return { newNotification, notification };
    } catch (error) {
      throw error;
    }
  }
}
