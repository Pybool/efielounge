import mongoose from "mongoose";
const Schema = mongoose.Schema;

const PaymentProofSchema = new Schema({
  checkOutId: {
    type: String,
    required: true,
  },
  attachments: [],
});

const PaymentProof = mongoose.model("paymentproof", PaymentProofSchema);

export default PaymentProof;
