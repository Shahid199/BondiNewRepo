const mongoose = require("mongoose");
const subjects = require("./Subject");
const courses = require("./Course");
const Schema = mongoose.Schema;

const bothExamSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      max: 200,
    },
    //exam variation for daily=1/Weekly=2/Monthly=3
    examType: {
      type: Number,
      required: true,
    },
    examVariation: {
      type: Number,
      required: true,
      default: 3,
    },
    startTime: {
      type: Date,
      required: true,
    },
    endTime: {
      type: Date,
      required: true,
    },
    totalDuration: {
      type: Number,
      required: true,
    },
    totalQuestionMcq: {
      type: Number,
      required: false,
    },
    marksPerMcq: {
      type: Number,
      required: false,
    },
    totalMarksMcq: {
      type: Number,
      required: false,
    },
    mcqDuration: {
      type: Number,
      required: false,
    },
    writtenDuration: {
      type: Number,
      required: false,
    },
    totalQuestionWritten: {
      type: Number,
      required: false,
    },
    totalMarksWritten: {
      type: Number,
      required: false,
    },
    status: {
      type: Boolean,
      required: true,
      default: false,
    },
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: subjects,
      required: true,
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: courses,
      required: true,
    },
    sscStatus: {
      type: Boolean,
      required: true,
      default: false,
    },
    hscStatus: {
      type: Boolean,
      required: true,
      default: false,
    },
    negativeMarksMcq: {
      type: Number,
      required: true,
      default: 0,
    },
    iLink: {
      type: String,
      required: true,
    },
    totalMarks: {
      type: Number,
      required: false,
    },
  },
  { timestamps: true } //createdAt,updatedAt auto genrate in the DB table.
);

module.exports = mongoose.model("BothExam", bothExamSchema);
