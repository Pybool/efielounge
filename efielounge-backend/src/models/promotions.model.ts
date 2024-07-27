import mongoose from "mongoose";
const Schema = mongoose.Schema;

const PromotionsSchema = new Schema({
  description: {
    type: String,
    required: true,
  },
  attachments: [

  ],
  isActive: {
    type: Boolean,
    default: false,
    required: true,
  },
  createdAt:{
    type: Date,
    required: true,
  }
});

const Promotions = mongoose.model("promotions", PromotionsSchema);
export default Promotions;
