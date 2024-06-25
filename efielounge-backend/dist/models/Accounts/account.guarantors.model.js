"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const mongoose = require("mongoose");
const guarantorSchema = new mongoose.Schema({
    accountId: {
        type: mongoose_1.Schema.Types.ObjectId,
        required: true,
        ref: "accounts",
    },
    firstName: {
        type: String,
        required: true,
    },
    lastName: {
        type: String,
        required: true,
    },
    phone: {
        type: String,
        required: true,
    },
    altPhone: {
        type: String,
    },
    address: {
        type: String,
    },
    workPlace: {
        type: String,
    },
    jobDescription: {
        type: String,
    },
    bvn: {
        type: String,
        validate: {
            validator: function (v) {
                return v.length === 11; // Basic validation for 11-digit BVNs
            },
            message: (props) => `${props.value} is not a valid BVN (must be 11 digits)`,
        },
    },
});
const Agentguarantors = mongoose.model("Agentguarantors", guarantorSchema);
exports.default = Agentguarantors;
