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

module.exports = mongoose.model("User", userScheama);
