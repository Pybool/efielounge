"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const Schema = mongoose_1.default.Schema;
const CartSchema = new Schema({
    account: {
        type: Schema.Types.ObjectId,
        ref: "accounts",
        required: false,
    },
    menu: {
        type: Schema.Types.ObjectId,
        ref: "menu",
        required: true,
    },
    units: {
        type: Number,
        default: 1,
        required: false,
    },
    customMenuItems: {
        type: [Schema.Types.ObjectId],
        ref: "menuitem",
        required: false,
    },
    createdAt: {
        type: Date,
        required: true
    }
});
const Cart = mongoose_1.default.model("cart", CartSchema);
exports.default = Cart;
