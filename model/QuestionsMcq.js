const mongoose = require("mongoose");
const exam = require("./Exam");
const Schema = mongoose.Schema;

const questionMcqSchema = new Schema(
  {
    question: {
      type: String,
      required: true,
      default:null,
    },
    type: {
      type: Boolean,
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
      type: Number,
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
  },
  { timestamps: true } //createdAt,updatedAt auto genrate in the DB table.
);

module.exports = mongoose.model("QuestionMcq", questionMcqSchema);
