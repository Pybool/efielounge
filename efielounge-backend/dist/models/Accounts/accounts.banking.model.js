"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const Schema = mongoose_1.default.Schema;
const AccountBankDetailSchema = new Schema({
    accountId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: "accounts",
    },
    bvn: {
        type: String,
        default: null,
    },
    preferredBank: {
        type: String,
        default: null,
    },
    accountNo: {
        type: String,
        default: null,
    },
    accountName: {
        type: String,
        default: null,
    },
});
const AccountBankDetails = mongoose_1.default.model("accountBankDetails", AccountBankDetailSchema);
exports.default = AccountBankDetails;
