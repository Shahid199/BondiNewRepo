const mongoose = require("mongoose");
const exams = require("./Exam");
const questionsWritten = require("./QuestionsWritten");
const students = require("./Student");
const Schema = mongoose.Schema;

const studentExamVsQuestionsWrittenSchema = new Schema(
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
  "StudentExamVsQuestionWritten",
  studentExamVsQuestionsWrittenSchema
);
