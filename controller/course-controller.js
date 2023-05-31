const { default: mongoose } = require("mongoose");
const Course = require("../model/Course");
const Student = require("../model/Student");
const CourseVsStudent = require("../model/CourseVsStudent");
const { json } = require("express");
const { ObjectId } = require("mongodb");
const pagination = require("../utilities/pagination");
const Limit = 30;
//Create Courses
const createCourse = async (req, res, next) => {
  const { name, descr, status } = req.body;
  if (status == null || status == "false")
    return res.status(404).json("Create course-status must be true.");
  //status = Boolean(status);
  let existingCourse;
  try {
    existingCourse = await Course.findOne({ name: name });
  } catch (err) {
    console.log(err);
    return res.status(500).json("Something went wrong!");
  }
  if (existingCourse) {
    return res.status(400).json({ message: "course already exist" });
  }

  const course = new Course({
    name: name,
    descr: descr,
    status: Boolean(status),
  });
  try {
    const doc = await course.save();
  } catch (err) {
    console.log(err);
    return res.status(500).json("Something went wrong!");
  }
  return res.status(201).json(course);
};
//get course update
const getCourse = async (req, res, next) => {
  const id = req.query.courseId;
  let course;
  try {
    course = await Course.findById(id);
  } catch (err) {
    return res.status(500).json(err);
  }
  if (!course) {
    return res.status(404).json({ message: "Course Not Found" });
  }
  return res.status(200).json(course);
};
//get all course
const getAllCourse = async (req, res, next) => {
  let courses;
  let page = Number(req.query.page) || 1;
  let count = 0;
  try {
    count = await Course.find({ status: true }).count();
  } catch (err) {
    return res.status(500).json("Something went wrong.");
  }
  count = Number(count);
  if (count == 0) return res.status(404).json("No courses found.");
  const paginateData = pagination(count, page);
  try {
    courses = await Course.find({ status: true })
      .skip(paginateData.skippedIndex)
      .limit(paginateData.perPage)
      .exec();
  } catch (err) {
    return res.status(500).json("1.Something went wrong.");
  }
  if (!courses) {
    return res.status(404).json({ message: "Courses Not Found" });
  }
  return res.status(200).json({ courses, paginateData });
};
//update status of course
const updateStatusCourse = async (req, res, next) => {
  const ObjectId = mongoose.Types.ObjectId;
  const courseId = req.body.courseId;
  if (!ObjectId.isValid(courseId))
    return res.status(404).json("courseId is invalid.");
  console.log(courseId);
  let status = req.body.status;
  let status1 = JSON.parse(status);
  const courseIdObj = new mongoose.Types.ObjectId(courseId);
  let updStatus = null;
  try {
    updStatus = await Course.findByIdAndUpdate(courseId, { status: status1 });
  } catch (err) {
    return res.status(500).json("1.Something went wrong.");
  }
  try {
    updStatus = await Course.findById(String(updStatus._id)).select(
      "status courseId"
    );
  } catch (err) {
    return res.status(500).json("2.Something went wrong.");
  }
  let updStatusSecond = null;
  if (updStatus.status == status1) {
    try {
      updStatusSecond = await CourseVsStudent.updateMany(
        { courseId: courseIdObj },
        { status: status1 }
      );
    } catch (err) {
      return res.status(500).json("3.Something went wrong.");
    }
    if (updStatusSecond.matchedCount == 0)
      return res.status(404).json("no student in the course.");
    else
      return res
        .status(201)
        .json("student & courses status update succesfully.");
  } else return res.status(404).json("Course status not updated.");
};
//use for functional work like dropdown load
const getAllCourseAdmin = async (req, res, next) => {
  let courses;
  try {
    courses = await Course.find({ status: true }, "name status").exec();
  } catch (err) {
    return new Error(err);
  }
  if (!courses) {
    return res.status(404).json({ message: "Courses Not Found" });
  }
  return res.status(200).json(courses);
};
const updateSingle = async (req, res, next) => {
  const id = req.query.id;
  const singleCourse = req.body;
  console.log(singleCourse);
  const filter = { _id: new ObjectId(id) };
  const result = await Course.findByIdAndUpdate(filter, singleCourse);
  return res.status(200).json(result);
};
const deactivateCourse = async (req, res, next) => {
  const id = req.query.id;
  const filter = { _id: new ObjectId(id) };
  const result = await Course.findByIdAndUpdate(filter, { status: false });
  let result2;
  if (result) {
    result2 = await CourseVsStudent.updateMany(
      { courseId: id },
      { status: false }
    );
  }
  console.log(result2);
  return res.status(200).json(result);
};
exports.createCourse = createCourse;
exports.getCourse = getCourse;
exports.getAllCourse = getAllCourse;
exports.getAllCourseAdmin = getAllCourseAdmin;
exports.updateStatusCourse = updateStatusCourse;
exports.updateSingle = updateSingle;
exports.deactivateCourse = deactivateCourse;
