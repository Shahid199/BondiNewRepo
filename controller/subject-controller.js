const Subject = require("../model/Subject");
const Course = require("../model/Course");
//Create Subject
const createSubject = async (req, res, next) => {
  const { courseid, name, descr } = req.body;
  const file = req.file;
  const courseId = courseid;

  let iLinkPath = null;
  if (file) {
    iLinkPath = "uploads/".concat(file.filename);
  }

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
    return res.status(400).json({ message: "course already exist" });
  }
  const subject = new Subject({
    name: name,
    descr: descr,
    iLink: iLinkPath,
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
    return res.status(200).json(subjects);
  } else return res.status(404).json({ message: "Subjects not found." });
};

exports.createSubject = createSubject;
exports.getSubjectByCourse = getSubjectByCourse;
