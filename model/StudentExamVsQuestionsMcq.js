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
    answeredStatus: [
      {
        type: Boolean,
        required: false,
        default: false,
      },
    ],
    totalObtainedMarks: {
      type: Number,
      required: false,
      default: null,
    },
  },
  { timestamps: true } //createdAt,updatedAt auto genrate in the DB table.
);

module.exports = mongoose.model(
  "StudentExamVsQuestionsMcq",
  StudentExamVsQuestionsMcqSchema
);
