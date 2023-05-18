const Course = require("../model/Course");
const Student = require("../model/Student");
const CourseVsStudent = require("../model/CourseVsStudent");
const fs = require("fs");
const fsp = fs.promises;
//add Student To Course
const addStudentToCourse1 = async (req, res, next) => {
  let { courseId, studentId } = req.body;
  const studnetIdCheck = studentId;
  console.log(studentId);
  try {
    studentId = await Student.findOne({ _id: studentId });
  } catch (err) {
    console.log(err);
    return res.status(500).json("Something went wrong1!");
  }
  console.log(studentId);
  try {
    courseId = await Course.findById(courseId).select("_id");
  } catch (err) {
    console.log(err);
    return res.status(500).json("Something went wrong2!");
  }
  let existingStudentCourse;
  let flag = false;
  try {
    existingStudentCourse = await CourseVsStudent.find({
      courseId: courseId,
    }).select("studentId");
    existingStudentCourse = Object.entries(existingStudentCourse);
    existingStudentCourse.forEach((Element) => {
      if (String(Element[1].studentId) == studnetIdCheck) {
        flag = true;
      }
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json("Something went wrong3!");
  }
  if (flag == true) {
    return res
      .status(400)
      .json({ message: "student already assign to the course." });
  }
  const courseVsStudent = new CourseVsStudent({
    courseId: courseId,
    studentId: studentId,
  });
  console.log(courseId);
  console.log(studentId);
  let doc;
  try {
    doc = await courseVsStudent.save();
  } catch (err) {
    console.log(err);
    return res.status(500).json("Something went wrong4!");
  }
  if (doc) {
    return res
      .status(201)
      .json({ message: "Successfull add student to course." });
  } else {
    return res.status(404).json({ message: "Something went wrong5." });
  }
};
const addStudentToCourse = async (req, res, next) => {
  //start file work
  const file = req.file;
  let courseId = req.body.courseId;
  let excelFilePath = null;
  if (!file) {
    return res.status(404).json({ message: "Excel File not uploaded." });
  }
  excelFilePath = "uploads/".concat(file.filename);
  const data1 = await fsp.readFile(excelFilePath, "utf8");
  const linesExceptFirst = data1.split("\n");
  const linesArr = linesExceptFirst;
  //end file work
  let students = [];
  let problemStudent = [];
  let courseId1;
  try {
    courseId1 = await Course.findById(courseId).select("_id");
  } catch (err) {
    return res.status(500).json(err);
  }
  if (courseId1 == null) return res.status(404).json("course not found");
  for (let i = 1; i < linesArr.length; i++) {
    const regNo = String(linesArr[i].replace(/[\r]/g, ""));
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
      problemStudent.push(regNo);
      continue;
    }
    users["courseId"] = courseId1;
    users["studentId"] = studentId;
    users["status"] = true;
    students.push(users);
  }
  let doc;
  try {
    doc = await CourseVsStudent.insertMany(students, { ordered: false });
  } catch (err) {
    return res.status(500).json(err);
  }
  return res.status(201).json(problemStudent);
};
//get students by course
const getStudentByCourse = async (req, res, next) => {
  let courseId = req.query.courseId;
  let students,
    flag = false;
  try {
    students = await CourseVsStudent.find({ courseId: courseId }).populate(
      "studentId"
    );
    flag = true;
  } catch (err) {
    console.log(err);
    return res.status(500).json("Something went wrong!");
  }
  if (flag == true) {
    return res.status(200).json(students);
  }
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
