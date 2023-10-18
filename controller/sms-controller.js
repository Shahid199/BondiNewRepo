const SmsTemp = require("../model/SmsTemp");
const { ObjectId, LEGAL_TLS_SOCKET_OPTIONS } = require("mongodb");
const { default: mongoose, Mongoose } = require("mongoose");
const FreeStudent = require("../model/FreeStudent");
const Student = require("../model/Student");
const Course = require("../model/Course");
const BothRank = require("../model/BothRank");
const SpecialRank = require("../model/SpecialRank");
const McqRank = require("../model/McqRank");
const { listenerCount } = require("../model/Subject");
const FreeMcqRank = require("../model/FreeMcqRank");

const tempCreate = async (req, res, next) => {
  let template = req.body.template;
  template = "`" + template + "`";
  let status = false;
  let smsTemp = new SmsTemp({
    template: template,
    status: status,
  });
  let sav = null;
  try {
    sav = await smsTemp.save();
  } catch (err) {
    return res.status.json("1.Something went wrong.");
  }
  return res.status(201).json("Successfully created");
};
const tempUpdate = async (req, res, next) => {
  let template = req.body.template;
  let smsId = req.body.smsId;
  if (!ObjectId.isValid(smsId))
    return res.status(404).json("smsId is not valid.");
  //template = "`" + template + "`";
  let sav = null;
  try {
    sav = await SmsTemp.findByIdAndUpdate(smsId, {
      $set: { template: template },
    });
  } catch (err) {
    return res.status.json("1.Something went wrong.");
  }
  return res.status(201).json("Successfully updated");
};
const tempStatusChange = async (req, res, next) => {
  let smsId = req.body.smsId;
  let status = JSON.parse(req.body.status);
  console.log(status);
  if (!ObjectId.isValid(smsId))
    return res.status(404).json("smsId is not valid.");
  smsId = new mongoose.Types.ObjectId(smsId);
  let existData = [];
  if (status == true) {
    try {
      existData = await SmsTemp.find({ status: true });
    } catch (err) {
      return res.status.json("1.Something went wrong.");
    }
    if (existData.length > 0)
      return res.status(404).json("already one template selected.");
  }
  let upd = null;
  try {
    upd = await SmsTemp.findByIdAndUpdate(smsId, { $set: { status: status } });
  } catch (err) {
    return res.status.json("2.Something went wrong.");
  }
  return res.status(201).json("Successfully updated status.");
};
const tempShow = async (req, res, next) => {
  let data = null;
  try {
    data = await SmsTemp.find({});
  } catch (err) {
    return res.status.json("1.Something went wrong.");
  }
  return res.status(200).json(data);
};
const tempShowById = async (req, res, next) => {
  let smsId = req.query.smsId;
  if (!ObjectId.isValid(smsId))
    return res.status(404).json("smsId is not valid.");
  smsId = new mongoose.Types.ObjectId(smsId);
  let data = null;
  try {
    data = await SmsTemp.findById(smsId);
  } catch (err) {
    return res.status.json("1.Something went wrong.");
  }
  return res.status(200).json(data);
};
const smsSendSingle = async (req, res, next) => {
  let examId = req.body.examId;
  let studentId = req.body.studentId;
  let examType = req.body.examType;
  if (!ObjectId.isValid(examId) || !ObjectId.isValid(studentId) || !examType)
    return res.status(404).json("examId or studentId is not valid.");
  studentId = new mongoose.Types.ObjectId(studentId);
  examId = new mongoose.Types.ObjectId(examId);
  let smsTempl = null;
  try {
    smsTempl = await SmsTemp.findOne({ status: true });
  } catch (err) {
    return res.status(404).json("1.Something went wrong.");
  }
  if (!smsTempl) return res.status(404).json("No template selected.");
  smsTempl = smsTempl.template;
  let studData = null;
  let mobileNo,
    studentName,
    totalObtainedMarks,
    rank,
    totalStudent,
    courseName,
    totalMarks,
    examName,
    topScore;
  let allData = [];
  if (examType == 1) {
    try {
      allData = await FreeMcqRank.find({
        $and: [{ examId: examId }],
      })
        .populate("freeStudentId examId")
        .sort({
          rank: 1,
        });
    } catch (err) {
      console.log(err);
      return res.status(500).json("2.Something went wrong.");
    }
    if (allData.length <= 0)
      return res.status(404).json("No Student Found in exam.");
    for (let i = 0; i < allData.length; i++) {
      if (String(studentId) == String(allData[i].freeStudentId._id)) {
        studData = allData[i];
        break;
      }
    }
    mobileNo = studData.freeStudentId.mobileNo;
    studentName = studData.freeStudentId.name;
    totalObtainedMarks = studData.totalObtainedMarks;
    rank = studData.rank;
    totalStudent = studData.length;
    courseName = "Free Exam";
    examName = studData.examId.name;
    totalMarks = studData.examId.totalMarksMcq;
    topScore = allData[0].totalObtainedMarks;
    totalRank = allData.length;
  } else if (examType == 2) {
    try {
      allData = await McqRank.find({
        $and: [{ examId: examId }],
      })
        .populate("studentId examId")
        .sort({
          rank: 1,
        });
    } catch (err) {
      return res.status(404).json("2.Something went wrong.");
    }
    if (allData.length <= 0)
      return res.status(404).json("No Student Found in exam.");
    for (let i = 0; i < allData.length; i++) {
      if (String(studentId) == String(allData[i].studentId._id)) {
        studData = allData[i];
        break;
      }
    }
    let courseId = studData.examId.courseId;
    try {
      courseName = await Course.findById(courseId);
    } catch (err) {
      return res.status.json("1.Something went wrong.");
    }
    mobileNo = studData.studentId.mobileNo;
    studentName = studData.studentId.name;
    totalObtainedMarks = studData.totalObtainedMarks;
    rank = studData.rank;
    totalStudent = studData.length;
    courseName = courseName.name;
    examName = studData.examId.name;
    totalMarks = studData.examId.totalMarksMcq;
    topScore = allData[0].totalObtainedMarks;
    totalRank = allData.length;
  } else if (examType == 3) {
    try {
      allData = await BothRank.find({
        $and: [{ examId: examId }],
      })
        .populate("studentId examId")
        .sort({
          rank: 1,
        });
    } catch (err) {
      return res.status(404).json("2.Something went wrong.");
    }
    if (allData.length <= 0)
      return res.status(404).json("No Student Found in exam.");
    for (let i = 0; i < allData.length; i++) {
      if (String(studentId) == String(allData[i].studentId._id)) {
        studData = allData[i];
        break;
      }
    }
    let courseId = studData.examId.courseId;
    try {
      courseName = await Course.findById(courseId);
    } catch (err) {
      return res.status.json("1.Something went wrong.");
    }
    courseName = courseName.name;
    mobileNo = studData.studentId.mobileNo;
    studentName = studData.studentId.name;
    totalObtainedMarks = studData.totalObtainedMarks;
    rank = studData.rank;
    totalStudent = studData.length;
    examName = studData.examId.name;
    totalMarks = studData.examId.totalMarks;
    topScore = allData[0].totalObtainedMarks;
    totalRank = allData.length;
  } else {
    try {
      allData = await SpecialRank.find({
        $and: [{ examId: examId }],
      })
        .populate("studentId examId")
        .sort({
          rank: 1,
        });
    } catch (err) {
      return res.status(404).json("2.Something went wrong.");
    }
    if (allData.length <= 0)
      return res.status(404).json("No Student Found in exam.");
    for (let i = 0; i < allData.length; i++) {
      if (String(studentId) == String(allData[i].studentId._id)) {
        studData = allData[i];
        break;
      }
    }
    let courseId = studData.examId.courseId;
    try {
      courseName = await Course.findById(courseId);
    } catch (err) {
      return res.status.json("1.Something went wrong.");
    }
    courseName = courseName.name;
    mobileNo = studData.studentId.mobileNo;
    studentName = studData.studentId.name;
    totalObtainedMarks = studData.totalObtainedMarks;
    rank = studData.rank;
    totalStudent = studData.length;
    examName = studData.examId.name;
    totalMarks = studData.examId.totalMarks;
    topScore = allData[0].totalObtainedMarks;
    totalRank = allData.length;
  }
  function format(str, args) {
    return str.replace(/%(\w+)%/g, (_, key) => args[key]);
  }

  //mobileNo:"01677732635",
  const args = {
    studentName: studentName,
    totalObtainedMarks: totalObtainedMarks,
    rank: rank,
    totalStudent: totalStudent,
    courseName: courseName,
    totalMarks: totalMarks,
    topScore: topScore,
    examName: examName,
    totalStudent: totalRank,
    newline: "\n",
  };
  //sms sent work block
  smsTempl = format(smsTempl, args);
  function sendMessage() {}
  console.log(smsTempl);
  return res.status(201).json(smsTempl);
  //sms sent work block
};
exports.tempCreate = tempCreate;
exports.tempUpdate = tempUpdate;
exports.tempShow = tempShow;
exports.tempStatusChange = tempStatusChange;
exports.tempShowById = tempShowById;
exports.smsSendSingle = smsSendSingle;
