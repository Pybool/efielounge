import { NextFunction, Response } from "express";
import Xrequest from "../../../interfaces/extensions.interface";
import { NotificationService } from "../../../services/v1/notifications/notification.service";

const notificationsController: any = {
  getNotifications: async (
    req: Xrequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      let status = 400;
      const result = await NotificationService.getNotifications();
      if (result) status = result.code;
      return res.status(status).json(result);
    } catch (error: any) {
      error.status = 500;
      next(error);
    }
  },
};

export default notificationsController;
