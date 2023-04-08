const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const courseScheam = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      max: 200,
    },
    descr: {
      type: String,
      required: false,
      max: 10000,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Course", courseScheam);
