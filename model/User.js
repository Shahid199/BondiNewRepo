const mongoose = require("mongoose");
const Schema = mongoose.Schema;

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
    institution: {
      type: String,
      required: false,
      default: null,
    },
    address: {
      type: String,
      required: false,
      default: null,
    },
    password: {
      type: String,
      required: true,
    },
    sscRoll: {
      type: String,
      required: false,
      default: null,
    },
    sscReg: {
      type: String,
      required: false,
      default: null,
    },
    hscRoll: {
      type: String,
      required: false,
      default: null,
    },
    hscReg: {
      type: String,
      required: false,
      default: null,
    },
    role: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true } //createdAt,updatedAt auto genrate in the DB table.
);

module.exports = mongoose.model("User", userScheama);
