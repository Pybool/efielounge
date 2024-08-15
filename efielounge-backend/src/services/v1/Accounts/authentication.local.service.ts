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
    const user = await Accounts.findOne({ phone: parsedPhone });
    if (!user) {
      otpType = "phone-otp-register";
      await setExpirableAccountData(phone, "pending-account-", {
        phone: parsedPhone,
        countryCode: countryCode,
        dialCode: this.payload?.dialCode,
      });
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
    SmsService.sendSms(messageType, Number(otp), data);
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
    let account: any = await Accounts.findOne({ phone: parsedPhone });
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
    }
    const otp: string = generateOtp();
    await setExpirableCode(email, otpType, otp);
    console.log("OTP===> ", otp);
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
    }

    const accessToken = await jwthelper.signAccessToken(account.id);
    const refreshToken = await jwthelper.signRefreshToken(account.id);
    return { status: true, data: account, accessToken, refreshToken };
  }
}
