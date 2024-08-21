import bcrypt from "bcryptjs";
import createError from "http-errors";
import mongoose from "mongoose";
import {
  generateOtp,
  getExpirableCode,
  setExpirableCode,
  setExpirablePhoneCode,
  getExpirablePhoneCode,
  setExpirableAccountData,
  getExpirableAccountData,
} from "./redis.service";
import mailActions from "../Mail/mail.service";
import Xrequest from "../../../interfaces/extensions.interface";
import validations from "../../../validators/authentication/joi.validators";
import message from "../../../helpers/messages";
import Accounts from "../../../models/Accounts/accounts.model";
import jwthelper from "../../../helpers/jwt_helper";
import { utils } from "../../../validators/authentication/custom.validators";
// import { SmsService } from "./twilio.sms.service";
import { config as dotenvConfig } from "dotenv";

import { handleErrors } from "../../../global.error.handler";
import { SmsService } from "./termii.service";
import { parsePhoneNumber } from "libphonenumber-js";

dotenvConfig();
dotenvConfig({ path: `.env.${process.env.NODE_ENV}` });
const API_KEY = process.env.TERMII_API_KEY;

// Mapping of country codes to their corresponding dial codes
const countryDialCodes: any = {
  NG: "234", // Nigeria
  US: "1", // United States
  GH: "233", // Ghana
  UK: "44", // United Kingdom
  // Add more countries as needed
};

// Function to normalize phone numbers
const normalizePhoneNumber = (countryCode: any, phone: string) => {
  const dialCode = countryDialCodes[countryCode];

  if (!dialCode) {
    throw new Error("Invalid country code");
  }

  // Remove all non-numeric characters
  let normalizedPhone = phone!.replace(/\D/g, "");

  // If the phone number starts with '0', replace it with the dial code
  if (normalizedPhone.startsWith("0")) {
    normalizedPhone = dialCode + normalizedPhone.slice(1);
  }

  // If the phone number doesn't start with the dial code, prepend it
  if (!normalizedPhone.startsWith(dialCode)) {
    normalizedPhone = dialCode + normalizedPhone;
  }

  return normalizedPhone;
};
export class Authentication {
  req: Xrequest;
  payload: {
    phone?: string;
    email?: string;
    password?: string;
    otp?: number;
    dialCode?: string;
    countryCode?: string;
  };

  constructor(req: Xrequest) {
    this.req = req;
    this.payload = req.body || {};
  }

  @handleErrors()
  public async sendPhoneOtp(messageType: string) {
    let otpType = "phone-otp-login";
    const phone: string = this.payload.phone!;
    const countryCode = this.payload.countryCode;
    const parsedPhone = normalizePhoneNumber(countryCode, phone);
    const user = await Accounts.findOne({countryCode:countryCode, phone: phone });
    if (!user) {
      otpType = "phone-otp-register";
      await setExpirableAccountData(phone, "pending-account-", {
        phone: parsedPhone,
        countryCode: countryCode,
        dialCode: this.payload?.dialCode,
      });
    }else{
      if(!user.active){
        throw new Error("Account is de-activated")
      }
    }
    
    const otp: string = generateOtp();
    await setExpirablePhoneCode(parsedPhone, otpType, otp);
    console.log("OTP===> ", otp);
    const data = {
      api_key: API_KEY,
      message_type: "NUMERIC",
      to: parsedPhone,
      from: "Efielounge",
      channel: "generic",
      pin_attempts: 10,
      pin_time_to_live: 5,
      pin_length: 4,
      pin_placeholder: "< 1234 >",
      message_text: "Your Efielounge pin is < 1234 >",
      pin_type: "NUMERIC",
    };
    // SmsService.sendSms(messageType, Number(otp), data);
    return {
      status: true,
      code: 200,
    };
  }

  @handleErrors()
  public async phoneLogin() {
    let accountId = null;
    let otpType = "phone-otp-login";
    const result = await validations.authPhoneLoginSchema.validateAsync(
      this.req.body
    );
    const phone: string = result?.phone!;
    const countryCode = result.countryCode;
    const parsedPhone = normalizePhoneNumber(countryCode, phone);
    let account: any = await Accounts.findOne({countryCode:countryCode, phone: phone });
    if (!account) {
      otpType = "phone-otp-register";
    }
    const cachedOtp: any = await getExpirablePhoneCode(otpType, parsedPhone);
    if (!cachedOtp) {
      throw new Error("OTP has expired");
    }
    if (Number(cachedOtp.code) !== result.otp) {
      throw new Error("Otp is invalid");
    }

    if (!account) {
      const pendingAccount = await getExpirableAccountData(
        "pending-account-",
        phone
      );
      if (pendingAccount) {
        pendingAccount.createdAt = new Date();
        account = await Accounts.create(pendingAccount);
      } else {
        throw Error("Request a new otp and try again");
      }
    }else{
      if(!account.active){
        throw new Error("Account is de-activated")
      }
    }
    accountId = account._id?.toString();
    const accessToken = await jwthelper.signAccessToken(accountId);
    const refreshToken = await jwthelper.signRefreshToken(accountId);
    return { status: true, data: account, accessToken, refreshToken };
  }

  @handleErrors()
  public async sendEmailOtp(messageType: string) {
    let otpType = "email-otp-login";
    const email: string = this.payload.email!;
    const user = await Accounts.findOne({ email: email });
    if (!user) {
      otpType = "email-otp-register";
      await setExpirableAccountData(email, "pending-account-", {
        email: email,
      });
    }else{
      if(!user.active){
        throw new Error("Account is de-activated")
      }
    }
    const otp: string = generateOtp();
    await setExpirableCode(email, otpType, otp);
    // console.log("OTP===> ", otp);
    mailActions.auth.sendEmailConfirmationOtp(email, otp);
    return {
      status: true,
      code: 200,
    };
  }

  @handleErrors()
  public async emailLogin() {
    let otpType = "email-otp-login";
    const result = await validations.authEmailLoginSchema.validateAsync(
      this.req.body
    );
    let account: any = await Accounts.findOne({ email: result.email });
    if (!account) {
      otpType = "email-otp-register";
    }

    const cachedOtp: any = await getExpirableCode(otpType, result.email);
    console.log("Existing login otp ==> ", cachedOtp);
    if (!cachedOtp) {
      throw new Error("OTP has expired");
    }
    console.log(Number(cachedOtp.code), result.otp);
    if (Number(cachedOtp.code) !== result.otp) {
      throw new Error("Otp is invalid");
    }
    if (!account) {
      const pendingAccount = await getExpirableAccountData(
        "pending-account-",
        result?.email
      );
      if (pendingAccount) {
        pendingAccount.createdAt = new Date();
        account = await Accounts.create(pendingAccount);
      } else {
        throw Error("Request a new otp and try again");
      }
    }else{
      if(!account.active){
        throw new Error("Account is de-activated")
      }
    }

    const accessToken = await jwthelper.signAccessToken(account.id);
    const refreshToken = await jwthelper.signRefreshToken(account.id);
    return { status: true, data: account, accessToken, refreshToken };
  }


  public async createAccount() {
    try {
      const session = await mongoose.startSession();
      const result: any = await validations.authSchema.validateAsync(
        this.req.body
      );
      const user = await Accounts.findOne({ email: result.email }).session(
        session
      );
      if (user) {
        throw createError.Conflict(message.auth.alreadyExistPartText);
      }
      result.createdAt = new Date();
      if (this.req?.account) {
        if (this.req!.account!.role === "ADMIN") {
          result.emailConfirmed = true;
        }
      }

      const pendingAccount = new Accounts(result);
      const savedUser: any = await pendingAccount.save();

      if (savedUser._id.toString()) {
        if (!this.req?.account) {
          const otp: string = generateOtp();
          await setExpirableCode(result.email, "account-verification", otp);
          mailActions.auth.sendEmailConfirmationOtp(result.email, otp);
        }

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

      if(!account.active){
        throw new Error("Account is de-activated")
      }

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

  @handleErrors()
  public async acceptedTerms(req:Xrequest){
    const accountId = req.body.accountId;
    let account = await Accounts.findOne({_id: accountId});
    if(account){
      account.acceptedTerms = true;
      account = await account.save()
      account.password = "oops nothing to see here"
      return {
        status: true,
        data: account,
        message: "Terms Accepted",
        code: 200
      }
    }
    return {
      status: false,
      data: null,
      message: "No account was found...",
      code: 200
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
          ]),
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
      const cachedOtp: any = await getExpirableCode(
        "password-reset",
        result.email
      );
      if (!cachedOtp) {
        return {
          status: false,
          message: "OTP has expired",
        };
      }
      if (this.req.body.otp.toString() !== cachedOtp.code.toString()) {
        return {
          status: false,
          message: "Invalid or expired otp",
        };
      }
      const account = await Accounts.findOne({
        email: result.email,
      });
      if (!account) {
        return {
          status: false,
          message: utils.joinStringsWithSpace([
            result.email,
            message.auth.notRegisteredPartText,
          ]),
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
