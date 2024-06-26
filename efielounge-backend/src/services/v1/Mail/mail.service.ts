import ejs from "ejs";
import sendMail from "./mailtrigger.service";

const mailActions = {
  auth: {
    sendEmailConfirmationOtp: async (email:string, otp:string) => {
      return new Promise(async (resolve, reject) => {
        try {
          
          const template = await ejs.renderFile(
            "templates/emailConfirmation.ejs",
            { email, otp }
          );

          const mailOptions = {
            from: "info.efielounge@gmail.com",
            to: email,
            subject: "Confirm your registration",
            text: `Use the otp in this mail to complete your account onboarding`,
            html: template,
          };
          await sendMail(mailOptions);
          resolve({ status: true });
        } catch(error){
          console.log(error)
          resolve({ status: false });
        }
      }).catch((error:any)=>{
        console.log(error)
        throw error
      });
    },

    sendPasswordResetMail: async (email: string, otp: any) => {
      return new Promise(async (resolve, reject) => {
        try {
          
          const template = await ejs.renderFile(
            "templates/passwordResetOtp.ejs",
            { email, otp }
          );

          const mailOptions = {
            from: "info.efielounge@gmail.com",
            to: email,
            subject: "Password Reset",
            text: `Use the otp in this mail to complete your password reset`,
            html: template,
          };
          await sendMail(mailOptions);
          resolve({ status: true });
        } catch(error){
          console.log(error)
          resolve({ status: false });
        }
      }).catch((error:any)=>{
        console.log(error)
        throw error
      });
    },
  }
};

export default mailActions;
