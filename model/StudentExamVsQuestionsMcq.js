const mongoose = require("mongoose");
const exams = require("./Exam");
const questionsMcq = require("./QuestionsMcq");
const students = require("./Student");
const Schema = mongoose.Schema;

const StudentExamVsQuestionsMcqSchema = new Schema(
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
    mcqQuestionId: [
      {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
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
    totalObtainedMarks: {
      type: Number,
      required: false,
      default: 0,
    },
  },
  { timestamps: true } //createdAt,updatedAt auto genrate in the DB table.
);

module.exports = mongoose.model(
  "StudentExamVsQuestionsMcq",
  StudentExamVsQuestionsMcqSchema
);
