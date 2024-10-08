import express from 'express';
import authController from '../../controllers/v1/Authentication/local/local.controller';
import { decode, decodeExt } from '../../middlewares/jwt';
import { handleInvalidMethod } from '../../middlewares/invalidrequest';
import { limiter } from '../../middlewares/ratelimit';
const authRouter = express.Router();

authRouter.post('/register', decodeExt, authController.createAccount)
// authRouter.post('/phone-register', decodeExt, authController.phoneRegister)
// authRouter.post('/email-register', decodeExt, authController.emailRegister)
authRouter.post('/phone-otp',limiter, decodeExt, authController.sendPhoneOtp)
authRouter.post('/email-otp',limiter, decodeExt, authController.sendEmailOtp)
authRouter.post('/phone-login', decodeExt, authController.phoneLogin)
authRouter.post('/email-login', decodeExt, authController.emailLogin)

authRouter.post('/resend-email-verification-otp',limiter, authController.sendEmailConfirmationOtp)
authRouter.post('/send-password-reset-otp', authController.sendPasswordResetLink)
authRouter.post('/reset-password', authController.resetPassword)
authRouter.post('/login', authController.loginAccount)
authRouter.post('/refresh-token', authController.getRefreshToken)
authRouter.put('/accept-terms', authController.acceptedTerms)


// authRouter.get('/user-profile', decode, authController.getUserProfile)
// authRouter.put('/user-profile', decode, authController.saveUserProfile)
// authRouter.put('/verify-account', authController.verifyAccountEmail)



authRouter.all('/register', handleInvalidMethod);
authRouter.all('/verify-email-address', handleInvalidMethod);
authRouter.all('/resend-email-verification', handleInvalidMethod);
authRouter.all('/send-reset-password-otp', handleInvalidMethod);
authRouter.all('/reset-password', handleInvalidMethod);
authRouter.all('/login', handleInvalidMethod);
authRouter.all('/refresh-token', handleInvalidMethod);
authRouter.all('/user-profile', handleInvalidMethod);
authRouter.all('/user-profile', handleInvalidMethod);
export default authRouter;

