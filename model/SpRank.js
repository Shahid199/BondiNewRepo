const mongoose = require("mongoose");
const exams = require("./SpecialExamNew");
const students = require("./Student");
const Schema = mongoose.Schema;

const specialRankSchema = new Schema(
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
      default: 0,
    },
    rank: {
      type: Number,
      required: true,
      default: -1,
    },
  },
  { timestamps: true } //createdAt,updatedAt auto genrate in the DB table.
);

module.exports = mongoose.model("SpRank", specialRankSchema);
