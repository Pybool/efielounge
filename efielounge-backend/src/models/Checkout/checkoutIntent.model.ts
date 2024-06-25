import mongoose from "mongoose";
const Schema = mongoose.Schema;

const CheckoutIntentSchema = new Schema({
  account: {
    type: Schema.Types.ObjectId,
    ref: "accounts",
    required: false,
    unique: true
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
  status: {
    type: String,
    default: "PENDING",
    required: false,
    enum: ['PENDING', 'PLACED', 'SHIPPED', 'DELIVERED', 'CANCELED']
  },
});

const CheckOut = mongoose.model("checkoutintent", CheckoutIntentSchema);

export default CheckOut;
