import express from "express";
import { decode, ensureAdmin } from "../../middlewares/jwt";
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

transactionRouter.get(
  "/fetch-transactions",
  authMiddleware,
  ensureAdmin,
  transactionController.fetchTransactions
);



export default transactionRouter;
