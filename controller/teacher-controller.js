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
const marksCalculation = async (req, res, next) => {
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
  const totalMarks = 0;
  const marks = getData.marksPerQuestion;
  marks.forEach((value) => {
    totalMarks += value;
  });
  let insertId = getData._id;
  let upd = {
    totalObtainedMarks: totalMarks,
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
const updateRank = async (req, res, next) => {
  let examId = req.body.examId;
  if (!ObjectId.isValid(examId))
    return res.status(404).json("Invalid exam Id.");
  let examIdObj = new mongoose.Types.ObjectId(examId);
  let delData = null;
  try {
    delData = await McqRank.deleteMany({ examId: examIdObj });
  } catch (err) {
    return res.status(500).json("Something went wrong.");
  }
  let ranks = null;
  try {
    ranks = await StudentExamVsQuestionsWritten.find({ examId: examIdObj })
      .select("examId totalObtainedMarks studentId -_id")
      .sort({
        totalObtainedMarks: -1,
      });
  } catch (err) {
    return res.status(500).json("Something went wrong.");
  }
  //console.log("ranks:", ranks);
  let dataLength = ranks.length;
  let dataIns = [];
  for (let i = 0; i < dataLength; i++) {
    let dataFree = {};
    dataFree["examId"] = ranks[i].examId;
    dataFree["studentId"] = ranks[i].studentId;
    dataFree["totalObtainedMarks"] = ranks[i].totalObtainedMarks;
    dataFree["rank"] = i + 1;
    dataIns.push(dataFree);
  }
  //console.log("dataIns:", dataIns);
  let sav = null;
  try {
    sav = await McqRank.insertMany(dataIns, { ordered: false });
  } catch (err) {
    return res.status(500).json("Something went wrong.");
  }
  return res.status(201).json("Success!");
};
const getRank = async (req, res, next) => {
  let examId = req.query.examId;
  let studentId = req.query.studentId;
  if (!ObjectId.isValid(examId) || !!ObjectId.isValid(studentId))
    return res.status(200).json("Invalid examId or mobileNo.");
  let examIdObj = new mongoose.Types.ObjectId(examId);
  let studentIdObj = new mongoose.Types.ObjectId(studentId);
  let resultRank = null;
  try {
    resultRank = await McqRank.findOne({
      $and: [{ examId: examIdObj }, { studentId: studentIdObj }],
    }).select("rank -_id");
  } catch (err) {
    return res.status(500).json("Something went wrong.");
  }
  if (!resultRank) return res.status(404).json("Exam not finshed yet.");
  //console.log(resultRank.rank);
  resultRank = Number(resultRank.rank);
  let data1 = {},
    getResult = null;
  try {
    getResult = await StudentExamVsQuestionsWritten.findOne({
      $and: [{ examId: examIdObj }, { studentId: studentIdObj }],
    }).populate("examId studentId");
  } catch (err) {
    return res.status(500).json("Problem when get Student Exam info.");
  }
  let dataTime = null;
  try {
    dataTime = await StudentMarksRank.findOne({
      $and: [{ examId: examIdObj }, { studentId: studentIdObj }],
    });
  } catch (err) {
    return res.status(500).json("Something went wrong.");
  }
  let totalStudent = null;
  try {
    totalStudent = await StudentMarksRank.find({ examId: examIdObj }).count();
  } catch (err) {
    return res.status(500).json("Something went wrong.");
  }
  let totalMarksWritten = null;
  try {
    totalMarksWritten = await QuestionsWritten.find({ examId: examIdObj });
  } catch (err) {
    return res.status(500).json("Something went wrong.");
  }
  data1["name"] = getResult.studentId.name;
  data1["mobileNo"] = getResult.studentId.mobileNo;
  data1["institution"] = getResult.studentId.institution;
  data1["rank"] = resultRank;
  data1["totalStudent"] = totalStudent;
  data1["examName"] = getResult.examId.name;
  data1["startTime"] = moment(getResult.examId.startTime).format("LLL");
  data1["endTime"] = moment(getResult.examId.endTime).format("LLL");
  data1["totalMarks"] = totalMarksWritten.totalMarks;
  data1["examVariation"] = examType[Number(getResult.examId.examType)];
  data1["examType"] = examVariation[Number(getResult.examId.examVariation)];
  data1["totalObtainedMarks"] = getResult.totalObtainedMarks;
  data1["studExamStartTime"] = moment(dataTime.examStartTime).format("LLL");
  data1["studExamEndTime"] = moment(dataTime.examEndTime).format("LLL");
  data1["studExamTime"] = dataTime.duration;
  return res.status(200).json(data1);
};
const getAllRank = async (req, res, next) => {
  let examId = req.query.examId;
  if (!ObjectId.isValid(examId)) return res.status(200).json("Invalid examId.");
  let examIdObj = new mongoose.Types.ObjectId(examId);
  let resultRank = null;
  try {
    resultRank = await McqRank.find({ examId: examIdObj })
      .sort("rank")
      .populate("examId studentId");
  } catch (err) {
    return res.status(500).json("Something went wrong.");
  }
  if (!resultRank) return res.status(404).json("Exam not finshed yet.");
  //console.log(resultRank);
  //eturn res.status(200).json(resultRank);
  let allData = [];
  let totalStudent = null;
  for (let i = 0; i < resultRank.length; i++) {
    let data1 = {};
    let conData = "*******";
    data1["examName"] = resultRank[i].examId.name;
    data1["studentName"] = resultRank[i].studentId.name;
    data1["mobileNoOrg"] = resultRank[i].studentId.mobileNo;
    data1["mobileNo"] = conData.concat(
      resultRank[i].studentId.mobileNo.slice(7)
    );
    data1["institution"] = resultRank[i].studentId.institution;
    data1["totalObtainedMarks"] = resultRank[i].totalObtainedMarks;
    data1["rank"] = resultRank[i].rank;
    data1["totalStudent"] = resultRank.length;
    data1["totalMarks"] = resultRank[i].examId.totalMarksMcq;
    allData.push(data1);
  }
  return res.status(200).json(allData);
};
exports.getStudentData = getStudentData;
exports.checkScriptSingle = checkScriptSingle;
exports.checkStatusUpdate = checkStatusUpdate;
exports.getCheckStatus = getCheckStatus;
exports.getWrittenScriptSingle = getWrittenScriptSingle;
exports.marksCalculation = marksCalculation;
exports.updateRank = updateRank;
exports.getRank = getRank;
exports.getAllRank = getAllRank;
