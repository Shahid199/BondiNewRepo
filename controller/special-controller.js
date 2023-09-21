const { ObjectId } = require("mongodb");
const { default: mongoose, Mongoose } = require("mongoose");
const SpecialExam = require("../model/SpecialExam");
const pagination = require("../utilities/pagination");
const moment = require("moment");
const updateSpecialExam = async (req, res, next) => {
  const {
    examId,
    courseId,
    name,
    examType,
    startTime,
    endTime,
    mcqDuration,
    marksPerMcq,
    negativeVarks,
    totalQuestionMcq,
    totalQuestionWritten,
    writtenDuration,
    totalMarksWritten,
    totalDuration,
    totalMarksMcq,
    totalMarks,
    status,
    sscStatus,
    hscStatus,
    noOfTotalSubject,
    noOfExamSubject,
    noOfOptionalSubject,
    optionalSubject, //array of subject Id
    subjectInfo, //array of subjectinfo
  } = req.body;
  console.log(req.body);
  if (!ObjectId.isValid(examId) || !ObjectId.isValid(courseId)) {
    return res.status(404).json("exam Id or course Id is not valid.");
  }
  let optionalSubjects = [];
  for (let i = 0; i < optionalSubject.length; i++) {
    optionalSubjects[i] = new mongoose.Types.ObjectId(optionalSubject[i]);
  }
  let subjectsInfos = [];
  for (let i = 0; i < subjectInfo.length; i++) {
    let dataOb = {};
    dataOb["subjectId"] = new mongoose.Types.ObjectId(subjectInfo[i].subjectId);
    dataOb["noOfQuestionsMcq"] = subjectInfo[i].numberOfMcqQuestions;
    dataOb["noOfQuestionsWritten"] = subjectInfo[i].numberOfWrittenQuestions;
    subjectsInfos.push(dataOb);
  }
  let startTime1, endTime1;
  startTime1 = new Date(startTime);
  endTime1 = new Date(endTime);
  let courseIdObj;
  courseIdObj = new mongoose.Types.ObjectId(courseId);
  let saveExam = new {
    courseId: courseIdObj,
    name: name,
    examType: examType,
    startTime: moment(startTime),
    endTime: moment(endTime),
    mcqDuration: mcqDuration,
    marksPerMcq: marksPerMcq,
    negativeMarks: negativeVarks,
    totalQuestionsMcq: totalQuestionMcq,
    totalQuestionsWritten: totalQuestionWritten,
    writtenDuration: writtenDuration,
    totalDuration: totalDuration,
    totalMarksMcq: totalMarksMcq,
    totalMarksWritten: totalMarksWritten,
    totalMarks: totalMarks,
    noOfTotalSubject: noOfTotalSubject,
    noOfExamSubject: noOfExamSubject,
    noOfOptionalSubject: noOfOptionalSubject,
    subjectInfo: subjectsInfos,
    optionalSubject: optionalSubject,
    sscStatus: JSON.parse(sscStatus),
    hscStatus: JSON.parse(hscStatus),
    status: JSON.parse(status),
  }();
  let updStatus = null;
  try {
    updStatus = await SpecialExam.findByIdAndUpdate(examId, saveExam);
  } catch (err) {
    console.log(err);
    return res.status(500).json("Something went wrong.");
  }
  if (!updStatus) return res.status(404).json("Not Updated.");
  return res.status(201).json("Updated special exam.");
};
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
    examVariation,
    startTime,
    endTime,
    mcqDuration,
    marksPerMcq,
    negativeVarks,
    totalQuestionMcq,
    totalQuestionWritten,
    writtenDuration,
    totalMarksWritten,
    totalDuration,
    totalMarksMcq,
    totalMarks,
    status,
    sscStatus,
    hscStatus,
    noOfTotalSubject,
    noOfExamSubject,
    noOfOptionalSubject,
    allSubject, //all subject ID in array
    optionalSubject, //array of subject Id
    subjectInfo, //array of subjectinfo
  } = req.body;
  console.log(req.body);
  if (!ObjectId.isValid(courseId)) {
    return res.status(404).json("Course Id is not valid.");
  }
  let allSubjects = [];
  let subjectId = JSON.parse(allSubject);
  console.log("subjectId", subjectId);
  for (let i = 0; i < subjectId.length; i++) {
    allSubjects[i] = new mongoose.Types.ObjectId(subjectId[i]);
  }
  let optionalSubjects = [];
  let optionalId = JSON.parse(optionalSubject);
  console.log("optionalId", optionalId);
  for (let i = 0; i < optionalId.length; i++) {
    optionalSubjects[i] = new mongoose.Types.ObjectId(optionalId[i]);
  }
  let subjectsInfos = [];
  console.log(subjectInfo);
  console.log(JSON.parse(subjectInfo));
  let subjectInfoId = JSON.parse(subjectInfo);
  console.log("subjectInfoId", subjectInfoId);
  for (let i = 0; i < subjectInfoId.length; i++) {
    let dataOb = {};
    dataOb["subjectId"] = new mongoose.Types.ObjectId(
      subjectInfoId[i].subjectId
    );
    dataOb["noOfQuestionsMcq"] = subjectInfoId[i].numberOfMcqQuestions;
    dataOb["noOfQuestionsWritten"] = subjectInfoId[i].numberOfWrittenQuestions;
    subjectsInfos.push(dataOb);
  }
  let startTime1, endTime1;
  startTime1 = new Date(startTime);
  endTime1 = new Date(endTime);
  let courseIdObj;
  courseIdObj = new mongoose.Types.ObjectId(courseId);
  let saveExam = new SpecialExam({
    courseId: courseIdObj,
    name: name,
    examVariation: examVariation,
    startTime: moment(startTime),
    endTime: moment(endTime),
    mcqDuration: mcqDuration,
    marksPerMcq: marksPerMcq,
    negativeMarks: negativeVarks,
    totalQuestionsMcq: totalQuestionMcq,
    totalQuestionsWritten: totalQuestionWritten,
    writtenDuration: writtenDuration,
    totalDuration: totalDuration,
    totalMarksMcq: totalMarksMcq,
    totalMarksWritten: totalMarksWritten,
    totalMarks: totalMarks,
    noOfTotalSubject: noOfTotalSubject,
    noOfExamSubject: noOfExamSubject,
    noOfOptionalSubject: noOfOptionalSubject,
    subjectInfo: subjectsInfos,
    optionalSubject: optionalSubject,
    allSubject: allSubjects,
    sscStatus: JSON.parse(sscStatus),
    hscStatus: JSON.parse(hscStatus),
    status: JSON.parse(status),
  });
  let updStatus = null;
  try {
    updStatus = await saveExam.save();
  } catch (err) {
    console.log(err);
    return res.status(500).json("Something went wrong.");
  }
  return res.status(201).json("Created special exam successfully.");
};
const showSpecialExamById = async (req, res, next) => {
  let examId = req.body.examId;
  if (!ObjectId.isValid(examId)) return res.staus(404).json("Invalid Exam Id.");
  examId = new mongoose.Types.ObjectId(examId);
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
const showSpecialExamByCourse = async (req, res, next) => {
  let courseId = req.body.courseId;
  if (!ObjectId.isValid(courseId))
    return res.staus(404).json("Invalid Course Id.");
  courseId = new mongoose.Types.ObjectId(courseId);
  let data = null;
  try {
    data = await SpecialExam.findOne({
      $and: [{ courseId: courseId }, { status: true }],
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

exports.showSpecialExamByCourse = showSpecialExamByCourse;
exports.createSpecialExam = createSpecialExam;
exports.updateSpecialExam = updateSpecialExam;
exports.showSpecialExamById = showSpecialExamById;
exports.showSpecialExamAll = showSpecialExamAll;
exports.deactivateSpecialExam = deactivateSpecialExam;
