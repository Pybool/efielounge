"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const Schema = mongoose_1.default.Schema;
const MenuCategoriesSchema = new Schema({
    name: {
        type: String,
        default: "",
        required: false,
    }
});
const MenuCategories = mongoose_1.default.model("menucategories", MenuCategoriesSchema);
exports.default = MenuCategories;
