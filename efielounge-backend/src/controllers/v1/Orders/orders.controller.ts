import { NextFunction, Response } from "express";
import Xrequest from "../../../interfaces/extensions.interface";
import { OrderService } from "../../../services/v1/orders/orders.service";

const clientOrderController: any = {
  fetchOrders: async (req: Xrequest, res: Response, next: NextFunction) => {
    try {
      let status = 400;
      const result = await OrderService.fetchOrders(req);
      if (result) status = result.code;
      return res.status(status).json(result);
    } catch (error: any) {
      error.status = 500;
      next(error);
    }
  },
};

export default clientOrderController;
