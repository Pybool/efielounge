"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const Schema = mongoose_1.default.Schema;
const AgentDocumentsSchema = new Schema({
    accountId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: "accounts",
    },
    highestQualification: {
        type: String,
        default: null,
    },
    certificate: {
        type: String,
        required: false,
        default: null,
    },
    nationalId: {
        type: String,
        required: false,
        default: null
    },
    resume: {
        type: String,
        required: false,
        default: null
    },
    g1nationalId: {
        type: String,
        required: false,
        default: null
    },
    g2nationalId: {
        type: String,
        required: false,
        default: null
    },
});
const AgentDocuments = mongoose_1.default.model("AgentDocuments", AgentDocumentsSchema);
exports.default = AgentDocuments;
