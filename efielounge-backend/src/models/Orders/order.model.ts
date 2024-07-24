import mongoose from "mongoose";
const Schema = mongoose.Schema;

const OrderSchema = new Schema({
  account: {
    type: Schema.Types.ObjectId,
    ref: "accounts",
    required: false,
  },
  checkOutId: {
    type: String,
    required: true,
  },
  menu: {
    type: Schema.Types.ObjectId,
    ref: "menu",
    required: true,
  },
  units: {
    type: Number,
    default: 1,
    required: false,
  },
  variants: [],
  customMenuItems: {
    type: [Schema.Types.ObjectId],
    ref: "menuitem",
    required: false,
  },
  createdAt: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    default: "PENDING",
    required: false,
    enum: ["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELED"],
  },
});

const Order = mongoose.model("orders", OrderSchema);

export default Order;
