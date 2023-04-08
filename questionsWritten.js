const mongoose = require("mongoose");
const exams = require("./exams");
const Schema = mongoose.Schema;

const questionWrittenScheama = new Schema(
  {
    questionIlink: {
      type: String,
      required: true,
    },
    status: {
      type: Boolean,
      required: true,
      default: true,
    },
    noOfQuestion: {
      type: Number,
      rewuired: true,
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

module.exports = mongoose.model("QuestionWritten", questionWrittenScheama);
