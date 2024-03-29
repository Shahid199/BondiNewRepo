const mongoose = require("mongoose");
const exams = require("./Exam");
const freeStudents = require("./FreeStudent");
const Schema = mongoose.Schema;

const FreestudentMarkRanksSchema = new Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: freeStudents,
    },
    examId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: exams,
    },
    examStartTime: {
      type: Date,
      required: true,
      default: null,
    },
    examEndTime: {
      type: Date,
      required: false,
      default: null,
    },
    duration: {
      type: Number,
      required: false,
      default: null,
    },
    totalObtainedMarks: {
      type: Number,
      required: false,
      default: 0,
    },
    rank: {
      type: Number,
      required: false,
      default: -1,
    },
    finishedStatus: {
      type: Boolean,
      required: true,
      default: false,
    },
    runningStatus: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  { timestamps: true } //createdAt,updatedAt auto genrate in the DB table.
);
module.exports = mongoose.model(
  "FreestudentMarkRank",
  FreestudentMarkRanksSchema
);
