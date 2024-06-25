import { required } from "@hapi/joi";
import mongoose from "mongoose";
const Schema = mongoose.Schema;

const MenuCategoriesSchema = new Schema({
  name: {
    type: String,
    default: "",
    required: false,
  },
  createdAt:{
    type: Date,
    required:true
  }
});

const MenuCategories = mongoose.model("menucategories", MenuCategoriesSchema);

export default MenuCategories;
