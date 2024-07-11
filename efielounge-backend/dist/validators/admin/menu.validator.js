"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const joi_1 = __importDefault(require("@hapi/joi"));
const menuCategoriesSchema = joi_1.default.object({
    _id: joi_1.default.string(),
    name: joi_1.default.string().required(),
});
const menuItemCategoriesSchema = joi_1.default.object({
    _id: joi_1.default.string(),
    name: joi_1.default.string().required(),
});
const menuItemSchema = joi_1.default.object({
    _id: joi_1.default.string(),
    name: joi_1.default.string().required(),
    description: joi_1.default.string(),
    category: joi_1.default.string(),
    price: joi_1.default.number(),
    currency: joi_1.default.string(),
    status: joi_1.default.string(),
});
const menuSchema = joi_1.default.object({
    _id: joi_1.default.string(),
    name: joi_1.default.string().required(),
    description: joi_1.default.string(),
    category: joi_1.default.string(),
    price: joi_1.default.number(),
    currency: joi_1.default.string(),
    status: joi_1.default.string(),
    menuItems: joi_1.default.array()
});
const validations = {
    menuCategoriesSchema,
    menuItemCategoriesSchema,
    menuItemSchema,
    menuSchema,
};
exports.default = validations;
