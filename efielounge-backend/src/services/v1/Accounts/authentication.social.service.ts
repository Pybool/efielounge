import { config as dotenvConfig } from "dotenv";
import jwthelper from "../../../helpers/jwt_helper";
import Xrequest from "../../../interfaces/extensions.interface";
import Accounts from "../../../models/Accounts/accounts.model";

dotenvConfig();
dotenvConfig({path:`.env.${process.env.NODE_ENV}`});

export class SocialAuthentication {

  static async googleAuthenticate(req:Xrequest) {
    try {
      const profile = req.body.profile;
      console.log(profile.email)
      if(!profile.id || !profile.email){
        return {
          status: false,
          message: "Invalid google authentication profile"
        }
      }
      let user: any = await Accounts.findOne({
        $or: [{ googleId: profile.id }, { email: profile.email }],
      });

      if (user && user?.googleId === "") {
        user.googleId = profile.id;
        await user.save();
      }


      if (!user) {
        const newUser: any = await Accounts.create({
          authProvider: "GOOGLE",
          googleId: profile.id,
          fullName: profile.displayName,
          email: profile.email,
          createdAt: new Date(),
        });
        user = newUser;
      }
      const accessToken = await jwthelper.signAccessToken(user._id!.toString());
      const refreshToken = await jwthelper.signRefreshToken(
        user._id!.toString()
      );
      const authResult = {
        status: true,
        message: "Google signup was successful",
        data: user,
        accessToken,
        refreshToken,
        extraMessage: ""
      };
      return authResult;
    } catch (error: any) {
      console.error(error);
      return {
        status: false,
        message: "Google signup was not successfull",
      };
    }
  }

  static async twitterAuthenticate(req:Xrequest) {
    try {
      const profile = req.body.profile;
      if(!profile.id || !profile.email){
        return {
          status: false,
          message: "Invalid twitter authentication profile"
        }
      }
      let user: any = await Accounts.findOne({
        $or: [{ twitterId: profile.id }, { email: profile.email }],
      });

      if (user && user.twitterId === "") {
        user.twitterId = profile.id;
        await user.save();
      }

      if (!user) {
        const newUser: any = await Accounts.create({
          authProvider: "TWITTER",
          twitterId: profile.id,
          fullName: profile?.displayName,
          email: profile.email,
          createdAt: new Date(),
        });
        user = newUser;
      }
      const accessToken = await jwthelper.signAccessToken(user._id!.toString());
      const refreshToken = await jwthelper.signRefreshToken(
        user._id!.toString()
      );
      const authResult = {
        status: true,
        message: "Twitter signup was successful",
        data: user,
        accessToken,
        refreshToken,
        extraMessage:""
      };
      return authResult;
    } catch (error: any) {
      return {
        status: false,
        message: "Twitter signup was not successfull",
      };
    }
  }

  static async appleAuthenticate(req:Xrequest) {
    
  }
}
