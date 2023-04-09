const mongoose = require("mongoose");
const exams = require("./exams");
const freeStudents = require("./freeStudents");
const questionsWritten = require("./questionsWritten");
const Schema = mongoose.Schema;

const freeStudentExamVsQuestionsWrittenSchema = new Schema(
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
    writtenQuestionId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: questionsWritten,
    },
    //when students submit image answer script
    submittedScriptILink: [
      {
        type: String,
        required: false,
      },
    ],
    //when students submit pdf answer script
    //submittedScriptPdfLink: {
    //    type: String,
    //    required: false,
    //  },
    //For Image
    ansewerScriptILink: [
      {
        type: String,
        required: false,
      },
    ],
    //For Pdf file
    //ansewerScriptPdfLink: {
    //  type: String,
    //  required: false,
    // },
    obtainedMarks: [
      {
        type: Number,
        required: false,
      },
    ],
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
  "FreeStudentExamVsQuestionWritten",
  freeStudentExamVsQuestionsWrittenSchema
);
