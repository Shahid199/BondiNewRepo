const mongoose = require("mongoose");
const subjects = require("./Subject");
const courses = require("./Course");
const questions = require("./QuestionsMcq");
const Schema = mongoose.Schema;

const McqSpecialExamSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      max: 200,
    },
    examVariation: { type: Number, default: 5 },
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
    curriculumName:{
      type: String,
      required: true,
    },
    isAdmission:{
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
      required: false,
    },
    solutionSheet: {
      type: String,
      required: false,
      default: null,
    },
    questionType: {
      type: String,
      required: false,
      default: null,
    },
    numberOfRetakes: {
      type: Number,
      required: false,
      default: 5,
    },
    numberOfOptions: {
      type: Number,
      required: false,
      default: 4,
    },
    numberOfSet: {
      type: Number,
      required: false,
      default: 4,
    },
  },
  { timestamps: true } //createdAt,updatedAt auto genrate in the DB table.
);

module.exports = mongoose.model("McqSpecialExam", McqSpecialExamSchema);
