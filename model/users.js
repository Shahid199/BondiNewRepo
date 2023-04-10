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
      required: true,
    },
    password: {
        type: password,
        required: true,
      },
      role: {
        type: String,
        required: true,
      },
  },
  { timestamps: true } //createdAt,updatedAt auto genrate in the DB table.
);

module.exports = mongoose.model("User", userScheama);
