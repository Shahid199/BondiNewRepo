const mongoose = require("mongoose");
const exams = require("./exams");
const questionsWritten = require("./questionsWritten");
const students = require("./students");
const Schema = mongoose.Schema;

const studentExamVsQuestionsWrittenScheama = new Schema(
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
    writtenQuestionId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: questionsWritten,
    },
    //when students submit image answer script
    submittedScriptILink: {
      type: Array,
      required: false,
    },
    //when students submit pdf answer script
    //submittedScriptPdfLink: {
    //    type: String,
    //    required: false,
    //  },
    //For Image
    ansewerScriptILink: {
      type: Array,
      required: false,
    },
    //For Pdf file
    //ansewerScriptPdfLink: {
    //  type: String,
    //  required: false,
    // },
    obtainedMarks: {
      type: Array,
      required: false,
    },
    totalObtainedMarks: {
      type: Number,
      required: false,
    },
    checkStatus: {
      type: Boolean,
      required: false,
    },
  },
  { timestamps: true } //createdAt,updatedAt auto genrate in the DB table.
);
module.exports = mongoose.model(
  "StudentExamVsQuestionWritten",
  studentExamVsQuestionsWrittenScheama
);
