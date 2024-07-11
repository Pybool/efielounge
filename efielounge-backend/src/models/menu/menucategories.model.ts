import { required } from "@hapi/joi";
import mongoose from "mongoose";
const Schema = mongoose.Schema;

const MenuCategoriesSchema = new Schema({
  name: {
    type: String,
    default: "",
    required: false,
  },
  archive: {
    type: Boolean,
    default: false,
    required: false,
  },
  createdAt:{
    type: Date,
    required:false
  }
});

const MenuCategories = mongoose.model("menucategories", MenuCategoriesSchema);

export default MenuCategories;
