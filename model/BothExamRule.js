const mongoose = require("mongoose");
const exams = require("./BothExam");
const Schema = mongoose.Schema;

const bothExamRuleSchema = new Schema(
  {
    bothExamId: {
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

module.exports = mongoose.model("BothExamRule", bothExamRuleSchema);
