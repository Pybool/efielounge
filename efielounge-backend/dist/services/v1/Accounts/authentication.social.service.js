"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocialAuthentication = void 0;
const dotenv_1 = require("dotenv");
const jwt_helper_1 = __importDefault(require("../../../helpers/jwt_helper"));
const accounts_model_1 = __importDefault(require("../../../models/Accounts/accounts.model"));
(0, dotenv_1.config)();
(0, dotenv_1.config)({ path: `.env.${process.env.NODE_ENV}` });
class SocialAuthentication {
    static async googleAuthenticate(req) {
        try {
            const profile = req.body.profile;
            console.log(profile.email);
            if (!profile.id || !profile.email) {
                return {
                    status: false,
                    message: "Invalid google authentication profile"
                };
            }
            let user = await accounts_model_1.default.findOne({
                $or: [{ googleId: profile.id }, { email: profile.email }],
            });
            if (user && user?.googleId === "") {
                user.googleId = profile.id;
                await user.save();
            }
            if (!user) {
                const newUser = await accounts_model_1.default.create({
                    authProvider: "GOOGLE",
                    googleId: profile.id,
                    fullName: profile.displayName,
                    email: profile.email,
                    createdAt: new Date(),
                });
                user = newUser;
            }
            const accessToken = await jwt_helper_1.default.signAccessToken(user._id.toString());
            const refreshToken = await jwt_helper_1.default.signRefreshToken(user._id.toString());
            const authResult = {
                status: true,
                message: "Google signup was successful",
                data: user,
                accessToken,
                refreshToken,
                extraMessage: ""
            };
            return authResult;
        }
        catch (error) {
            console.error(error);
            return {
                status: false,
                message: "Google signup was not successfull",
            };
        }
    }
    static async twitterAuthenticate(req) {
        try {
            const profile = req.body.profile;
            if (!profile.id || !profile.email) {
                return {
                    status: false,
                    message: "Invalid twitter authentication profile"
                };
            }
            let user = await accounts_model_1.default.findOne({
                $or: [{ twitterId: profile.id }, { email: profile.email }],
            });
            if (user && user.twitterId === "") {
                user.twitterId = profile.id;
                await user.save();
            }
            if (!user) {
                const newUser = await accounts_model_1.default.create({
                    authProvider: "TWITTER",
                    twitterId: profile.id,
                    fullName: profile?.displayName,
                    email: profile.email,
                    createdAt: new Date(),
                });
                user = newUser;
            }
            const accessToken = await jwt_helper_1.default.signAccessToken(user._id.toString());
            const refreshToken = await jwt_helper_1.default.signRefreshToken(user._id.toString());
            const authResult = {
                status: true,
                message: "Twitter signup was successful",
                data: user,
                accessToken,
                refreshToken,
                extraMessage: ""
            };
            return authResult;
        }
        catch (error) {
            return {
                status: false,
                message: "Twitter signup was not successfull",
            };
        }
    }
    static async appleAuthenticate(req) {
    }
}
exports.SocialAuthentication = SocialAuthentication;
