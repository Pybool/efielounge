import { NextFunction, Response } from "express";
import Xrequest from "../../../interfaces/extensions.interface";
import { AccountService } from "../../../services/v1/Accounts/account.service";
import { AdminAccountService } from "../../../services/v1/Admin/accounts.service";

const accountController:any = {
  getUserProfile: async (req: Xrequest, res: Response, next: NextFunction) => {
    try {
      let status = 400;
      const result = await AccountService.getUserProfile(req);
      if (result) status = 200;
      return res.status(status).json(result);
    } catch (error: any) {
      error.status = 500;
      next(error);
    }
  },

  saveUserProfile: async (req: Xrequest, res: Response, next: NextFunction) => {
    try {
      let status = 400;
      const result = await AccountService.saveUserProfile(req);
      if (result) status = 200;
      return res.status(status).json(result);
    } catch (error: any) {
      error.status = 500;
      next(error);
    }
  },

  uploadAvatar: async (req: Xrequest, res: Response, next: NextFunction) => {
    try {
      let status = 400;
      const result = await AccountService.uploadAvatar(req);
      if (result) status = 200;
      return res.status(status).json(result);
    } catch (error: any) {
      error.status = 500;
      next(error);
    }
  },

  getCustomers: async (req: Xrequest, res: Response, next: NextFunction) => {
    try {
      let status = 400;
      const result = await AdminAccountService.getCustomers(req);
      if (result) status = 200;
      return res.status(status).json(result);
    } catch (error: any) {
      error.status = 500;
      next(error);
    }
  },

  getStaff: async (req: Xrequest, res: Response, next: NextFunction) => {
    try {
      let status = 400;
      const result = await AdminAccountService.getStaff(req);
      if (result) status = 200;
      return res.status(status).json(result);
    } catch (error: any) {
      error.status = 500;
      next(error);
    }
  },

  addAddress: async (req: Xrequest, res: Response, next: NextFunction) => {
    try {
      let status = 400;
      const result = await AccountService.addAddress(req);
      if (result) status = 200;
      return res.status(status).json(result);
    } catch (error: any) {
      error.status = 500;
      next(error);
    }
  },

  getAddresses: async (req: Xrequest, res: Response, next: NextFunction) => {
    try {
      let status = 400;
      const result = await AccountService.getAddresses(req);
      if (result) status = 200;
      return res.status(status).json(result);
    } catch (error: any) {
      error.status = 500;
      next(error);
    }
  },

  setDefaultAddress: async (req: Xrequest, res: Response, next: NextFunction) => {
    try {
      let status = 400;
      const result = await AccountService.setDefaultAddress(req);
      if (result) status = 200;
      return res.status(status).json(result);
    } catch (error: any) {
      error.status = 500;
      next(error);
    }
  },

  removeAddress: async (req: Xrequest, res: Response, next: NextFunction) => {
    try {
      let status = 400;
      const result = await AccountService.removeAddress(req);
      if (result) status = 200;
      return res.status(status).json(result);
    } catch (error: any) {
      error.status = 500;
      next(error);
    }
  },

  deactivateAccount: async (req: Xrequest, res: Response, next: NextFunction) => {
    try {
      let status = 400;
      const result = await AccountService.deactivateAccount(req);
      if (result) status = 200;
      return res.status(status).json(result);
    } catch (error: any) {
      error.status = 500;
      next(error);
    }
  },
};


export default accountController;