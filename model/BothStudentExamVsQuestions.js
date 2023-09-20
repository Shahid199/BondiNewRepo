const mongoose = require("mongoose");
const exams = require("./BothExam");
const questionsMcq = require("./QuestionsMcq");
const questionsWritten = require("./BothQuestionsWritten");
const students = require("./Student");
const Schema = mongoose.Schema;

const BothStudentExamVsQuestionsMcqSchema = new Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: students,
    },
    examId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: exams,
    },
    examStartTimeMcq: {
      type: Date,
      required: false,
      default: null,
    },
    examEndTimeMcq: {
      type: Date,
      required: false,
      default: null,
    },
    examStartTimeWritten: {
      type: Date,
      required: false,
      default: null,
    },
    examEndTimeWritten: {
      type: Date,
      required: false,
      default: null,
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
    totalDuration: {
      type: Number,
      required: false,
      default: 0,
    },
    mcqQuestionId: [
      {
        type: mongoose.Schema.Types.ObjectId,
        required: false,
        ref: questionsMcq,
      },
    ],
    answeredOption: [
      {
        type: String,
        required: false,
        default: null,
      },
    ],
    totalCorrectAnswer: {
      type: Number,
      required: false,
      default: 0,
    },
    totalWrongAnswer: {
      type: Number,
      required: false,
      default: 0,
    },
    totalNotAnswered: {
      type: Number,
      required: false,
      default: 0,
    },
    totalCorrectMarks: {
      type: Number,
      required: false,
      default: 0,
    },
    totalWrongMarks: {
      type: Number,
      required: false,
      default: 0,
    },
    totalObtainedMarksMcq: {
      type: Number,
      required: false,
      default: 0,
    },
    writtenQuestionId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: questionsWritten,
    },
    submittedScriptILink: [
      [
        {
          type: String,
          required: false,
        },
      ],
    ],
    ansewerScriptILink: [
      [
        {
          type: String,
          required: false,
        },
      ],
    ],
    obtainedMarks: [
      {
        type: Number,
        required: false,
        default: 0,
      },
    ],
    totalObtainedMarksWritten: {
      type: Number,
      required: false,
      default: 0,
    },
    checkStatus: {
      type: Boolean,
      required: true,
      default: false,
    },
    uploadStatus: {
      type: Boolean,
      required: true,
      default: false,
    },
    totalObtainedMarks: {
      type: Number,
      required: false,
      default: 0,
    },
    rank: {
      type: Number,
      required: false,
      default: -1,
    },
    finishedStatus: {
      type: Boolean,
      required: true,
      default: false,
    },
    runningStatus: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  { timestamps: true } //createdAt,updatedAt auto genrate in the DB table.
);

module.exports = mongoose.model(
  "BothStudentExamVsQuestions",
  BothStudentExamVsQuestionsMcqSchema
);
