import mongoose from "mongoose";
const Schema = mongoose.Schema;

const CartSchema = new Schema({
  account: {
    type: Schema.Types.ObjectId,
    ref: "accounts",
    required: false,
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
  total:{
    type: Number,
    default: 0.00,
    required: false,
  },

  updatedAt: {
    type: Date,
    required: false,
  },
});

const Cart = mongoose.model("cart", CartSchema);

export default Cart;
