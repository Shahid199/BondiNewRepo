const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const examRuleSchema = new Schema(
  {
    ruleImage: {
      type: String,
      required: true,
      unique: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ExamRule", examRuleSchema);
