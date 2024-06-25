import Joi from "@hapi/joi";

const menuCategoriesSchema = Joi.object({
  name: Joi.string().required(),
});

const menuItemCategoriesSchema = Joi.object({
  name: Joi.string().required(),
});

const menuItemSchema = Joi.object({
  name: Joi.string().required(),
  description: Joi.string(),
  category: Joi.string(),
  price: Joi.number(),
  currency: Joi.string(),
  status: Joi.string(),
});

const menuSchema = Joi.object({
  name: Joi.string().required(),
  description: Joi.string(),
  category: Joi.string(),
  price: Joi.number(),
  currency: Joi.string(),
  status: Joi.string(),
  menuItems: Joi.array()
});

const validations = {
  menuCategoriesSchema,
  menuItemCategoriesSchema,
  menuItemSchema,
  menuSchema,
};

export default validations;