import mongoose from "mongoose";
const Schema = mongoose.Schema;

const RatingSchema = new Schema({
  rating: {
    type: Number,
    default: 1,
    required: false,
  },
  account: {
    type: Schema.Types.ObjectId,
    ref: "accounts",
    required: false,
  },
});

const MenuRatings = mongoose.model("menuratings", RatingSchema);

export default MenuRatings;
