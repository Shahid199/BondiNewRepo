const mongoose = require("mongoose");
const exams = require("./McqSpecialExam");
const Schema = mongoose.Schema;

const McqSpecialExamRuleSchema = new Schema(
  {
    examId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: exams,
    },

    ruleILink: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("McqSpecialExamRule", McqSpecialExamRuleSchema);
