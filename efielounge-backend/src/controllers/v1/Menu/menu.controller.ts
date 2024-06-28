import { NextFunction, Response } from "express";
import Xrequest from "../../../interfaces/extensions.interface";
import { Menuservice } from "../../../services/v1/menu/menu.service";

const clientMenuController:any = {
  getMenus: async (req: Xrequest, res: Response, next: NextFunction) => {
    try {
      let status = 400;
      const result = await Menuservice.getMenus(req);
      if (result) status = result.code;
      return res.status(status).json(result);
    } catch (error: any) {
      error.status = 500;
      next(error);
    }
  },

  getMenuCategories: async (req: Xrequest, res: Response, next: NextFunction) => {
    try {
      let status = 400;
      const result = await Menuservice.getMenuCategories();
      if (result) status = result.code;
      return res.status(status).json(result);
    } catch (error: any) {
      error.status = 500;
      next(error);
    }
  },

  getMenuItemCategories: async (req: Xrequest, res: Response, next: NextFunction) => {
    try {
      let status = 400;
      const result = await Menuservice.getMenuItemCategories();
      if (result) status = result.code;
      return res.status(status).json(result);
    } catch (error: any) {
      error.status = 500;
      next(error);
    }
  },

  fetchMenuDetail: async (req: Xrequest, res: Response, next: NextFunction) => {
    try {
      let status = 400;
      const result = await Menuservice.fetchMenuDetail(req);
      if (result) status = result.code;
      return res.status(status).json(result);
    } catch (error: any) {
      error.status = 500;
      next(error);
    }
  },

  getMenuItems: async (req: Xrequest, res: Response, next: NextFunction) => {
    try {
      let status = 400;
      const result = await Menuservice.getMenuItems();
      if (result) status = result.code;
      return res.status(status).json(result);
    } catch (error: any) {
      error.status = 500;
      next(error);
    }
  },

  likeMenu: async (req: Xrequest, res: Response, next: NextFunction) => {
    try {
      let status = 400;
      const result = await Menuservice.likeMenu(req);
      if (result) status = result.code;
      return res.status(status).json(result);
    } catch (error: any) {
      error.status = 500;
      next(error);
    }
  },
};

export default clientMenuController;