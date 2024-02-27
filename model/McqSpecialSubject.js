const mongoose = require("mongoose");
const mcqSpecialExams = require("./McqSpecialExam");
const QuestionsMcq = require("./QuestionsMcq");
const subjects = require("./Subject");
const Schema = mongoose.Schema;

const McqSpecialSubjectSchema = new Schema(
  {
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: subjects,
      required: true,
    },
    examId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: mcqSpecialExams,
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

module.exports = mongoose.model("McqSpecialSubject", McqSpecialSubjectSchema);
