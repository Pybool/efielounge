import { RequestHandler } from "express";

export interface IAuth {
  createAccount: RequestHandler;
  sendEmailConfirmationOtp: RequestHandler;
  sendPasswordResetLink: RequestHandler;
  resetPassword: RequestHandler;
  verifyAccountEmail: RequestHandler;
  loginAccount: RequestHandler;
  getRefreshToken: RequestHandler;
}

export interface ISocialAuth {
  googleAuthenticate: RequestHandler;
  twitterAuthenticate: RequestHandler;
  appleAuthenticate: RequestHandler;
}
