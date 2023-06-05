const mongoose = require("mongoose");
const specialExams = require("./SpeciaExam");
const QuestionsMcq = require("./QuestionsMcq");
const Schema = mongoose.Schema;

const specialSubjectSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    descr: {
      type: String,
      required: false,
      max: 10000,
    },
    iLink: {
      type: String,
      required: true,
      unique: true,
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
    status: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  { timestamps: true } //createdAt,updatedAt auto genrate in the DB table.
);

module.exports = mongoose.model("SpecialSubject", specialSubjectSchema);
