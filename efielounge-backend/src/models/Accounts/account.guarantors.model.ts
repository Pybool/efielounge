import { Schema } from "mongoose";

const mongoose = require("mongoose");

const guarantorSchema = new mongoose.Schema({
  accountId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "accounts",
  },
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  altPhone: {
    type: String,
  },
  address: {
    type: String,
  },
  workPlace: {
    type: String,
  },
  jobDescription: {
    type: String,
  },
  bvn: {
    type: String,
    validate: {
      validator: function (v: string | any[]) {
        return v.length === 11; // Basic validation for 11-digit BVNs
      },
      message: (props: { value: any }) =>
        `${props.value} is not a valid BVN (must be 11 digits)`,
    },
  },
});

const Agentguarantors = mongoose.model("Agentguarantors", guarantorSchema);

export default Agentguarantors;
