const mongoose = require("mongoose");
const exams = require("./exams");
const students = require("./students");
const Schema = mongoose.Schema;

const studentMarkRanksSchema = new Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: students,
    },
    examId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: exams,
    },
    examStartTime: {
      type: Date,
      required: true,
    },
    examEndTime: {
      type: Date,
      required: true,
    },
    duration: {
      type: Number,
      required: true,
    },
    totalObtainedMarks: {
      type: Number,
      required: true,
    },
    rank: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true } //createdAt,updatedAt auto genrate in the DB table.
);

module.exports = mongoose.model("StudentMarkRank", studentMarkRanksSchema);
