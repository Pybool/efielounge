import bcrypt from "bcryptjs";
import createError from "http-errors";
import message from "../../../helpers/messages";
import Xrequest from "../../../interfaces/extensions.interface";
import Accounts from "../../../models/Accounts/accounts.model";
import { utils } from "../../../validators/authentication/custom.validators";
import validations from "../../../validators/authentication/joi.validators";

export class AdminAccountService {
  static async getCustomers(req: Xrequest) {
    try {
        const page = Number((req.query.page! as string) || 1);
        const limit = Number((req.query.limit! as string) || 20);
        const filter = {role: 'CUSTOMER'}
        const [accounts, total] = await Promise.all([
          Accounts.find(filter, null).sort({createdAt: -1}),
          Accounts.countDocuments(filter),
        ]);
  
        const totalPages = Math.ceil(total / limit);
        return {
            status: true,
            data: accounts,
            total: total,
            totalPages: totalPages,
            currentPage: page,
            limit: limit,
            accountType: 'customers',
            message: "Customers were fetched successfully",
            code: 200,
          };
    } catch (error: any) {
      console.log(error);
      throw error.message;
    }
  }

  static async getStaff(req: Xrequest) {
    try {
        const page = Number((req.query.page! as string) || 1);
        const limit = Number((req.query.limit! as string) || 20);
        const filter = { 'role': { '$in': ['STAFF', 'ADMIN'] } };
        const [accounts, total] = await Promise.all([
          Accounts.find(filter, null).sort({createdAt: -1}),
          Accounts.countDocuments(filter),
        ]);
  
        const totalPages = Math.ceil(total / limit);
        return {
            status: true,
            data: accounts,
            total: total,
            totalPages: totalPages,
            currentPage: page,
            limit: limit,
            accountType: 'staff',
            message: "Staff were fetched successfully",
            code: 200,
          };
    } catch (error: any) {
      console.log(error);
      throw error.message;
    }
  }

  static async changePassword(req:Xrequest) {
    try {
      if (!req.query.token)
        throw createError.BadRequest(message.auth.invalidTokenSupplied);
      const result = await validations.authResetPassword.validateAsync(
        req.body
      );
      const account = await Accounts.findOne({
        reset_password_token: req.query.token,
        reset_password_expires: { $gt: Date.now() },
      });
      if (!account) {
        throw createError.NotFound(
          utils.joinStringsWithSpace([
            result.email,
            message.auth.userNotRequestPasswordReset,
          ])
        );
      }
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(result.password, salt);
      account.password = hashedPassword; // Set to the new password provided by the account
      await account.save();
      return { status: true, message: message.auth.passwordResetOk };
    } catch (error) {
      console.log(error);
      return { status: false, message: message.auth.passwordResetFailed };
    }
  }
}
