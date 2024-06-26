"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const account_controller_1 = __importDefault(require("../../controllers/v1/Account/account.controller"));
const jwt_1 = require("../../middlewares/jwt");
const invalidrequest_1 = require("../../middlewares/invalidrequest");
const menu_middleware_1 = require("../../middlewares/menu.middleware");
const authRouter = express_1.default.Router();
authRouter.get('/user-profile', jwt_1.decode, account_controller_1.default.getUserProfile);
authRouter.put('/user-profile', jwt_1.decode, (0, menu_middleware_1.getMulterConfigSingle)('../efielounge-backend/public/accounts/'), account_controller_1.default.saveUserProfile);
authRouter.all('/user-profile', invalidrequest_1.handleInvalidMethod);
authRouter.all('/user-profile', invalidrequest_1.handleInvalidMethod);
exports.default = authRouter;
