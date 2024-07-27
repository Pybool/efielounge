import { NextFunction, Response } from "express";
import Xrequest from "../../../interfaces/extensions.interface";
import { PromotionService } from "../../../services/v1/Admin/promotions.service";

const promotionsController:any = {
  createPromotion: async (req: Xrequest, res: Response, next: NextFunction) => {
    try {
      let status = 400;
      const result = await PromotionService.createPromotion(req);
      if (result) status = result.code;
      return res.status(status).json(result);
    } catch (error: any) {
      error.status = 500;
      next(error);
    }
  },

  activatePromotion: async (req: Xrequest, res: Response, next: NextFunction) => {
    try {
      let status = 400;
      const result = await PromotionService.activatePromotion(req);
      if (result) status = result.code;
      return res.status(status).json(result);
    } catch (error: any) {
      error.status = 500;
      next(error);
    }
  },

  deletePromotion: async (req: Xrequest, res: Response, next: NextFunction) => {
    try {
      let status = 400;
      const result = await PromotionService.deletePromotion(req);
      if (result) status = result.code;
      return res.status(status).json(result);
    } catch (error: any) {
      error.status = 500;
      next(error);
    }
  },
};


export default promotionsController;