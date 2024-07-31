import mongoose from "mongoose";
const Schema = mongoose.Schema;

const CheckoutIntentSchema = new Schema({
  account: {
    type: Schema.Types.ObjectId,
    ref: "accounts",
    required: false,
  },
  checkOutId: {
    type: String,
    required: true,
    unique: true
  },
  cart: {
    type: [Schema.Types.ObjectId],
    ref: "cart",
    required: true,
  },
  address: {
    type: Schema.Types.ObjectId,
    ref: "Address",
    required: false,
  },
  amount:{
    type: Number,
    required: true,
    default: 0.00
  },
  notes:{
    type: String,
    required: false,
  },
  deliveryCost:{
    type: Number,
    required: false,
    default: 0.00
  },
  status: {
    type: String,
    default: "PENDING",
    required: false,
    enum: ["PENDING", "CONFIRMED", "IN-TRANSIT", "DELIVERED", "CANCELED"],
  },
  
});

const CheckOut = mongoose.model("checkoutintent", CheckoutIntentSchema);

export default CheckOut;
