import { NextFunction, Response } from "express";
import Xrequest from "../../../interfaces/extensions.interface";
import { Menuservice } from "../../../services/v1/Admin/menu.service";

const menuController:any = {
  createMenu: async (req: Xrequest, res: Response, next: NextFunction) => {
    try {
      let status = 400;
      const result = await Menuservice.createMenu(req);
      if (result) status = result.code;
      return res.status(status).json(result);
    } catch (error: any) {
      error.status = 500;
      next(error);
    }
  },

  createMenuCategory: async (req: Xrequest, res: Response, next: NextFunction) => {
    try {
      let status = 400;
      const result = await Menuservice.createMenuCategory(req);
      if (result) status = result.code;
      return res.status(status).json(result);
    } catch (error: any) {
      error.status = 500;
      next(error);
    }
  },

  createMenuItem: async (req: Xrequest, res: Response, next: NextFunction) => {
    try {
      let status = 400;
      const result = await Menuservice.createMenuItem(req);
      if (result) status = result.code;
      return res.status(status).json(result);
    } catch (error: any) {
      error.status = 500;
      next(error);
    }
  },

  createMenuItemCategory: async (req: Xrequest, res: Response, next: NextFunction) => {
    try {
      let status = 400;
      const result = await Menuservice.createMenuItemCategory(req);
      if (result) status = result.code;
      return res.status(status).json(result);
    } catch (error: any) {
      error.status = 500;
      next(error);
    }
  },
};


export default menuController;