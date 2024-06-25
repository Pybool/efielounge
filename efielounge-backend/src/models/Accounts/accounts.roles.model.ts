import mongoose from "mongoose";
const Schema = mongoose.Schema;

const AccountRolesSchema = new Schema({
  role: {
    type: String,
    required: true,
    unique: true,
  },
  description: {
    type: String,
    required: true,
    unique: true,
  },
  permissions:Object
});

const AccountRoles = mongoose.model(
  "AccountRoles",
  AccountRolesSchema
);
export default AccountRoles;


  