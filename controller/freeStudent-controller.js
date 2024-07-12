const { default: mongoose, mpngo, get } = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const FreeStudent = require("../model/FreeStudent");
const jwt = require("jsonwebtoken");
const FreestudentMarksRank = require("../model/FreestudentMarksRank");
const McqQuestionVsExam = require("../model/McqQuestionVsExam");
const Exam = require("../model/Exam");
const QuestionsMcq = require("../model/QuestionsMcq");
const FreeStudentExamVsQuestionsMcq = require("../model/FreeStudentExamVsQuestionsMcq");
const moment = require("moment");
const pagination = require("../utilities/pagination");
const FreeMcqRank = require("../model/FreeMcqRank");
const examType = require("../utilities/exam-type");
const examVariation = require("../utilities/exam-variation");
const ExamRule = require("../model/ExamRule");
const { response } = require("express");
const PublishFreeExam = require("../model/PublishFreeExam");
/**
 * login a student to a course
 * @param {Object} req courseId,regNo
 * @returns token
 */

//exam id
const getExamById = async (req, res, next) => {
  const examId = req.query.examId;
  if (!ObjectId.isValid(examId))
    return res.status(404).json("examId is invalid.");
  let examData = null;
  try {
    examData = await Exam.findOne({
      $and: [{ _id: examId }, { status: true }],
    }).populate("courseId subjectId");
  } catch (err) {
    return res.status(500).json("Something went wrong.");
  }
  return res.status(200).json(examData);
};
//free student Admin side
const getAllFreeStudent = async (req, res, next) => {
  let page = Number(req.body.page) || 1;
  let count = 0;
  let data;
  try {
    count = await FreeStudent.find({}).count();
  } catch (err) {
    return res.status.json("Something went wrong.");
  }
  if (count == 0) return res.status(404).json("No data found.");
  let paginateData = pagination(count, page);
  try {
    data = await FreeStudent.find({})
      .skip(paginateData.skippedIndex)
      .limit(paginateData.perPage);
  } catch (err) {
    return res.status(500).json(err);
  }
  return res.status(200).json({ data, paginateData });
};
const getFreeStudenInfoById = async (req, res, next) => {
  let studentId = req.query.freeStudentId;
  let data = null;
  if (!ObjectId.isValid(studentId))
    return res.status(404).json("Invalid User Id.");
  try {
    data = await FreeStudent.findById(studentId);
  } catch (err) {
    return res.status(500).json("Something went wrong.");
  }
  return res.status(200).json(data);
};
const getFreeStudenInfoByMobile = async (req, res, next) => {
  let mobileNo = req.query.mobileNo;
  let data = null;
  if (!mobileNo) return res.status(404).json("Invalid mobile No.");
  try {
    data = await FreeStudent.findOne({ mobileNo: mobileNo });
  } catch (err) {
    return res.status(500).json("Something went wrong.");
  }
  return res.status(200).json(data);
};
const freeStudentViewSollutionAdmin1 = async (req, res, next) => {
  const studentId = req.query.freeStudentId;
  const examId = req.query.examId;
  if (!ObjectId.isValid(studentId) || !ObjectId.isValid(examId))
    return res.status(404).json("student Id or examId is not valid.");
  let studentIdObj = new mongoose.Types.ObjectId(studentId);
  let examIdObj = new mongoose.Types.ObjectId(examId);
  let data = null;
  try {
    data = await FreeStudentExamVsQuestionsMcq.find({
      $and: [{ studentId: studentIdObj }, { examId: examIdObj }],
    }).populate("mcqQuestionId");
  } catch (err) {
    return res.status(500).json("1.Something went wrong.");
  }
  if (data == null)
    return res.status(404).json("No exam found under this student.");
  let resultData = [];
  for (let i = 0; i < data[0].mcqQuestionId.length; i++) {
    let data1 = {};
    data1["id"] = data[0].mcqQuestionId[i]._id;
    data1["question"] = data[0].mcqQuestionId[i].question;
    data1["options"] = data[0].mcqQuestionId[i].options;
    data1["correctOptions"] = Number(data[0].mcqQuestionId[i].correctOption);
    data1["explanationILink"] = data[0].mcqQuestionId[i].explanationILink;
    data1["type"] = data[0].mcqQuestionId[i].type;
    data1["answeredOption"] = data[0].answeredOption[i];
    resultData.push(data1);
  }
  return res.status(200).json(resultData);
};
const freeStudentViewSollutionAdmin = async (req, res, next) => {
  const studentId = req.query.freeStudentId;
  const examId = req.query.examId;
  if (!ObjectId.isValid(studentId) || !ObjectId.isValid(examId))
    return res.status(404).json("student Id or examId is not valid.");
  let studentIdObj = new mongoose.Types.ObjectId(studentId);
  let examIdObj = new mongoose.Types.ObjectId(examId);
  let data = null;
  try {
    data = await FreeStudentExamVsQuestionsMcq.find({
      $and: [{ studentId: studentIdObj }, { examId: examIdObj }],
    }).populate("mcqQuestionId");
  } catch (err) {
    return res.status(500).json("1.Something went wrong.");
  }
  if (data == null)
    return res.status(404).json("No exam found under this student.");
  let resultData = [];
  console.log(data[0].mcqQuestionId);
  for (let i = 0; i < data[0].mcqQuestionId.length; i++) {
    let data1 = {};
    data1["id"] = data[0].mcqQuestionId[i]._id;
    data1["question"] = data[0].mcqQuestionId[i].question;
    data1["optionCount"] = data[0].mcqQuestionId[i].optionCount;
    data1["options"] = data[0].mcqQuestionId[i].options;
    data1["correctOptions"] = Number(data[0].mcqQuestionId[i].correctOption);
    data1["explanationILink"] = data[0].mcqQuestionId[i].explanationILink;
    data1["type"] = data[0].mcqQuestionId[i].type;
    data1["answeredOption"] = data[0].answeredOption[i];
    resultData.push(data1);
  }
  return res.status(200).json(resultData);
};
const freeStudentHistoryDataAdmin = async (req, res, next) => {
  const studentId = req.query.studentId;
  if (!ObjectId.isValid(studentId))
    return res.status(404).json("Student ID not valid.");
  let page = req.query.page || 1;

  let studentIdObj = new mongoose.Types.ObjectId(studentId);
  let data2;
  let count = 0;
  try {
    count = await FreeStudentExamVsQuestionsMcq.find({
      studentId: studentIdObj,
    }).count();
  } catch (err) {
    return res.status(500).json("Something went wrong.");
  }
  //return res.status(200).json(count);
  ////console.log(count);
  if (count == 0) return res.status(404).json("1.No data found.");
  let paginateData = pagination(count, page);
  try {
    data2 = await FreeStudentExamVsQuestionsMcq.find({
      studentId: studentIdObj,
    })
      .populate("examId")
      .skip(paginateData.skippedIndex)
      .limit(paginateData.perPage);
  } catch (err) {
    return res.status(500).json("1.SOmething went wrong.");
  }
  if (data2 == null)
    return res.status(404).json("No exam data found for the student.");
  let flag = false;
  let data = [];
  for (let i = 0; i < data2.length; i++) {
    let data1 = {};
    let rank = null;
    let examIdObj = new mongoose.Types.ObjectId(data2[i].examId._id);
    try {
      rank = await FreeMcqRank.findOne(
        {
          $and: [{ studentId: studentIdObj }, { examId: examIdObj }],
        },
        "rank totalObtainedMarks examStartTime examEndtime"
      );
    } catch (err) {
      return res.status(500).json("2.Something went wrong.");
    }
    ////console.log("rank");

    if (rank == null)
      return res.status(404).json("No exam data forunf for the student.");
    let subjectIdObj = String(data2[i].examId.subjectId);
    let subjectName = null;
    try {
      subjectName = await Subject.findById(subjectIdObj).select("name");
    } catch (err) {
      return res.status(500).json("3.Something went wrong.");
    }
    subjectName = subjectName.name;
    if (rank == null || subjectName == null) {
    }
    data1["examId"] = data2[i].examId._id;
    data1["title"] = data2[i].examId.name;
    data1["type"] = data2[i].examId.examType;
    data1["variation"] = data2[i].examId.examVariation;
    data1["totalMarksMcq"] = data2[i].examId.totalMarksMcq;
    data1["totalObtainedMarks"] = rank.totalObtainedMarks;
    data1["meritPosition"] = rank.rank;
    data1["examStartTime"] = moment(rank.examStartTime).format("LLL");
    data1["examEndTime"] = moment(rank.examEndTime).format("LLL");
    data1["subjectName"] = subjectName;
    data.push(data1);
  }
  return res.status(200).json({ data, paginateData });
};
const freeStudentMissedExamAdmin = async (req, res, next) => {
  const studentId = req.query.studentId;
  const courseId = req.query.courseId;
  if (!ObjectId.isValid(studentId) || !ObjectId.isValid(courseId)) {
    return res.status(404).json("Student Id or Course Id is not valid.");
  }
  const courseIdObj = new mongoose.Types.ObjectId(courseId);
  let studentIdObj = new mongoose.Types.ObjectId(studentId);
  let allExam = null;
  try {
    allExam = await Exam.find({
      $and: [
        { status: true },
        { examFreeOrNot: true },
        { courseId: courseIdObj },
        { endtime: { $lt: new Date() } },
      ],
    }).select("_id");
  } catch (err) {
    return res.status(500).json("1.Sometihing went wrong.");
  }
  let doneExam = null;
  try {
    doneExam = await FreestudentMarksRank.find(
      {
        studentId: studentIdObj,
      },
      "examId"
    );
  } catch (err) {
    return res.status(500).json("2.Something went wrong.");
  }
  if (allExam == null) return res.status(404).json("No Exam data found.");
  let data2 = [];
  for (let i = 0; i < allExam.length; i++) {
    data2[i] = String(allExam[i]._id);
  }
  let doneExamArr = [];
  for (let i = 0; i < doneExam.length; i++) {
    doneExamArr.push(String(doneExam[i].examId));
  }
  let removedArray = null;
  let resultData = null;
  if (doneExam == null) removedArray = data2;
  else {
    removedArray = data2.filter(function (el) {
      return !doneExamArr.includes(el);
    });
  }
  let page = Number(req.query.page) || 1;
  let count = 0;
  try {
    count = await Exam.find({
      $and: [
        { _id: { $in: removedArray } },
        { status: true },
        { examFreeOrNot: true },
      ],
    }).count();
  } catch (err) {
    return res.status(500).json("Something went wrong.");
  }
  if (count == 0) {
    return res.status(404).json("No data found.");
  }
  let paginateData = pagination(count, page);
  try {
    resultData = await Exam.find({
      $and: [
        { _id: { $in: removedArray } },
        { status: true },
        { examFreeOrNot: true },
      ],
    })
      .populate("subjectId courseId")
      .skip(paginateData.skippedIndex)
      .limit(paginateData.perPage);
  } catch (err) {
    return res.status(500).json("3.Something went wrong.");
  }
  if (resultData == null) return res.status(404).json("No missed exam found.");
  let data = [];
  for (let i = 0; i < resultData.length; i++) {
    let result = {};
    result["id"] = resultData[i]._id;
    result["exanName"] = resultData[i].name;
    result["subject"] = resultData[i].subjectId.name;
    result["startTime"] = moment(resultData[i].startTime).format("LL");
    result["duration"] = resultData[i].duration;
    result["examType"] = resultData[i].examType;
    result["examVariation"] = resultData[i].examVariation;
    result["negativeMarks"] = resultData[i].negativeMarks;
    data.push(result);
  }
  return res.status(200).json({ data, paginateData });
};
const freeGetHistoryByExamId = async (req, res, next) => {
  const examId = req.query.examId;
  if (!ObjectId.isValid(examId))
    return res.status(404).json("Student ID not valid.");
  let page = req.query.page || 1;

  let examIdObj = new mongoose.Types.ObjectId(examId);
  let count = 0;
  try {
    count = await FreestudentMarksRank.find({
      $and: [{ examId: examIdObj }, { finishedStatus: true }],
    }).count();
  } catch (err) {
    return res.status(500).json("1.Something went wrong.");
  }
  if (count == 0) {
    return res.status(404).json("No data found.");
  }
  let paginateData = pagination(count, page);
  let data = [],
    rank;
  try {
    rank = await FreestudentMarksRank.find({
      $and: [{ examId: examIdObj }, { finishedStatus: true }],
    })
      .populate("studentId")
      .skip(paginateData.skippedIndex)
      .limit(paginateData.perPage);
  } catch (err) {
    ////console.log(err);
    return res.status(500).json("2.Something went wrong.");
  }
  ////console.log(rank);
  for (let i = 0; i < rank.length; i++) {
    //rank data start
    let mcqRank = null;
    ////console.log(rank[i].studentId._id);
    try {
      mcqRank = await FreeMcqRank.findOne({
        $and: [{ examId: examIdObj }, { freeStudentId: rank[i].studentId._id }],
      });
    } catch (err) {
      return res.status(500).json("3.Something went wrong.");
    }
    ////console.log("mcq rank:", mcqRank);
    if (mcqRank == null) mcqRank = "-1";
    else mcqRank = mcqRank.rank;
    //rank data end

    let data1 = {},
      examStud = null;
    data1["studentId"] = rank[i].studentId._id;
    try {
      examStud = await FreeStudentExamVsQuestionsMcq.findOne({
        $and: [{ examId: examIdObj }, { studentId: data1["studentId"] }],
      }).populate("studentId");
    } catch (err) {
      return res.status(500).json("4.Something went wrong.");
    }
    data1["examStud"] = examStud;
    data1["totalObtainedMarks"] = rank[i].totalObtainedMarks;
    data1["meritPosition"] = mcqRank;
    data1["examStartTime"] = moment(rank[i].examStartTime)
      .subtract(6, "h")
      .format("MMMM Do YYYY, h:mm:ss a");
    data1["examEndTime"] = moment(rank[i].examEndTime)
      .subtract(6, "h")
      .format("MMMM Do YYYY, h:mm:ss a");
    //data1["duration"] = rank[i].duration;
    data1["duration"] = (data1.examEndTime - data1.examStartTime) / (1000 * 60);
    data.push(data1);
  }
  examDetails = null;
  try {
    examDetails = await Exam.findById(String(examIdObj)).populate(
      "courseId subjectId"
    );
  } catch (err) {
    return res.status(500).json("5.Something went wrong.");
  }
  let examInfo = {
    id: String(examDetails._id),
    name: examDetails.name,
    courseName: examDetails.courseId.name,
    subjectName: examDetails.subjectId.name,
    startTime: moment(examDetails.startTime).subtract(6, "h").format("LLL"),
    endTime: moment(examDetails.endTime).subtract(6, "h").format("LLL"),
    totalQuestion: examDetails.totalQuestionMcq,
    variation: examType[Number(examDetails.examType)],
    type: examVariation[Number(examDetails.examVariation)],
    totalMarksMcq: examDetails.totalMarksMcq,
  };
  return res.status(200).json({ data, examInfo, paginateData });
};
const freeGetHistoryByExamIdFilterM = async (req, res, next) => {
  const examId = req.query.examId;
  const mobileNo = req.query.mobileNo;
  if (!ObjectId.isValid(examId) || !mobileNo)
    return res.status(404).json("Student ID or mobileNo not valid.");
  let page = req.query.page || 1;

  let studentId = null;
  let examIdObj = new mongoose.Types.ObjectId(examId);
  try {
    studentId = await FreeStudent.find({
      mobileNo: {
        $regex: new RegExp(".*" + mobileNo.toLowerCase() + ".*", "i"),
      },
    });
  } catch (err) {
    return res.status(500).json("Something went wrong.");
  }
  if (studentId.length == 0) return res.status(404).json("No data found.");
  let studIds = [];
  for (let i = 0; i < studentId.length; i++) {
    studIds[i] = studentId[i]._id;
  }
  let count = 0;
  try {
    count = await FreestudentMarksRank.find({
      $and: [
        { examId: examIdObj },
        { finishedStatus: true },
        { studentId: { $in: studIds } },
      ],
    }).count();
  } catch (err) {
    return res.status(500).json("1.Something went wrong.");
  }
  if (count == 0) {
    return res.status(404).json("No data found.");
  }
  let paginateData = pagination(count, page);
  let data = [],
    rank;
  try {
    rank = await FreestudentMarksRank.find({
      $and: [
        { examId: examIdObj },
        { finishedStatus: true },
        { studentId: { $in: studIds } },
      ],
    })
      .populate("studentId")
      .skip(paginateData.skippedIndex)
      .limit(paginateData.perPage);
  } catch (err) {
    ////console.log(err);
    return res.status(500).json("2.Something went wrong.");
  }
  ////console.log(rank);
  for (let i = 0; i < rank.length; i++) {
    //rank data start
    let mcqRank = null;
    ////console.log(rank[i].studentId._id);
    try {
      mcqRank = await FreeMcqRank.findOne({
        $and: [{ examId: examIdObj }, { freeStudentId: rank[i].studentId._id }],
      });
    } catch (err) {
      return res.status(500).json("3.Something went wrong.");
    }
    ////console.log("mcq rank:", mcqRank);
    if (mcqRank == null) mcqRank = "-1";
    else mcqRank = mcqRank.rank;
    //rank data end

    let data1 = {},
      examStud = null;
    data1["studentId"] = rank[i].studentId._id;
    try {
      examStud = await FreeStudentExamVsQuestionsMcq.findOne({
        $and: [{ examId: examIdObj }, { studentId: data1["studentId"] }],
      }).populate("studentId");
    } catch (err) {
      return res.status(500).json("4.Something went wrong.");
    }
    data1["examStud"] = examStud;
    data1["totalObtainedMarks"] = rank[i].totalObtainedMarks;
    data1["meritPosition"] = mcqRank;
    data1["examStartTime"] = moment(rank[i].examStartTime).format(
      "MMMM Do YYYY, h:mm:ss a"
    );
    data1["examEndTime"] = moment(rank[i].examEndTime).format(
      "MMMM Do YYYY, h:mm:ss a"
    );
    //data1["duration"] = rank[i].duration;
    data1["duration"] = (data1.examEndTime - data1.examStartTime) / (1000 * 60);
    data.push(data1);
  }
  examDetails = null;
  try {
    examDetails = await Exam.findById(String(examIdObj)).populate(
      "courseId subjectId"
    );
  } catch (err) {
    return res.status(500).json("5.Something went wrong.");
  }
  let examInfo = {
    id: String(examDetails._id),
    name: examDetails.name,
    courseName: examDetails.courseId.name,
    subjectName: examDetails.subjectId.name,
    startTime: moment(examDetails.examStartTime).format("LLL"),
    endTime: moment(examDetails.examEndTime).format("LLL"),
    totalQuestion: examDetails.totalQuestionMcq,
    variation: examType[Number(examDetails.examType)],
    type: examVariation[Number(examDetails.examVariation)],
    totalMarksMcq: examDetails.totalMarksMcq,
  };
  return res.status(200).json({ data, examInfo, paginateData });
};
const freeGetHistoryByExamIdFilterN = async (req, res, next) => {
  const examId = req.query.examId;
  const name = req.query.name;
  if (!ObjectId.isValid(examId) || name)
    return res.status(404).json("Student ID or name not valid.");
  let page = req.query.page || 1;

  let studentId = null;
  let examIdObj = new mongoose.Types.ObjectId(examId);
  try {
    studentId = await FreeStudent.find({
      name: {
        $regex: new RegExp(".*" + name.toLowerCase() + ".*", "i"),
      },
    });
  } catch (err) {
    return res.status(500).json("Something went wrong.");
  }
  if (studentId.length == 0) return res.status(404).json("No data found.");
  let studIds = [];
  for (let i = 0; i < studentId.length; i++) {
    studIds[i] = studentId[i]._id;
  }
  let count = 0;
  try {
    count = await FreestudentMarksRank.find({
      $and: [
        { examId: examIdObj },
        { finishedStatus: true },
        { studentId: { $in: studIds } },
      ],
    }).count();
  } catch (err) {
    return res.status(500).json("1.Something went wrong.");
  }
  if (count == 0) {
    return res.status(404).json("No data found.");
  }
  let paginateData = pagination(count, page);
  let data = [],
    rank;
  try {
    rank = await FreestudentMarksRank.find({
      $and: [
        { examId: examIdObj },
        { finishedStatus: true },
        { studentId: { $in: studIds } },
      ],
    })
      .populate("studentId")
      .skip(paginateData.skippedIndex)
      .limit(paginateData.perPage);
  } catch (err) {
    ////console.log(err);
    return res.status(500).json("2.Something went wrong.");
  }
  ////console.log(rank);
  for (let i = 0; i < rank.length; i++) {
    //rank data start
    let mcqRank = null;
    ////console.log(rank[i].studentId._id);
    try {
      mcqRank = await FreeMcqRank.findOne({
        $and: [{ examId: examIdObj }, { freeStudentId: rank[i].studentId._id }],
      });
    } catch (err) {
      return res.status(500).json("3.Something went wrong.");
    }
    ////console.log("mcq rank:", mcqRank);
    if (mcqRank == null) mcqRank = "-1";
    else mcqRank = mcqRank.rank;
    //rank data end

    let data1 = {},
      examStud = null;
    data1["studentId"] = rank[i].studentId._id;
    try {
      examStud = await FreeStudentExamVsQuestionsMcq.findOne({
        $and: [{ examId: examIdObj }, { studentId: data1["studentId"] }],
      }).populate("studentId");
    } catch (err) {
      return res.status(500).json("4.Something went wrong.");
    }
    data1["examStud"] = examStud;
    data1["totalObtainedMarks"] = rank[i].totalObtainedMarks;
    data1["meritPosition"] = mcqRank;
    data1["examStartTime"] = moment(rank[i].examStartTime).format(
      "MMMM Do YYYY, h:mm:ss a"
    );
    data1["examEndTime"] = moment(rank[i].examEndTime).format(
      "MMMM Do YYYY, h:mm:ss a"
    );
    //data1["duration"] = rank[i].duration;
    data1["duration"] = (data1.examEndTime - data1.examStartTime) / (1000 * 60);
    data.push(data1);
  }
  examDetails = null;
  try {
    examDetails = await Exam.findById(String(examIdObj)).populate(
      "courseId subjectId"
    );
  } catch (err) {
    return res.status(500).json("5.Something went wrong.");
  }
  let examInfo = {
    id: String(examDetails._id),
    name: examDetails.name,
    courseName: examDetails.courseId.name,
    subjectName: examDetails.subjectId.name,
    startTime: moment(examDetails.examStartTime).format("LLL"),
    endTime: moment(examDetails.examEndTime).format("LLL"),
    totalQuestion: examDetails.totalQuestionMcq,
    variation: examType[Number(examDetails.examType)],
    type: examVariation[Number(examDetails.examVariation)],
    totalMarksMcq: examDetails.totalMarksMcq,
  };
  return res.status(200).json({ data, examInfo, paginateData });
};
//free student exam system
const getFreeExamId = async (req, res, next) => {
  let examId = [];
  let currentTime = new Date(moment(new Date()).add(6, "hours")).toISOString();
  ////console.log(currentTime);
  try {
    examId = await Exam.find({
      $and: [
        { status: true },
        { examFreeOrNot: true },
        { startTime: { $lt: currentTime } },
        { endTime: { $gt: currentTime } },
      ],
    });
  } catch (err) {
    ////console.log(err);
    return res.status(500).json("Something went wrong.");
  }
  ////console.log(moment(examId[0].startTime).format("LLL"));
  ////console.log(examId);
  if (examId.length == 0)
    return res
      .status(404)
      .json("No Free exam has been announced yet.Keep follow the site.");

  if (examId.length > 1) return res.status(404).json("Something went wrong.");
  return res.status(200).json(examId[0]);
};

const getFreeExamAll = async (req, res, next) => {
  let exams;
  let currentTime = Date.now();
  try {
    exams = await Exam.find({
      $and: [{ status: true }, { examFreeOrNot: true }],
    });
  } catch (err) {
    return res.status(500).json("Something went wrong.");
  }
  ////console.log(exams.length);
  if (exams.length == 0)
    return res.status(404).json("No Free exam has been completed.");
  let data1 = [];
  for (let i = 0; i < exams.length; i++) {
    let dataObj = {};
    dataObj["courseId"] = exams[i].courseId;
    dataObj["createdAt"] = exams[i].createdAt;
    dataObj["duration"] = exams[i].duration;
    dataObj["endTime"] = exams[i].endTime;
    dataObj["examFreeOrNot"] = exams[i].examFreeOrNot;
    dataObj["examType"] = -1;
    dataObj["examVariation"] = 1;
    dataObj["hscStatus"] = exams[i].hscStatus;
    dataObj["iLink"] = exams[i].iLink;
    dataObj["marksPerMcq"] = exams[i].marksPerMcq;
    dataObj["name"] = exams[i].name;
    dataObj["negativeMarks"] = exams[i].negativeMarks;
    dataObj["isAdmssion"] = exams[i].isAdmssion;
    dataObj["curriculumName"] = exams[i].curriculumName;
    dataObj["startTime"] = exams[i].startTime;
    dataObj["endTime"] = exams[i].endTime;
    dataObj["status"] = exams[i].status;
    dataObj["subjectId"] = exams[i].subjectId;
    dataObj["totalMarksMcq"] = exams[i].totalMarksMcq;
    dataObj["totalQuestionMcq"] = exams[i].totalQuestionMcq;
    dataObj["updatedAt"] = exams[i].updatedAt;
    dataObj["__v"] = exams[i].__v;
    dataObj["_id"] = exams[i]._id;
    let dataRule = null;
    try {
      dataRule = await ExamRule.findOne({ examId: exams[i]._id }).select(
        "ruleILink -_id"
      );
    } catch (err) {
      return res.status(500).json("Something went wrong.");
    }
    if (dataRule == null) dataObj["RuleImage"] = "0";
    else {
      dataObj["RuleImage"] = dataRule.ruleILink;
    }
    let pubStatus = null;
    try {
      pubStatus = await PublishFreeExam.findOne({ examId: exams[i]._id });
    } catch (err) {
      return res.status(500).json("Something went wrong.");
    }
    if (!pubStatus) dataObj["publishStatus"] = null;
    else if (pubStatus.status == false) dataObj["publishStatus"] = false;
    else dataObj["publishStatus"] = true;
    data1.push(dataObj);
  }
  return res.status(200).json(data1);
};
const addFreeStudent1 = async (req, res, next) => {
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
      return res.status(500).json("Something went wrong.");
    }
    return res.status(201).json("Updated.");
  } else {
    try {
      sav = await student.save();
    } catch (err) {
      return res.status(500).json("Something went wrong.");
    }
    return res.status(200).json(mobileNo);
  }
};
const addFreeStudent = async (req, res, next) => {
  const {
    name,
    mobileNo,
    institution,
    sscRoll,
    sscReg,
    hscRoll,
    hscReg,
    buetRoll,
    medicalRoll,
    universityRoll,
  } = req.body;
  let student = new FreeStudent({
    name: name,
    mobileNo: mobileNo,
    institution: institution,
    sscReg: sscReg,
    sscRoll: null,
    curriculumRoll: sscRoll,
    hscReg: hscReg,
    hscRoll: hscRoll,
    buetRoll: buetRoll,
    medicalRoll: medicalRoll,
    universityRoll: universityRoll,
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
      buetRoll: buetRoll,
      medicalRoll: medicalRoll,
      universityRoll: universityRoll,
    };
    try {
      upd = await FreeStudent.findByIdAndUpdate(
        String(existMobile._id),
        update
      );
    } catch (err) {
      return res.status(500).json("Something went wrong.");
    }
    return res.status(201).json("Updated.");
  } else {
    try {
      sav = await student.save();
    } catch (err) {
      return res.status(500).json("Something went wrong.");
    }
    return res.status(200).json(mobileNo);
  }
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
    ////console.log(error);
    return res.status(500).json({ message: "Something went wrong!" });
  }
};
const validateToken = async (req, res) => {
  return res.json(req.user);
};
const examCheckMiddlewareFree = async (req, res, next) => {
  const examId = req.query.eId;
  const studentId = req.user.studentId;
  ////console.log(req.query.eId);
  ////console.log(req.user);
  if (!ObjectId.isValid(examId) || !ObjectId.isValid(studentId))
    return res.status(404).json("Exam Id or Student Id is invalid.");
  //start:check student already complete the exam or not
  let examIdObj, studentIdObj;
  studentIdObj = new mongoose.Types.ObjectId(studentId);
  examIdObj = new mongoose.Types.ObjectId(examId);
  let status = null,
    query = null;
  let currentDate = moment(new Date());
  try {
    query = await Exam.findById(examId, "endTime");
  } catch (err) {
    return res.status(500).json("Something went wrong.");
  }
  let examEndTimeNew = query.endTime;
  //console.log(query.endTime);
  //console.log(currentDate);
  if (examEndTimeNew <= currentDate) return res.status(200).json("ended");
  try {
    status = await FreestudentMarksRank.findOne({
      $and: [{ studentId: studentIdObj }, { examId: examIdObj }],
    });
  } catch (err) {
    ////console.log(err);
    return res.status(500).json("Soomething went wrong.");
  }
  if (status == null) return res.status(200).json("assign");
  else {
    if (status.finishedStatus == true) return res.status(200).json("ended");
    else return res.status(200).json("running");
  }
};
const assignQuestionFree1 = async (req, res, next) => {
  //data get from examcheck function req.body
  const eId = req.query.eId;
  const studentId = req.user.studentId;
  //start:check student already complete the exam or not
  let eId1, sId;
  sId = new mongoose.Types.ObjectId(studentId);
  eId1 = new mongoose.Types.ObjectId(eId);
  let doc = [],
    size,
    min = 0,
    max = 0,
    rand;
  try {
    size = await McqQuestionVsExam.findOne({ eId: eId1 }).populate("mId");
    size = size.mId.length;
    //size = await McqQuestionVsExam.findOne({ eId: eId }).select("sizeMid");
  } catch (err) {
    return res.status(500).json("1.something went wrong.");
  }
  if (!size) return res.status(404).json("No question assigned in the exam.");
  let totalQuesData;
  try {
    totalQuesData = await Exam.findById(eId).select(
      "totalQuestionMcq duration endTime"
    );
  } catch (err) {
    return res.status(500).json("2.something went wrong");
  }
  let examFinishTime = totalQuesData.endTime;
  //start:generating random index of questions
  let totalQues = Number(totalQuesData.totalQuestionMcq);
  //count question:start
  let totalQuestionCount = null;
  let eIdObj = new mongoose.Types.ObjectId(eId);
  try {
    totalQuestionCount = await McqQuestionVsExam.findOne({
      eId: eIdObj,
    }).populate({
      path: "mId",
      match: { status: true },
    });
  } catch (err) {
    return res.status(500).json("2.something went wrong");
  }
  // console.log(totalQuestionCount.mId, "totalQuesCountMid");
  totalQuestionCount = totalQuestionCount.mId.length;
  ////console.log(totalQues, "totalQues");
  // console.log(totalQuestionCount, "totalQuesCount");
  //count question:end
  max = size - 1;
  let countDown = 0;
  rand = parseInt(Date.now() % totalQues);
  ////console.log(rand, "rand");
  if (rand == 0) rand = 1;
  if (rand == totalQues - 1) rand = rand - 1;
  if (rand % 2 == 0) {
    for (let j = rand; j >= 0; j--) doc.push(j);
    for (let j = rand + 1; j < totalQuestionCount; j++) {
      if (doc.length == totalQues) break;
      doc.push(j);
    }
  } else {
    for (let j = rand + 1; j < totalQuestionCount; j++) {
      if (doc.length == totalQues) break;
      doc.push(j);
    }
    for (let j = rand; j >= 0; j--) {
      if (doc.length == totalQues) break;
      doc.push(j);
    }
  }
  // for (let i = 0; i < totalQues; i++) {
  //   //console.log("rand", rand);
  //   Math.random;
  //   // rand = Math.random();
  //   // rand = rand * Number(max);
  //   // rand = Math.floor(rand);
  //   // rand = rand + Number(min);
  //   if (!doc.includes(rand)) {
  //     doc.push(rand);
  //   } else doc.push(rand + 3);
  //   if (doc.length == totalQues) break;
  // }
  ////console.log(doc, "doc");
  //end:generating random index of questions
  let doc1;
  try {
    doc1 = await McqQuestionVsExam.findOne({ eId: eId1 }).select("mId");
  } catch (err) {
    return res.status(500).json("3.Something went wrong.");
  }
  let statQues = [];
  // //console.log(doc1.mId,'doc1.mId');
  for (let i = 0; i < doc1.mId.length; i++) {
    let quesId = String(doc1.mId[i]);
    let stat;
    try {
      stat = await QuestionsMcq.findById(quesId).select("status");
      stat = stat.status;
    } catch (err) {
      console.log(err);
      return res.status(500).json("11.Something went wrong.");
    }
    if (stat == true) statQues.push(new mongoose.Types.ObjectId(quesId));
  }

  if (totalQues > statQues.length)
    return res
      .status(404)
      .json("Total exam questions is less then exam's questions.");
  let doc2 = statQues;
  let resultQuestion = [];
  for (let i = 0; i < totalQues; i++) {
    let data = String(doc2[doc[i]]);
    resultQuestion.push(data);
  }
  // //console.log(totalQues,'totalQues')
  // console.log(resultQuestion, "resultQuestion");
  let questions = [];
  try {
    questions = await QuestionsMcq.find(
      { _id: { $in: resultQuestion } },
      "question type options"
    );
  } catch (err) {
    console.log(err);
    return res.status(500).json("12. Something went wrong.");
  }
  // //console.log(questions);
  if (sId == null)
    return res
      .status(404)
      .json("student not found or not permissible for the exam");
  let answered = [];
  for (let i = 0; i < totalQues; i++) {
    answered[i] = "-1";
  }
  let studentExamVsQuestionsMcq = new FreeStudentExamVsQuestionsMcq({
    studentId: sId,
    examId: eId1,
    mcqQuestionId: resultQuestion,
    answeredOption: answered,
  });
  let saveStudentQuestion = null,
    saveStudentExam = null;
  let duration = Number(totalQuesData.duration);
  let examEndTimeNew = totalQuesData.endTime;
  let examStartTime = moment(new Date()).add(6, "hours");
  let examEndTime = moment(examStartTime).add(duration, "minutes");
  if (examEndTime > moment(examEndTimeNew)) {
    //console.log("pass");
    examEndTime = examEndTimeNew;
    //console.log("EE:", examEndTime);
  }
  //console.log(examStartTime);
  //console.log(examEndTime);
  let studentMarksRank = new FreestudentMarksRank({
    studentId: sId,
    examId: eId1,
    examStartTime: examStartTime,
    runningStatus: true,
    finishedStatus: false,
    examEndTime: examEndTime,
    duration: (examEndTime - examStartTime) / 60000,
  });
  try {
    saveStudentQuestion = await studentExamVsQuestionsMcq.save();
  } catch (err) {
    console.log(err);
    return res.status(500).json("4.Something went wrong.");
  }
  try {
    saveStudentExam = await studentMarksRank.save();
  } catch (err) {
    return res.status(500).json("5.Something went wrong.");
  }
  //if (examEndTime >= examFinishTime) examEndTime = examFinishTime;
  questions.push({ studStartTime: examStartTime });
  questions.push({ studEndTime: examEndTime });
  questions.push({ examEndTime: examFinishTime });
  questions.push({ answeredOption: answered });
  if (saveStudentQuestion == null || saveStudentExam == null) {
    return res.status(404).json("Problem occur to assign question.");
  }
  return res.status(201).json(questions);
};
const assignQuestionFree = async (req, res, next) => {
  //data get from examcheck function req.body
  const eId = req.query.eId;
  const studentId = req.user.studentId;
  //start:check student already complete the exam or not
  let eId1, sId;
  sId = new mongoose.Types.ObjectId(studentId);
  eId1 = new mongoose.Types.ObjectId(eId);
  let exist = null;
  try {
    exist = await FreeStudentExamVsQuestionsMcq.findOne({
      $and: [{ examId: eId1 }, { studentId: sId }],
    });
  } catch (error) {
    console.log(error);
  }
  console.log("exist", exist);
  if (exist) {
    return res.status(200).json("runnning");
  }
  let doc = [],
    size,
    min = 0,
    max = 0,
    rand,
    mcqData = [];
  try {
    mcqData = await McqQuestionVsExam.findOne({ eId: eId1 }).populate({
      path: "mId",
      match: { status: true },
    });
    size = mcqData.mId.length;
  } catch (err) {
    return res.status(500).json("1.something went wrong.");
  }
  if (!size) return res.status(404).json("No question assigned in the exam.");
  let totalQuesData;
  try {
    totalQuesData = await Exam.findById(eId);
  } catch (err) {
    return res.status(500).json("2.something went wrong");
  }
  let examFinishTime = totalQuesData.endTime;
  //start:generating random index of questions
  let totalQues = Number(totalQuesData.totalQuestionMcq);
  max = size - 1;
  rand = parseInt(Date.now() % size);
  //console.log("rand", rand);
  let flag = 0;

  let resultQuestion = [];
  for (let j = rand; j >= 0; j--) {
    if (resultQuestion.length == totalQues) {
      flag = 1;
      break;
    }
    //console.log("j:", j);
    resultQuestion.push(new mongoose.Types.ObjectId(mcqData.mId[j]._id));
  }
  if (flag == 0) {
    for (let j = rand + 1; j < size; j++) {
      if (resultQuestion.length == totalQues) {
        flag = 1;
        break;
      }
      //console.log("j:", j);
      resultQuestion.push(new mongoose.Types.ObjectId(mcqData.mId[j]._id));
    }
  }
  let answered = [];
  for (let i = 0; i < totalQues; i++) {
    answered[i] = "-1";
  }

  let studentExamVsQuestionsMcq = new FreeStudentExamVsQuestionsMcq({
    studentId: sId,
    examId: eId1,
    mcqQuestionId: resultQuestion,
    answeredOption: answered,
  });
  let saveStudentQuestion = null,
    saveStudentExam = null,
    examEndTimeActual = totalQuesData.endTime;
  let duration = Number(totalQuesData.duration);
  //let examEndTimeNew = totalQuesData.endTime;
  let examStartTime = moment(new Date());
  let examEndTime = moment(examStartTime).add(duration, "m");
  if (examEndTime > examEndTimeActual.endTime)
    examEndTime = examEndTimeActual.endTime;
  let studentMarksRank = new FreestudentMarksRank({
    studentId: sId,
    examId: eId1,
    examStartTime: moment(examStartTime).add(6, "h"),
    runningStatus: true,
    finishedStatus: false,
    examEndTime: moment(examEndTime).add(6, "h"),
    duration: (examEndTime - examStartTime) / (1000 * 60),
  });
  try {
    saveStudentQuestion = await studentExamVsQuestionsMcq.save();
    saveStudentExam = await studentMarksRank.save();
  } catch (err) {
    console.log(err);
    return res.status(500).json("4.Something went wrong.");
  }
  return res.status(201).json("Suceess!!");
};

// const testAssignRoute = async (req, res, next) => {
//   const eId = req.query.eId;
//   const studentId = req.user.studentId;

//   let eId1, sId;
//   sId = new mongoose.Types.ObjectId(studentId);
//   eId1 = new mongoose.Types.ObjectId(eId);
//   let size = null,
//     examQuestion = null;
//   try {
//     size = await McqQuestionVsExam.findOne({ eId: eId1 }).populate("mId");
//   } catch (err) {
//     return res.status(500).json("1.something went wrong.");
//   }
//   examQuestion = size.mId;
//   size = size.mId.length;
//   let questData = null;
//   try {
//     size = await QuestionsMcq.aggregate()
//       .sample()
//       .find({ _id: { $in: examQuestion } })
//       .select("question type options");
//   } catch (err) {
//     return res.status(500).json("1.something went wrong.");
//   }
// };
const updateAssignQuestionFree = async (req, res, next) => {
  let studentId = req.user.studentId;
  let examId = req.body.examId;
  let questionIndexNumber = Number(req.body.questionIndexNumber);
  let optionIndexNumber = Number(req.body.optionIndexNumber);
  studentId = new mongoose.Types.ObjectId(studentId);
  examId = new mongoose.Types.ObjectId(examId);
  //exam status Check:start
  let studentCheck = null;
  try {
    studentCheck = await FreestudentMarksRank.findOne(
      {
        $and: [{ examId: examId }, { studentId: studentId }],
      },
      "finishedStatus -_id"
    );
  } catch (err) {
    return res.status(500).json("Something went wrong.");
  }
  if (studentCheck.finishedStatus == true)
    return res.status(409).json("Exam End.");
  //exam status Check:end
  let docId,
    docId1,
    result,
    answered = [];
  try {
    result = await FreeStudentExamVsQuestionsMcq.find(
      {
        $and: [{ studentId: studentId }, { examId: examId }],
      },
      "_id answeredOption"
    );
  } catch (err) {
    return res.status(500).json("Something went wrong.");
  }
  ////console.log(result);
  docId = result[0]._id;
  docId1 = String(docId);
  answered = result[0].answeredOption;
  ////console.log(questionIndexNumber);
  ////console.log(optionIndexNumber);
  answered[questionIndexNumber] = String(optionIndexNumber);
  try {
    updateAnswer = await FreeStudentExamVsQuestionsMcq.findByIdAndUpdate(
      docId1,
      {
        answeredOption: answered,
      }
    );
  } catch (err) {
    return res.status(500).json("Something went wrong.");
  }
  ////console.log(updateAnswer);
  return res.status(201).json("Ok");
};
const getRunningDataFree = async (req, res, next) => {
  const sId = req.user.studentId;
  const eId = req.query.eId;
  if (!ObjectId.isValid(sId) || !ObjectId.isValid(eId))
    return res.status(404).json("invalid student ID or exam ID.");
  let eId1, sId1;
  sId1 = new mongoose.Types.ObjectId(sId);
  eId1 = new mongoose.Types.ObjectId(eId);
  // //exam status Check:start
  // let studentCheck = null;
  // try {
  //   studentCheck = await FreestudentMarksRank.findOne(
  //     {
  //       $and: [{ examId: eId1 }, { studentId: sId1 }],
  //     },
  //     "finishedStatus -_id"
  //   );
  // } catch (err) {
  //   return res.status(500).json("Something went wrong.");
  // }
  // if (studentCheck.finishedStatus == true)
  //   return res.status(409).json("Exam End.");
  // //exam status Check:end
  let getQuestionMcq, getExamData;
  try {
    getQuestionMcq = await FreeStudentExamVsQuestionsMcq.findOne({
      $and: [{ studentId: sId1 }, { examId: eId1 }],
    }).populate("mcqQuestionId");
  } catch (err) {
    return res.status(500).json("can't get question.Problem Occur.");
  }
  try {
    getExamData = await FreestudentMarksRank.findOne(
      { $and: [{ examId: eId1 }, { studentId: sId1 }] },
      "examStartTime examEndTime examId"
    )
      .populate({
        path: "examId",
        populate: {
          path: "subjectId",
          select: "name",
          model: "Subject",
        },
      })
      .populate({
        path: "examId",
        populate: {
          path: "courseId",
          select: "name",
          model: "Course",
        },
      });
  } catch (err) {
    return res.status(500).json("Can't get exam info.");
  }
  let runningResponseLast = [];
  let examData = new Object();
  let questionData = new Object();
  let timeData = new Object();
  for (let i = 0; i < getQuestionMcq.mcqQuestionId.length; i++) {
    let runningResponse = {};
    runningResponse["question"] = getQuestionMcq.mcqQuestionId[i].question;
    runningResponse["options"] = getQuestionMcq.mcqQuestionId[i].options;
    runningResponse["type"] = getQuestionMcq.mcqQuestionId[i].type;
    runningResponse["answeredOption"] = getQuestionMcq.answeredOption[i];
    runningResponse["optionCount"] =
      getQuestionMcq.mcqQuestionId[i].optionCount;
    runningResponseLast.push(runningResponse);
  }
  timeData["examDuration"] = getExamData.examId.duration;
  let examStartTime = getExamData.examStartTime;
  let examEndTime = getExamData.examEndTime;
  timeData["startTime"] = examStartTime;
  timeData["endTine"] = examEndTime;
  questionData = runningResponseLast;
  examData = getExamData.examId;
  return res.status(200).json({ timeData, questionData, examData });
};
const submitAnswerFree1 = async (req, res, next) => {
  const eId = req.query.eId;
  const sId = req.user.studentId;
  if (!ObjectId.isValid(eId) || !ObjectId.isValid(sId))
    return res.status(404).json("Invalid studnet Id or Exam Id");
  let eId2 = new mongoose.Types.ObjectId(eId);
  let sId2 = new mongoose.Types.ObjectId(eId);
  //exam status Check:start
  let studentCheck = null;
  try {
    studentCheck = await FreestudentMarksRank.findOne(
      {
        $and: [{ examId: eId2 }, { studentId: sId2 }],
      },
      "finishedStatus -_id"
    );
  } catch (err) {
    return res.status(500).json("Something went wrong.");
  }
  ////console.log(studentCheck);
  if (studentCheck != null) {
    if (studentCheck.finishedStatus == true)
      return res.status(409).json("Exam End.");
  }
  //exam status Check:end

  let examEndTime = moment(new Date()).add(6, "h");
  let eId1, sId1;
  sId1 = new mongoose.Types.ObjectId(sId);
  eId1 = new mongoose.Types.ObjectId(eId);
  let findId = null;
  try {
    findId = await FreestudentMarksRank.find({
      $and: [{ examId: eId1 }, { studentId: sId1 }],
    });
  } catch (err) {
    return res
      .status(500)
      .json("Proble when get student info from student marks table.");
  }
  let dataTimeNew = findId;
  //console.log("dataTimeNew:", dataTimeNew);
  let dataTimeStart = dataTimeNew[0].examStartTime;
  if (findId == null) return res.status(404).json("data not found.");
  findId = String(findId[0]._id);
  let saveStudentExamEnd;
  let du = examEndTime - moment(dataTimeStart).subtract(6, "h") / 60000;
  // //console.log(
  //   "du",
  //   examEndTime - moment(dataTimeStart).subtract(6, "h") / 60000
  // );
  //console.log("du", examEndTime);
  //console.log("du", dataTimeStart);
  let update = {
    finishedStatus: true,
    runningStatus: false,
    examEndTime: moment(examEndTime),
    duration: du,
  };
  try {
    saveStudentExamEnd = await FreestudentMarksRank.findByIdAndUpdate(
      findId,
      update
    );
  } catch (err) {
    //console.log(err);
    return res.status(500).json("Problem when updating student marks rank.");
  }
  let sIeIObj = await FreestudentMarksRank.find(
    { $and: [{ studentId: sId1 }, { examId: eId1 }] },
    "_id"
  );
  sIeIObj = sIeIObj[0]._id;
  let examData = null;
  try {
    examData = await FreeStudentExamVsQuestionsMcq.findOne({
      $and: [{ examId: eId1 }, { studentId: sId1 }],
    }).populate("mcqQuestionId examId");
  } catch (err) {
    return res.status(500).json("Problem when get exam data.");
  }
  ////console.log(examData);
  let id = String(examData._id);
  let correctMarks = examData.examId.marksPerMcq;
  let negativeMarks = examData.examId.negativeMarks;
  let negativeMarksValue = (correctMarks * negativeMarks) / 100;
  let examDataMcq = examData.mcqQuestionId;
  let answered = examData.answeredOption;
  let notAnswered = 0;
  let totalCorrectAnswer = 0;
  let totalWrongAnswer = 0;
  let totalObtainedMarks = 0;
  let totalCorrectMarks = 0;
  let totalWrongMarks = 0;
  for (let i = 0; i < examDataMcq.length; i++) {
    if (answered[i] == "-1") {
      notAnswered = notAnswered + 1;
    } else if (answered[i] == examDataMcq[i].correctOption) {
      totalCorrectAnswer = totalCorrectAnswer + 1;
    } else totalWrongAnswer = totalWrongAnswer + 1;
  }
  totalCorrectMarks = totalCorrectAnswer * correctMarks;
  totalWrongMarks = totalWrongAnswer * negativeMarksValue;
  totalObtainedMarks = totalCorrectMarks - totalWrongMarks;
  const update1 = {
    totalCorrectAnswer: totalCorrectAnswer,
    totalWrongAnswer: totalWrongAnswer,
    totalNotAnswered: notAnswered,
    totalCorrectMarks: totalCorrectMarks,
    totalWrongMarks: totalWrongMarks,
    totalObtainedMarks: totalObtainedMarks,
  };
  let result = null,
    getResult = null,
    sendResult = {},
    rank = null,
    dataRank = null,
    upd = null,
    upd1 = null,
    upd2 = null,
    getRank = null;

  try {
    result = await FreeStudentExamVsQuestionsMcq.findByIdAndUpdate(id, update1);
    upd = await FreestudentMarksRank.updateOne(
      {
        $and: [{ examId: eId1 }, { studentId: sId1 }],
      },
      { totalObtainedMarks: totalObtainedMarks },
      { examEndTime: examEndTime }
    );
  } catch (err) {
    return res.status(500).json("Problem when update total obtained marks.");
  }
  try {
    getResult = await FreeStudentExamVsQuestionsMcq.findById(id).populate(
      "examId"
    );
  } catch (err) {
    return res.status(500).json("Problem when get Student Exam info.");
  }
  // try {
  //   dataRank = await FreestudentMarksRank.find(
  //     { examId: eId1 },
  //     "studentId totalObtainedMarks"
  //   ).sort({ totalObtainedMarks: -1 });
  // } catch (err) {
  //   return res.status(500).json("Problem when get all student of an exam Id.");
  // }
  // let dataRankId = dataRank.map((e) => e._id.toString());
  // rank = dataRankId.findIndex((e) => e == sIeIObj.toString()) + 1;
  // try {
  //   upd1 = await StudentMarksRank.findByIdAndUpdate(String(sIeIObj), {
  //     rank: rank,
  //   });
  // } catch (err) {
  //   return res.status(500).json("Problem when update rank.");
  // }
  // try {
  //   upd2 = await FreeStudentMarksRank.findById(String(sIeIObj), "rank");
  // } catch (err) {
  //   return res.status(500).json("Problem get rank.");
  // }
  // getRank = upd2.rank;
  // sendResult["totalCrrectAnswer"] = getResult.totalCorrectAnswer;
  // sendResult["totalCorrectMarks"] = getResult.totalCorrectMarks;
  // sendResult["totalWrongAnswer"] = getResult.totalWrongAnswer;
  // sendResult["totalWrongMarks"] = getResult.totalWrongMarks;
  // sendResult["totalNotAnswered"] = getResult.totalNotAnswered;
  // sendResult["totalObtained"] = getResult.totalObtainedMarks;
  // sendResult["totalMarksMcq"] = getResult.examId.totalMarksMcq;
  // sendResult["rank"] = getRank;
  // //console.log(sendResult);
  let dataTime = null;
  try {
    dataTime = await FreestudentMarksRank.findOne({
      $and: [{ examId: eId1 }, { studentId: sId1 }],
    });
  } catch (err) {
    return res.status(500).json("Something went wrong.");
  }
  let data1 = {};
  data1["examName"] = getResult.examId.name;
  data1["startTime"] = moment(getResult.examId.startTime).format("LLL");
  data1["endTime"] = moment(getResult.examId.endTime).format("LLL");
  data1["totalMarksMcq"] = getResult.examId.totalMarksMcq;
  data1["examVariation"] = examType[Number(getResult.examId.examType)];
  data1["examType"] = examVariation[Number(getResult.examId.examVariation)];
  data1["totalCorrectAnswer"] = getResult.totalCorrectAnswer;
  data1["totalWrongAnswer"] = getResult.totalWrongAnswer;
  data1["totalCorrectMarks"] = getResult.totalCorrectMarks;
  data1["totalWrongMarks"] = getResult.totalWrongMarks;
  data1["totalNotAnswered"] = getResult.totalNotAnswered;
  data1["totalObtainedMarks"] = getResult.totalObtainedMarks;
  data1["rank"] = -1;
  data1["studExamStartTime"] = moment(dataTime.examStartTime).format("LLL");
  data1["studExamEndTime"] = moment(dataTime.examEndTime).format("LLL");
  data1["studExamTime"] = dataTime.duration;
  data1["marksPerMcq"] = getResult.examId.marksPerMcq;
  data1["marksPerWrong"] =
    (getResult.examId.marksPerMcq * getResult.examId.negativeMarks) / 100;
  return res.status(200).json(data1);
};
const submitAnswerFree = async (req, res, next) => {
  const eId = req.query.eId;
  const sId = req.user.studentId;
  let answeredOptions = req.body.answeredOptions;
  if (!ObjectId.isValid(eId) || !ObjectId.isValid(sId) || !answeredOptions)
    return res.status(404).json("Invalid studnet Id or Exam Id");
  const examEndTime = moment(new Date());
  let eId1, sId1;
  sId1 = new mongoose.Types.ObjectId(sId);
  eId1 = new mongoose.Types.ObjectId(eId);
  //exam status Check:start
  let studentCheck = null;
  let examData = null;
  let time = null;
  try {
    studentCheck = await FreestudentMarksRank.findOne({
      $and: [{ examId: eId1 }, { studentId: sId1 }],
    });
    // console.log(studentCheck);
    examData = await FreeStudentExamVsQuestionsMcq.findOne({
      $and: [{ examId: eId1 }, { studentId: sId1 }],
    }).populate("mcqQuestionId examId");
  } catch (err) {
    return res.status(500).json("1.Something went wrong.");
  }
  console.log("check",studentCheck);
  console.log("data",examData);
  let curDate = moment(studentCheck.examEndTime).subtract(6, "h");
  curDate = moment(curDate).add(180, "s");
  let flagSt = true;
  let curTime = moment(new Date());
  let studEndTime = moment(studentCheck.examEndTime).subtract(6, "h");
  // console.log("StudentEndTime Curdate");
  // console.log(studEndTime, curDate);
  // console.log(studEndTime.valueOf(), ":studEndTime.valueOf()");
  // console.log(curDate.valueOf(), ":curDate.valueOf()");
  // console.log(
  //   studEndTime.valueOf() > curDate.valueOf(),
  //   "studEndTime.valueOf() > curDate.valueOf()"
  // );
  if (curTime.valueOf() > studEndTime.valueOf() ) {
    flagSt = false;
    // console.log("check timer");
  }
  console.log("flagSt", flagSt);
  if (studentCheck.finishedStatus == true)
    return res.status(409).json("Exam End.");

  //exam status Check:e
  let timeStudent = [];
  let findId = studentCheck;
  if (findId == null) return res.status(404).json("data not found.");
  findId = String(findId._id);
  timeStudent[0] = findId.examStartTime;
  timeStudent[1] = findId.examEndTime;
  let submitTime = moment(new Date());
  let id = String(examData._id);
  let correctMarks = examData.examId.marksPerMcq;
  let negativeMarks = examData.examId.negativeMarks;
  let negativeMarksValue = (correctMarks * negativeMarks) / 100;
  let examDataMcq = examData.mcqQuestionId;
  let notAnswered = 0;
  let totalCorrectAnswer = 0;
  let totalWrongAnswer = 0;
  let totalObtainedMarks = 0;
  let totalCorrectMarks = 0;
  let totalWrongMarks = 0;
  for (let i = 0; i < examDataMcq.length; i++) {
    if (answeredOptions[i] == "-1") {
      notAnswered = notAnswered + 1;
    } else if (answeredOptions[i] == examDataMcq[i].correctOption) {
      totalCorrectAnswer = totalCorrectAnswer + 1;
    } else totalWrongAnswer = totalWrongAnswer + 1;
  }
  totalCorrectMarks = totalCorrectAnswer * correctMarks;
  totalWrongMarks = totalWrongAnswer * negativeMarksValue;
  totalObtainedMarks = totalCorrectMarks - totalWrongMarks;
  let update1;
  let result = null,
    saveStudentExamEnd = null;
  let update;
  if (flagSt == true) {
    update1 = {
      totalCorrectAnswer: totalCorrectAnswer,
      totalWrongAnswer: totalWrongAnswer,
      totalNotAnswered: notAnswered,
      totalCorrectMarks: totalCorrectMarks,
      totalWrongMarks: totalWrongMarks,
      totalObtainedMarks: totalObtainedMarks,
      answeredOption: answeredOptions,
    };
    let x = moment(submitTime);
    // console.log("submit time", x);
    update = {
      finishedStatus: true,
      runningStatus: false,
      examEndTime: moment(submitTime).add(6, "h"),
      duration: (moment(submitTime) - moment(timeStudent[0])) / 60000,
      totalObtainedMarks: totalObtainedMarks,
      rank: -1,
    };
  } else {
    let answerArray = [];
    for (let i = 0; i < examData.examId.totalQuestionMcq; i++) {
      answerArray[i] = "-1";
    }
    update1 = {
      totalCorrectAnswer: 0,
      totalWrongAnswer: 0,
      totalNotAnswered: 0,
      totalCorrectMarks: 0,
      totalWrongMarks: -5000,
      totalObtainedMarks: -5000,
      answeredOption: answerArray,
    };
    update = {
      finishedStatus: true,
      runningStatus: false,
      examEndTime: moment(submitTime).add(6, "h"),
      duration: 0,
      totalObtainedMarks: -5000,
      rank: -1,
    };
  }
  try {
    saveStudentExamEnd = await FreestudentMarksRank.findByIdAndUpdate(
      findId,
      update
    );
    result = await FreeStudentExamVsQuestionsMcq.findByIdAndUpdate(id, update1);
    // console.log(update, update1, flagSt);
  } catch (err) {
    return res.status(500).json("3.Something went wrong.");
  }
  if (flagSt == false) return res.status(201).json("Late Submision.");
  return res.status(200).json("Successfully Submitted!!");
};
//error handle and ranks update
const updateStudentExamInfoFree = async (req, res, next) => {
  const examId = req.query.examId;
  if (!ObjectId.isValid(examId))
    return res.status(404).json("Exam Id is not valid.");
  const examIdObj = new mongoose.Types.ObjectId(examId);
  let getEndTime = null;
  ////console.log(examIdObj, "examIdObj");
  try {
    getEndTime = await Exam.findById(examId).select("endTime -_id");
  } catch (err) {
    return res.status(500).json("Something went wrong.");
  }
  let nullArr = [];
  getEndTime = moment(getEndTime.endTime);
  let currentTime = moment(Date.now()).add(6, "hours");
  ////console.log(currentTime);
  ////console.log(getEndTime);
  if (currentTime < getEndTime) {
    ////console.log("11");
    return res.status(200).json(nullArr);
  }
  let examUncheckStudent = null;
  try {
    examUncheckStudent = await FreestudentMarksRank.find(
      {
        $and: [
          { examId: examIdObj },
          { finishedStatus: false },
          { runningStatus: true },
        ],
      },
      "_id"
    );
  } catch (err) {
    return res.status(500).json("Something went wrong.");
  }
  //get student id dont submit:start
  let studentIds = [];
  try {
    studentIds = await FreestudentMarksRank.find(
      {
        $and: [
          { examId: examIdObj },
          { finishedStatus: false },
          { runningStatus: true },
        ],
      },
      "studentId -_id"
    );
  } catch (err) {
    return res.status(500).json("Something went wrong.");
  }
  //get student id dont submit:end
  ////console.log(examUncheckStudent, "examUncheckStudent");
  if (examUncheckStudent.length == 0)
    return res.status(200).json("All student submit the exam.");
  let updateStatus = null;
  try {
    updateStatus = await FreestudentMarksRank.updateMany(
      {
        _id: { $in: examUncheckStudent },
      },
      { $set: { runningStatus: false, finishedStatus: true } }
    );
  } catch (err) {
    return res.status(500).json("Something went wrong.");
  }
  ////console.log(updateStatus, "updateStatus");
  if (updateStatus.modifiedCount == 0)
    return res.status(404).json("Not updated.");

  //result calculation:start
  ////console.log("studentIds", studentIds);
  for (let i = 0; i < studentIds.length; i++) {
    let examData = null;
    try {
      examData = await FreeStudentExamVsQuestionsMcq.findOne({
        $and: [{ examId: examIdObj }, { studentId: studentIds[i].studentId }],
      }).populate("mcqQuestionId examId");
    } catch (err) {
      return res.status(500).json("Problem when get exam data.");
    }
    ////console.log(examData);
    let id = String(examData._id);
    let correctMarks = examData.examId.marksPerMcq;
    let negativeMarks = examData.examId.negativeMarks;
    let negativeMarksValue = (correctMarks * negativeMarks) / 100;
    let examDataMcq = examData.mcqQuestionId;
    let answered = examData.answeredOption;
    let notAnswered = 0;
    let totalCorrectAnswer = 0;
    let totalWrongAnswer = 0;
    let totalObtainedMarks = 0;
    let totalCorrectMarks = 0;
    let totalWrongMarks = 0;
    for (let i = 0; i < examDataMcq.length; i++) {
      if (answered[i] == "-1") {
        notAnswered = notAnswered + 1;
      } else if (answered[i] == examDataMcq[i].correctOption) {
        totalCorrectAnswer = totalCorrectAnswer + 1;
      } else totalWrongAnswer = totalWrongAnswer + 1;
    }
    totalCorrectMarks = totalCorrectAnswer * correctMarks;
    totalWrongMarks = totalWrongAnswer * negativeMarksValue;
    totalObtainedMarks = totalCorrectMarks - totalWrongMarks;
    const update1 = {
      totalCorrectAnswer: totalCorrectAnswer,
      totalWrongAnswer: totalWrongAnswer,
      totalNotAnswered: notAnswered,
      totalCorrectMarks: totalCorrectMarks,
      totalWrongMarks: totalWrongMarks,
      totalObtainedMarks: totalObtainedMarks,
    };
    let result = null,
      upd = null;
    try {
      result = await FreeStudentExamVsQuestionsMcq.findByIdAndUpdate(
        id,
        update1
      );
      ////console.log("result", result.modifiedCount);
      upd = await FreestudentMarksRank.updateOne(
        {
          $and: [{ examId: examIdObj }, { studentId: studentIds[i].studentId }],
        },
        { totalObtainedMarks: totalObtainedMarks }
      );
      ////console.log("upd", upd.modifiedCount);
    } catch (err) {
      return res.status(500).json("Problem when update total obtained marks.");
    }
  }
  //result calculation:end

  return res.status(201).json("Updated successfully.");
};
const updateRankFree = async (req, res, next) => {
  let examId = req.query.examId;
  if (!ObjectId.isValid(examId))
    return res.status(404).json("Invalid exam Id.");
  let examIdObj = new mongoose.Types.ObjectId(examId);
  let delData = null;
  try {
    delData = await FreeMcqRank.deleteMany({ examId: examIdObj });
  } catch (err) {
    return res.status(500).json("Something went wrong.");
  }
  // try {
  //   checkGenerate = await FreeMcqRank.find({ examId: examIdObj });
  // } catch (err) {
  //   return res.status(500).json("Something went wrong.");
  // }
  // if (checkGenerate) return res.status(404).json("Already Generated.");
  let ranks = null;
  try {
    ranks = await FreestudentMarksRank.find({ examId: examIdObj })
      .select("examId totalObtainedMarks studentId -_id")
      .sort({
        totalObtainedMarks: -1,
      });
  } catch (err) {
    return res.status(500).json("Something went wrong.");
  }
  ////console.log("ranks:", ranks);
  let dataLength = ranks.length;
  let dataIns = [];
  for (let i = 0; i < dataLength; i++) {
    let dataFree = {};
    dataFree["examId"] = ranks[i].examId;
    dataFree["freeStudentId"] = ranks[i].studentId;
    dataFree["totalObtainedMarks"] = ranks[i].totalObtainedMarks;
    dataFree["rank"] = i + 1;
    dataIns.push(dataFree);
  }
  ////console.log("dataIns:", dataIns);
  let sav = null;
  try {
    sav = await FreeMcqRank.insertMany(dataIns, { ordered: false });
  } catch (err) {
    return res.status(500).json("Something went wrong.");
  }
  return res.status(201).json("Success!");
};
const getRankFree = async (req, res, next) => {
  let examId = req.query.examId;
  let mobileNo = req.query.mobileNo;
  if (!ObjectId.isValid(examId) || !mobileNo)
    return res.status(200).json("Invalid examId or mobileNo.");
  let examIdObj = new mongoose.Types.ObjectId(examId);
  let studentIdObj = null,
    studentInfo = null;
  try {
    studentInfo = await FreeStudent.findOne({ mobileNo: mobileNo });
  } catch (err) {
    return res.status(500).json("Something went wrong.");
  }
  ////console.log("student Info", studentInfo);
  if (!studentInfo) return res.status(404).json("No data found.");
  studentIdObj = studentInfo._id;
  let resultRank = null;
  try {
    resultRank = await FreeMcqRank.findOne({
      $and: [{ examId: examIdObj }, { freeStudentId: studentIdObj }],
    }).select("rank -_id");
  } catch (err) {
    return res.status(500).json("Something went wrong.");
  }
  if (!resultRank) return res.status(404).json("Exam not finshed yet.");
  ////console.log(resultRank.rank);
  resultRank = Number(resultRank.rank);
  let data1 = {},
    getResult = null;
  try {
    getResult = await FreeStudentExamVsQuestionsMcq.findOne({
      $and: [{ examId: examId }, { studentId: studentIdObj }],
    }).populate("examId");
  } catch (err) {
    return res.status(500).json("Problem when get Student Exam info.");
  }
  let dataTime = null;
  try {
    dataTime = await FreestudentMarksRank.findOne({
      $and: [{ examId: examId }, { studentId: studentIdObj }],
    });
  } catch (err) {
    return res.status(500).json("Something went wrong.");
  }
  let totalStudent = null;
  try {
    totalStudent = await FreestudentMarksRank.find({ examId: examId }).count();
  } catch (err) {
    return res.status(500).json("Something went wrong.");
  }
  data1["name"] = studentInfo.name;
  data1["mobileNo"] = studentInfo.mobileNo;
  data1["institution"] = studentInfo.institution;
  data1["rank"] = resultRank;
  data1["totalStudent"] = totalStudent;
  data1["examName"] = getResult.examId.name;
  data1["startTime"] = moment(getResult.examId.startTime)
    .subtract(6, "h")
    .format("LLL");
  data1["endTime"] = moment(getResult.examId.endTime)
    .subtract(6, "h")
    .format("LLL");
  data1["totalMarksMcq"] = getResult.examId.totalMarksMcq;
  data1["examVariation"] = examType[Number(getResult.examId.examType)];
  data1["examType"] = examVariation[Number(getResult.examId.examVariation)];
  data1["totalCorrectAnswer"] = getResult.totalCorrectAnswer;
  data1["totalWrongAnswer"] = getResult.totalWrongAnswer;
  data1["totalCorrectMarks"] = getResult.totalCorrectMarks;
  data1["totalWrongMarks"] = getResult.totalWrongMarks;
  data1["totalNotAnswered"] = getResult.totalNotAnswered;
  data1["totalObtainedMarks"] = getResult.totalObtainedMarks;
  data1["studExamStartTime"] = moment(dataTime.examStartTime)
    .subtract(6, "h")
    .format("LLL");
  data1["studExamEndTime"] = moment(dataTime.examEndTime)
    .subtract(6, "h")
    .format("LLL");
  data1["studExamTime"] = dataTime.duration;
  data1["marksPerMcq"] = getResult.examId.marksPerMcq;
  data1["marksPerWrong"] =
    (getResult.examId.marksPerMcq * getResult.examId.negativeMarks) / 100;
  return res.status(200).json(data1);
};

const getAllRankFree = async (req, res, next) => {
  let examId = req.query.examId;
  if (!ObjectId.isValid(examId)) return res.status(200).json("Invalid examId.");
  let examIdObj = new mongoose.Types.ObjectId(examId);
  let resultRank = null;
  try {
    resultRank = await FreeMcqRank.find({ examId: examIdObj })
      .sort("rank")
      .populate("examId freeStudentId");
  } catch (err) {
    return res.status(500).json("Something went wrong.");
  }
  if (!resultRank) return res.status(404).json("Exam not finshed yet.");
  ////console.log(resultRank);
  //eturn res.status(200).json(resultRank);
  let data2;
  // let freeStudentIds;
  // try {
  //   freeStudentIds = await FreeMcqRank.find({ examId: examIdObj })
  //     .sort("rank")
  //     .select("freeStudentId -_id");
  // } catch (err) {
  //   return res.status(500).json("Something went wrong.");
  // }
  let freeStudentArr = [];
  for (let i = 0; i < resultRank.length; i++) {
    freeStudentArr[i] = resultRank[i].freeStudentId._id;
    ////console.log(freeStudentArr[i]);
  }
  ////console.log(freeStudentArr);
  try {
    data2 = await FreestudentMarksRank.find({
      $and: [{ examId: examIdObj }, { studentId: { $in: freeStudentArr } }],
    }).sort({ totalObtainedMarks: -1 });
  } catch (err) {
    return res.status(500).json("Soomething went wrong.");
  }
  // for (let i = 0; i < resultRank.length; i++) {
  //   //freeStudentArr[i] = resultRank[i].freeStudentId._id;
  //   //console.log(freeStudentArr[i], "freestudent");
  //   //console.log(data2[i].studentId, "data2");
  // }
  let allData = [];
  let totalStudent = null;
  for (let i = 0; i < resultRank.length; i++) {
    let data1 = {};
    let conData = "*******";
    data1["examName"] = resultRank[i].examId.name;
    data1["studentName"] = resultRank[i].freeStudentId.name;
    data1["mobileNoOrg"] = resultRank[i].freeStudentId.mobileNo;
    data1["buetRoll"] = resultRank[i].freeStudentId.buetRoll;
    data1["medicalRoll"] = resultRank[i].freeStudentId.medicalRoll;
    data1["universityRoll"] = resultRank[i].freeStudentId.universityRoll;
    data1["sscRoll"] = resultRank[i].freeStudentId.sscRoll;
    data1["hscRoll"] = resultRank[i].freeStudentId.hscRoll;
    data1["curricullumRoll"] = resultRank[i].freeStudentId.curriculumRoll;
    data1["mobileNo"] = conData.concat(
      resultRank[i].freeStudentId.mobileNo.slice(7)
    );
    data1["institution"] = resultRank[i].freeStudentId.institution;
    data1["totalObtainedMarks"] = resultRank[i].totalObtainedMarks;
    data1["rank"] = resultRank[i].rank;
    data1["totalStudent"] = resultRank.length;
    data1["totalMarks"] = resultRank[i].examId.totalMarksMcq;
    data1["examStartTime"] = moment(data2[i].examStartTime)
      .subtract(6, "h")
      .format("MMMM Do YYYY, h:mm:ss a");
    data1["examEndTime"] = moment(data2[i].examEndTime)
      .subtract(6, "h")
      .format("MMMM Do YYYY, h:mm:ss a");
    data1["id"] = resultRank[i].freeStudentId._id;

    allData.push(data1);
  }

  return res.status(200).json(allData);
  //return res.status(200).json(data2);
};

// const updateNullData = async (req, res, next) => {
//   //let examId = "64d61e0b6d50accd196c764d";
//   // examId = new mongoose.Types.ObjectId(examId);
//   // //console.log(examId, "examId");
//   // let students;
//   // try {
//   //   students = await FreeMcqRank.find({
//   //     $and: [{ examId: examId }, { totalObtainedMarks: null }],
//   //   }).populate("freeStudentId");
//   // } catch (err) {
//   //   return res.status(200).json("Soomething went wrong.");
//   // }
//   // let id = students[0].freeStudentId._id;
//   // id = new mongoose.Types.ObjectId(id);
//   let upd = {
//     totalCorrectAnswer: 20,
//     totalWrongAnswer: 13,
//     totalNotAnswered: 17,
//     totalCorrectMarks: 20,
//     totalWrongMarks: 3.25,
//     totalObtainedMarks: 16.75,
//   };
//   let sav = null;
//   try {
//     sav = await FreeStudentExamVsQuestionsMcq.findByIdAndUpdate(
//       "64d652b1326d83366fcb7f01",
//       upd
//     );
//   } catch (err) {
//     return res.status(200).json("Soomething went wrong.");
//   }
//   return res.status(200).json(sav);
// };

const getFreeExamNew1 = async (req, res, next) => {
  let exams;
  let id = new mongoose.Types.ObjectId("64dcd8c6c227ba908b10b041");
  let currentTime = Date.now();
  try {
    exams = await Exam.find({
      $and: [{ status: true }, { examFreeOrNot: true }, { _id: id }],
    });
  } catch (err) {
    return res.status(500).json("Something went wrong.");
  }
  ////console.log(exams.length);
  if (exams.length == 0)
    return res.status(404).json("No Free exam has been completed.");
  let data1 = [];
  for (let i = 0; i < exams.length; i++) {
    let dataObj = {};
    dataObj["courseId"] = exams[i].courseId;
    dataObj["createdAt"] = exams[i].createdAt;
    dataObj["duration"] = exams[i].duration;
    dataObj["endTime"] = exams[i].endTime;
    dataObj["examFreeOrNot"] = exams[i].examFreeOrNot;
    dataObj["examType"] = -1;
    dataObj["examVariation"] = 1;
    dataObj["hscStatus"] = exams[i].hscStatus;
    dataObj["iLink"] = exams[i].iLink;
    dataObj["marksPerMcq"] = exams[i].marksPerMcq;
    dataObj["name"] = exams[i].name;
    dataObj["negativeMarks"] = exams[i].negativeMarks;
    dataObj["sscStatus"] = exams[i].sscStatus;
    dataObj["startTime"] = exams[i].startTime;
    dataObj["endTime"] = exams[i].endTime;
    dataObj["status"] = exams[i].status;
    dataObj["subjectId"] = exams[i].subjectId;
    dataObj["totalMarksMcq"] = exams[i].totalMarksMcq;
    dataObj["totalQuestionMcq"] = exams[i].totalQuestionMcq;
    dataObj["updatedAt"] = exams[i].updatedAt;
    dataObj["__v"] = exams[i].__v;
    dataObj["_id"] = exams[i]._id;
    let dataRule = null;
    try {
      dataRule = await ExamRule.findOne({ examId: exams[i]._id }).select(
        "ruleILink -_id"
      );
    } catch (err) {
      return res.status(500).json("Something went wrong.");
    }
    if (dataRule == null) dataObj["RuleImage"] = "0";
    else {
      dataObj["RuleImage"] = dataRule.ruleILink;
    }
    data1.push(dataObj);
  }
  return res.status(200).json(data1);
};
const getFreeExamNew = async (req, res, next) => {
  let exams = [];
  try {
    exams = await PublishFreeExam.find({
      $and: [{ status: true }],
    }).populate("examId");
  } catch (err) {
    return res.status(500).json("Something went wrong.");
  }
  if (exams.length == 0)
    return res.status(404).json("No Free exam has been completed.");
  let data1 = [];
  for (let i = 0; i < exams.length; i++) {
    let dataObj = {};
    dataObj["name"] = exams[i].examId.name;
    dataObj["_id"] = exams[i].examId._id;
    data1.push(dataObj);
  }
  return res.status(200).json(data1);
};
const addPublishFree = async (req, res, next) => {
  let examId = req.body.examId;
  if (!ObjectId.isValid(examId))
    return res.status(404).json("exam Id not valid.");
  examId = new mongoose.Types.ObjectId(examId);
  let upd = null;
  try {
    upd = await PublishFreeExam.findOne({ examId: examId });
  } catch (err) {
    return res.status(500).json("Something went wrong.");
  }
  if (upd) {
    let upd1 = null;
    try {
      upd1 = await PublishFreeExam.updateOne(
        { examId: examId },
        { $set: { status: true } }
      );
    } catch (err) {
      return res.status(500).json("Something went wrong.");
    }
  } else {
    let insertData = new PublishFreeExam({
      examId: examId,
      status: true,
    });
    let sav = null;
    try {
      sav = await insertData.save();
    } catch (err) {
      return res.status(500).json("Something went wrong.");
    }
  }
  return res.status(201).json("Save Succesfully.");
};
const showPublishFree = async (req, res, next) => {
  let data = null;
  try {
    data = await PublishFreeExam.find({ status: true }).populate("examId");
  } catch (err) {
    return res.status(500).json("Something went wrong.");
  }
  let data1 = [];
  for (let i = 0; i < data.length; i++) {
    let objData = {};
    objData["examId"] = data[i].examId._id;
    objData["examName"] = data[i].examId.name;
    objData["publishStatus"] = data[i].status;
    data1.push(objData);
  }
  return res.status(200).json(data1);
};
const statusUpdatePublishFree = async (req, res, next) => {
  let examId = req.body.examId;
  let status = JSON.parse(req.body.status);
  //console.log(examId);
  //console.log(req.body.status);
  //console.log(status);
  if (!ObjectId.isValid(examId) || status == null)
    return res.status(404).json("exam Id not valid.");
  examId = new mongoose.Types.ObjectId(examId);
  let upd = null;
  try {
    upd = await PublishFreeExam.updateOne(
      { examId: examId },
      { $set: { status: status } }
    );
  } catch (err) {
    return res.status(500).json("Something went wrong.");
  }
  return res.status(201).json("Status Updated Succesfully.");
};

const testApi = async (req, res, next) => {
  let getExamData = [];
  try {
    getExamData = await FreestudentMarksRank.find({})
      .populate({
        path: "examId",
        populate: {
          path: "subjectId",
          select: "name",
          model: "Subject",
        },
      })
      .populate({
        path: "examId",
        populate: {
          path: "courseId",
          select: "name",
          model: "Course",
        },
      })
      .limit(5);
  } catch (err) {
    console.log(err);
    return res.status(500).json("Can't get exam info.");
  }
  return res.status(200).json(getExamData);
};
exports.testApi = testApi;
exports.addPublishFree = addPublishFree;
exports.showPublishFree = showPublishFree;
exports.statusUpdatePublishFree = statusUpdatePublishFree;
exports.freeGetHistoryByExamIdFilterM = freeGetHistoryByExamIdFilterM;
exports.freeGetHistoryByExamIdFilterN = freeGetHistoryByExamIdFilterN;
exports.addFreeStudent = addFreeStudent;
exports.getAllFreeStudent = getAllFreeStudent;
exports.freeLoginStudent = freeLoginStudent;
exports.examCheckMiddlewareFree = examCheckMiddlewareFree;
exports.validateToken = validateToken;
exports.assignQuestionFree = assignQuestionFree;
exports.updateAssignQuestionFree = updateAssignQuestionFree;
exports.getRunningDataFree = getRunningDataFree;
exports.submitAnswerFree = submitAnswerFree;
exports.freeStudentViewSollutionAdmin = freeStudentViewSollutionAdmin;
exports.freeStudentHistoryDataAdmin = freeStudentHistoryDataAdmin;
exports.freeStudentMissedExamAdmin = freeStudentMissedExamAdmin;
exports.getFreeExamId = getFreeExamId;
exports.getFreeStudenInfoById = getFreeStudenInfoById;
exports.getFreeStudenInfoByMobile = getFreeStudenInfoByMobile;
exports.updateStudentExamInfoFree = updateStudentExamInfoFree;
exports.updateRankFree = updateRankFree;
exports.getRankFree = getRankFree;
exports.getExamById = getExamById;
exports.getFreeExamAll = getFreeExamAll;
exports.freeGetHistoryByExamId = freeGetHistoryByExamId;
exports.getAllRankFree = getAllRankFree;
exports.getFreeExamNew = getFreeExamNew;
