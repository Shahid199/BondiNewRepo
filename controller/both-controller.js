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
    totalMarksMcq: Number(totalMarksMcq),
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
    totalMarksMcq: Number(totalMarksMcq),
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
exports.createBothExam = createBothExam;
exports.updateBothExam = updateBothExam;
