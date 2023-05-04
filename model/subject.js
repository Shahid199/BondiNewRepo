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
      required: true,
      unique: true,
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: courses,
      required: true,
    },
  },
  { timestamps: true } //createdAt,updatedAt auto genrate in the DB table.
);

module.exports = mongoose.model("Subject", subjectSchema);
