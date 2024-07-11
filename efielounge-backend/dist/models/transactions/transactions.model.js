"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const Schema = mongoose_1.default.Schema;
const TransactionsSchema = new Schema({
    reference: {
        type: String,
        required: true,
    },
    checkOutId: {
        type: String,
        required: true,
    },
    transaction: {},
    createdAt: {
        type: Date,
        required: true,
    },
});
const Transaction = mongoose_1.default.model("transactions", TransactionsSchema);
exports.default = Transaction;
