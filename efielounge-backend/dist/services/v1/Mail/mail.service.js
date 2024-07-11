"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ejs_1 = __importDefault(require("ejs"));
const mailtrigger_service_1 = __importDefault(require("./mailtrigger.service"));
let env = process.env.NODE_ENV;
let path = "";
if (env == "dev") {
    path = "src/";
}
const mailActions = {
    auth: {
        sendEmailConfirmationOtp: async (email, otp) => {
            return new Promise(async (resolve, reject) => {
                try {
                    const template = await ejs_1.default.renderFile(`${path}templates/emailConfirmation.ejs`, { email, otp });
                    const mailOptions = {
                        from: process.env.EFIELOUNGE_EMAIL_HOST_USER,
                        to: email,
                        subject: "Confirm your registration",
                        text: `Use the otp in this mail to complete your account onboarding`,
                        html: template,
                    };
                    await (0, mailtrigger_service_1.default)(mailOptions);
                    resolve({ status: true });
                }
                catch (error) {
                    console.log(error);
                    resolve({ status: false });
                }
            }).catch((error) => {
                console.log(error);
                throw error;
            });
        },
        sendPasswordResetMail: async (email, otp) => {
            return new Promise(async (resolve, reject) => {
                try {
                    const template = await ejs_1.default.renderFile(`${path}templates/passwordResetOtp.ejs`, { email, otp });
                    const mailOptions = {
                        from: process.env.EFIELOUNGE_EMAIL_HOST_USER,
                        to: email,
                        subject: "Password Reset",
                        text: `Use the otp in this mail to complete your password reset`,
                        html: template,
                    };
                    await (0, mailtrigger_service_1.default)(mailOptions);
                    resolve({ status: true });
                }
                catch (error) {
                    console.log(error);
                    resolve({ status: false });
                }
            }).catch((error) => {
                console.log(error);
                throw error;
            });
        },
    },
    orders: {
        sendOrderConfirmationMail: async (email, orderId) => {
            return new Promise(async (resolve, reject) => {
                try {
                    const template = await ejs_1.default.renderFile(`${path}templates/orderConfirmation.ejs`, { email, orderId });
                    console.log("receipient ", email);
                    const mailOptions = {
                        from: process.env.EFIELOUNGE_EMAIL_HOST_USER,
                        to: email,
                        subject: "Order Placed",
                        text: `You have just placed an order with us`,
                        html: template,
                    };
                    await (0, mailtrigger_service_1.default)(mailOptions);
                    resolve({ status: true });
                }
                catch (error) {
                    console.log(error);
                    resolve({ status: false });
                }
            }).catch((error) => {
                console.log(error);
                throw error;
            });
        }
    }
};
exports.default = mailActions;
