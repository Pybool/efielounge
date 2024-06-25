"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const Schema = mongoose_1.default.Schema;
const RatingSchema = new Schema({
    rating: {
        type: Number,
        default: 1,
        required: false,
    },
    account: {
        type: Schema.Types.ObjectId,
        ref: "accounts",
        required: false,
    },
});
const MenuRatings = mongoose_1.default.model("menuratings", RatingSchema);
exports.default = MenuRatings;
