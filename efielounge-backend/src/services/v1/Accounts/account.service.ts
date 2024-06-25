import bcrypt from "bcryptjs";
import createError from "http-errors";
import message from "../../../helpers/messages";
import Xrequest from "../../../interfaces/extensions.interface";
import Accounts from "../../../models/Accounts/accounts.model";
import { utils } from "../../../validators/authentication/custom.validators";
import validations from "../../../validators/authentication/joi.validators";

export class AccountService {
  static async getUserProfile(req: Xrequest) {
    try {
      const account: any = await Accounts.findOne({ _id: req.query.accountId! });
      if (!account) {
        throw createError.NotFound("User was not found");
      }
      return {
        status: true,
        data: account,
        code: 200
      } //await account.getProfile();
    } catch (error: any) {
      console.log(error);
      throw error.message;
    }
  }

  static async saveUserProfile(req: Xrequest) {
    try {
      const patchData = JSON.parse(req.body.data);
      console.log(patchData)
      if (!patchData) {
        throw createError.NotFound("No data was provided");
      }
      let account: any = await Accounts.findOne({ _id: req.query.accountId });
      if (!account) {
        throw createError.NotFound("Account was not found");
      }
      // Add fields validation
      Object.keys(patchData).forEach((field) => {
        if (field != "email") account[field] = patchData[field];
      });
      if(req?.attachments?.length > 0){
        account.avatar = req.attachments[0].replaceAll("/public", "")
      }
    
      account = await account.save();
      return {
        status: true,
        data: account,
        message: "Profile updated successfully..",
      };
    } catch (error) {
      console.log(error);
      return { status: false, message: "Profile update failed.." };
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
