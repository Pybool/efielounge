"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require('mongoose');
const OrderSequenceSchema = new mongoose.Schema({
    sequence: {
        type: Number,
        default: 0, // Initial sequence value
    },
    checksum: {
        type: Number,
        default: 0, // Initial checksum value
    },
});
const OrderSequence = mongoose.model('ordersequence', OrderSequenceSchema);
exports.default = OrderSequence;
