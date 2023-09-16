const mongoose = require("mongoose");
const exams = require("./BothExam");
const students = require("./Student");
const Schema = mongoose.Schema;

const BothMcqRanksSchema = new Schema(
  {
    examId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: exams,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: students,
    },
    totalObtainedMarks: {
      type: Number,
      required: false,
      default: null,
    },
    rank: {
      type: Number,
      required: true,
      default: -1,
    },
  },
  { timestamps: true } //createdAt,updatedAt auto genrate in the DB table.
);

module.exports = mongoose.model("BothMcqRank", BothMcqRanksSchema);
