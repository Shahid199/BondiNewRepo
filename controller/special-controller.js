const { ObjectId } = require("mongodb");
const { default: mongoose, Mongoose } = require("mongoose");
const SpecialExam = require("../model/SpecialExam");
const pagination = require("../utilities/pagination");
const moment = require("moment");
const createSpecialExam = async (req, res, next) => {
  const file = req.file;
  let iLinkPath = null;
  if (!file) {
    return res.status(404).json("File not uploaded.");
  }
  iLinkPath = "uploads/".concat(file.filename);
  const {
    courseId,
    name,
    examType,
    startTime,
    endTime,
    mcqDuration,
    writtenDuration,
    totalMarksMcq,
    totalMarksWritten,
    totalMarks,
    status,
    totalDuration,
    totalSubject,
    examSubject,
  } = req.body;
  console.log(courseId);
  if (!ObjectId.isValid(courseId))
    return res.status(404).json("course Id is invalid.");
  let startTime1, endTime1;
  startTime1 = new Date(startTime);
  endTime1 = new Date(endTime);
  let courseIdObj, saveExam;
  courseIdObj = new mongoose.Types.ObjectId(courseId);
  saveExam = new SpecialExam({
    courseId: courseIdObj,
    name: name,
    examType: examType,
    startTime: moment(startTime1),
    endTime: moment(endTime1),
    mcqDuration: mcqDuration,
    writtenDuration: writtenDuration,
    totalDuration: totalDuration,
    totalMarksMcq: totalMarksMcq,
    totalMarksWritten: totalMarksWritten,
    totalMarks: totalMarks,
    status: JSON.parse(status),
    iLink: iLinkPath,
    totalSubject: totalSubject,
    examSubject: examSubject,
  });
  let doc;
  try {
    doc = await saveExam.save();
  } catch (err) {
    //console.log(err);
    return res.status(500).json("Something went wrong!");
  }

  return res.status(201).json(doc);
};
const updateSpecialExam = async (req, res, next) => {
  const {
    examId,
    courseId,
    name,
    examType,
    startTime,
    endTime,
    mcqDuration,
    writtenDuration,
    totalMarksMcq,
    totalMarksWritten,
    totalMarks,
    status,
    totalDuration,
    totalSubject,
    examSubject,
  } = req.body;
  console.log(req.body);
  if (!ObjectId.isValid(examId) || !ObjectId.isValid(courseId)) {
    return res.status(404).json("exam Id or course Id is not valid.");
  }
  let startTime1, endTime1;
  startTime1 = new Date(startTime);
  endTime1 = new Date(endTime);
  let courseIdObj;
  courseIdObj = new mongoose.Types.ObjectId(courseId);
  let saveExam = {
    courseId: courseIdObj,
    name: name,
    examType: examType,
    startTime: moment(startTime),
    endTime: moment(endTime),
    mcqDuration: mcqDuration,
    writtenDuration: writtenDuration,
    totalDuration: totalDuration,
    totalMarksMcq: totalMarksMcq,
    totalMarksWritten: totalMarksWritten,
    totalMarks: totalMarks,
    status: JSON.parse(status),
    totalSubject: totalSubject,
    examSubject: examSubject,
  };
  let updStatus = null;
  try {
    updStatus = await SpecialExam.findByIdAndUpdate(examId, saveExam);
  } catch (err) {
    console.log(err);
    return res.status(500).json("Something went wrong.");
  }
  if (updStatus == null) return res.status(404).json("Problem at update.");
  else return res.status(201).json("Updated special exam.");
};
const showSpecialExamById = async (req, res, next) => {
  let examId = req.body.examId;
  if (!ObjectId.isValid(examId)) return res.staus(404).json("Invalid Exam Id.");
  let data = null;
  try {
    data = await SpecialExam.findOne({
      $and: [{ _id: examId }, { status: true }],
    });
  } catch (err) {
    return res.status(500).json("Something went wrong.");
  }
  if (data == null) return res.status(404).json("No data found.");
  return res.status(200).json(data);
};
const showSpecialExamAll = async (req, res, next) => {
  let data = null;
  let page = Number(req.query.page) || 1;
  let count = 0;
  try {
    count = await SpecialExam.find({ status: true }).count();
  } catch (err) {
    return res.status(500).json("Something went wrong.");
  }
  const paginateData = pagination(count, page);
  try {
    data = await SpecialExam.find({ status: true })
      .populate(courseId)
      .skip(paginateData.skippedIndex)
      .limit(paginateData.perPage);
  } catch (err) {
    return res.status(500).json("Something went wrong.");
  }
  if (data == null) return res.status(404).json("No data found.");
  return res.status(200).json(data, paginateData);
};
const deactivateSpecialExam = async (req, res, next) => {
  let examId = req.body.examId;
  if (!ObjectId.isValid(examId))
    return res.status(404).json("examId is not valid.");
  let upd = null;
  try {
    upd = await SpecialExam.findByIdAndUpdate(examId, { status: false });
  } catch (err) {
    return res.status(500).json("Something went wrong.");
  }
  if (upd == null) return res.status(404).json("No data found.");
  return res.status(201).json("Deactivated.");
};

exports.createSpecialExam = createSpecialExam;
exports.updateSpecialExam = updateSpecialExam;
exports.showSpecialExamById = showSpecialExamById;
exports.showSpecialExamAll = showSpecialExamAll;
exports.deactivateSpecialExam = deactivateSpecialExam;
