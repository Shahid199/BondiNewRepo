const mongoose = require("mongoose");
const exams = require("./exams");
const questionsMcq = require("./questionsMcq");
const students = require("./students");
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
    McqQuestionId: [
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
      },
    ],
    answeredStatus: [
      {
        type: String,
        required: false,
        default: false,
      },
    ],
    totalObtainedMarks: {
      type: Number,
      required: false,
    },
  },
  { timestamps: true } //createdAt,updatedAt auto genrate in the DB table.
);

module.exports = mongoose.model(
  "StudentExamVsQuestionMcq",
  StudentExamVsQuestionsMcqSchema
);
