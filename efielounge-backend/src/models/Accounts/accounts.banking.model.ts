import mongoose from "mongoose";
const Schema = mongoose.Schema;

const AccountBankDetailSchema = new Schema({
  accountId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "accounts",
  },
  bvn: {
    type: String,
    default: null,
  },
  preferredBank: {
    type: String,
    default: null,
  },
  accountNo: {
    type: String,
    default: null,
  },
  accountName: {
    type: String,
    default: null,
  },

})

const AccountBankDetails = mongoose.model(
    "accountBankDetails",
    AccountBankDetailSchema
  );
  export default AccountBankDetails;
  