const mongoose = require("mongoose");
const exams = require("./Exam");
const freeStudents = require("./FreeStudent");
const questionsMcq = require("./QuestionsMcq");
const Schema = mongoose.Schema;

const freeStudentExamVsQuestionsMcqSchema = new Schema(
  {
    freeStudentId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: freeStudents,
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
        type: Boolean,
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
  "FreeStudentExamVsQuestionMcq",
  freeStudentExamVsQuestionsMcqSchema
);
