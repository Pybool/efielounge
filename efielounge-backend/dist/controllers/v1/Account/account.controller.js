"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const account_service_1 = require("../../../services/v1/Accounts/account.service");
const accounts_service_1 = require("../../../services/v1/Admin/accounts.service");
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
    uploadAvatar: async (req, res, next) => {
        try {
            let status = 400;
            const result = await account_service_1.AccountService.uploadAvatar(req);
            if (result)
                status = 200;
            return res.status(status).json(result);
        }
        catch (error) {
            error.status = 500;
            next(error);
        }
    },
    getCustomers: async (req, res, next) => {
        try {
            let status = 400;
            const result = await accounts_service_1.AdminAccountService.getCustomers(req);
            if (result)
                status = 200;
            return res.status(status).json(result);
        }
        catch (error) {
            error.status = 500;
            next(error);
        }
    },
    getStaff: async (req, res, next) => {
        try {
            let status = 400;
            const result = await accounts_service_1.AdminAccountService.getStaff(req);
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
