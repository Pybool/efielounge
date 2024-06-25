"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const Schema = mongoose_1.default.Schema;
const MenuItemSchema = new Schema({
    name: {
        type: String,
        default: "",
        required: false,
    },
    category: {
        type: [Schema.Types.ObjectId],
        ref: "menuitemcategories",
        required: false,
    },
    description: {
        type: String,
        default: "",
        required: false,
    },
    price: {
        type: Number,
        default: 0.00,
        required: false,
    },
    attachments: [],
    currency: {
        type: String,
        default: "GHC",
        enum: ["GHC", "USD"]
    },
    status: {
        type: String,
        default: "Available",
        enum: ["Available", "You're Too Late"]
    }
});
const MenuItem = mongoose_1.default.model("menuitem", MenuItemSchema);
exports.default = MenuItem;
