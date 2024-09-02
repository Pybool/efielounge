import bcrypt from "bcryptjs";
import createError from "http-errors";
import message from "../../../helpers/messages";
import Xrequest from "../../../interfaces/extensions.interface";
import Accounts from "../../../models/Accounts/accounts.model";
import { utils } from "../../../validators/authentication/custom.validators";
import validations from "../../../validators/authentication/joi.validators";
import Address from "../../../models/Accounts/accounts.address.model";
import { handleErrors } from "../../../global.error.handler";

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
export class AccountService {
  static async getUserProfile(req: Xrequest) {
    try {
      const account: any = await Accounts.findOne({
        _id: req.query.accountId!,
      });
      if (!account) {
        throw createError.NotFound("User was not found");
      }
      return {
        status: true,
        data: account,
        code: 200,
      }; //await account.getProfile();
    } catch (error: any) {
      console.log(error);
      throw error.message;
    }
  }

  static async uploadAvatar(req: Xrequest) {
    try {
      let account: any = await Accounts.findOne({ _id: req.accountId });
      if (!account) {
        throw createError.NotFound("Account was not found");
      }

      if (req?.attachments?.length > 0) {
        account.avatar = req.attachments[0].replaceAll("/public", "");
      }

      account = await account.save();
      return {
        status: true,
        data: account,
        message: "Avatar updated successfully..",
      };
    } catch (error) {
      console.log(error);
      return { status: false, message: "Profile update failed.." };
    }
  }

  static async saveUserProfile(req: Xrequest) {
    try {
      let patchData: any = {};
      try {
        patchData = JSON.parse(req.body.data);
      } catch {
        patchData = req.body;
      }

      console.log(patchData);
      if (!patchData) {
        throw createError.NotFound("No data was provided");
      }
      let account: any = await Accounts.findOne({
        _id: req.query.accountId || req.accountId,
      });
      if (!account) {
        throw createError.NotFound("Account was not found");
      }
      const existingMail = await Accounts.findOne({
        email: patchData?.email,
      });
      if (existingMail) {
        delete patchData?.email;
      }
      // const parsedPhone = normalizePhoneNumber(patchData?.countryCode, patchData?.phone);
      // patchData.phone = parsedPhone
      if (patchData?.phone) {
        let existingPhone = await Accounts.findOne({
          dialCode: patchData?.dialCode,
          phone: patchData.phone,
        });

        if (existingPhone) {
          delete patchData?.phone;
          delete patchData?.dialCode;
          delete patchData?.countryCode;
        }
      }
      // Add fields validation
      if (req.query.accountId) {
        Object.keys(patchData).forEach((field) => {
          if (field != "email") account[field] = patchData[field];
        });
      } else {
        Object.keys(patchData).forEach((field) => {
          account[field] = patchData[field];
        });
      }

      if (req?.attachments?.length > 0) {
        account.avatar = req.attachments[0].replaceAll("/public", "");
      }

      console.log("patchData?.phone ", patchData?.phone);

      account = await account.save();
      account.password = null;
      return {
        status: true,
        data: account,
        message: "Profile updated successfully..",
      };
    } catch (error: any) {
      let msg = "This request has been denied";
      console.log(error);
      if (error?.message.includes("denied")) {
        msg = error?.message;
      }

      if (error?.message.includes("duplicate key")) {
        msg = "This email address is already taken.";
      }
      return { status: false, message: msg };
    }
  }

  static async changePassword(req: Xrequest) {
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

  static async addAddress(req: Xrequest) {
    try {
      const data: any = req.body!;
      data.account = req.accountId! as string;
      const address = await Address.create(data);

      await AccountService.setDefaultAddress(req, address._id.toString());
      return {
        status: true,
        message: "A new google address has been created",
        data: address,
      };
    } catch (error: any) {
      return {
        status: false,
        message: "We could not add an address at this moment",
      };
    }
  }

  static async getAddresses(req: Xrequest) {
    try {
      const addresses = await Address.find({ account: req.accountId! });
      return {
        status: true,
        message: "Fetched user addresses",
        data: addresses,
      };
    } catch (error: any) {
      return {
        status: false,
        message: "We could not add an address at this moment",
      };
    }
  }

  static async setDefaultAddress(
    req: Xrequest,
    addressId: string | null = null
  ) {
    try {
      const defaultAddress: any = await Address.findOne({
        account: req.accountId!,
        isDefault: true,
      });
      if (defaultAddress) {
        defaultAddress.isDefault = false;
        await defaultAddress.save();
      }
      if (!addressId) {
        addressId = req.body.addressId;
      }

      const newDefault = await Address.findOne({
        account: req.accountId!,
        _id: addressId,
      })!;
      if (newDefault) {
        newDefault.isDefault = true;
        const newdefaultAddress = await newDefault.save();
        return {
          status: true,
          message: "Default address was set",
          data: newdefaultAddress,
        };
      }
      return {
        status: false,
        message: "We could not sset default address at this moment",
      };
    } catch (error: any) {
      return {
        status: false,
        message: "We could not sset default address at this moment",
      };
    }
  }

  static async removeAddress(req: Xrequest) {
    try {
      const addressId = req.body.addressId;
      const deletedAddress: any = await Address.findOneAndDelete({
        account: req.accountId!,
        _id: addressId,
      });
      if (deletedAddress) {
        return {
          status: true,
          message: "Address was deleted",
          data: deletedAddress,
        };
      }
      return {
        status: false,
        message: "Address does not exist!",
      };
    } catch (error: any) {
      return {
        status: false,
        message: "We could not delete address at this moment",
      };
    }
  }

  @handleErrors()
  static async deactivateAccount(req: Xrequest) {
    const accountId = req.body.accountId;
    let account = await Accounts.findOne({ _id: accountId });
    if (account) {
      account.active = false;
      account = await account.save();
      account.password = "oops nothing to see here";
      return {
        status: true,
        message: "Account de-activated",
        code: 200,
      };
    }
    return {
      status: false,
      data: null,
      message: "No account was found...",
      code: 200,
    };
  }
}
