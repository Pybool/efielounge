import mongoose from "mongoose";
const Schema = mongoose.Schema;

const AgentDocumentsSchema = new Schema({
  accountId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "accounts",
  },
  highestQualification: {
    type: String,
    default: null,
  },
  certificate: {
    type: String,
    required: false,
    default: null,
  },
  nationalId: {
    type: String,
    required: false,
    default: null
  },
  resume: {
    type: String,
    required: false,
    default: null
  },
  g1nationalId: {
    type: String,
    required: false,
    default: null
  },
  g2nationalId: {
    type: String,
    required: false,
    default: null
  },
});

const AgentDocuments = mongoose.model("AgentDocuments",AgentDocumentsSchema);
export default AgentDocuments;
