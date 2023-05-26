const Subject = require("../model/Subject");
const Course = require("../model/Course");
const { default: mongoose } = require("mongoose");
const Exam = require("../model/Exam");
const moment = require("moment");
//Create Subject
const createSubject = async (req, res, next) => {
  const { courseId, name, descr } = req.query;
  const file = req.file;
  const courseId1 = courseId;

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
    courseId: courseId1,
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
  const ObjectId = mongoose.Types.ObjectId;
  let subjects = [];
  const courseId = req.query.courseId;
  if (!ObjectId.isValid(courseId)) return res.status(404).json(subjects);
  let courseIdOb = new mongoose.Types.ObjectId(courseId);
  try {
    subjects = await Subject.find({ courseId: courseIdOb });
  } catch (err) {
    return res.status(500).json("Something went wrong!");
  }
  // if (!subjects) return res.status().json(su);
  return res.status(200).json(subjects);
};
//view subject info
const getSubjectById = async (req, res, next) => {
  const subjectId = req.query.subjectId;
  if (subjectId == null) return res.status(404).json("subject not found");
  let subjectData = null;
  let subjectDataAll = {};
  try {
    subjectData = await Subject.findById(subjectId).populate("courseId");
  } catch (err) {
    return res.status(500).json(err);
  }
  if (subjectData == null) return res.status(200).json([]);
  subjectDataAll["name"] = subjectData.name;
  subjectDataAll["descr"] = subjectData.descr;
  subjectDataAll["courseId"] = subjectData.courseId._id;
  subjectDataAll["courseName"] = subjectData.courseId.name;
  subjectDataAll["iLink"] = subjectData.iLink;
  subjectDataAll["createdAt"] = subjectData.createdAt;
  subjectDataAll["updatedAt"] = subjectData.updatedAt;
  subjectDataAll["_id"] = subjectData._id;

  return res.status(200).json(subjectDataAll);
};
//update subject
const updateSubject = async (req, res, next) => {
  const ObjectId = mongoose.Types.ObjectId;
  const { subjectId, name, descr, iLink, courseId } = req.body;
  if (!ObjectId.isValid(courseId) || !ObjectId.isValid(subjectId))
    return res.status(404).json("subjectId or courseId is not valid.");
  let subjectExam = null;
  try {
    subjectExam = await Exam.find({
      subjectId: new mongoose.Types.ObjectId(subjectId)
    }).count();
  } catch (err) {
    return res.status(500).json(err);
  }
  if (subjectExam>0) return res.status(404).json("Exam already exist.Can' update subject.");
    

  const subjectData = {
    name: name,
    descr: descr,
    iLink: iLink,
    courseId: new mongoose.Types.ObjectId(courseId),
  };
  try {
    upd = await Subject.findByIdAndUpdate(subjectId, subjectData);
  } catch (err) {
    return res.status(501).json(err);
  }
  return res.status(200).json("Subject is updated.");
};
//Get Subject List
const getAllSubject = async (req, res, next) => {
  let subjects = null;
  let data = [];
  try {
    subjects = await Subject.find({}).populate("courseId");
  } catch (err) {
    return res.status(500).json(err);
  }
  //return res.status(200).json(subjects);
  for (let i = 0; i < subjects.length; i++) {
    let subjectDataAll = {};
    subjectDataAll["name"] = subjects[i].name;
    subjectDataAll["descr"] = subjects[i].descr;
    subjectDataAll["courseId"] = subjects[i].courseId._id;
    subjectDataAll["courseName"] = subjects[i].courseId.name;
    subjectDataAll["createdAt"] = moment(subjects[i].createdAt).format(
      "MM-DD-YYYY hh:mm:ss a"
    );
    subjectDataAll["updatedAt"] = moment(subjects[i].updatedAt).format(
      "MM-DD-YYYY hh:mm:ss a"
    );
    subjectDataAll["_id"] = subjects[i]._id;
    data.push(subjectDataAll);
  }

  return res.status(200).json(data);
};
exports.createSubject = createSubject;
exports.getSubjectByCourse = getSubjectByCourse;
exports.getSubjectById = getSubjectById;
exports.updateSubject = updateSubject;
exports.getAllSubject = getAllSubject;
