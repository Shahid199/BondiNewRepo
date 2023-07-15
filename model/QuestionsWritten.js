const mongoose = require("mongoose");
const exam = require("./Exam");
const Schema = mongoose.Schema;

const questionWrittenSchema = new Schema(
  {
    questionILink: {
      type: String,
      required: true,
      unique: true,
    },
    status: {
      type: Boolean,
      required: true,
      default: true,
    },
    totalQuestions: {
      type: Number,
      required: true,
    },
    marksPerQuestion: [
      {
        type: Number,
        required: true,
      },
    ],
    totalMarks: {
      type: Number,
      required: true,
    },
    examId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: exam,
    },
  },
  { timestamps: true } //createdAt,updatedAt auto genrate in the DB table.
);

module.exports = mongoose.model("QuestionWritten", questionWrittenSchema);
