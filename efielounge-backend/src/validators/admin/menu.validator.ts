import Joi from "@hapi/joi";

const menuCategoriesSchema = Joi.object({
  _id:Joi.string(),
  name: Joi.string().required(),
});

const menuItemCategoriesSchema = Joi.object({
  _id:Joi.string(),
  name: Joi.string().required(),
});

const menuItemSchema = Joi.object({
  _id:Joi.string(),
  name: Joi.string().required(),
  description: Joi.string().allow(''),
  category: Joi.string(),
  price: Joi.number(),
  currency: Joi.string(),
  status: Joi.string(),
});

const menuSchema = Joi.object({
  _id:Joi.string(),
  name: Joi.string().required(),
  description: Joi.string().allow(''),
  category: Joi.string(),
  price: Joi.number(),
  currency: Joi.string(),
  status: Joi.string(),
  menuItems: Joi.array(),
  variants: Joi.array()
});

const validations = {
  menuCategoriesSchema,
  menuItemCategoriesSchema,
  menuItemSchema,
  menuSchema,
};

export default validations;