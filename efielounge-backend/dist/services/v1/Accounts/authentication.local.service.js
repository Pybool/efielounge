"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Authentication = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const http_errors_1 = __importDefault(require("http-errors"));
const mongoose_1 = __importDefault(require("mongoose"));
const redis_service_1 = require("./redis.service");
const mail_service_1 = __importDefault(require("../Mail/mail.service"));
const joi_validators_1 = __importDefault(require("../../../validators/authentication/joi.validators"));
const messages_1 = __importDefault(require("../../../helpers/messages"));
const accounts_model_1 = __importDefault(require("../../../models/Accounts/accounts.model"));
const jwt_helper_1 = __importDefault(require("../../../helpers/jwt_helper"));
const custom_validators_1 = require("../../../validators/authentication/custom.validators");
class Authentication {
    constructor(req) {
        this.req = req;
        this.payload = req.body || {};
    }
    async createAccount() {
        try {
            const session = await mongoose_1.default.startSession();
            const result = await joi_validators_1.default.authSchema.validateAsync(this.req.body);
            const user = await accounts_model_1.default.findOne({ email: result.email }).session(session);
            if (user) {
                throw http_errors_1.default.Conflict(messages_1.default.auth.alreadyExistPartText);
            }
            result.createdAt = new Date();
            const pendingAccount = new accounts_model_1.default(result);
            const savedUser = await pendingAccount.save();
            if (savedUser._id.toString()) {
                const otp = (0, redis_service_1.generateOtp)();
                await (0, redis_service_1.setExpirableCode)(result.email, "account-verification", otp);
                mail_service_1.default.auth.sendEmailConfirmationOtp(result.email, otp);
                return {
                    status: true,
                    data: savedUser._id,
                    message: "Registration successful",
                };
            }
            return { status: false, message: "Registration was unsuccessful!" };
        }
        catch (error) {
            let msg = "Registration was unsuccessful!";
            if (error.message.includes("already exists!")) {
                error.status = 200;
                msg = error.message || "User with email address already exists!";
            }
            return { status: false, message: msg };
        }
    }
    async loginAccount() {
        try {
            const result = await joi_validators_1.default.authSchema.validateAsync(this.req.body);
            const account = await accounts_model_1.default.findOne({ email: result.email });
            if (!account)
                return http_errors_1.default.NotFound(messages_1.default.auth.userNotRegistered);
            const isMatch = await account.isValidPassword(result.password);
            if (!isMatch)
                return http_errors_1.default.Unauthorized(messages_1.default.auth.invalidCredentials);
            if (!account.emailConfirmed) {
                const otp = (0, redis_service_1.generateOtp)();
                await (0, redis_service_1.setExpirableCode)(result.email, "account-verification", otp);
                await mail_service_1.default.auth.sendEmailConfirmationOtp(result.email, otp);
                return {
                    status: false,
                    code: 1001, //Code 101 is code to restart otp verification...
                    data: account._id,
                    message: "Please verify your account",
                };
            }
            const accessToken = await jwt_helper_1.default.signAccessToken(account.id);
            const refreshToken = await jwt_helper_1.default.signRefreshToken(account.id);
            return { status: true, data: account, accessToken, refreshToken };
        }
        catch (error) {
            console.log(error);
            return { status: false, message: messages_1.default.auth.loginError };
        }
    }
    async sendEmailConfirmationOtp() {
        try {
            const result = await joi_validators_1.default.authSendEmailConfirmOtpSchema.validateAsync(this.req.body);
            const user = await accounts_model_1.default.findOne({ email: result.email });
            if (!user) {
                throw http_errors_1.default.NotFound(custom_validators_1.utils.joinStringsWithSpace([
                    result.email,
                    messages_1.default.auth.notRegisteredPartText,
                ]));
            }
            if (user.emailConfirmed) {
                return { status: false, message: messages_1.default.auth.emailAlreadyVerified };
            }
            const otp = (0, redis_service_1.generateOtp)();
            await (0, redis_service_1.setExpirableCode)(result.email, "account-verification", otp);
            return await mail_service_1.default.auth.sendEmailConfirmationOtp(result.email, otp);
        }
        catch (error) {
            console.log(error);
            throw error;
        }
    }
    async sendPasswordResetLink() {
        try {
            const result = await joi_validators_1.default.authSendResetPasswordLink.validateAsync(this.req.body);
            const user = await accounts_model_1.default.findOne({ email: result.email });
            if (!user) {
                throw http_errors_1.default.NotFound(custom_validators_1.utils.joinStringsWithSpace([
                    result.email,
                    messages_1.default.auth.notRegisteredPartText,
                ]));
            }
            const otp = (0, redis_service_1.generateOtp)();
            await (0, redis_service_1.setExpirableCode)(result.email, "password-reset", otp);
            return mail_service_1.default.auth.sendPasswordResetMail(result.email, otp);
        }
        catch (error) {
            console.log(error);
            throw error.message;
        }
    }
    async resetPassword() {
        try {
            if (!this.req.query.token)
                throw http_errors_1.default.BadRequest(messages_1.default.auth.invalidTokenSupplied);
            const result = await joi_validators_1.default.authResetPassword.validateAsync(this.req.body);
            const account = await accounts_model_1.default.findOne({
                reset_password_token: this.req.body.otp,
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
    async verifyAccountEmail() {
        const { otp, email } = this.req.body;
        if (!otp) {
            return { status: false, message: messages_1.default.auth.missingConfToken };
        }
        const cachedOtp = await (0, redis_service_1.getExpirableCode)("account-verification", email);
        if (!cachedOtp || cachedOtp?.code.toString() !== otp.toString()) {
            return {
                status: false,
                message: "This otp is incorrect or has expired...",
            };
        }
        try {
            const account = await accounts_model_1.default.findOne({ email });
            if (!account.emailConfirmed) {
                account.emailConfirmed = true;
                await account.save();
                return { status: true, message: messages_1.default.auth.emailVerifiedOk };
            }
            return { status: false, message: "Account already verified!" };
        }
        catch (error) {
            console.log(error);
            return { status: false, message: messages_1.default.auth.invalidConfToken };
        }
    }
    async getRefreshToken(next) {
        try {
            const { refreshToken } = this.req.body;
            if (!refreshToken)
                throw http_errors_1.default.BadRequest();
            const { aud } = (await jwt_helper_1.default.verifyRefreshToken(refreshToken, next));
            if (aud) {
                const accessToken = await jwt_helper_1.default.signAccessToken(aud);
                // const refToken = await jwthelper.signRefreshToken(aud);
                return { status: true, accessToken: accessToken };
            }
        }
        catch (error) {
            console.log(error);
            return { status: false, message: error.mesage };
        }
    }
}
exports.Authentication = Authentication;
