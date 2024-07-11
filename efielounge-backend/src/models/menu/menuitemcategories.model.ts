import mongoose from "mongoose";
const Schema = mongoose.Schema;

const MenuItemCategoriesSchema = new Schema({
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

const MenuItemCategories = mongoose.model("menuitemcategories", MenuItemCategoriesSchema);

export default MenuItemCategories;
