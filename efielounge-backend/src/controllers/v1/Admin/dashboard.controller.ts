import { NextFunction, Response } from "express";
import Xrequest from "../../../interfaces/extensions.interface";
import { DashboardService } from "../../../services/v1/Admin/dashboard.service";

const dashboardController: any = {
  fecthDashBoardData: async (
    req: Xrequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      let status = 400;
      const result = await DashboardService.fecthDashBoardData(req);
      if (result) status = result.code;
      return res.status(status).json(result);
    } catch (error: any) {
      error.status = 500;
      next(error);
    }
  },
};

export default dashboardController;
