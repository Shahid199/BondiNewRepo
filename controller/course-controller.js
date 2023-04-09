const Course = require("../model/Course");

//Create Courses
const createcourse = async (req, res, next) => {
  const { name, descr, courseILink } = req.body;
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
    courseILink: courseILink,
  });
  try {
    const doc = await course.save();
  } catch (err) {
    console.log(err);
  }
  return res.status(201).json({ message: course });
};

exports.createcourse = createcourse;
