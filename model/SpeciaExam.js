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
    totalQuestionMcq: [
      {
        type: Object,
        required: false,
      },
    ],
    mandatory: [
      {
        type: Object,
        required: false,
      },
    ],
    marksPerMcq: {
      type: Number,
      required: false,
    },
    totalMarksMcq: {
      type: Number,
      required: false,
    },
    status: {
      type: Boolean,
      required: true,
      default: false,
    },
    subjectId: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: subjects,
        required: true,
      },
    ],
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: courses,
      required: true,
    },
    negativeMarks: {
      type: Number,
      required: true,
      default: 0,
    },
    iLink: {
      type: String,
      required: true,
    },
  },
  { timestamps: true } //createdAt,updatedAt auto genrate in the DB table.
);

module.exports = mongoose.model("SpecialExam", SpecialExamSchema);
