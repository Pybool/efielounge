"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminAccountService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const http_errors_1 = __importDefault(require("http-errors"));
const messages_1 = __importDefault(require("../../../helpers/messages"));
const accounts_model_1 = __importDefault(require("../../../models/Accounts/accounts.model"));
const custom_validators_1 = require("../../../validators/authentication/custom.validators");
const joi_validators_1 = __importDefault(require("../../../validators/authentication/joi.validators"));
class AdminAccountService {
    static async getCustomers(req) {
        try {
            const page = Number(req.query.page || 1);
            const limit = Number(req.query.limit || 20);
            const filter = { role: 'CUSTOMER' };
            const [accounts, total] = await Promise.all([
                accounts_model_1.default.find(filter, null).sort({ createdAt: -1 }),
                accounts_model_1.default.countDocuments(filter),
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
        }
        catch (error) {
            console.log(error);
            throw error.message;
        }
    }
    static async getStaff(req) {
        try {
            const page = Number(req.query.page || 1);
            const limit = Number(req.query.limit || 20);
            const filter = { 'role': { '$in': ['STAFF', 'ADMIN'] } };
            const [accounts, total] = await Promise.all([
                accounts_model_1.default.find(filter, null).sort({ createdAt: -1 }),
                accounts_model_1.default.countDocuments(filter),
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
        }
        catch (error) {
            console.log(error);
            throw error.message;
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
exports.AdminAccountService = AdminAccountService;
