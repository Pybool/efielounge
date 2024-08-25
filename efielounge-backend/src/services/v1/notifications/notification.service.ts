import { Socket } from "socket.io";
import Notification, { Priority } from "../../../models/notifications.model";
import { NotificationGenerator } from "./notificationGenerator.service";
import { getAllAdminProfileSockets, getUserProfileSockets } from "../sockets/socketsStore.service";
import Xrequest from "../../../interfaces/extensions.interface";

export class NotificationService {
  static async buildNotification(data: any) {
    try {
      const { actorIdentity, recordId, message, identity } = data;

      const rawNotification: any = {
        recordId: recordId,
        actor: actorIdentity,
        message: message,
        status: "PENDING",
        title: `${identity} placed a new order`,
        notificationClass: "activity",
        priority: Priority.HIGH,
        module: "SOCIAL",
        createdAt: new Date(),
      };

      console.log("RAW NOTIFICATION ===> ", rawNotification);
      const { newNotification, notification } =
        await NotificationGenerator.createNotification(rawNotification);
      const _newNotification = await newNotification.populate('actor')
      await NotificationService.sendNotification(_newNotification);
    } catch (error) {
      throw error;
    }
  }

  static async sendNotificationToAdmins(notification: any) {
    try {
      const sockets: Socket[] = getAllAdminProfileSockets();
      if (sockets) {
        console.log(sockets);
        for(let socket of sockets){
          socket.emit("notifications", JSON.stringify(notification));
        }
      }
    } catch (error) {
      console.log(error);
    }
  }

  static async sendNotification(notification: any): Promise<any> {
    try {
      if (notification) {
        NotificationService.sendNotificationToAdmins(notification);
        return { status: true, message: "Notification sent" };
      } else {
        return {
          status: false,
          message: "No Notification was found that matches the id provided",
        };
      }
    } catch (error: any) {
      console.error(error);
    }
  }

  static async getNotifications(){
    try{
      return {
        status: true,
        data: await Notification.find({}).populate('actor').limit(15),
        message: "Notifications fetched successfully",
        code: 200
      }
    }catch(error){
      throw error;
    }
  }
}
