import mongoose from "mongoose";
const Schema = mongoose.Schema;

const MenuItemSchema = new Schema({
  name: {
    type: String,
    default: "",
    required: false,
  },
  category: {
    type: [Schema.Types.ObjectId],
    ref: "menuitemcategories",
    required: false,
  },
  description: {
    type: String,
    default: "",
    required: false,
  },
  price: {
    type: Number,
    default: 0.00,
    required: false,
  },
  attachments: [],
  currency: {
    type: String,
    default: "GHC",
    enum: ["GHC", "USD"]
  },
  status: {
    type: String,
    default: "Available",
    enum: ["Available", "You're Too Late"]
  }
});

const MenuItem = mongoose.model("menuitem", MenuItemSchema);

export default MenuItem;
