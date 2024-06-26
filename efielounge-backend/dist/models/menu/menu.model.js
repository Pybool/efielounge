"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const Schema = mongoose_1.default.Schema;
const MenuSchema = new Schema({
    name: {
        type: String,
        default: "",
        required: false,
    },
    description: {
        type: String,
        default: "",
        required: false,
    },
    slug: {
        type: String,
        default: "",
        required: false,
    },
    price: {
        type: Number,
        default: 0.0,
        required: false,
    },
    currency: {
        type: String,
        default: "GHC",
        enum: ["GHC", "USD"],
    },
    attachments: [],
    menuItems: {
        type: [Schema.Types.ObjectId],
        ref: "menuitem",
        required: false,
    },
    category: {
        type: Schema.Types.ObjectId,
        ref: "menucategories",
        required: false,
    },
    ratings: {
        type: Number,
        default: 0,
        required: false,
    },
    likes: {
        type: Number,
        default: 0,
        required: false,
    },
    createdAt: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        default: "Cooking",
        enum: ["Cooking", "Ready", "You're Too Late"]
    }
});
const Menu = mongoose_1.default.model("menu", MenuSchema);
exports.default = Menu;
