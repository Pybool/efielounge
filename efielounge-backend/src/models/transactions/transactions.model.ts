import mongoose from "mongoose";
const Schema = mongoose.Schema;

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

const Transaction = mongoose.model("transactions", TransactionsSchema);

export default Transaction;
