const mongoose = require("mongoose");
const courses = require("./courses");
const Schema = mongoose.Schema;

const subjectScheama = new Schema(
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
    iLink: {
      type: String,
      required: true,
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: courses,
      required: true,
    },
  },
  { timestamps: true } //createdAt,updatedAt auto genrate in the DB table.
);

module.exports = mongoose.model("Subject", subjectScheama);
