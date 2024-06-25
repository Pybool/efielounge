import mongoose from "mongoose";
const Schema = mongoose.Schema;
import bcrypt from "bcryptjs";

const AccountSchema = new Schema({
  email: {
    type: String,
    lowercase: true,
    unique: true,
    sparse: true, // Allows null values while maintaining uniqueness
  },
  userName: {
    type: String,
    required: false,
    default: "",
  },
  password: {
    type: String,
    required: false,
    default: null,
  },
  emailConfirmed: {
    type: Boolean,
    required: true,
    default: false,
  },
  firstName: {
    type: String,
    required: false,
    default: "",
  },
  lastName: {
    type: String,
    required: false,
    default: "",
  },
  phone: {
    type: String,
    required: false,
    default: "",
  },
  altPhone: {
    type: String,
    required: false,
    default: "",
  },
  street: {
    type: String,
    default: "",
  },
  city: {
    type: String,
    required: false,
    default: "",
  },
  stateOfResidence: {
    type: String,
    required: false,
    default: "Lagos",
  },
  stateOfOrigin: {
    type: String,
    required: false,
    default: "Lagos",
  },
  country: {
    type: String,
    required: false,
    default: "Nigeria",
  },
  avatar: {
    type: String,
    required: false,
    default: "shared/anon.jpeg",
  },
  createdAt: {
    type: Date,
    default: null,
    required: true,
  },
  lastLogin: {
    type: Date,
    default: null,
    required: false,
  },
  role: {
    type: String,
    required: false,
    default:"CUSTOMER",
    enum: ["CUSTOMER", "STAFF", "ADMIN", "ROOT"]
  }
});

AccountSchema.statics.getUserProfileById = async function (_id) {
  try {
    const user = await this.findById(_id);

    if (!user) {
      throw new Error("User not found");
    }

    return {
      isAdmin: user.isAdmin,
      avatar: user.avatar,
      firstName: user.firstName,
      lastname: user.lastName,
      email: user.email,
      phone: user.phone,
      accountStatus: user.accountStatus,
      role: user.role
    };
  } catch (error) {
    throw error;
  }
};

AccountSchema.methods.getProfile = async function () {
  try {
    return {
      isAdmin: this.isAdmin,
      avatar: this.avatar,
      firstName: this.firstName,
      lastname: this.lastName,
      email: this.email,
      phone: this.phone,
      accountStatus: this.accountStatus,
      role: this.role
    };
  } catch (error) {
    throw error;
  }
};

AccountSchema.methods.isValidPassword = async function (password: string) {
  try {
    console.log(this.password, password);
    return await bcrypt.compare(password, this.password);
  } catch (error) {
    throw error;
  }
};

AccountSchema.pre('save', async function (next) {
  try {
    if (this.isNew) {
      const salt = await bcrypt.genSalt(10)
      const hashedPassword = await bcrypt.hash(this.password || "!00000000QWE", salt)
      this.password = hashedPassword
    }
    next()
  } catch (error:any) {
    next(error)
  }
})

AccountSchema.pre('find', function(next) {
  this.select({ password: 0 });
  next();
});


const Accounts = mongoose.model("accounts", AccountSchema);
export default Accounts;
