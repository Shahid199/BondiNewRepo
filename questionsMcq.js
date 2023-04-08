const mongoose = require("mongoose");
const exams = require("./exams");
const Schema = mongoose.Schema;

const questionMcqScheam = new Schema(
  {
    question: {
      type: String,
      required: true,
    },
    options: [
      {
        type: Array,
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
    },
    status: {
      type: Boolean,
      required: true,
      default: true,
    },
    examId: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: exams,
      },
    ],
  },
  { timestamps: true } //createdAt,updatedAt auto genrate in the DB table.
);

module.exports = mongoose.model("QuestionMcq", questionMcqScheam);
