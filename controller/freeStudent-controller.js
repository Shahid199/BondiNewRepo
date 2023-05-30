const { default: mongoose } = require("mongoose");
const FreeStudent = require("../model/FreeStudent");
const jwt = require("jsonwebtoken");
const FreestudentMarksRank = require("../model/FreestudentMarksRank");
const McqQuestionVsExam = require("../model/McqQuestionVsExam");
const Exam = require("../model/Exam");
const QuestionsMcq = require("../model/QuestionsMcq");
const FreeStudentExamVsQuestionsMcq = require("../model/FreeStudentExamVsQuestionsMcq");
const moment = require("moment");
const Limit = 10;

/**
 * login a student to a course
 * @param {Object} req courseId,regNo
 * @returns token
 */
const addFreeStudent = async (req, res, next) => {
  const { name, mobileNo, institution, sscRoll, sscReg, hscRoll, hscReg } =
    req.body;
  let student = new FreeStudent({
    name: name,
    mobileNo: mobileNo,
    institution: institution,
    sscReg: sscReg,
    sscRoll: sscRoll,
    hscReg: hscReg,
    hscRoll: hscRoll,
  });
  let sav = null;
  let upd = null;
  try {
    existMobile = await FreeStudent.findOne({ mobileNo: mobileNo }, "_id");
  } catch (err) {
    return res.status(500).json(err);
  }
  if (existMobile != null) {
    let update = {
      name: name,
      institution: institution,
      sscReg: sscReg,
      sscRoll: sscRoll,
      hscReg: hscReg,
      hscRoll: hscRoll,
    };
    try {
      upd = await FreeStudent.findByIdAndUpdate(
        String(existMobile._id),
        update
      );
    } catch (err) {
      return res.status(500).json(err);
    }
    return res.status(201).json("Updated.");
  } else {
    try {
      sav = await student.save();
    } catch (err) {
      return res.status(500).json(err);
    }
    return res.status(200).json("Succesfully inserted!");
  }
};
const getAllFreeStudent = async (req, res, next) => {
  let page = req.body.page;
  let skippedItem;
  if (page == null) {
    page = Number(1);
    skippedItem = (page - 1) * Limit;
  } else {
    page = Number(page);
    skippedItem = (page - 1) * Limit;
  }
  let data;
  try {
    data = await FreeStudent.find({}).skip(skippedItem).limit(Limit);
  } catch (err) {
    return res.status(500).json(err);
  }
  return res.status(200).json(data);
};

const freeLoginStudent = async (req, res) => {
  const mobileNo = req.body.mobileNo;
  try {
    const getFreeStudent = await FreeStudent.findOne({
      mobileNo: mobileNo,
    });
    if (!getFreeStudent) {
      return res.status(404).json("Student not found");
    }
    // if all checks passed above now geneate login token
    const studentIdStr = String(getFreeStudent._id);
    const token = jwt.sign(
      {
        studentId: studentIdStr,
        role: 5,
      },
      process.env.SALT,
      { expiresIn: "1d" }
    );

    return res.status(200).json({
      message: "Student logged into the exam",
      token,
      studentIdStr,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Something went wrong!" });
  }
};

const validateToken = async (req, res) => {
  return res.json(req.user);
};
//start:free student exam system
const examCheckMiddleware = async (req, res, next) => {
  const studentId = req.user.studentId;
  const examId = req.body.examId;
  let studentIdObj = new mongoose.Types.ObjectId(studentId);
  let examIdObj = new mongoose.Types.ObjectId(examId);
  let status = null;
  try {
    status = await FreestudentMarksRank.findOne({
      $and: [{ studentId: studentIdObj }, { examId: examIdObj }],
    });
  } catch (err) {
    return res.status(500).json(err);
  }
  if (status == null) return res.status(200).json("assign");
  else {
    if (status.finishedStatus == true) return res.status(200).json("ended");
    else return res.status(200).json("running");
  }
};
const assignQuestion = async (req, res, next) => {
  //data get from examcheck function req.body
  const eId = req.query.eId;
  const freeStudentId = req.user.studentId;
  //start:check student already complete the exam or not
  let eId1, sId;
  sId = new mongoose.Types.ObjectId(freeStudentId);
  eId1 = new mongoose.Types.ObjectId(eId);
  let doc = [],
    size,
    min = 0,
    max = 0,
    rand;
  try {
    size = await McqQuestionVsExam.findOne({ eId: eId }).select("sizeMid");
  } catch (err) {
    return res.status(500).json(err);
  }
  let totalQuesData;
  try {
    totalQuesData = await Exam.findById(eId).select(
      "totalQuestionMcq duration endTime"
    );
  } catch (err) {
    return res.status(500).json(err);
  }
  let examFinishTime = totalQuesData.endTime;
  //start:generating random index of questions
  let totalQues = Number(totalQuesData.totalQuestionMcq);
  max = size.sizeMid - 1;
  max = max - min;
  for (let i = 0; ; i++) {
    rand = Math.random();
    rand = rand * Number(max);
    rand = Math.floor(rand);
    rand = rand + Number(min);
    if (!doc.includes(rand)) doc.push(rand);
    if (doc.length == totalQues) break;
  }
  //end:generating random index of questions
  let doc1;
  try {
    doc1 = await McqQuestionVsExam.findOne({ eId: eId1 })
      .select("mId")
      .populate({
        path: "mId",
        match: { status: { $eq: true } },
        select: "_id",
      });
  } catch (err) {
    return res.status(500).json(err);
  }
  let doc2 = [];
  doc1 = doc1.mId;
  for (let i = 0; i < totalQues; i++) {
    let data = doc1[doc[i]];
    doc2.push(data);
  }
  let questions;
  try {
    questions = await QuestionsMcq.find(
      { _id: { $in: doc2 } },
      "question type options"
    );
  } catch (err) {
    return res.status(500).json(err);
  }
  console.log(questions);
  if (sId == null)
    return res
      .status(404)
      .json("student not found or not permissible for the exam");
  let answered = [];
  for (let i = 0; i < totalQues; i++) {
    answered[i] = "-1";
  }
  let freeStudentExamVsQuestionsMcq = new FreeStudentExamVsQuestionsMcq({
    freeStudentId: sId,
    examId: eId1,
    McqQuestionId: doc2,
    answeredOption: answered,
  });
  let saveStudentQuestion = null,
    saveStudentExam = null;
  let duration = totalQues.duration;
  const examStartTime = new Date();
  const examEndTime = new Date(moment(startTime1).add(duration, "minutes"));
  let freeStudentMarksRank = new FreestudentMarksRank({
    studentId: sId,
    examId: eId1,
    examStartTime: examStartTime,
    runningStatus: true,
    examEndTime: examEndTime,
  });
  try {
    saveStudentQuestion = await freeStudentExamVsQuestionsMcq.save();
    saveStudentExam = await freeStudentMarksRank.save();
  } catch (err) {
    return res.status(500).json(err);
  }
  questions.push({ studStartTime: examStartTime });
  questions.push({ studEndTime: examEndTime });
  questions.push({ examEndTime: examFinishTime });
  console.log(questions);
  if (saveStudentQuestion == null || saveStudentExam == null) {
    return res.status(404).json("Problem occur to assign question.");
  }
  return res.status(201).json(questions);
};
const updateAssignQuestion = async (req, res, next) => {
  let freeStudentId = req.user.studentId;
  let examId = req.body.examId;
  let questionIndexNumber = Number(req.body.questionIndexNumber);
  let optionIndexNumber = Number(req.body.optionIndexNumber);
  let freeStudentIdObj = new mongoose.Types.ObjectId(freeStudentId);
  examId = new mongoose.Types.ObjectId(examId);
  let docId,
    docId1,
    result = null,
    answered = [];
  try {
    result = await FreeStudentExamVsQuestionsMcq.find(
      {
        $and: [{ freeStudentId: freeStudentIdObj }, { examId: examId }],
      },
      "_id answeredOption"
    );
  } catch (err) {
    return res.status(500).json(err);
  }
  if (result == null) return res.status(404).json("Not found exam or student.");
  console.log(result);
  docId = result[0]._id;
  docId1 = String(docId);
  answered = result[0].answeredOption;
  console.log(questionIndexNumber);
  console.log(optionIndexNumber);
  answered[questionIndexNumber] = String(optionIndexNumber);
  try {
    updateAnswer = await FreeStudentExamVsQuestionsMcq.findByIdAndUpdate(
      docId1,
      {
        answeredOption: answered,
      }
    );
  } catch (err) {
    return res.status(500).json(err);
  }
  console.log(updateAnswer);
  return res.status(201).json("Ok");
};
const getRunningData = async (req, res, next) => {
  const freeStudentId = req.user.studentId;
  const examId = req.query.examId;
  let examIdObj, freeStudentIdObj;
  freeStudentIdObj = new mongoose.Types.ObjectId(freeStudentId);
  examIdObj = new mongoose.Types.ObjectId(eId);
  let getQuestionMcq;
  try {
    getQuestionMcq = await FreeStudentExamVsQuestionsMcq.findOne({
      $and: [{ studentId: freeStudentIdObj }, { examId: examIdObj }],
    }).populate("mcqQuestionId");
  } catch (err) {
    return res.status(500).json(err);
  }
  let runningResponseLast = [];
  for (let i = 0; i < getQuestionMcq.mcqQuestionId.length; i++) {
    let runningResponse = {};
    runningResponse["question"] = getQuestionMcq.mcqQuestionId[i].question;
    runningResponse["options"] = getQuestionMcq.mcqQuestionId[i].options;
    runningResponse["type"] = getQuestionMcq.mcqQuestionId[i].type;
    runningResponse["answeredOption"] = getQuestionMcq.answeredOption[i];
    runningResponseLast.push(runningResponse);
  }
  return res.status(200).json(runningResponseLast);
};
//end:free student exam system

exports.addFreeStudent = addFreeStudent;
exports.getAllFreeStudent = getAllFreeStudent;
exports.freeLoginStudent = freeLoginStudent;
exports.examCheckMiddleware = examCheckMiddleware;
exports.validateToken = validateToken;
exports.assignQuestion = assignQuestion;
exports.updateAssignQuestion = updateAssignQuestion;
exports.getRunningData = getRunningData;
