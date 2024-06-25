import mongoose from "mongoose";
const Schema = mongoose.Schema;

const MenuItemCategoriesSchema = new Schema({
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

const MenuItemCategories = mongoose.model("menuitemcategories", MenuItemCategoriesSchema);

export default MenuItemCategories;
