import ejs from "ejs";
import sendMail from "./mailtrigger.service";
const juice = require("juice");
let env = process.env.NODE_ENV;
let path = "dist/";
if (env == "dev") {
  path = "src/";
}
const mailActions = {
  auth: {
    sendEmailConfirmationOtp: async (email: string, otp: string) => {
      return new Promise(async (resolve, reject) => {
        try {
          const template = await ejs.renderFile(
            `${path}templates/emailConfirmation.ejs`,
            { email, otp }
          );

          const mailOptions = {
            from: process.env.EFIELOUNGE_EMAIL_HOST_USER,
            to: email,
            subject: "Email Verification",
            text: `Use the otp in this mail to complete your account onboarding`,
            html: template,
          };
          await sendMail(mailOptions);
          resolve({ status: true });
        } catch (error) {
          console.log(error);
          resolve({ status: false });
        }
      }).catch((error: any) => {
        console.log(error);
        throw error;
      });
    },

    sendPasswordResetMail: async (email: string, otp: any) => {
      return new Promise(async (resolve, reject) => {
        try {
          const template = await ejs.renderFile(
            `${path}templates/passwordResetOtp.ejs`,
            { email, otp }
          );

          const mailOptions = {
            from: process.env.EFIELOUNGE_EMAIL_HOST_USER,
            to: email,
            subject: "Password Reset",
            text: `Use the otp in this mail to complete your password reset`,
            html: template,
          };
          await sendMail(mailOptions);
          resolve({ status: true });
        } catch (error) {
          console.log(error);
          resolve({ status: false });
        }
      }).catch((error: any) => {
        console.log(error);
        throw error;
      });
    },
  },

  orders:{
    sendOrderSuccessfulMail: async (email:string, checkOutId:string)=>{
      return new Promise(async (resolve, reject) => {
        try {
          const template = await ejs.renderFile(
            `${path}templates/orderUpdate.ejs`,
            { email, checkOutId }
          );

          const mailOptions = {
            from: process.env.EFIELOUNGE_EMAIL_HOST_USER,
            to: email,
            subject: "Order Placed",
            text: `You have just placed an order with us`,
            html: template,
          };
          await sendMail(mailOptions);
          resolve({ status: true });
        } catch (error) {
          console.log(error);
          resolve({ status: false });
        }
      }).catch((error: any) => {
        console.log(error);
        throw error;
      });
    },
    sendOrderUpdateMail: async (email:string, status:string, checkOutId:string)=>{

      const msgs:any = {
        "CONFIRMED": {
          short: "Efielounge Confirmed Order",
          long: "We have confirmed your order, it will be processed as soon as possible"
        },
        "DISPATCHED": {
          short: "Efielounge Dispatched Order",
          long: "Yay!!, Your order has been dispatched and would arrive shortly"
        },
        "DELIVERED": {
          short: "Efielounge Order Delivered",
          long: "Your order has been delivered, Thank you for choosing Efielounge."
        },
        "CANCELLED": {
          short: "Efielounge Order Cancelled",
          long: "Unfortunately your order had to be cancelled, refunds will be processed as soon as possible"
        },
      }
      return new Promise(async (resolve, reject) => {
        try {
          const msg = msgs[status]
          const template = await ejs.renderFile(
            `${path}templates/orderUpdate.ejs`,
            { email, msg, checkOutId }
          );
          console.log("receipient ", email, checkOutId);

          const mailOptions = {
            from: process.env.EFIELOUNGE_EMAIL_HOST_USER,
            to: email,
            subject: msg.short,
            text: msg.short,
            html: template,
          };
          await sendMail(mailOptions);
          resolve({ status: true });
        } catch (error) {
          console.log(error);
          resolve({ status: false });
        }
      }).catch((error: any) => {
        console.log(error);
        throw error;
      });
    },
    sendReceiptMail: async (email:string, metaData:any, orders:any[])=>{
      return new Promise(async (resolve, reject) => {
        try {
          const template = await ejs.renderFile(
            `${path}templates/receipt.ejs`,
            { email, metaData, orders }
          );

          console.log(email)

          const mailOptions = {
            from: process.env.EFIELOUNGE_EMAIL_HOST_USER,
            to: email,
            subject: "Order Receipt",
            text: `You have just placed an order with us`,
            html: juice(template),
          };
          await sendMail(mailOptions);
          resolve({ status: true });
        } catch (error) {
          console.log(error);
          resolve({ status: false });
        }
      }).catch((error: any) => {
        console.log(error);
        throw error;
      });
    },
  }
  
};

export default mailActions;
