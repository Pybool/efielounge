import axios from "axios";
import { handleErrors } from "../../../global.error.handler";
import { config as dotenvConfig } from "dotenv";

dotenvConfig();
dotenvConfig({ path: `.env.${process.env.NODE_ENV}` });
const baseUrl = "https://v3.api.termii.com/api/sms/otp/send";

export class SmsService {
  @handleErrors()
  static async sendSms(msgType: string, otp: number, data: any) {
    const messages: any = {
      REGISTER: `Welcome to EfieLounge! Your registration OTP is ${otp}. Please enter this code to complete your registration.`,
      LOGIN: `Your EfieLounge login OTP is ${otp}. Please enter this code to log in to your account.`,
    };

    data["message_text"] = messages[msgType];

    return axios
      .post(baseUrl, data, {
        headers: {
          "Content-Type": "application/json",
        },
      })
      .then((response) => {
        console.log("SMS sent successfully:", response.data);
        return response.data
      })
      .catch((error) => {
        console.error("Error sending SMS:", error);
        return error?.message
      });
  }
}
