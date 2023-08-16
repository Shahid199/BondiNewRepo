const { ObjectId } = require("mongodb");
const { default: mongoose, Mongoose } = require("mongoose");
const SpecialExam = require("../model/SpecialExam");
const pagination = require("../utilities/pagination");

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
    startTime,
    endTime,
    marksPerMcq,
    status,
    duration,
    negativeMarks,
  } = req.body;
  if (!ObjectId.isValid(courseId) || subjectId.length == 0)
    return res.status(404).json("course Id or subject Id is invalid.");
  let startTime1, endTime1;
  startTime1 = new Date(startTime);
  endTime1 = new Date(endTime);
  let courseIdObj, saveExam;
  courseIdObj = new mongoose.Types.ObjectId(courseId);
  saveExam = new SpecialExam({
    courseId: courseIdObj,
    name: name,
    startTime: new Date(moment(startTime1).add(6, "hours")),
    endTime: new Date(moment(endTime1).add(6, "hours")),
    duration: Number(duration),
    marksPerMcq: Number(marksPerMcq),
    negativeMarks: Number(negativeMarks),
    status: JSON.parse(status),
    iLink: iLinkPath,
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
    startTime,
    endTime,
    marksPerMcq,
    status,
    duration,
    negativeMarks,
  } = req.body;
  if (!ObjectId.isValid(examId) || !ObjectId.isValid(courseId)) {
    return res.status(404).json("exam Id or course Id is not valid.");
  }
  let saveExamUpd = {
    courseId: new mongoose.Types.ObjectId(courseId),
    name: name,
    startTime: new Date(moment(new Date(startTime)).add(6, "hours")),
    endTime: new Date(moment(new Date(endTime)).add(6, "hours")),
    duration: Number(duration),
    marksPerMcq: Number(marksPerMcq),
    negativeMarks: Number(negativeMarks),
    status: JSON.parse(status),
  };
  let updStatus = null;
  try {
    updStatus = await SpecialExam.findByIdAndUpdate(examId, saveExamUpd);
  } catch (err) {
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
