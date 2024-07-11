import mongoose from "mongoose";
const Schema = mongoose.Schema;

const MenuSchema = new Schema({
  name: {
    type: String,
    default: "",
    required: false,
  },
  description: {
    type: String,
    default: "",
    required: false,
  },
  slug: {
    type: String,
    default: "",
    required: false,
  },
  price: {
    type: Number,
    default: 0.0,
    required: false,
  },
  currency: {
    type: String,
    default: "GHC",
    enum: ["GHC", "USD"],
  },
  attachments: [],
  menuItems: 
    {
      type: [Schema.Types.ObjectId],
      ref: "menuitem",
      required: false,
    },
  
  category: {
    type: Schema.Types.ObjectId,
    ref: "menucategories",
    required: false,
  },
  ratings: {
    type: Number,
    default: 0,
    required: false,
  },
  likes: {
    type: Number,
    default: 0,
    required: false,
  },
  iRated: {
    type: Boolean,
    default: false,
    required: false,
  },
  inCart: {
    type: Boolean,
    default: false,
    required: false,
  },
  createdAt:{
    type:Date,
    required: false
  },
  status: {
    type: String,
    default: "Cooking",
    enum: ["Cooking", "Ready", "You're Too Late"]
  },
  archive: {
    type: Boolean,
    default: false,
    required: false,
  },
});

const Menu = mongoose.model("menu", MenuSchema);

export default Menu;
