const mongoose = require("mongoose");
const exams = require("./Exam");
const questions = require("./QuestionsWritten");
const Schema = mongoose.Schema;

const WrittenQuestionVsExamSchema = new Schema(
  {
    writtenQuestionId: {
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
  "WrittenQuestionVsExamSchema",
  WrittenQuestionVsExamSchema
);
