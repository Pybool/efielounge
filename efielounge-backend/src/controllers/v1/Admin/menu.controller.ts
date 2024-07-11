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

  editMenu: async (req: Xrequest, res: Response, next: NextFunction) => {
    try {
      let status = 400;
      const result = await Menuservice.editMenu(req);
      if (result) status = result.code;
      return res.status(status).json(result);
    } catch (error: any) {
      error.status = 500;
      next(error);
    }
  },

  archiveMenu: async (req: Xrequest, res: Response, next: NextFunction) => {
    try {
      let status = 400;
      const result = await Menuservice.archiveMenu(req);
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

  editMenuCategory: async (req: Xrequest, res: Response, next: NextFunction) => {
    try {
      let status = 400;
      const result = await Menuservice.editMenuCategory(req);
      if (result) status = result.code;
      return res.status(status).json(result);
    } catch (error: any) {
      error.status = 500;
      next(error);
    }
  },

  archiveMenuCategory: async (req: Xrequest, res: Response, next: NextFunction) => {
    try {
      let status = 400;
      const result = await Menuservice.archiveMenuCategory(req);
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

  editMenuItem: async (req: Xrequest, res: Response, next: NextFunction) => {
    try {
      let status = 400;
      const result = await Menuservice.editMenuItem(req);
      if (result) status = result.code;
      return res.status(status).json(result);
    } catch (error: any) {
      error.status = 500;
      next(error);
    }
  },

  archiveMenuItem: async (req: Xrequest, res: Response, next: NextFunction) => {
    try {
      let status = 400;
      const result = await Menuservice.archiveMenuItem(req);
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

  editMenuItemCategory: async (req: Xrequest, res: Response, next: NextFunction) => {
    try {
      let status = 400;
      const result = await Menuservice.editMenuItemCategory(req);
      if (result) status = result.code;
      return res.status(status).json(result);
    } catch (error: any) {
      error.status = 500;
      next(error);
    }
  },

  archiveMenuItemCategory: async (req: Xrequest, res: Response, next: NextFunction) => {
    try {
      let status = 400;
      const result = await Menuservice.archiveMenuItemCategory(req);
      if (result) status = result.code;
      return res.status(status).json(result);
    } catch (error: any) {
      error.status = 500;
      next(error);
    }
  },
};


export default menuController;