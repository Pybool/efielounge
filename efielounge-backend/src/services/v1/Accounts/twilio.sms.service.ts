import { handleErrors } from "../../../global.error.handler";
import { config as dotenvConfig } from "dotenv";

dotenvConfig();
dotenvConfig({ path: `.env.${process.env.NODE_ENV}` });

const twilio = require("twilio");

export class SmsService {
  @handleErrors("An Error occured while sending sms to customer")
  static async sendSMS(to: string, messageType: string, otp: number) {
    const accountSid = process.env.EFIELOUNGE_TWILIO_SID;
    const authToken = process.env.EFIELOUNGE_TWILIO_AUTH_TOKEN;

    const messages: any = {
      REGISTER: `Welcome to EfieLounge! Your registration OTP is ${otp}. Please enter this code to complete your registration.`,
      LOGIN: `Your EfieLounge login OTP is ${otp}. Please enter this code to log in to your account.`,
    };

    const client = new twilio(accountSid, authToken);

    // async function listVerificationTemplate() {
    //   const templates = await client.verify.v2.templates.list({ limit: 20 });

    //   templates.forEach((t: any) => console.log(t.translations));
    // }

    // listVerificationTemplate();
    return client.verify.v2
      .services("VA6facc0e3de1a96205d902f9ab2f6e33c")
      .verifications.create({ to: "+233535845865", channel: "sms" })
      .then((verification: any) => console.log(verification.sid));
    // Send an SMS using Twilio's API
    // return client.messages
    //   .create({
    //     body: messages[messageType],
    //     to: `+233${to}`,
    //     from: process.env.EFIELOUNGE_TWILIO_PHONE_NUMBER,
    //   })
    //   .then((message: { sid: any }) => {
    //     console.log("Message sent successfully:", message.sid);
    //     return message.sid;
    //   })
    //   .catch((error: any) => {
    //     console.error("Error sending message:", error);
    //     throw error;
    //   });
  }
}
