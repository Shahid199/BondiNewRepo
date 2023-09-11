const Course = require("../model/Course");
const Exam = require("../model/Exam");
const McqQuestionVsExam = require("../model/McqQuestionVsExam");
const QuestionsMcq = require("../model/QuestionsMcq");
const QuestionsWritten = require("../model/QuestionsWritten");
const Subject = require("../model/Subject");
const WrittenQuestionVsExam = require("../model/WrittenQuestionVsExam");
const CourseVsStudent = require("../model/CourseVsStudent");
const fs = require("fs");
const { default: mongoose, mongo } = require("mongoose");
const ExamRule = require("../model/ExamRule");
const StudentExamVsQuestionsMcq = require("../model/StudentExamVsQuestionsMcq");
const ObjectId = mongoose.Types.ObjectId;
const moment = require("moment");
const pagination = require("../utilities/pagination");
const examType = require("../utilities/exam-type");
const examVariation = require("../utilities/exam-variation");
const StudentExamVsQuestionsWritten = require("../model/StudentExamVsQuestionsWritten");
const TeacherVsExam = require("../model/TeacherVsExam");
const BothExam = require("../model/BothExam");

const createBothExam = async (req, res, next) => {
  const file = req.file;
  let iLinkPath = null;
  if (!file) {
    return res.status(404).json("File not uploaded.");
  }
  iLinkPath = "uploads/".concat(file.filename);
  //const examFromQuery = JSON.parse(req.query.exam);
  const {
    courseId,
    subjectId,
    name,
    examType,
    startTime,
    endTime,
    totalQuestionMcq,
    marksPerMcq,
    totalMarksMcq,
    mcqDuration,
    totalDuration,
    writtenDurartion,
    totalQuestionWritten,
    totalMarksWritten,
    status,
    sscStatus,
    hscStatus,
    negativeMarks,
    totalMarks,
  } = req.body;

  if (!ObjectId.isValid(courseId) || !ObjectId.isValid(subjectId))
    return res.status(404).json("course Id or subject Id is invalid.");
  let startTime1, endTime1, tqm, tmm;
  tqm = totalQuestionMcq;
  tmm = marksPerMcq;
  if (totalQuestionMcq == null || marksPerMcq == null) {
    tqm = Number(0);
    tmm = Number(0);
  }
  startTime1 = new Date(startTime);
  endTime1 = new Date(endTime);
  let courseIdObj, subjectIdObj, saveExam;
  courseIdObj = new mongoose.Types.ObjectId(courseId);
  subjectIdObj = new mongoose.Types.ObjectId(subjectId);
  saveExam = new BothExam({
    courseId: courseIdObj,
    subjectId: subjectIdObj,
    name: name,
    examType: Number(examType),
    startTime: moment(startTime1),
    endTime: moment(endTime1),
    totalDuration: Number(totalDuration),
    mcqDuration: Number(mcqDuration),
    writtenDuration: Number(writtenDurartion),
    totalQuestionWritten: Number(totalQuestionWritten),
    totalMarksWritten: Number(totalMarksWritten),
    totalMarks: Number(totalMarks),
    totalQuestionMcq: tqm,
    marksPerMcq: tmm,
    totalMarksMcq: tqm * tmm,
    negativeMarks: Number(negativeMarks),
    status: JSON.parse(status),
    sscStatus: JSON.parse(sscStatus),
    hscStatus: JSON.parse(hscStatus),
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
const updateBothExam = async (req, res, next) => {
  const {
    examId,
    courseId,
    subjectId,
    name,
    startTime,
    endTime,
    totalQuestionMcq,
    marksPerMcq,
    totalMarksMcq,
    mcqDuration,
    totalDuration,
    writtenDurartion,
    totalQuestionWritten,
    totalMarksWritten,
    status,
    sscStatus,
    hscStatus,
    negativeMarks,
    totalMarks,
  } = req.body;
  if (
    !ObjectId.isValid(examId) ||
    !ObjectId.isValid(courseId) ||
    !ObjectId.isValid(subjectId)
  ) {
    return res
      .status(404)
      .json("exam Id or course Id or subject Id is not valid.");
  }
  examId = new mongoose.Types.ObjectId(examId);
  let saveExamUpd = {
    courseId: new mongoose.Types.ObjectId(courseId),
    subjectId: new mongoose.Types.ObjectId(subjectId),
    name: name,
    startTime: moment(startTime),
    endTime: moment(endTime),
    totalDuration: Number(totalDuration),
    mcqDuration: Number(mcqDuration),
    writtenDuration: Number(writtenDurartion),
    totalQuestionWritten: Number(totalQuestionWritten),
    totalMarksWritten: Number(totalMarksWritten),
    totalMarks: Number(totalMarks),
    totalQuestionMcq: Number(totalQuestionMcq),
    marksPerMcq: Number(marksPerMcq),
    totalMarksMcq: Number(totalQuestionMcq) * Number(marksPerMcq),
    negativeMarks: Number(negativeMarks),
    status: JSON.parse(status),
    sscStatus: JSON.parse(sscStatus),
    hscStatus: JSON.parse(hscStatus),
  };
  let updStatus = null;
  try {
    updStatus = await BothExam.updateOne({ _id: examId }, saveExamUpd);
  } catch (err) {
    return res.status(500).json(err);
  }
  if (updStatus == null) return res.status(404).json("Prolem at update.");
  else return res.status(201).json("Updated.");
};
const deactivateBothExam = async (req, res, next) => {
  const examId = req.body.examId;
  if (!ObjectId.isValid(examId))
    return res.status(404).json("Invalid exam Id.");
  //const examIdObj = new mongoose.Types.ObjectId(examId);
  let queryResult = null;
  try {
    queryResult = await BothExam.findByIdAndUpdate(examId, { status: false });
  } catch (err) {
    return res.status(500).json(err);
  }
  if (queryResult) return res.status(201).json("Deactivated.");
  else return res.status(404).json("Something went wrong.");
};
const getBothExamBySubject = async (req, res, next) => {
  let subjectId = req.query.subjectId;
  if (!ObjectId.isValid(subjectId))
    return res.status(404).json("subject Id is not valid.");
  subjectId = new mongoose.Types.ObjectId(subjectId);
  let courseId = null;
  let page = Number(req.query.page) || 1;
  let count = 0;
  try {
    count = await BothExam.find({
      $and: [
        { status: true },
        { subjectId: subjectId },
        { endTime: { $gt: new Date() } },
      ],
    }).count();
  } catch (err) {
    return res.status(500).json("something went wrong.");
  }
  if (count == 0) return res.status(404).json("No data found.");
  let paginateData = pagination(count, page);
  let exams1 = null;
  exams1 = await BothExam.find({
    $and: [
      { status: true },
      { subjectId: subjectId },
      { endTime: { $gt: new Date() } },
    ],
  })
    .populate("courseId subjectId")
    .skip(paginateData.skippedIndex)
    .limit(paginateData.limit);
  let exams = [];
  for (let i = 0; i < exams1.length; i++) {
    let inst = {};
    inst["name"] = exams1[i].name;
    inst["examVariation"] = examType[Number(exams1[i].examType)];
    inst["startTime"] = moment(exams1[i].startTime).format("LLL");
    inst["subjectName"] = exams1[0].subjectId.name;
    inst["totalDuration"] = exams1[0].totalDuration;
    inst["endTime"] = exams1[0].endTime;
    inst["totalMarks"] = exams1[0].totalMarks;
    exams.push(inst);
  }
  let examPage = new Object();
  examPage["exam"] = exams;
  examPage["course"] = exams1[0].courseId.name;
  examPage["subject"] = exams1[0].subjectId.name;
  if (
    exams.length > 0 &&
    examPage["course"] != null &&
    examPage["subject"] != null
  )
    return res.status(200).json({ examPage, paginateData });
  else return res.status(404).json({ message: "No exam Found." });
};
exports.createBothExam = createBothExam;
exports.updateBothExam = updateBothExam;
exports.deactivateBothExam = deactivateBothExam;
exports.getBothExamBySubject = getBothExamBySubject;
