const mongoose = require("mongoose");
const courses = require("./Course");
const Schema = mongoose.Schema;

const subjectSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    descr: {
      type: String,
      required: false,
      max: 10000,
    },
    iLink: {
      type: String,
      required: false,
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: courses,
      required: true,
    },
    status: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  { timestamps: true } //createdAt,updatedAt auto genrate in the DB table.
);

module.exports = mongoose.model("Subject", subjectSchema);
