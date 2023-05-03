const mongoose = require("mongoose");
const exams = require("./Exam");
const freeStudents = require("./FreeStudent");
const Schema = mongoose.Schema;

const freeStudentMarkRanksSchema = new Schema(
  {
    freeStudentId: {
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

module.exports = mongoose.model("FreeStudentMarkRank", freeStudentMarkRanksSchema);
