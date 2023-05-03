const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const freeStudentsSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    mobileNo: {
      type: String,
      required: true,
    },
    institution: {
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
  },
  { timestamps: true } //createdAt,updatedAt auto genrate in the DB table.
);

module.exports = mongoose.model("FreeStudent", freeStudentsSchema);
