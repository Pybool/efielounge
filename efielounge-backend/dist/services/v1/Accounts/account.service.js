"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccountService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const http_errors_1 = __importDefault(require("http-errors"));
const messages_1 = __importDefault(require("../../../helpers/messages"));
const accounts_model_1 = __importDefault(require("../../../models/Accounts/accounts.model"));
const custom_validators_1 = require("../../../validators/authentication/custom.validators");
const joi_validators_1 = __importDefault(require("../../../validators/authentication/joi.validators"));
class AccountService {
    static async getUserProfile(req) {
        try {
            const account = await accounts_model_1.default.findOne({ _id: req.query.accountId });
            if (!account) {
                throw http_errors_1.default.NotFound("User was not found");
            }
            return {
                status: true,
                data: account,
                code: 200
            }; //await account.getProfile();
        }
        catch (error) {
            console.log(error);
            throw error.message;
        }
    }
    static async uploadAvatar(req) {
        try {
            let account = await accounts_model_1.default.findOne({ _id: req.accountId });
            if (!account) {
                throw http_errors_1.default.NotFound("Account was not found");
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
        }
        catch (error) {
            console.log(error);
            return { status: false, message: "Profile update failed.." };
        }
    }
    static async saveUserProfile(req) {
        try {
            const patchData = JSON.parse(req.body.data);
            console.log(patchData);
            if (!patchData) {
                throw http_errors_1.default.NotFound("No data was provided");
            }
            let account = await accounts_model_1.default.findOne({ _id: req.query.accountId });
            if (!account) {
                throw http_errors_1.default.NotFound("Account was not found");
            }
            // Add fields validation
            Object.keys(patchData).forEach((field) => {
                if (field != "email")
                    account[field] = patchData[field];
            });
            if (req?.attachments?.length > 0) {
                account.avatar = req.attachments[0].replaceAll("/public", "");
            }
            account = await account.save();
            return {
                status: true,
                data: account,
                message: "Profile updated successfully..",
            };
        }
        catch (error) {
            console.log(error);
            return { status: false, message: "Profile update failed.." };
        }
    }
    static async changePassword(req) {
        try {
            if (!req.query.token)
                throw http_errors_1.default.BadRequest(messages_1.default.auth.invalidTokenSupplied);
            const result = await joi_validators_1.default.authResetPassword.validateAsync(req.body);
            const account = await accounts_model_1.default.findOne({
                reset_password_token: req.query.token,
                reset_password_expires: { $gt: Date.now() },
            });
            if (!account) {
                throw http_errors_1.default.NotFound(custom_validators_1.utils.joinStringsWithSpace([
                    result.email,
                    messages_1.default.auth.userNotRequestPasswordReset,
                ]));
            }
            const salt = await bcryptjs_1.default.genSalt(10);
            const hashedPassword = await bcryptjs_1.default.hash(result.password, salt);
            account.password = hashedPassword; // Set to the new password provided by the account
            await account.save();
            return { status: true, message: messages_1.default.auth.passwordResetOk };
        }
        catch (error) {
            console.log(error);
            return { status: false, message: messages_1.default.auth.passwordResetFailed };
        }
    }
}
exports.AccountService = AccountService;
