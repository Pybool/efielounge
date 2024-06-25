"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const local_controller_1 = __importDefault(require("../../controllers/v1/Authentication/local/local.controller"));
const invalidrequest_1 = require("../../middlewares/invalidrequest");
const authRouter = express_1.default.Router();
authRouter.post('/register', local_controller_1.default.createAccount);
authRouter.post('/resend-email-verification-otp', local_controller_1.default.sendEmailConfirmationOtp);
authRouter.post('/send-password-reset-otp', local_controller_1.default.sendPasswordResetLink);
authRouter.post('/reset-password', local_controller_1.default.resetPassword);
authRouter.post('/login', local_controller_1.default.loginAccount);
authRouter.post('/refresh-token', local_controller_1.default.getRefreshToken);
// authRouter.get('/user-profile', decode, authController.getUserProfile)
// authRouter.put('/user-profile', decode, authController.saveUserProfile)
authRouter.put('/verify-account', local_controller_1.default.verifyAccountEmail);
authRouter.all('/register', invalidrequest_1.handleInvalidMethod);
authRouter.all('/verify-email-address', invalidrequest_1.handleInvalidMethod);
authRouter.all('/resend-email-verification', invalidrequest_1.handleInvalidMethod);
authRouter.all('/send-reset-password-otp', invalidrequest_1.handleInvalidMethod);
authRouter.all('/reset-password', invalidrequest_1.handleInvalidMethod);
authRouter.all('/login', invalidrequest_1.handleInvalidMethod);
authRouter.all('/refresh-token', invalidrequest_1.handleInvalidMethod);
authRouter.all('/user-profile', invalidrequest_1.handleInvalidMethod);
authRouter.all('/user-profile', invalidrequest_1.handleInvalidMethod);
exports.default = authRouter;
