const mongoose = require("mongoose");
const subjects = require("./Subject");
const courses = require("./Course");
const Schema = mongoose.Schema;

const examSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      max: 200,
    },
    //exam variation for Weekly=1/Monthly=2/daily=3
    examType: {
      type: Number,
      required: true,
    },
    //exam variation for MCQ=1/Written=2/Both=3
    examVariation: {
      type: Number,
      required: true,
    },
   // exam variation for free/not
    examFreeOrNot: {
      type: Boolean,
      required: true,
      default: false,
    },
    startTime: {
      type: Date,
      required: true,
    },
    endTime: {
      type: Date,
      required: true,
    },
    duration: {
      type: Number,
      required: true,
    },
    totalQuestionMcq: {
      type: Number,
      required: false,
    },
    totalMarksMcq: {
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
    negativeMarks: {
      type: Number,
      required: true,
      default:0,
    },
    iLink: {
      type: String,
      required: true,
    },
  },
  { timestamps: true } //createdAt,updatedAt auto genrate in the DB table.
);

module.exports = mongoose.model("Exam", examSchema);
