import Joi from '@hapi/joi';

const authSchema = Joi.object({
  email: Joi.string().email().lowercase().required(),
  password: Joi.string().min(4).required(),
  userName: Joi.string(),
  role: Joi.string()
});

const authPhoneSchema = Joi.object({
  phone: Joi.string().required(),
  otp: Joi.number().required(),
  countryCode: Joi.string().required(),
  dialCode: Joi.string().required(),
});

const authEmailSchema = Joi.object({
  email: Joi.string().email().lowercase().required(),
  otp: Joi.number().required()
});

const authPhoneLoginSchema = Joi.object({
  dialCode:Joi.string().required(),
  countryCode: Joi.string().required(),
  phone: Joi.string().required(),
  otp: Joi.number().required()
});

const authEmailLoginSchema = Joi.object({
  email: Joi.string().required(),
  otp: Joi.number().required()
});

const authSendEmailConfirmOtpSchema = Joi.object({
  email: Joi.string().email().lowercase().required(),
});

const authSendResetPasswordLink = Joi.object({
  email: Joi.string().email().lowercase().required(),
});

const authResetPassword = Joi.object({
  email:Joi.string().email().lowercase().required(),
  otp: Joi.string().required(),
  password: Joi.string().min(4).required(),
});

const validations = {
  authSchema,
  authSendEmailConfirmOtpSchema,
  authSendResetPasswordLink,
  authResetPassword,
  authPhoneSchema,
  authPhoneLoginSchema,
  authEmailLoginSchema,
  authEmailSchema
}

export default validations