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
  },
  { timestamps: true } //createdAt,updatedAt auto genrate in the DB table.
);

module.exports = mongoose.model("QuestionWritten", questionWrittenSchema);
