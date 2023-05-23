const Course = require("../model/Course");
const Student = require("../model/Student");
const CourseVsStudent = require("../model/CourseVsStudent");
const fs = require("fs");
const { default: mongoose } = require("mongoose");
const fsp = fs.promises;
//add Student To Course
const addStudentToCourse = async (req, res, next) => {
  //start file work
  const file = req.file;
  let courseId = req.body.courseId;
  let excelFilePath = null;
  if (!file) {
    return res.status(404).json({ message: "File not uploaded." });
  }
  excelFilePath = "uploads/".concat(file.filename);
  const data1 = await fsp.readFile(excelFilePath, "utf8");
  const linesExceptFirst = data1.split("\n");
  const linesArr = linesExceptFirst;
  //end file work
  let students = [];
  let problemStudent = [];
  let existStudent = [];
  let courseId1;
  courseId1 = new mongoose.Types.ObjectId(courseId);
  for (let i = 1; i < linesArr.length; i++) {
    const regNo = String(linesArr[i].replace(/[-"\r]/g, ""));
    if (regNo == "undefined") {
      continue;
    }
    const users = {};
    let studentId = null;
    try {
      studentId = await Student.findOne({ regNo: regNo }).select("_id");
    } catch (err) {
      return res.status(500).json(err);
    }
    if (studentId == null) {
      problemStudent.push(regNo);
      continue;
    }
    let existData = null;
    try {
      existData = await CourseVsStudent.findOne({
        $and: [{ studentId: studentId }, { courseId: courseId1 }],
      }).select("_id");
    } catch (err) {
      return res.status(500).json("err");
    }
    if (existData != null) {
      existStudent.push(regNo);
      continue;
    }
    users["courseId"] = courseId1;
    users["studentId"] = studentId;
    users["status"] = true;
    students.push(users);
  }
  if (problemStudent.length > 0) return res.status(202).json(problemStudent);
  let doc;
  try {
    doc = await CourseVsStudent.insertMany(students, { ordered: false });
  } catch (err) {
    return res.status(500).json(err);
  }
  return res
    .status(201)
    .json({ message: "Successfully inserted all student.", existStudent });
};
//get students by course
const getStudentByCourse = async (req, res, next) => {
  let courseId = req.query.courseId;
  let students;
  try {
    students = await CourseVsStudent.find({
      $and: [{ courseId: courseId }, { status: true }],
    }).populate("studentId");
  } catch (err) {
    console.log(err);
    return res.status(500).json("Something went wrong!");
  }
  if (students != null) return res.status(200).json(students);
  else return res.status(404).json("student not found in course.");
};
//get courses by student
const getCourseByStudent = async (req, res, next) => {
  let studentId = req.query.studentid;
  let courses,
    flag = false;
  try {
    courses = await CourseVsStudent.find({ studentId: studentId }).populate(
      "courseId"
    );
    flag = true;
  } catch (err) {
    console.log(err);
    return res.status(500).json("Something went wrong!");
  }
  if (flag == true) {
    return res.status(200).json(courses);
  }
};
//get course by regNo
const getCourseByReg = async (req, res, next) => {
  const regNo = req.query.regNo;
  let studentId;
  let courses;
  try {
    studentId = await Student.findOne({ regNo: regNo }).select("_id");
  } catch (err) {
    console.log(err);
    return res.status(500).json("Something went wrong!");
  }
  if (studentId) {
    courses = await CourseVsStudent.find({ studentId: studentId }).populate(
      "courseId"
    );
    let dataNew = [];
    for (let i = 0; i < courses.length; i++) {
      dataNew.push(courses[i].courseId);
    }
    let studentId1 = studentId._id;
    return res.status(200).json({ courses: dataNew, studentId: studentId1 });
  } else return res.status(404).json({ message: "Course Not found." });
};

exports.addStudentToCourse = addStudentToCourse;
exports.getStudentByCourse = getStudentByCourse;
exports.getCourseByStudent = getCourseByStudent;
exports.getCourseByReg = getCourseByReg;
