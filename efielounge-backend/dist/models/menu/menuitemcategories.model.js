"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const Schema = mongoose_1.default.Schema;
const MenuItemCategoriesSchema = new Schema({
    name: {
        type: String,
        default: "",
        required: false,
    },
    createdAt: {
        type: Date,
        required: true
    }
});
const MenuItemCategories = mongoose_1.default.model("menuitemcategories", MenuItemCategoriesSchema);
exports.default = MenuItemCategories;
