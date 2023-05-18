const mongoose = require("mongoose");
const exams = require("./Exam");
const students = require("./Student");
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
      ddefault: null,
    },
    totalObtainedMarks: {
      type: Number,
      required: false,
      default: null,
    },
    rank: {
      type: Number,
      required: false,
      default: null,
    },
    finishedStatus: {
      type: Boolean,
      required: true,
      default: false,
    },
    runningStatus:{
      type:Boolean,
      required:false,
      default:false,
    }
  },
  { timestamps: true } //createdAt,updatedAt auto genrate in the DB table.
);

module.exports = mongoose.model("StudentMarkRank", studentMarkRanksSchema);
