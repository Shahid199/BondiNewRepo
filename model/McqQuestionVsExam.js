const mongoose = require("mongoose");
const exams = require("./Exam");
const questions = require("./QuestionsMcq");
const Schema = mongoose.Schema;

const McqQuestionVsExamSchema = new Schema(
  {
    eId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: exams,
    },
    mId: [
      {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: questions,
      },
    ],

    setName: {
      type: Number,
      required: true,
      default: 0,
    },

    // sizeMid: {
    //   type: Number,
    //   required: true,
    // },
  },
  { timestamps: true } //createdAt,updatedAt auto genrate in the DB table.
);

module.exports = mongoose.model("McqQuestionVsExam", McqQuestionVsExamSchema);
