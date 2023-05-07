const mongoose = require("mongoose");
const exams = require("./Exam");
const questions = require("./QuestionsMcq");
const Schema = mongoose.Schema;

const McqQuestionVsExamSchema = new Schema(
  {
    McqQuestionId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: questions,
    },
    examId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: exams,
    },
  },
  { timestamps: true } //createdAt,updatedAt auto genrate in the DB table.
);

module.exports = mongoose.model(
  "McqQuestionVsExamSchema",
  McqQuestionVsExamSchema
);
