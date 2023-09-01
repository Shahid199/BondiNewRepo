const { default: mongoose } = require("mongoose");
const TeacherVsExam = require("../model/TeacherVsExam");
const { ObjectId } = require("mongodb");
const StudentExamVsQuestionsWritten = require("../model/StudentExamVsQuestionsWritten");
const QuestionsWritten = require("../model/QuestionsWritten");
var base64Img = require("base64-img");
const path = require("path");
const fs = require("fs");
const mime = require("mime");

const dir = path.resolve(path.join(__dirname, "../uploads"));
const getStudentData = async (req, res, next) => {
  let teacherId = req.user._id;
  teacherId = new mongoose.Types.ObjectId(teacherId);
  let students = [];
  try {
    students = await TeacherVsExam.findOne({ teacherId: teacherId }).populate(
      "studentId"
    );
  } catch (err) {
    return res.status(500).json("Something went wrong.");
  }
  if (students.length == 0) return res.status(404).json("No student assigned.");
  let data = [];
  for (let i = 0; i < students.studentId.length; i++) {
    let stud = {};
    stud["id"] = students.studentId._id;
    stud["name"] = students.studentId.name;
    data.push(stud);
  }
  return res.status(200).json(data);
};
const checkScriptSingle = async (req, res, next) => {
  console.log(req.body);
  let questionNo = Number(req.body.questionNo);
  let obtainedMarks = Number(req.body.obtainedMarks);
  let studentId = req.body.studentId;
  let examId = req.body.examId;
  let images = req.body.uploadImages;
  if (
    !ObjectId.isValid(studentId) ||
    !ObjectId.isValid(examId) ||
    !questionNo ||
    !obtainedMarks
  ) {
    return res
      .status(404)
      .json("Student Id or Exam Id or question Id is not valid.");
  }
  questionNo = questionNo - 1;
  let uploadImages = [];
  for (let i = 0; i < images.length; i++) {
    const matches = String(images[i]).replace(
      /^data:([A-Za-z-+/]+);base64,/,
      ""
    );
    let fileName = String(questionNo + 1) + "-" + String(i + 1) + ".png";
    try {
      fs.writeFileSync(dir + fileName, matches, { encoding: "base64" });
    } catch (e) {
      console.log(e);
      return res.status(500).json(e);
    }
    uploadImages[i] = "uploads/" + fileName;
  }

  let studentIdObj = new mongoose.Types.ObjectId(studentId);
  let examIdObj = new mongoose.Types.ObjectId(examId);
  let getData = null;
  try {
    getData = await StudentExamVsQuestionsWritten.findOne({
      $and: [{ studentId: studentIdObj }, { examId: examIdObj }],
    });
  } catch (err) {
    return res.status(500).json("Something went wrong.");
  }
  let insertId = getData._id;
  let checkScript = [];
  let obtainedMarksArr = [];
  checkScript[questionNo] = uploadImages;
  obtainedMarksArr[questionNo] = obtainedMarks;

  let upd = {
    ansewerScriptILink: checkScript,
    obtainedMarks: obtainedMarksArr,
  };
  let doc;
  try {
    doc = await StudentExamVsQuestionsWritten.findByIdAndUpdate(insertId, upd);
  } catch (err) {
    //console.log(err);
    return res.status(500).json("Something went wrong!");
  }
  return res.status(201).json("Updated Successfully.");
};
const checkStatusUpdate = async (req, res, next) => {
  let studentId = req.body.studentId;
  let examId = req.body.examId;
  let status = JSON.parse(req.body.status);
  if (!ObjectId.isValid(studentId) || !ObjectId.isValid(examId)) {
    return res
      .status(404)
      .json("Student Id or Exam Id or question Id is not valid.");
  }
  let studentIdObj = new mongoose.Types.ObjectId(studentId);
  let examIdObj = new mongoose.Types.ObjectId(examId);
  let getData = null;
  try {
    getData = await StudentExamVsQuestionsWritten.findOne({
      $and: [{ studentId: studentIdObj }, { examId: examIdObj }],
    });
  } catch (err) {
    return res.status(500).json("Something went wrong.");
  }
  let insertId = getData._id;
  let upd = {
    checkStatus: status,
  };
  let doc;
  try {
    doc = await StudentExamVsQuestionsWritten.findByIdAndUpdate(insertId, upd);
  } catch (err) {
    //console.log(err);
    return res.status(500).json("Something went wrong!");
  }
  return res.status(201).json("Status Change Successfully.");
};

const getCheckStatus = async (req, res, next) => {
  let studentId = req.body.studentId;
  let examId = req.body.examId;
  if (!ObjectId.isValid(studentId) || !ObjectId.isValid(examId)) {
    return res
      .status(404)
      .json("Student Id or Exam Id or question Id is not valid.");
  }
  let studentIdObj = new mongoose.Types.ObjectId(studentId);
  let examIdObj = new mongoose.Types.ObjectId(examId);
  let getData = null;
  try {
    getData = await StudentExamVsQuestionsWritten.findOne({
      $and: [{ studentId: studentIdObj }, { examId: examIdObj }],
    });
  } catch (err) {
    return res.status(500).json("Something went wrong.");
  }
  let status = getData.checkStatus;
  return res.status(200).json(status);
};

const getWrittenScriptSingle = async (req, res, next) => {
  let studentId = req.query.studentId;
  let examId = req.query.examId;
  if (!ObjectId.isValid(studentId) || !ObjectId.isValid(examId)) {
    return res
      .status(404)
      .json("Student Id or Exam Id or question Id is not valid.");
  }
  let studentIdObj = new mongoose.Types.ObjectId(studentId);
  let examIdObj = new mongoose.Types.ObjectId(examId);
  let getData = null;
  try {
    getData = await StudentExamVsQuestionsWritten.findOne({
      $and: [{ studentId: studentIdObj }, { examId: examIdObj }],
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json("Something went wrong.");
  }
  // if (getData.checkStatus != true)
  //   return res.status(404).json("Not checked yet.");
  let data = {};
  data["studentId"] = studentId;
  data["answerScript"] = getData.submittedScriptILink;
  data["checkScript"] = getData.ansewerScriptILink;
  data["obtainedMarks"] = getData.obtainedMarks;
  data["totalObtainedMarks"] = getData.totalObtainedMarks;
  data["examId"] = examId;
  data["checkStatus"] = getData.checkStatus;
  data["uploadStatus"] = getData.uploadStatus;
  let getQuestion = null;
  try {
    getQuestion = await QuestionsWritten.findOne({
      examId: examIdObj,
    });
  } catch (err) {
    return res.status(500).json("Something went wrong.");
  }
  data["question"] = getQuestion.questionILink;
  data["totalQuestions"] = getQuestion.totalQuestions;
  data["marksPerQuestion"] = getQuestion.marksPerQuestion;
  data["totalMarks"] = getQuestion.totalMarks;
  console.log(getQuestion);
  return res.status(200).json(data);
};
exports.getStudentData = getStudentData;
exports.checkScriptSingle = checkScriptSingle;
exports.checkStatusUpdate = checkStatusUpdate;
exports.getCheckStatus = getCheckStatus;
exports.getWrittenScriptSingle = getWrittenScriptSingle;
