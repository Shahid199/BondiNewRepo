const mongoose = require("mongoose");
const subjects = require("./subjects");
const Schema = mongoose.Schema;

const examSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      max: 200,
    },
    //exam variation for Weekly/Monthly/daily
    examType: {
      type: Number,
      required: false,
    },
    //exam variation for MCQ/Written/Both
    examVariation: {
      type: Number,
      required: true,
    },
    //exam variation for free/not
    examFreeOrNot: {
      type: Boolean,
      required: true,
      default: false,
    },
    startTime: {
      type: Date,
      required: true,
    },
    endTime: {
      type: Date,
      required: true,
    },
    duration: {
      type: Number,
      required: true,
    },
    // totalMarks: {
    //   type: Number,
    //   required: true,
    // },
    // numberOfQuestions: {
    //   type: Number,
    //   required: true,
    // },
    status: {
      type: Boolean,
      required: true,
      default: true,
    },
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: subjects,
      required: true,
    },
  },
  { timestamps: true } //createdAt,updatedAt auto genrate in the DB table.
);

module.exports = mongoose.model("Exam", examSchema);
