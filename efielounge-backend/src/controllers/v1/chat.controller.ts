import { NextFunction, Response } from "express";
import Xrequest from "../../interfaces/extensions.interface";
import { RtmRoomService } from "../../services/v1/chats/room.service";

const chatController: any = {

  sendMessage: async (req: Xrequest, res: Response, next: NextFunction) => {
    try {
      let status = 400;
      const result:any = await RtmRoomService.sendMessage(req)
      if (result) status = result?.code || 200;
      return res.status(status).json(result);
    } catch (error: any) {
      error.status = 500;
      next(error);
    }
  },

  fetchChats: async (req: Xrequest, res: Response, next: NextFunction) => {
    try {
      let status = 400;
      const result:any = await RtmRoomService.fetchRoomMesages(req)
      if (result) status = result?.code || 200;
      return res.status(status).json(result);
    } catch (error: any) {
      error.status = 500;
      next(error);
    }
  },

  joinChatRoomAuth: async (req: Xrequest, res: Response, next: NextFunction) => {
    try {
      let status = 400;
      const result:any = await RtmRoomService.joinChatRoomAuth(req)
      if (result) status = result?.code || 200;
      return res.status(status).json(result);
    } catch (error: any) {
      error.status = 500;
      next(error);
    }
  },

  fetchChatsPreview: async (req: Xrequest, res: Response, next: NextFunction) => {
    let status = 200;
    try {
      const result = await RtmRoomService.fetchChatsPreview(req);
      if (result.status) {
        res.status(status).json(result);
      } else {
        return res.status(400).json(result);
      }
    } catch (error: any) {
      res.status(500).json({ status: false, message: error?.message });
    }
  },

  fetchRooms: async (req: Xrequest, res: Response, next: NextFunction) => {
    let status = 200;
    try {
      const result = await RtmRoomService.fetchRooms(req);
      if (result.status) {
        res.status(status).json(result);
      } else {
        return res.status(400).json(result);
      }
    } catch (error: any) {
      res.status(500).json({ status: false, message: error?.message });
    }
  },

  markChatsAsRead: async (req: Xrequest, res: Response, next: NextFunction) => {
    let status = 200;
    try {
      const result = await RtmRoomService.markChatsAsRead(req.body.roomId);
      if (result.status) {
        res.status(status).json(result);
      } else {
        return res.status(400).json(result);
      }
    } catch (error: any) {
      res.status(500).json({ status: false, message: error?.message });
    }
  },


};

export default chatController;
