import bcrypt from "bcryptjs";
import createError from "http-errors";
import mongoose from "mongoose";
import {
  generateOtp,
  getExpirableCode,
  setExpirableCode,
} from "./redis.service";
import mailActions from "../Mail/mail.service";
import Xrequest from "../../../interfaces/extensions.interface";
import validations from "../../../validators/authentication/joi.validators";
import message from "../../../helpers/messages";
import Accounts from "../../../models/Accounts/accounts.model";
import jwthelper from "../../../helpers/jwt_helper";
import { utils } from "../../../validators/authentication/custom.validators";

export class Authentication {
  req: Xrequest;
  payload: { email: string; password: string };

  constructor(req: Xrequest) {
    this.req = req;
    this.payload = req.body || {};
  }

  public async createAccount() {
    try {
      const session = await mongoose.startSession();
      const result = await validations.authSchema.validateAsync(this.req.body);
      const user = await Accounts.findOne({ email: result.email }).session(
        session
      );
      if (user) {
        throw createError.Conflict(message.auth.alreadyExistPartText);
      }
      result.createdAt = new Date();
      const pendingAccount = new Accounts(result);
      const savedUser: any = await pendingAccount.save();

      if (savedUser._id.toString()) {
        const otp: string = generateOtp();
        await setExpirableCode(result.email, "account-verification", otp);
        mailActions.auth.sendEmailConfirmationOtp(result.email, otp);
        return {
          status: true,
          data: savedUser._id,
          message: "Registration successful",
        };
      }
      return { status: false, message: "Registration was unsuccessful!" };
    } catch (error: any) {
      let msg: string = "Registration was unsuccessful!";
      if (error.message.includes("already exists!")) {
        error.status = 200;
        msg = error.message || "User with email address already exists!";
      }
      return { status: false, message: msg };
    }
  }

  public async loginAccount() {
    try {
      const result = await validations.authSchema.validateAsync(this.req.body);
      const account: any = await Accounts.findOne({ email: result.email });
      if (!account) return createError.NotFound(message.auth.userNotRegistered);

      const isMatch = await account.isValidPassword(result.password);
      if (!isMatch)
        return createError.Unauthorized(message.auth.invalidCredentials);

      if (!account.emailConfirmed) {
        const otp: string = generateOtp();
        await setExpirableCode(result.email, "account-verification", otp);
        await mailActions.auth.sendEmailConfirmationOtp(result.email, otp);
        return {
          status: false,
          code: 1001, //Code 101 is code to restart otp verification...
          data: account._id,
          message: "Please verify your account",
        };
      }

      const accessToken = await jwthelper.signAccessToken(account.id);
      const refreshToken = await jwthelper.signRefreshToken(account.id);
      return { status: true, data: account, accessToken, refreshToken };
    } catch (error) {
      console.log(error);
      return { status: false, message: message.auth.loginError };
    }
  }

  public async sendEmailConfirmationOtp() {
    try {
      const result =
        await validations.authSendEmailConfirmOtpSchema.validateAsync(
          this.req.body
        );
      const user: any = await Accounts.findOne({ email: result.email });
      if (!user) {
        throw createError.NotFound(
          utils.joinStringsWithSpace([
            result.email,
            message.auth.notRegisteredPartText,
          ])
        );
      }

      if (user.emailConfirmed) {
        return { status: false, message: message.auth.emailAlreadyVerified };
      }
      const otp: string = generateOtp();
      await setExpirableCode(result.email, "account-verification", otp);
      return await mailActions.auth.sendEmailConfirmationOtp(result.email, otp);
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  public async sendPasswordResetLink() {
    try {
      const result = await validations.authSendResetPasswordLink.validateAsync(
        this.req.body
      );
      const user = await Accounts.findOne({ email: result.email });
      if (!user) {
        return {
          status: false,
          message: utils.joinStringsWithSpace([
            result.email,
            message.auth.notRegisteredPartText,
          ])
        };
      }
      const otp: string = generateOtp();
      await setExpirableCode(result.email, "password-reset", otp);
      return mailActions.auth.sendPasswordResetMail(result.email, otp);
    } catch (error: any) {
      console.log(error);
      throw error.message;
    }
  }

  public async resetPassword() {
    try {
      
      const result = await validations.authResetPassword.validateAsync(
        this.req.body
      );
      const cachedOtp:any = await getExpirableCode("password-reset", result.email);
      if(!cachedOtp){
        return {
          status: false,
          message: "OTP has expired"
        }
      }
      if(this.req.body.otp.toString() !== cachedOtp.code.toString()){
        return {
          status: false,
          message: "Invalid or expired otp"
        }
      }
      const account = await Accounts.findOne({
        email: result.email
      });
      if (!account) {
        return {
          status: false,
          message: utils.joinStringsWithSpace([
            result.email,
            message.auth.notRegisteredPartText,
          ])
        };
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

  public async verifyAccountEmail() {
    const { otp, email } = this.req.body as any;
    if (!otp) {
      return { status: false, message: message.auth.missingConfToken };
    }
    const cachedOtp = await getExpirableCode("account-verification", email);
    if (!cachedOtp || cachedOtp?.code.toString() !== otp.toString()) {
      return {
        status: false,
        message: "This otp is incorrect or has expired...",
      };
    }

    try {
      const account: any = await Accounts.findOne({ email });
      if (!account.emailConfirmed) {
        account.emailConfirmed = true;
        await account.save();

        return { status: true, message: message.auth.emailVerifiedOk };
      }
      return { status: false, message: "Account already verified!" };
    } catch (error) {
      console.log(error);
      return { status: false, message: message.auth.invalidConfToken };
    }
  }

  public async getRefreshToken(next: any) {
    try {
      const { refreshToken } = this.req.body;
      if (!refreshToken) throw createError.BadRequest();
      const { aud } = (await jwthelper.verifyRefreshToken(
        refreshToken,
        next
      )) as any;
      if (aud) {
        const accessToken = await jwthelper.signAccessToken(aud);
        // const refToken = await jwthelper.signRefreshToken(aud);
        return { status: true, accessToken: accessToken };
      }
    } catch (error: any) {
      console.log(error);
      return { status: false, message: error.mesage };
    }
  }

}
