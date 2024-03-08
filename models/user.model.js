const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const dotenv = require('dotenv')
dotenv.config()
const jwt = require('jsonwebtoken')

const UserSchema = mongoose.Schema(
  {
    Name: {
      type: String,
      required: true,
    },
    Email: {
      type: String,
      required: true,
      unique: true,
    },
    Password: {
      type: String,
      required: true
    },
    ContactNumber: {
      type: Number,
      required: true,
      unique: true,
    },
    isActive: {
      type: Boolean,
      default: false,
    },
 
    Role: {
      type: String,
      enum: ["User", "Admin"],
      default: "User",
    },
  },
  { timestamps: true }
);

// Password Hashing

UserSchema.pre("save", async function (next) {
// Instilize user with this
  const user = this;

// check user Password
  if (!user.isModified("Password")) {
    return next();
  }
//Hash The password using bcrypt 
  try {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(user.Password, salt);
    user.Password = hash;
    next();
  } catch (error) {
    return next("Password Hashing Error", error);
    // console.log("Password Hashing Error", error);
  }
});




// Add the method to compare passwords
UserSchema.methods.comparePassword = async function (enteredPassword) {
  try {
    return await bcrypt.compare(enteredPassword, this.Password); // Ensure to use this.Password
  } catch (error) {
    throw new Error('Password comparison failed', error);
  }
}

const User = mongoose.model("User", UserSchema);

module.exports = User;
