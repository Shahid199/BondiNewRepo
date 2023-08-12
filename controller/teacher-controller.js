const { default: mongoose } = require("mongoose");
const TeacherVsExam = require("../model/TeacherVsExam");

const getStudentData = async (req, res, next) => {
  let teacherId = req.user._id;
  teacherId = new mongoose.Types.ObjectId(teacherId);
  let students = [];
  try {
    students = await TeacherVsExam.findOne({ teacherId: teacherId }).populate(
      "studentId"
    );
  } catch (err) {
    return res.status(500).json("Something went wrong.");
  }
  if (students.length == 0) return res.status(404).json("No student assigned.");
  let data = [];
  for (let i = 0; i < students.studentId.length; i++) {
    let stud = {};
    stud["id"] = students.studentId._id;
    stud["name"] = students.studentId.name;
    data.push(stud);
  }
  return res.status(200).json(data);
};

exports.getStudentData = getStudentData;
