const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const studentsSchema = new Schema(
  {
    regNo: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
    institution: {
      type: String,
      required: false,
      default: null,
    },
    mobileNo: {
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
    curriculumRoll: {
      type: String,
      required: false,
      default: null,
    },
    displayPicture:{
      type: String,
      required: false,
      default: null,
    },
    password:{
      type: String,
      required: false,
      default: null,
    }
  },
  { timestamps: true } //createdAt,updatedAt auto genrate in the DB table.
);

module.exports = mongoose.model("Student", studentsSchema);
