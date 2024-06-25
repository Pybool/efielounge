"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ejs_1 = __importDefault(require("ejs"));
const mailtrigger_service_1 = __importDefault(require("./mailtrigger.service"));
const mailActions = {
    auth: {
        sendEmailConfirmationOtp: async (email, otp) => {
            return new Promise(async (resolve, reject) => {
                try {
                    const template = await ejs_1.default.renderFile("src/templates/emailConfirmation.ejs", { email, otp });
                    const mailOptions = {
                        from: "info.swiftcrib@gmail.com",
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
                    const template = await ejs_1.default.renderFile("src/templates/passwordResetOtp.ejs", { email, otp });
                    const mailOptions = {
                        from: "info.efielounge@gmail.com",
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
    }
};
exports.default = mailActions;
