const mongoose = require("mongoose");
const bothExams = require("./BothExam");
const specialExams = require("./SpecialExam");
const exams = require("./Exam");
const Schema = mongoose.Schema;

const SollutionSheetSchema = new Schema(
  {
    examId: {
      type: mongoose.Schema.Types.ObjectId,
      required: false,
      ref: exams,
    },
    bothExamId: {
      type: mongoose.Schema.Types.ObjectId,
      required: false,
      ref: bothExams,
    },
    specialExamId: {
      type: mongoose.Schema.Types.ObjectId,
      required: false,
      ref: specialExams,
    },
    sollutionLink: {
      type: String,
      required: true,
    },
  },
  { timestamps: true } //createdAt,updatedAt auto genrate in the DB table.
);

module.exports = mongoose.model("SollutionSheet", SollutionSheetSchema);