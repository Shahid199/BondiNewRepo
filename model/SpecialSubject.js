const mongoose = require("mongoose");
const specialExams = require("./SpecialExamNew");
const QuestionsMcq = require("./QuestionsMcq");
const subjects = require("./Subject");
const Schema = mongoose.Schema;

const specialSubjectSchema = new Schema(
  {
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: subjects,
      required: true,
    },
    examId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: specialExams,
      required: true,
    },
    mcqQuestionId: [
      {
        type: mongoose.Schema.Types.ObjectId,
        required: false,
        ref: QuestionsMcq,
      },
    ],
    marksPerMcq: {
      type: Number,
      required: false,
    },
    subjectTotalMarksMcq: {
      type: Number,
      required: false,
    },
    negativeMarks: {
      type: Number,
      required: false,
    },
    writtenQuestionILink: {
      type: String,
      required: false,
    },
    writtenTotalQuestions: {
      type: Number,
      required: false,
    },
    writtenMarksPerQuestion: [
      {
        type: Number,
        required: false,
      },
    ],
    subjectWrittenTotalMarks: {
      type: Number,
      required: false,
    },
    TotalMarks: {
      type: Number,
      required: true,
    },
    priority: {
      type: Boolean,
      required: true,
      default: false,
    },
    status: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  { timestamps: true } //createdAt,updatedAt auto genrate in the DB table.
);

module.exports = mongoose.model("SpecialSubject", specialSubjectSchema);
