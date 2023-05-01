const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const bcrypt = require("bcryptjs");
const jwt = require('jsonwebtoken');

const userScheama = new Schema(
  {
    name: {
      type: String,
      required: true,
      max: 200,
    },
    userName: {
      type: String,
      unique: true,
      required: true,
      max: 500,
    },
    mobileNo: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: false,
      default: null,
    },
    password: {
      type: String,
      required: false,
    },
    role: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true } //createdAt,updatedAt auto genrate in the DB table.
);
// login and generate token if verified correctly
userScheama.methods.loginUser = async (user, password, done) => {
  try {
    // Always use hashed passwords and fixed time comparison
    bcrypt.compare(password, user.password, async (err, isValid) => {
      if (err) {
        return done(err, false);
      }
      if (!isValid) {
        return done(null, false);
      }

      return done(null, jwt.sign({
        userName: user.userName,
        id: user._id,
        name: user.name,
        role: user.role,
        mobileNo: user.mobileNo,
        address: user.address
      },process.env.SALT, { expiresIn: '1d'}));
    });
  } catch (error) {
    return done(error);
  }
}
module.exports = mongoose.model("User", userScheama);
