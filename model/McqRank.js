const mongoose = require("mongoose");
const exams = require("./Exam");
const students = require("./Student");
const Schema = mongoose.Schema;

const McqRanksSchema = new Schema(
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
      default: 0,
    },
  },
  { timestamps: true } //createdAt,updatedAt auto genrate in the DB table.
);

module.exports = mongoose.model("McqRanks", McqRanksSchema);
