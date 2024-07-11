"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const jwt_1 = require("../../middlewares/jwt");
const transaction_controller_1 = __importDefault(require("../../controllers/v1/transaction.controller"));
const authMiddleware = jwt_1.decode;
const transactionRouter = express_1.default.Router();
transactionRouter.post("/save-transaction", authMiddleware, transaction_controller_1.default.saveTransaction);
exports.default = transactionRouter;
