const Course = require("../model/Course");
const Student = require("../model/Student");
const CourseVsStudent = require("../model/CourseVsStudent");
const mongoose = require("mongoose");
var mongodb = require("mongodb");
//add Student To Course
const addStudentToCourse = async (req, res, next) => {
  let { courseId, studentId } = req.body;
  const studnetIdCheck = studentId;
  try {
    studentId = await Student.findById(studentId).select("_id");
  } catch (err) {
    console.log(err);
  }
  try {
    courseId = await Course.findById(courseId).select("_id");
  } catch (err) {
    console.log(err);
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
  }
  if (flag == true) {
    return res
      .status(401)
      .json({ message: "student already assign to the course." });
  }
  const courseVsStudent = new CourseVsStudent({
    courseId: courseId,
    studentId: studentId,
  });
  let doc;
  try {
    doc = await courseVsStudent.save();
  } catch (err) {
    console.log(err);
  }
  if (doc) {
    return res
      .status(201)
      .json({ message: "Successfull add student to course." });
  } else {
    return res.status(400).json({ message: "Something went wrong." });
  }
};
//get students by course
const getStudentByCourse = async (req, res, next) => {
  let courseId = req.query.courseid;
  let students,
    flag = false;
  try {
    students = await CourseVsStudent.find({ courseId: courseId }).populate(
      "studentId"
    );
    flag = true;
  } catch (err) {
    console.log(err);
  }
  if (flag == true) {
    return res.status(201).json(students);
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
  }
  if (flag == true) {
    return res.status(201).json(courses);
  }
};

exports.addStudentToCourse = addStudentToCourse;
exports.getStudentByCourse = getStudentByCourse;
exports.getCourseByStudent = getCourseByStudent;
