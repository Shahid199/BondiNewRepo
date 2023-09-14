const mongoose = require("mongoose");
const subjects = require("./Subject");
const courses = require("./Course");
const Schema = mongoose.Schema;

const SpecialExamSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      max: 200,
    },
    examType: {
      type: Number,
      required: true,
    },
    startTime: {
      type: Date,
      required: true,
    },
    endTime: {
      type: Date,
      required: true,
    },
    totalSubject: {
      type: Number,
      required: true,
      default: 0,
    },
    examSubject: {
      type: Number,
      required: true,
      default: 0,
    },
    mcqDuration: {
      type: Number,
      required: true,
      default: 0,
    },
    writtenDuration: {
      type: Number,
      required: true,
      Deafault: 0,
    },
    totalMarksMcq: {
      type: Number,
      required: true,
    },
    totalMarksWritten: {
      type: Number,
      required: true,
    },
    totalMarks: {
      type: Number,
      required: true,
    },
    totalDuration: {
      type: Number,
      required: true,
    },
    status: {
      type: Boolean,
      required: true,
      default: false,
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: courses,
      required: true,
    },
    iLink: {
      type: String,
      required: true,
    },
  },
  { timestamps: true } //createdAt,updatedAt auto genrate in the DB table.
);

module.exports = mongoose.model("SpecialExam", SpecialExamSchema);
