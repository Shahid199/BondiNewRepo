const Subject = require("../model/Subject");
const Course = require("../model/Course");
//Create Subject
const createSubject = async (req, res, next) => {
  const { courseId, name, descr, iLink } = req.body;
  let existingSubject;
  try {
    existingSubject = await Subject.findOne({ name: name }).select("courseId");
  } catch (err) {
    console.log(err);
    return res.status(500).json("Something went wrong!");
  }
  if (existingSubject) {
    existingSubject = String(existingSubject.courseId);
  }
  if (existingSubject == courseId) {
    return res.status(403).json({ message: "course already exist" });
  }
  const subject = new Subject({
    name: name,
    descr: descr,
    iLink: iLink,
    courseId: courseId,
  });
  try {
    const doc = await subject.save();
  } catch (err) {
    console.log(err);
    return res.status(500).json("Something went wrong!");
  }
  return res.status(201).json({ message: "Subject Successfully created." });
};
//get subject by course
const getSubjectByCourse = async (req, res, next) => {
  const courseId = req.query.courseid;
  let courseIdOb;
  try {
    courseIdOb = await Course.findById(courseId).select("_id");
  } catch (err) {
    console.log(err);
    return res.status(500).json("Something went wrong!");
  }
  let subjects;
  try {
    subjects = await Subject.find({ courseId: courseIdOb });
  } catch (err) {
    console.log(err);
    return res.status(500).json("Something went wrong!");
  }
  if (subjects) {
    return res.status(201).json(subjects);
  } else return res.status(404).json({ message: "Subjects not found." });
};

exports.createSubject = createSubject;
exports.getSubjectByCourse = getSubjectByCourse;
