import jwt from "jsonwebtoken";
import { Socket } from "socket.io";
import { config as dotenvConfig } from "dotenv";
import { Types } from "mongoose";
import Accounts from "../models/Accounts/accounts.model";

dotenvConfig();
dotenvConfig({ path: `.env.${process.env.NODE_ENV}` });

export interface CustomSocket extends Socket {
  user?: any;
  token?: string;
}
type NextFunction = (err?: Error) => void;

async function authenticateToken(token: string) {
  try {
    const SECRET_KEY: string = process.env.EFIELOUNGE_ACCESS_TOKEN_SECRET!;
    const decoded: any = jwt.verify(token, SECRET_KEY);
    let user = await Accounts.findOne({ _id: new Types.ObjectId(decoded.aud!) });
    if (!user) {
      return {
        status: false,
        message: "No associated user was found for the jwt token",
      };
    }
    if (user) {
      return { status: true, user: user };
    }
    return { status: false };
  } catch (error: any) {
    console.log(error);
    return { status: false };
  }
}

export const socketAuth = async (socket: CustomSocket, next: NextFunction) => {
  const token = socket.handshake.auth.token || socket.handshake.query.token;
  if (!token) {
    console.log("Authentication error no token in request")
    return next(new Error("Authentication error no token in request"));
  }

  try {
    const result = await authenticateToken(token);
    if (result.status) {
      socket.user = result?.user!;
      socket.token = token || undefined;
      next();
    }else{
      console.log("Error ", "Authentication error")
      // throw new Error("Invalid or expired token in headers")
      next(new Error("Token Error"));
    }
    
  } catch (error) {
    console.log("Error ", error)
    next(new Error("Authentication error"));
  }
};
