import mongoose from "mongoose";
const Schema = mongoose.Schema;

const LikesSchema = new Schema({
  accounts: [
    {
      type: [Schema.Types.ObjectId],
      ref: "accounts",
      required: false,
    },
  ],
});

const MenuLikes = mongoose.model("menulikes", LikesSchema);

export default MenuLikes;
