const mongoose = require("mongoose");
const exams = require("./SpecialExamNew");
const Schema = mongoose.Schema;

const specialExamRuleSchema = new Schema(
  {
    examId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: exams,
      index: { unique: true },
    },

    ruleILink: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("SpecialExamRule", specialExamRuleSchema);
