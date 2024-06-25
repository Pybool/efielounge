"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const account_service_1 = require("../../../services/v1/Accounts/account.service");
const accountController = {
    getUserProfile: async (req, res, next) => {
        try {
            let status = 400;
            const result = await account_service_1.AccountService.getUserProfile(req);
            if (result)
                status = 200;
            return res.status(status).json(result);
        }
        catch (error) {
            error.status = 500;
            next(error);
        }
    },
    saveUserProfile: async (req, res, next) => {
        try {
            let status = 400;
            const result = await account_service_1.AccountService.saveUserProfile(req);
            if (result)
                status = 200;
            return res.status(status).json(result);
        }
        catch (error) {
            error.status = 500;
            next(error);
        }
    },
};
exports.default = accountController;
