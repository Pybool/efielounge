import mongoose from "mongoose";
const Schema = mongoose.Schema;

const LikesSchema = new Schema({
  account: {
    type: Schema.Types.ObjectId,
    ref: "accounts",
    required: false,
  },
  menuId: {
    type: Schema.Types.ObjectId,
    ref: "menu",
    required: false,
  },
});

const MenuLikes = mongoose.model("menulikes", LikesSchema);

export default MenuLikes;
