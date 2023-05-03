const Course = require("../model/Course");
//Create Courses
const createCourse = async (req, res, next) => {
  const { name, descr } = req.body;
  let existingCourse;
  try {
    existingCourse = await Course.findOne({ name: name });
  } catch (err) {
    console.log(err);
  }
  if (existingCourse) {
    return res.status(400).json({ message: "course already exist" });
  }
  const course = new Course({
    name: name,
    descr: descr,
  });
  try {
    const doc = await course.save();
  } catch (err) {
    console.log(err);
  }
  return res.status(201).json({ message: course });
};

//get course
const getCourse = async (req, res, next) => {
  const courseId = req.query.id;
  console.log(courseId);
  let course;
  try {
    course = await Course.findById(courseId);
  } catch (err) {
    return new Error(err);
  }
  if (!course) {
    return res.status(404).json({ message: "Course Not Found" });
  }
  return res.status(200).json( course );
};
//get all course
const getAllCourse = async (req, res, next) => {
  let courses;
  try {
    courses = await Course.find({}).exec();
  } catch (err) {
    return new Error(err);
  }
  if (!courses) {
    return res.status(404).json({ message: "Courses Not Found" });
  }
  return res.status(200).json({ courses });
};

exports.createCourse = createCourse;
exports.getCourse = getCourse;
exports.getAllCourse = getAllCourse;
