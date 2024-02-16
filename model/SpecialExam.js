const mongoose = require("mongoose");
const subjects = require("./Subject");
const courses = require("./Course");
const questions = require("./QuestionsMcq");
const Schema = mongoose.Schema;

const SpecialExamSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      //unique: true,
      max: 200,
    },
    examVariation: {
      type: Number,
      required: true,
    },
    noOfTotalSubject: {
      type: Number,
      required: true,
    },
    noOfExamSubject: {
      type: Number,
      required: true,
    },
    noOfOptionalSubject: {
      type: Number,
      required: true,
    },
    noOfFixedSubject: {
      type: Number,
      required: true,
    },
    allSubject: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: subjects,
        required: true,
      },
    ],
    optionalSubject: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: subjects,
        required: true,
      },
    ],
    fixedSubject: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: subjects,
        required: true,
      },
    ],
    subjectInfo: [
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
    questionMcq: [
      {
        subjectId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: subjects,
          required: false,
        },
        mcqId: [
          {
            type: mongoose.Schema.Types.ObjectId,
            ref: questions,
            required: false,
          },
        ],
      },
    ],
    questionWritten: [
      {
        subjectId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: subjects,
          required: false,
        },
        marksPerQuestion: [
          {
            type: Number,
            required: false,
          },
        ],
        writtenILink: {
          type: String,
          required: false,
        },
      },
    ],
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
      default: 0,
    },
    totalQuestionsMcq: {
      type: Number,
      required: false,
      default: 0,
    },
    marksPerMcq: {
      type: Number,
      required: false,
      default: -1,
    },
    negativeMarksMcq: {
      type: Number,
      required: true,
    },
    totalMarksMcq: {
      type: Number,
      required: false,
      default: 0,
    },
    totalQuestionsWritten: {
      type: Number,
      required: false,
      default: 0,
    },
    totalMarksWritten: {
      type: Number,
      required: false,
      default: 0,
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
    publishStatus: {
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
    sollutionSheet: {
      type: String,
      required: false,
      default: null,
    },
  },
  { timestamps: true } //createdAt,updatedAt auto genrate in the DB table.
);

module.exports = mongoose.model("SpecialExam", SpecialExamSchema);
