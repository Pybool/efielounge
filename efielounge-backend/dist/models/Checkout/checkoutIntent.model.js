"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const Schema = mongoose_1.default.Schema;
const CheckoutIntentSchema = new Schema({
    account: {
        type: Schema.Types.ObjectId,
        ref: "accounts",
        required: false,
        unique: true
    },
    checkOutId: {
        type: String,
        required: true,
        unique: true
    },
    cart: {
        type: [Schema.Types.ObjectId],
        ref: "cart",
        required: true,
    },
    status: {
        type: String,
        default: "PENDING",
        required: false,
        enum: ['PENDING', 'PLACED', 'SHIPPED', 'DELIVERED', 'CANCELED']
    },
});
const CheckOut = mongoose_1.default.model("checkoutintent", CheckoutIntentSchema);
exports.default = CheckOut;
