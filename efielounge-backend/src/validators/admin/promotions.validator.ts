import Joi from "@hapi/joi";

const promotionCreationSchema = Joi.object({
  description: Joi.string().required(),
  attachments: Joi.array().items(
    Joi.object({
      type: Joi.string().required(),
      url: Joi.string().required(),
    })
  ),
});

const promotionActivationSchema = Joi.object({
  _id: Joi.string().required(),
  isActive: Joi.boolean().required(),
});

const promotionDeletionSchema = Joi.object({
  _id: Joi.string().required(),
});

const validations = {
  promotionCreationSchema,
  promotionActivationSchema,
  promotionDeletionSchema
};

export default validations;
