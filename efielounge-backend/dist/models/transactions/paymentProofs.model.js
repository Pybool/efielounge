"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const Schema = mongoose_1.default.Schema;
const PaymentProofSchema = new Schema({
    checkOutId: {
        type: String,
        required: true,
    },
    attachments: [],
});
const PaymentProof = mongoose_1.default.model("paymentproof", PaymentProofSchema);
exports.default = PaymentProof;
