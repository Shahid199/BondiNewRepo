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
      [
        {
          type: String,
          required: false,
        },
      ],
    ],
    ansewerScriptILink: [
      [
        {
          type: String,
          required: false,
        },
      ],
    ],
    obtainedMarks: [
      {
        type: Number,
        required: false,
        default: 0,
      },
    ],
    totalObtainedMarks: {
      type: Number,
      required: false,
      default: 0,
    },
    checkStatus: {
      type: Boolean,
      required: true,
      default: false,
    },
    uploadStatus: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  { timestamps: true } //createdAt,updatedAt auto genrate in the DB table.
);
module.exports = mongoose.model(
  "StudentExamVsQuestionWritten",
  studentExamVsQuestionsWrittenSchema
);
