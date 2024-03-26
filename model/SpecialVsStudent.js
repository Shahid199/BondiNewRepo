const mongoose = require("mongoose");
const exams = require("./SpecialExamNewNew");
const students = require("./Student");
const questions = require("./QuestionsMcq");
const subjects = require("./Subject");
const Schema = mongoose.Schema;

const specialVsStudentSchema = new Schema(
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
    startTimeMcq: {
      type: Date,
      required: false,
      default: null,
    },
    endTimeMcq: {
      type: Date,
      required: false,
      default: null,
    },
    mcqDuration: {
      type: Number,
      required: false,
      default: 0,
    },
    startTimeWritten: {
      type: Date,
      required: false,
      default: null,
    },
    endTimeWritten: {
      type: Date,
      required: false,
      default: null,
    },
    writtenDuration: {
      type: Number,
      required: false,
      default: 0,
    },
    questionMcq: [
      {
        subjectId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: subjects,
          required: false,
        },
        mcqMarksPerSub: {
          type: Number,
          required: false,
          default: 0,
        },
        totalCorrectAnswer: {
          type: Number,
          required: false,
          default: 0,
        },
        totalWrongAnswer: {
          type: Number,
          required: false,
          default: 0,
        },
        totalCorrectMarks: {
          type: Number,
          required: false,
          default: 0,
        },
        totalNotAnswered: {
          type: Number,
          required: false,
          default: 0,
        },
        totalWrongMarks: {
          type: Number,
          required: false,
          default: 0,
        },
        mcqId: [
          {
            type: mongoose.Schema.Types.ObjectId,
            ref: questions,
            required: false,
          },
        ],
        mcqAnswer: [
          {
            type: Number,
            required: false,
            default: -1,
          },
        ],
      },
    ],
    questionWritten: [
      {
        subjectId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: subjects,
          required: false,
        },
        submittedScriptILink: [
          [
            {
              type: String,
              required: false,
            },
          ],
        ],
        answerScriptILink: [
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
        totalObtainedMarksWritten: {
          type: Number,
          required: false,
          default: 0,
        },
        subStatus: {
          type: Boolean,
          required: true,
          default: false,
        },
      },
    ],
    totalMarksMcq: {
      type: Number,
      required: false,
      default: 0,
    },
    totalMarksWritten: {
      type: Number,
      required: false,
      default: 0,
    },
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
    finishStatus: {
      type: Boolean,
      required: true,
      default: false,
    },
    runningStatus: {
      type: Boolean,
      required: true,
      default: false,
    },
    publishStatus: {
      type: Boolean,
      required: true,
      default: false,
    },
    rank: {
      type: Number,
      required: false,
      default: -1,
    },
  },

  { timestamps: true }
);

module.exports = mongoose.model("SpecialVsStudent", specialVsStudentSchema);
