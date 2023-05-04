const mongoose = require("mongoose");
const exam = require("./Exam");
const Schema = mongoose.Schema;

const questionMcqSchema = new Schema(
  {
    question: {
      type: String,
      required: true,
    },
    options: [
      {
        type: String,
        required: false,
      },
    ],
    optionCount: {
      type: Number,
      required: true,
    },
    correctOption: {
      type: String,
      required: true,
    },
    explanationILink: {
      type: String,
      required: true,
      unique: true,
    },
    status: {
      type: Boolean,
      required: true,
      default: true,
    },
    examId: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: exam,
      },
    ],
  },
  { timestamps: true } //createdAt,updatedAt auto genrate in the DB table.
);

module.exports = mongoose.model("QuestionMcq", questionMcqSchema);
