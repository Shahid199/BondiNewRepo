const mongoose = require("mongoose");
const exams = require("./Exam");
const Schema = mongoose.Schema;

const publishFreeExamSchema = new Schema(
  {
    examId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: exams,
    },
    status: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  { timestamps: true } //createdAt,updatedAt auto genrate in the DB table.
);

module.exports = mongoose.model("PublishFreeExamSchema", publishFreeExamSchema);
