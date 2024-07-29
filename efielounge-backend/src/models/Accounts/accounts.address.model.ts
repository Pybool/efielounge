import mongoose from "mongoose";
const Schema = mongoose.Schema;

const Addresschema = new Schema({
  account: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "accounts",
  },
  address: {
    type: String,
    default: null,
    required: true,
  },
  district: {
    type: String,
    default: null,
    required: true,
  },
  phone: {
    type: String,
    default: null,
  },
  isDefault: {
    type: Boolean,
    default: false,
  },
});

const Address = mongoose.model("Address", Addresschema);
export default Address;
