import express from "express";
import { decode } from "../../middlewares/jwt";
import transactionController from "../../controllers/v1/transaction.controller";
const authMiddleware = decode;
const transactionRouter = express.Router();

transactionRouter.post(
  "/save-transaction",
  authMiddleware,
  transactionController.saveTransaction
);

transactionRouter.get(
  "/paystack/verify-transaction",
  authMiddleware,
  transactionController.verifyTransaction
);

export default transactionRouter;
