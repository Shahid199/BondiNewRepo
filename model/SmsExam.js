const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const SmsExamSchema = new Schema(
  {
    examId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    examType: {
      type: Number,
      required: true,
    },
    examFreeOrNot: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true } //createdAt,updatedAt auto genrate in the DB table.
);

module.exports = mongoose.model("SmsExam", SmsExamSchema);
