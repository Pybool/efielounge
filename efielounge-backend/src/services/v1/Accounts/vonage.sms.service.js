import { handleErrors } from "../../../global.error.handler";
import { config as dotenvConfig } from "dotenv";
import { Vonage } from "@vonage/server-sdk";

dotenvConfig();
dotenvConfig({ path: `.env.${process.env.NODE_ENV}` });

export class SmsService {
  // @handleErrors("An error occurred while sending SMS to customer")
  static async sendSMS(to, messageType, otp) {
    const vonage = new Vonage({
      apiKey: process.env.EFIELOUNGE_VONAGE_API_KEY,
      apiSecret: process.env.EFIELOUNGE_VONAGE_API_SECRET,
    });

    console.log("Vonage ===> ", vonage, process.env.EFIELOUNGE_VONAGE_API_KEY)

    const messages = {
      "REGISTER": `Welcome to EfieLounge! Your registration OTP is ${otp}. Please enter this code to complete your registration.`,
      "LOGIN": `Your EfieLounge login OTP is ${otp}. Please enter this code to log in to your account.`,
    };

    return new Promise((resolve, reject) => {
      vonage.sms.send(
        { to, from: process.env.EFIELOUNGE_VONAGE_PHONE_NUMBER, text: messages[messageType] },
        (err, responseData) => {
          if (err) {
            console.error("Error sending message:", err);
            reject(err);
          } else {
            if (responseData.messages[0].status === "0") {
              console.log("Message sent successfully:", responseData.messages[0].messageId);
              resolve(responseData.messages[0].messageId);
            } else {
              console.error("Message failed with error:", responseData.messages[0]["error-text"]);
              reject(new Error(responseData.messages[0]["error-text"]));
            }
          }
        }
      );
    });
  }
}
