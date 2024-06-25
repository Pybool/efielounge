import { NextFunction, Response } from "express";
import Xrequest from "../../../interfaces/extensions.interface";
import { CartService } from "../../../services/v1/orders/cart.service";

const clientCartController:any = {
  addToCart: async (req: Xrequest, res: Response, next: NextFunction) => {
    try {
      let status = 400;
      const result = await CartService.addToCart(req);
      if (result) status = result.code;
      return res.status(status).json(result);
    } catch (error: any) {
      error.status = 500;
      next(error);
    }
  },

  getCart: async (req: Xrequest, res: Response, next: NextFunction) => {
    try {
      let status = 400;
      const result = await CartService.getCart(req);
      if (result) status = result.code;
      return res.status(status).json(result);
    } catch (error: any) {
      error.status = 500;
      next(error);
    }
  },

  removeFromCart: async (req: Xrequest, res: Response, next: NextFunction) => {
    try {
      let status = 400;
      const result = await CartService.removeFromCart(req);
      if (result) status = result.code;
      return res.status(status).json(result);
    } catch (error: any) {
      error.status = 500;
      next(error);
    }
  },

  updateCart: async (req: Xrequest, res: Response, next: NextFunction) => {
    try {
      let status = 400;
      const result = await CartService.updateCart(req);
      if (result) status = result.code;
      return res.status(status).json(result);
    } catch (error: any) {
      error.status = 500;
      next(error);
    }
  },

  checkOut: async (req: Xrequest, res: Response, next: NextFunction) => {
    try {
      let status = 400;
      const result = await CartService.checkOut(req);
      if (result) status = result.code;
      return res.status(status).json(result);
    } catch (error: any) {
      error.status = 500;
      next(error);
    }
  },

  uploadReceipt: async (req: Xrequest, res: Response, next: NextFunction) => {
    try {
      let status = 400;
      const result = await CartService.uploadReceipt(req);
      if (result) status = result.code;
      return res.status(status).json(result);
    } catch (error: any) {
      error.status = 500;
      next(error);
    }
  },
 
};


export default clientCartController;