"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const Schema = mongoose_1.default.Schema;
const LikesSchema = new Schema({
    account: {
        type: Schema.Types.ObjectId,
        ref: "accounts",
        required: false,
    },
    menuId: {
        type: Schema.Types.ObjectId,
        ref: "menu",
        required: false,
    },
});
const MenuLikes = mongoose_1.default.model("menulikes", LikesSchema);
exports.default = MenuLikes;
