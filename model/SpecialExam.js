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
    optionalSubject: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: subjects,
        required: true,
      },
    ],
    subjecInfo: [
      {
        subjectId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: subjects,
          required: true,
        },
        noOfQuestionsMcq: {
          type: Number,
          required: false,
          default: 0,
        },
        noOfQuestionsWritten: {
          type: Number,
          required: false,
          default: 0,
        },
      },
    ],
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
    mcqDuration: {
      type: Number,
      required: false,
      default: 0,
    },
    writtenDuration: {
      type: Number,
      required: false,
      Deafault: 0,
    },
    totalQuestionsMcq: {
      type: Number,
      required: false,
    },
    marksPerMcq: {
      type: Number,
      required: false,
    },
    megativeMarksMcq: {
      type: Number,
      required: false,
    },
    totalMarksMcq: {
      type: Number,
      required: false,
    },
    totalQuestionsWritten: {
      type: Number,
      required: false,
    },
    totalMarksWritten: {
      type: Number,
      required: false,
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
