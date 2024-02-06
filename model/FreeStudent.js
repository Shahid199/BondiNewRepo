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
      unique: true,
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
    buetRoll: {
      type: String,
      required: false,
      default: null,
    },
    medicalRoll: {
      type: String,
      required: false,
      default: null,
    },
    universityRoll: {
      type: String,
      required: false,
      default: null,
    },
  },
  { timestamps: true } //createdAt,updatedAt auto genrate in the DB table.
);

module.exports = mongoose.model("FreeStudent", freeStudentsSchema);
