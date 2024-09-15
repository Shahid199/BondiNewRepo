const mongoose = require("mongoose");
const teachers = require("./User");
const exams = require("./Exam");
const Schema = mongoose.Schema;

const scriptDetailsSchema = new Schema(
  {
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: teachers,
    },
    examId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: exams,
    },
    examName:{
      type: String,
      required: true,
      default: null,
    },
    numberOfQuestions:{
        type: Number,
        required: true,
     },
    numberOfStudents:{
        type: Number,
        required: true,
     },
    paid:{
      type:Boolean,
      requred:false,
      default:false
    },

  },
  { timestamps: true } //createdAt,updatedAt auto genrate in the DB table.
);

module.exports = mongoose.model("ScriptDetails", scriptDetailsSchema);
