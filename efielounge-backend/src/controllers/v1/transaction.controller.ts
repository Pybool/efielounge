import { NextFunction, Response } from "express";
import { CartService } from "../../services/v1/orders/cart.service";
import Xrequest from "../../interfaces/extensions.interface";

const transactionController:any = {
  saveTransaction: async (req: Xrequest, res: Response, next: NextFunction) => {
    try {
      let status = 400;
      const result = await CartService.saveTransaction(req);
      if (result) status = result.code;
      return res.status(status).json(result);
    } catch (error: any) {
      error.status = 500;
      next(error);
    }
  },

 
};


export default transactionController;