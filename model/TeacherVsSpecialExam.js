const mongoose = require("mongoose");
const teachers = require("./User");
const exams = require("./SpecialExamNew");
const students = require("./Student");
const Schema = mongoose.Schema;

const teacherVsSpecialExamSchema = new Schema(
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
    studentId: [
      {
        type: mongoose.Schema.Types.ObjectId,
        required: false,
        ref: students,
      },
    ],
  },
  { timestamps: true } //createdAt,updatedAt auto genrate in the DB table.
);

module.exports = mongoose.model(
  "TeacherVsSpecialExam",
  teacherVsSpecialExamSchema
);
