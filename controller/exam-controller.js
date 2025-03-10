const Course = require("../model/Course");
const Exam = require("../model/Exam");
const McqQuestionVsExam = require("../model/McqQuestionVsExam");
const QuestionsMcq = require("../model/QuestionsMcq");
const QuestionsWritten = require("../model/QuestionsWritten");
const Subject = require("../model/Subject");
const WrittenQuestionVsExam = require("../model/WrittenQuestionVsExam");
const CourseVsStudent = require("../model/CourseVsStudent");
const fs = require("fs");
const { default: mongoose, mongo, isValidObjectId } = require("mongoose");
const ExamRule = require("../model/ExamRule");
const StudentExamVsQuestionsMcq = require("../model/StudentExamVsQuestionsMcq");
const ObjectId = mongoose.Types.ObjectId;
//const moment = require("moment");
const moment = require("moment-timezone");
const pagination = require("../utilities/pagination");
const examType = require("../utilities/exam-type");
const examVariation = require("../utilities/exam-variation");
const StudentExamVsQuestionsWritten = require("../model/StudentExamVsQuestionsWritten");
const TeacherVsExam = require("../model/TeacherVsExam");
const BothTeacherVsExam = require("../model/BothTeacherVsExam");
const BothStudentExamVsQuestions = require("../model/BothStudentExamVsQuestions");
const BothExam = require("../model/BothExam");
const StudentMarksRank = require("../model/StudentMarksRank");
const SpecialVsStudent = require("../model/SpecialVsStudent");
const Student = require("../model/Student");
const BothQuestionsWritten = require("../model/BothQuestionsWritten");
const FreeStudent = require("../model/FreeStudent");
const path = require("path");
// const solutionSheet = require("../model/solutionSheet");
//const SpecialExam = require("../model/SpecialExam");
const SpecialExam = require("../model/SpecialExamNew");
const BothMcqQuestionVsExam = require("../model/BothMcqQuestionVsExam");
const BothExamRule = require("../model/BothExamRule");
const BothRank = require("../model/BothRank");
const FreeMcqRank = require("../model/FreeMcqRank");
const FreeStudentExamVsQuestionsMcq = require("../model/FreeStudentExamVsQuestionsMcq");
const FreestudentMarksRank = require("../model/FreestudentMarksRank");
const McqSpecialExam = require("../model/McqSpecialExam");
const { forEach } = require("jszip");
const bcrypt = require("bcryptjs");
const McqRank = require("../model/McqRank");
let dir = path.resolve(path.join(__dirname, "../uploads"));

const Limit = 100;
//test
function checkIfEmpty(array) {
  return (
    Array.isArray(array) && (array.length == 0 || array.every(checkIfEmpty))
  );
}
const shuffle = (array) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

//create Exam
const createExam1 = async (req, res, next) => {
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
    examVariation,
    examFreeOrNot,
    startTime,
    endTime,
    totalQuestionMcq,
    marksPerMcq,
    totalMarksMcq,
    status,
    duration,
    sscStatus,
    hscStatus,
    negativeMarks,
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
  saveExam = new Exam({
    courseId: courseIdObj,
    subjectId: subjectIdObj,
    name: name,
    examType: Number(examType),
    examVariation: Number(examVariation),
    examFreeOrNot: JSON.parse(examFreeOrNot),
    startTime: moment(startTime).add(6, "h"),
    endTime: moment(endTime).add(6, "h"),
    duration: Number(duration),
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
const createExam2 = async (req, res, next) => {
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
    examVariation,
    examFreeOrNot,
    startTime,
    endTime,
    totalQuestionMcq,
    marksPerMcq,
    totalMarksMcq,
    status,
    duration,
    sscStatus,
    hscStatus,
    buetStatus,
    medicalStatus,
    universityStatus,
    negativeMarks,
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
  saveExam = new Exam({
    courseId: courseIdObj,
    subjectId: subjectIdObj,
    name: name,
    examType: Number(examType),
    examVariation: Number(examVariation),
    examFreeOrNot: JSON.parse(examFreeOrNot),
    startTime: moment(startTime).add(6, "h"),
    endTime: moment(endTime).add(6, "h"),
    duration: Number(duration),
    totalQuestionMcq: tqm,
    marksPerMcq: tmm,
    totalMarksMcq: Number(totalMarksMcq),
    negativeMarks: Number(negativeMarks),
    status: JSON.parse(status),
    sscStatus: JSON.parse(sscStatus),
    hscStatus: JSON.parse(hscStatus),
    buetStatus: JSON.parse(buetStatus),
    medicalStatus: JSON.parse(medicalStatus),
    universityStatus: JSON.parse(universityStatus),
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

const examByCourse = async (req, res, next) => {
  let examType = Number(req.query.type);
  let courseId = req.query.courseId;
  //  courseId =  new mongoose.Types.ObjectId(courseId);
  // console.log("params: ",req.params.course);
  console.log(examType, courseId);
  let getData = [];
  if (examType === 0) {
    try {
      getData = await Exam.find({
        $and: [{ courseId: courseId }, { examVariation: 1 }, { status: true }],
      });
      // console.log(getData);
    } catch (error) {
      return res.status(500).json("No exams available for this course");
    }
  }
  if (examType === 1) {
    try {
      getData = await Exam.find({
        courseId: courseId,
        examVariation: 2,
        status: true,
      });
    } catch (error) {
      return res.status(500).json("No exams available for this course");
    }
  }
  if (examType === 2) {
    try {
      getData = await BothExam.find({ courseId: courseId, status: true });
    } catch (error) {
      return res.status(500).json("No exams available for this course");
    }
  }
  if (examType === 3) {
    try {
      getData = await SpecialExam.find({ courseId: courseId, status: true });
    } catch (error) {
      return res.status(500).json("No exams available for this course");
    }
  }
  if (examType === 4) {
    try {
      getData = await McqSpecialExam.find({ courseId: courseId, status: true });
    } catch (error) {
      return res.status(500).json("No exams available for this course");
    }
  }
  // console.log(getData);

  return res.status(200).json(getData);
};

const leaderboard = async (req, res, next) => {
  let type = Number(req.query.type);
  // let studentId = req.user.studentId;
  // console.log(studentId);
  let examId = new mongoose.Types.ObjectId(req.query.examId);
  // console.log(examId,type)
  let data = null;
  if (type === 0) {
    try {
      console.log("hi");
      data = await McqRank.find({ examId: examId })
        .populate("studentId")
        .exec();
    } catch (error) {
      return res.status(500).json("Exam Id is not found");
    }
  } else if (type === 1) {
    try {
      data = await BothExam.find({ examId: examId }).populate(
        "examId studentId"
      );
    } catch (error) {
      return res.status(500).json("Exam Id is not found");
    }
  } else if (type === 2) {
    try {
      data = await SpecialExam.find({ examId: examId }).populate(
        "examId studentId"
      );
    } catch (error) {
      return res.status(500).json("Exam Id is not found");
    }
  } else if (type === 3) {
    try {
      data = await McqSpecialExam.find({ examId: examId }).populate(
        "examId studentId"
      );
    } catch (error) {
      return res.status(500).json("Exam Id is not found");
    }
  }
  return res.status(200).json(data);
};

const createExam = async (req, res, next) => {
  const file = req.file;
  // console.log(file);
  // console.log(req.body);
  let iLinkPath = null;
  if (file) {
    iLinkPath = "uploads/".concat(file.filename);
  }

  //const examFromQuery = JSON.parse(req.query.exam);
  const {
    courseId,
    subjectId,
    name,
    examType,
    examVariation,
    startTime,
    endTime,
    examFreeOrNot,
    totalQuestionMcq,
    marksPerMcq,
    totalMarksMcq,
    status,
    duration,
    curriculumName,
    isAdmission,
    negativeMarks,
    numberOfOptions,
    numberOfRetakes,
    numberOfSet,
    questionType,
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
  saveExam = new Exam({
    courseId: courseIdObj,
    subjectId: subjectIdObj,
    name: name,
    examType: Number(examType),
    examVariation: Number(examVariation),
    examFreeOrNot: JSON.parse(examFreeOrNot),
    startTime: moment(startTime).add(6, "h"),
    endTime: moment(endTime).add(6, "h"),
    duration: Number(duration),
    totalQuestionMcq: tqm,
    marksPerMcq: tmm,
    totalMarksMcq: Number(totalMarksMcq),
    negativeMarks: Number(negativeMarks),
    status: JSON.parse(status),
    isAdmission: JSON.parse(isAdmission),
    curriculumName,
    numberOfRetakes,
    numberOfOptions,
    numberOfSet,
    questionType,
    iLink: iLinkPath,
  });
  let doc;
  try {
    doc = await saveExam.save();
  } catch (err) {
    console.log(err);
    return res.status(500).json("Something went wrong!");
  }
  return res.status(201).json(doc);
};
//get exam
const getAllExam = async (req, res, next) => {
  const examType = req.query.examType;
  let paginateData;
  let page = Number(req.query.page) || 1;
  let exams;
  if (examType) {
    let count = 0;
    try {
      count = await Exam.find({
        $and: [
          { examType: Number(examType) },
          { examFreeOrNot: false },
          { status: true },
        ],
      }).count();
    } catch (err) {
      return res.status(500).json("Something went wrong.Pagination.");
    }
    if (count == 0) return res.status(404).json("No data found.");
    paginateData = pagination(count, page);
    try {
      exams = await Exam.find({
        $and: [
          { examType: Number(examType) },
          { examFreeOrNot: false },
          { status: true },
        ],
      })
        .skip(paginateData.skippedIndex)
        .limit(paginateData.perPage);
    } catch (err) {
      ////console.log(err);
      return res.status(500).json("Something went wrong!");
    }
  } else {
    let count = 0;
    try {
      count = await Exam.find({
        $and: [{ examFreeOrNot: false }, { status: true }],
      }).count();
    } catch (err) {
      return res.status(500).json("Something went wrong!");
    }
    if (count == 0) return res.status(404).json("No data found");
    paginateData = pagination(count, page);
    exams = await Exam.find({
      $and: [{ examFreeOrNot: false }, { status: true }],
    })
      .skip(paginateData.skippedIndex)
      .limit(paginateData.perPage);
  }
  return res.status(200).send({ exams, paginateData });
};
const getExamById = async (req, res, next) => {
  const examId = req.query.examId;
  if (!ObjectId.isValid(examId))
    return res.status(404).json("examId is invalid.");
  let examIdObj = new mongoose.Types.ObjectId(examId);
  let examData = null;
  try {
    examData = await Exam.findOne({
      $and: [{ _id: examIdObj }, { status: true }],
    }).populate("courseId subjectId");
  } catch (err) {
    return res.status(500).json("Something went wrong.");
  }
  return res.status(200).json(examData);
};
const updateExam1 = async (req, res, next) => {
  const {
    examId,
    courseId,
    subjectId,
    name,
    examType,
    examVariation,
    examFreeOrNot,
    startTime,
    endTime,
    totalQuestionMcq,
    marksPerMcq,
    totalMarksMcq,
    status,
    duration,
    sscStatus,
    hscStatus,
    negativeMarks,
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
  //console.log("CT", moment(new Date()));
  //console.log("ST", moment(new Date(startTime)));
  //console.log("ET", moment(new Date(endTime)));

  let saveExamUpd = {
    courseId: new mongoose.Types.ObjectId(courseId),
    subjectId: new mongoose.Types.ObjectId(subjectId),
    name: name,
    examType: Number(examType),
    examVariation: Number(examVariation),
    examFreeOrNot: JSON.parse(examFreeOrNot),
    startTime: moment(startTime).add(6, "h"),
    endTime: moment(endTime).add(6, "h"),
    duration: Number(duration),
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
    updStatus = await Exam.updateOne({ _id: examId }, saveExamUpd);
  } catch (err) {
    return res.status(500).json(err);
  }
  if (updStatus == null) return res.status(404).json("Prolem at update.");
  else return res.status(201).json("Updated.");
};
const updateExam2 = async (req, res, next) => {
  const {
    examId,
    courseId,
    subjectId,
    name,
    examType,
    examVariation,
    examFreeOrNot,
    startTime,
    endTime,
    totalQuestionMcq,
    marksPerMcq,
    totalMarksMcq,
    status,
    duration,
    sscStatus,
    hscStatus,
    buetStatus,
    medicalStatus,
    universityStatus,
    negativeMarks,
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
  //console.log("CT", moment(new Date()));
  //console.log("ST", moment(new Date(startTime)));
  //console.log("ET", moment(new Date(endTime)));

  let saveExamUpd = {
    courseId: new mongoose.Types.ObjectId(courseId),
    subjectId: new mongoose.Types.ObjectId(subjectId),
    name: name,
    examType: Number(examType),
    examVariation: Number(examVariation),
    examFreeOrNot: JSON.parse(examFreeOrNot),
    startTime: moment(startTime).add(6, "h"),
    endTime: moment(endTime).add(6, "h"),
    duration: Number(duration),
    totalQuestionMcq: Number(totalQuestionMcq),
    marksPerMcq: Number(marksPerMcq),
    totalMarksMcq: Number(totalMarksMcq),
    negativeMarks: Number(negativeMarks),
    status: JSON.parse(status),
    sscStatus: JSON.parse(sscStatus),
    hscStatus: JSON.parse(hscStatus),
    buetStatus: JSON.parse(buetStatus),
    medicalStatus: JSON.parse(medicalStatus),
    universityStatus: JSON.parse(universityStatus),
  };
  let updStatus = null;
  try {
    updStatus = await Exam.updateOne({ _id: examId }, saveExamUpd);
  } catch (err) {
    return res.status(500).json(err);
  }
  if (updStatus == null) return res.status(404).json("Problem at update.");
  else return res.status(201).json("Updated.");
};

const updateExam = async (req, res, next) => {
  const file = req.file;

  const {
    examId,
    courseId,
    subjectId,
    name,
    examType,
    examVariation,
    examFreeOrNot,
    startTime,
    endTime,
    totalQuestionMcq,
    marksPerMcq,
    totalMarksMcq,
    status,
    duration,
    curriculumName,
    isAdmission,
    negativeMarks,
    numberOfRetakes,
    numberOfOptions,
    numberOfSet,
    questionType,
  } = req.body;
  // console.log(req.body);

  const totalMarks = Number(totalQuestionMcq) * Number(marksPerMcq);
  if (
    !ObjectId.isValid(examId) ||
    !ObjectId.isValid(courseId) ||
    !ObjectId.isValid(subjectId)
  ) {
    return res
      .status(404)
      .json("exam Id or course Id or subject Id is not valid.");
  }
  //console.log("CT", moment(new Date()));
  //console.log("ST", moment(new Date(startTime)));
  //console.log("ET", moment(new Date(endTime)));

  let saveExamUpd = {
    courseId: new mongoose.Types.ObjectId(courseId),
    subjectId: new mongoose.Types.ObjectId(subjectId),
    name: name,
    examType: Number(examType),
    examVariation: Number(examVariation),
    examFreeOrNot: JSON.parse(examFreeOrNot),
    startTime: moment(startTime).add(6, "h"),
    endTime: moment(endTime).add(6, "h"),
    duration: Number(duration),
    totalQuestionMcq: Number(totalQuestionMcq),
    marksPerMcq: Number(marksPerMcq),
    totalMarksMcq: Number(totalMarks),
    negativeMarks: Number(negativeMarks),
    status: JSON.parse(status),
    curriculumName,
    isAdmission: JSON.parse(isAdmission),
    numberOfRetakes,
    numberOfOptions,
    numberOfSet,
    questionType,
  };
  let updStatus = null;
  try {
    updStatus = await Exam.updateOne({ _id: examId }, saveExamUpd);
  } catch (err) {
    return res.status(500).json(err);
  }
  if (updStatus == null) return res.status(404).json("Problem at update.");
  else return res.status(201).json("Updated.");
};

const updateFreeExam = async (req, res, next) => {
  const {
    examId,
    name,
    startTime,
    endTime,
    totalQuestionMcq,
    marksPerMcq,
    status,
    duration,
    sscStatus,
    hscStatus,
    negativeMarks,
  } = req.body;
  if (!ObjectId.isValid(examId)) {
    return res
      .status(404)
      .json("exam Id or course Id or subject Id is not valid.");
  }

  let saveExamUpd = {
    name: name,
    startTime: new Date(startTime),
    endTime: new Date(endTime),
    duration: Number(duration),
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
    updStatus = await Exam.updateOne({ _id: examId }, saveExamUpd);
  } catch (err) {
    return res.status(500).json(err);
  }
  if (updStatus == null) return res.status(404).json("Prolem at update.");
  else return res.status(201).json("Updated.");
};
const deactivateExam = async (req, res, next) => {
  const examId = req.body.examId;
  if (!ObjectId.isValid(examId))
    return res.status(404).json("Invalid exam Id.");
  //const examIdObj = new mongoose.Types.ObjectId(examId);
  let queryResult = null;
  try {
    queryResult = await Exam.findByIdAndUpdate(examId, { status: false });
  } catch (err) {
    return res.status(500).json(err);
  }
  if (queryResult) return res.status(201).json("Deactivated.");
  else return res.status(404).json("Something went wrong.");
};
const getExamType = async (req, res, next) => {
  const examId = req.body.examId;
  if (!ObjectId.isValid(examId))
    return res.status(404).json("Exam Id is not valid.");
  let type = null;
  try {
    type = Exam.findById(examId).select("examVariation -_id");
  } catch (err) {
    return res.status(500).json("Something went wrong.");
  }
  if (type == null) return res.status(404).json("Exam variation not found.");
  return res.status(200).json(type);
};
//get all exam for a particular course of particular subject
const getExamBySub1 = async (req, res, next) => {
  const subjectId = req.query.subjectId;
  if (!ObjectId.isValid(subjectId))
    return res.status(404).json("subject Id is not valid.");
  const subjectIdObj = new mongoose.Types.ObjectId(subjectId);
  let examData = null;
  try {
    examData = await Exam.find({
      $and: [
        { subjectId: subjectIdObj },
        // { examFreeOrNot: false },
        { status: true },
      ],
    });
  } catch (err) {
    return res.status(500).json(err);
  }
  return res.status(200).json(examData);
};
const getExamBySub = async (req, res, next) => {
  const subjectId = req.query.subjectId;
  const examType = req.query.examType;
  if (!ObjectId.isValid(subjectId))
    return res.status(404).json("subject Id is not valid.");
  const subjectIdObj = new mongoose.Types.ObjectId(subjectId);
  let examData1 = null;
  try {
    examData1 = await Exam.find({
      $and: [
        { subjectId: subjectIdObj },
        //{ examVariation: examType },
        // { examFreeOrNot: false },
        { status: true },
      ],
    });
  } catch (err) {
    return res.status(500).json(err);
  }
  let examData = [];
  for (let i = 0; i < examData1.length; i++) {
    let examObj = {};
    let dataRule = "0";
    try {
      dataRule = await ExamRule.findOne({ examId: examData1[i]._id }).select(
        "ruleILink -_id"
      );
    } catch (err) {
      return res.status(500).json("Something went wrong.");
    }
    examObj["_id"] = examData1[i]._id;
    examObj["name"] = examData1[i].name;
    examObj["examType"] = examData1[i].examType;
    examObj["examVariation"] = examData1[i].examVariation;
    examObj["examFreeOrNot"] = examData1[i].examFreeOrNot;
    examObj["startTime"] = new Date(
      moment(examData1[i].startTime).subtract(6, "hours")
    );
    examObj["endTime"] = new Date(
      moment(examData1[i].endTime).subtract(6, "hours")
    );
    examObj["duration"] = examData1[i].duration;
    examObj["totalQuestionMcq"] = examData1[i].totalQuestionMcq;
    examObj["marksPerMcq"] = examData1[i].marksPerMcq;
    examObj["totalMarksMcq"] = examData1[i].totalMarksMcq;
    examObj["status"] = examData1[i].status;
    examObj["subjectId"] = examData1[i].subjectId;
    examObj["courseId"] = examData1[i].courseId;
    examObj["sscStatus"] = examData1[i].sscStatus;
    examObj["hscStatus"] = examData1[i].hscStatus;
    examObj["negativeMarks"] = examData1[i].negativeMarks;
    examObj["iLink"] = examData1[i].iLink;
    examObj["createdAt"] = examData1[i].createdAt;
    examObj["updatedAt"] = examData1[i].updatedAt;
    examObj["__v"] = examData1[i].__v;
    if (dataRule == null) examObj["RuleImage"] = "0";
    else {
      examObj["RuleImage"] = dataRule.ruleILink;
    }
    examData.push(examObj);
  }
  return res.status(200).json(examData);
};
const getExamBySubAdmin = async (req, res, next) => {
  const subjectId = req.query.subjectId;
  const examType = req.query.examType;
  const type = req.query.type;
  if (!ObjectId.isValid(subjectId))
    return res.status(404).json("subject Id is not valid.");
  const subjectIdObj = new mongoose.Types.ObjectId(subjectId);
  let examData1 = null;
  if (type === "free") {
    try {
      examData1 = await Exam.find({
        $and: [
          { subjectId: subjectIdObj },
          { examType: examType },
          // { examFreeOrNot: false },
          { status: true },
        ],
      });
    } catch (err) {
      return res.status(500).json(err);
    }
  } else {
    try {
      examData1 = await Exam.find({
        $and: [
          { subjectId: subjectIdObj },
          { examVariation: examType },
          // { examFreeOrNot: false },
          { status: true },
        ],
      });
    } catch (err) {
      return res.status(500).json(err);
    }
  }
  let examData = [];
  for (let i = 0; i < examData1.length; i++) {
    let examObj = {};
    let dataRule = "0";
    try {
      dataRule = await ExamRule.findOne({ examId: examData1[i]._id }).select(
        "ruleILink -_id"
      );
    } catch (err) {
      return res.status(500).json("Something went wrong.");
    }
    examObj["_id"] = examData1[i]._id;
    examObj["name"] = examData1[i].name;
    examObj["examType"] = examData1[i].examType;
    examObj["examVariation"] = examData1[i].examVariation;
    examObj["examFreeOrNot"] = examData1[i].examFreeOrNot;
    examObj["startTime"] = new Date(
      moment(examData1[i].startTime).subtract(6, "hours")
    );
    examObj["endTime"] = new Date(
      moment(examData1[i].endTime).subtract(6, "hours")
    );
    examObj["duration"] = examData1[i].duration;
    examObj["totalQuestionMcq"] = examData1[i].totalQuestionMcq;
    examObj["marksPerMcq"] = examData1[i].marksPerMcq;
    examObj["totalMarksMcq"] = examData1[i].totalMarksMcq;
    examObj["status"] = examData1[i].status;
    examObj["subjectId"] = examData1[i].subjectId;
    examObj["courseId"] = examData1[i].courseId;
    examObj["sscStatus"] = examData1[i].sscStatus;
    examObj["hscStatus"] = examData1[i].hscStatus;
    examObj["negativeMarks"] = examData1[i].negativeMarks;
    examObj["iLink"] = examData1[i].iLink;
    examObj["solutionSheet"] = examData1[i].solutionSheet;
    examObj["numberOfRetakes"] = examData1[i].numberOfRetakes;
    examObj["numberOfOptions"] = examData1[i].numberOfOptions;
    examObj["numberOfSet"] = examData1[i].numberOfSet;
    examObj["questionType"] = examData1[i].questionType;
    examObj["curriculumName"] = examData1[i].curriculumName;
    examObj["createdAt"] = examData1[i].createdAt;
    examObj["updatedAt"] = examData1[i].updatedAt;
    examObj["__v"] = examData1[i].__v;

    if (dataRule == null) {
      examObj["RuleImage"] = "0";
    } else {
      examObj["RuleImage"] = dataRule.ruleILink;
    }
    examData.push(examObj);
  }
  return res.status(200).json(examData);
};

const getExamBySubWritten = async (req, res, next) => {
  const subjectId = req.query.subjectId;
  const examType = req.query.examType;
  if (!ObjectId.isValid(subjectId))
    return res.status(404).json("subject Id is not valid.");
  const subjectIdObj = new mongoose.Types.ObjectId(subjectId);
  let examData1 = null;
  try {
    examData1 = await Exam.find({
      $and: [
        { subjectId: subjectIdObj },
        { examVariation: examType },
        // { examFreeOrNot: false },
        { status: true },
      ],
    });
  } catch (err) {
    return res.status(500).json(err);
  }
  let examData = [];
  for (let i = 0; i < examData1.length; i++) {
    let examObj = {};
    let dataRule = "0";
    try {
      dataRule = await ExamRule.findOne({ examId: examData1[i]._id }).select(
        "ruleILink -_id"
      );
    } catch (err) {
      return res.status(500).json("Something went wrong.");
    }
    examObj["_id"] = examData1[i]._id;
    examObj["name"] = examData1[i].name;
    examObj["examType"] = examData1[i].examType;
    examObj["examVariation"] = examData1[i].examVariation;
    examObj["examFreeOrNot"] = examData1[i].examFreeOrNot;
    examObj["startTime"] = new Date(
      moment(examData1[i].startTime).subtract(6, "hours")
    );
    examObj["endTime"] = new Date(
      moment(examData1[i].endTime).subtract(6, "hours")
    );
    examObj["duration"] = examData1[i].duration;
    examObj["totalQuestionMcq"] = examData1[i].totalQuestionMcq;
    examObj["marksPerMcq"] = examData1[i].marksPerMcq;
    examObj["totalMarksMcq"] = examData1[i].totalMarksMcq;
    examObj["status"] = examData1[i].status;
    examObj["subjectId"] = examData1[i].subjectId;
    examObj["courseId"] = examData1[i].courseId;
    examObj["sscStatus"] = examData1[i].sscStatus;
    examObj["hscStatus"] = examData1[i].hscStatus;
    examObj["negativeMarks"] = examData1[i].negativeMarks;
    examObj["iLink"] = examData1[i].iLink;
    examObj["createdAt"] = examData1[i].createdAt;
    examObj["updatedAt"] = examData1[i].updatedAt;
    examObj["__v"] = examData1[i].__v;
    if (dataRule == null) examObj["RuleImage"] = "0";
    else {
      examObj["RuleImage"] = dataRule.ruleILink;
    }
    examData.push(examObj);
  }
  return res.status(200).json(examData);
};
const getExamBySubQuestion = async (req, res, next) => {
  const subjectId = req.query.subjectId;
  if (!ObjectId.isValid(subjectId))
    return res.status(404).json("subject Id is not valid.");
  const subjectIdObj = new mongoose.Types.ObjectId(subjectId);
  let examData1 = null;
  try {
    examData1 = await Exam.find({
      $and: [
        { subjectId: subjectIdObj },
        // { examFreeOrNot: false },
        { status: true },
      ],
    });
  } catch (err) {
    return res.status(500).json(err);
  }
  let examData = [];
  for (let i = 0; i < examData1.length; i++) {
    let examObj = {};
    let dataRule = "0";
    try {
      dataRule = await ExamRule.findOne({ examId: examData1[i]._id }).select(
        "ruleILink -_id"
      );
    } catch (err) {
      return res.status(500).json("Something went wrong.");
    }
    examObj["_id"] = examData1[i]._id;
    examObj["name"] = examData1[i].name;
    examObj["examType"] = examData1[i].examType;
    examObj["examVariation"] = examData1[i].examVariation;
    examObj["examFreeOrNot"] = examData1[i].examFreeOrNot;
    examObj["startTime"] = new Date(
      moment(examData1[i].startTime).subtract(6, "hours")
    );
    examObj["endTime"] = new Date(
      moment(examData1[i].endTime).subtract(6, "hours")
    );
    examObj["duration"] = examData1[i].duration;
    examObj["totalQuestionMcq"] = examData1[i].totalQuestionMcq;
    examObj["marksPerMcq"] = examData1[i].marksPerMcq;
    examObj["totalMarksMcq"] = examData1[i].totalMarksMcq;
    examObj["status"] = examData1[i].status;
    examObj["subjectId"] = examData1[i].subjectId;
    examObj["courseId"] = examData1[i].courseId;
    examObj["sscStatus"] = examData1[i].sscStatus;
    examObj["hscStatus"] = examData1[i].hscStatus;
    examObj["negativeMarks"] = examData1[i].negativeMarks;
    examObj["iLink"] = examData1[i].iLink;
    examObj["createdAt"] = examData1[i].createdAt;
    examObj["updatedAt"] = examData1[i].updatedAt;
    examObj["__v"] = examData1[i].__v;
    if (dataRule == null) examObj["RuleImage"] = "0";
    else {
      examObj["RuleImage"] = dataRule.ruleILink;
    }
    examData.push(examObj);
  }
  return res.status(200).json(examData);
};
const getMcqBySub = async (req, res, next) => {
  const subjectId = req.query.subjectId;
  if (!ObjectId.isValid(subjectId))
    return res.status(404).json("subject Id is not valid.");
  const subjectIdObj = new mongoose.Types.ObjectId(subjectId);
  let examData1 = null;
  try {
    examData1 = await Exam.find({
      $and: [
        { subjectId: subjectIdObj },
        { examFreeOrNot: false },
        { status: true },
        { examVariation: 1 },
      ],
    });
  } catch (err) {
    return res.status(500).json(err);
  }
  let examData = [];
  for (let i = 0; i < examData1.length; i++) {
    let examObj = {};
    let dataRule = "0";
    try {
      dataRule = await ExamRule.findOne({ examId: examData1[i]._id }).select(
        "ruleILink -_id"
      );
    } catch (err) {
      return res.status(500).json("Something went wrong.");
    }
    examObj["_id"] = examData1[i]._id;
    examObj["name"] = examData1[i].name;
    examObj["examType"] = examData1[i].examType;
    examObj["examVariation"] = examData1[i].examVariation;
    examObj["examFreeOrNot"] = examData1[i].examFreeOrNot;
    examObj["startTime"] = new Date(
      moment(examData1[i].startTime).subtract(6, "hours")
    );
    examObj["endTime"] = new Date(
      moment(examData1[i].endTime).subtract(6, "hours")
    );
    examObj["duration"] = examData1[i].duration;
    examObj["totalQuestionMcq"] = examData1[i].totalQuestionMcq;
    examObj["marksPerMcq"] = examData1[i].marksPerMcq;
    examObj["totalMarksMcq"] = examData1[i].totalMarksMcq;
    examObj["status"] = examData1[i].status;
    examObj["subjectId"] = examData1[i].subjectId;
    examObj["courseId"] = examData1[i].courseId;
    examObj["sscStatus"] = examData1[i].sscStatus;
    examObj["hscStatus"] = examData1[i].hscStatus;
    examObj["negativeMarks"] = examData1[i].negativeMarks;
    examObj["iLink"] = examData1[i].iLink;
    examObj["createdAt"] = examData1[i].createdAt;
    examObj["updatedAt"] = examData1[i].updatedAt;
    examObj["__v"] = examData1[i].__v;
    if (dataRule == null) examObj["RuleImage"] = "0";
    else {
      examObj["RuleImage"] = dataRule.ruleILink;
    }
    examData.push(examObj);
  }
  return res.status(200).json(examData);
};
const getWrittenBySub = async (req, res, next) => {
  const subjectId = req.query.subjectId;
  if (!ObjectId.isValid(subjectId))
    return res.status(404).json("subject Id is not valid.");
  const subjectIdObj = new mongoose.Types.ObjectId(subjectId);
  let examData1 = null;
  try {
    examData1 = await Exam.find({
      $and: [
        { subjectId: subjectIdObj },
        { examFreeOrNot: false },
        { status: true },
        { examVariation: 2 },
      ],
    });
  } catch (err) {
    return res.status(500).json(err);
  }
  let examData = [];
  for (let i = 0; i < examData1.length; i++) {
    let examObj = {};
    let dataRule = "0";
    try {
      dataRule = await ExamRule.findOne({ examId: examData1[i]._id }).select(
        "ruleILink -_id"
      );
    } catch (err) {
      return res.status(500).json("Something went wrong.");
    }
    examObj["_id"] = examData1[i]._id;
    examObj["name"] = examData1[i].name;
    examObj["examType"] = examData1[i].examType;
    examObj["examVariation"] = examData1[i].examVariation;
    examObj["examFreeOrNot"] = examData1[i].examFreeOrNot;
    examObj["startTime"] = new Date(
      moment(examData1[i].startTime).subtract(6, "hours")
    );
    examObj["endTime"] = new Date(
      moment(examData1[i].endTime).subtract(6, "hours")
    );
    examObj["duration"] = examData1[i].duration;
    examObj["totalQuestionMcq"] = examData1[i].totalQuestionMcq;
    examObj["marksPerMcq"] = examData1[i].marksPerMcq;
    examObj["totalMarksMcq"] = examData1[i].totalMarksMcq;
    examObj["status"] = examData1[i].status;
    examObj["subjectId"] = examData1[i].subjectId;
    examObj["courseId"] = examData1[i].courseId;
    examObj["sscStatus"] = examData1[i].sscStatus;
    examObj["hscStatus"] = examData1[i].hscStatus;
    examObj["negativeMarks"] = examData1[i].negativeMarks;
    examObj["iLink"] = examData1[i].iLink;
    // examObj["solutionSheet"] = examData1[i].solutionSheet;
    examObj["createdAt"] = examData1[i].createdAt;
    examObj["updatedAt"] = examData1[i].updatedAt;
    examObj["__v"] = examData1[i].__v;
    if (dataRule == null) examObj["RuleImage"] = "0";
    else {
      examObj["RuleImage"] = dataRule.ruleILink;
    }
    examData.push(examObj);
  }
  return res.status(200).json(examData);
};

const getExamBySubject = async (req, res, next) => {
  let subjectId = req.query.subjectId;
  let variation = req.query.variation;
  let type = req.query.type || null;
  ////console.log(subjectId);
  //let studentId = req.user.studentId;
  if (!ObjectId.isValid(subjectId) || !variation || !type)
    return res.status(404).json("subject Id is not valid.");
  subjectId = new mongoose.Types.ObjectId(subjectId);
  let courseId = null;
  let page = Number(req.query.page) || 1;
  let count = 0;
  let timer = moment(new Date()).add(6, "h");
  if (type == 1) {
    try {
      count = await Exam.find({
        $and: [
          { status: true },
          { subjectId: subjectId },
          { examType: variation }, //variation:mcq1=1,written-2
          { examVariation: 1 },
          { startTime: { $gt: timer } },
        ],
      }).count();
    } catch (err) {
      return res.status(500).json("something went wrong.");
    }
    if (count == 0) return res.status(404).json("No data found.");
    let paginateData = pagination(count, page);
    let exams1 = null;
    exams1 = await Exam.find(
      {
        $and: [
          { status: true },
          { subjectId: subjectId },
          { examType: variation },
          { examVariation: 1 },
          { startTime: { $gt: timer } },
        ],
      },
      "name examVariation startTime endTime examType"
    ).populate("courseId subjectId");
    // .skip(paginateData.skippedIndex)
    // .limit(paginateData.limit)
    let exams = [];
    for (let i = 0; i < exams1.length; i++) {
      //exams[i].examType
      let inst = {};
      inst["name"] = exams1[i].name;
      inst["examVariation"] = examType[Number(exams1[i].examType)];
      inst["examType"] = examVariation[Number(exams1[i].examVariation)];
      inst["startTime"] = moment(exams1[i].startTime).format("LLL");
      inst["subjectName"] = exams1[0].subjectId.name;
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
  } else if (type == 2) {
    try {
      count = await Exam.find({
        $and: [
          { status: true },
          { subjectId: subjectId },
          { examType: variation },
          { examVariation: 2 },
          { startTime: { $gt: timer } },
        ],
      }).count();
    } catch (err) {
      return res.status(500).json("something went wrong.");
    }
    if (count == 0) return res.status(404).json("No data found.");
    let paginateData = pagination(count, page);
    let exams1 = null;
    exams1 = await Exam.find(
      {
        $and: [
          { status: true },
          { subjectId: subjectId },
          { examType: variation },
          { examVariation: 2 },
          { startTime: { $gt: timer } },
        ],
      },
      "name examVariation startTime endTime examType"
    ).populate("courseId subjectId");
    // .skip(paginateData.skippedIndex)
    // .limit(paginateData.limit)
    let exams = [];
    for (let i = 0; i < exams1.length; i++) {
      //exams[i].examType
      let inst = {};
      inst["name"] = exams1[i].name;
      inst["examVariation"] = examType[Number(exams1[i].examType)];
      inst["examType"] = examVariation[Number(exams1[i].examVariation)];
      inst["startTime"] = moment(exams1[i].startTime).format("LLL");
      inst["subjectName"] = exams1[0].subjectId.name;
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
  } else {
    try {
      count = await BothExam.find({
        $and: [
          { status: true },
          { subjectId: subjectId },
          { examType: variation },
          { examVariation: 3 },
          { startTime: { $gt: timer } },
        ],
      }).count();
    } catch (err) {
      return res.status(500).json("something went wrong.");
    }
    if (count == 0) return res.status(404).json("No data found.");
    let paginateData = pagination(count, page);
    let exams1 = null;
    exams1 = await BothExam.find(
      {
        $and: [
          { status: true },
          { subjectId: subjectId },
          { examType: variation },
          { examVariation: 3 },
          { startTime: { $gt: timer } },
        ],
      },
      "name examVariation startTime endTime examType"
    ).populate("courseId subjectId");
    // .skip(paginateData.skippedIndex)
    // .limit(paginateData.limit)
    let exams = [];
    for (let i = 0; i < exams1.length; i++) {
      //exams[i].examType
      let inst = {};
      inst["name"] = exams1[i].name;
      inst["examVariation"] = examType[Number(exams1[i].examType)];
      inst["examType"] = examVariation[Number(exams1[i].examVariation)];
      inst["startTime"] = moment(exams1[i].startTime).format("LLL");
      inst["subjectName"] = exams1[0].subjectId.name;
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
  }
};
const examByCourseSubject = async (req, res, next) => {
  const { courseId, subjectId } = req.query;
  if (!ObjectId.isValid(subjectId) || !ObjectId.isValid(courseId))
    return res.status(404).json("subject Id or course Id is not valid.");
  const courseIdObj = new mongoose.Types.ObjectId(courseId);
  const subjectIdObj = new mongoose.Types.ObjectId(subjectId);
  let page = Number(req.query.page) || 1;
  let count = 0;
  try {
    count = await Exam.find({
      $and: [
        { courseId: courseIdObj },
        { subjectId: subjectIdObj },
        { status: true },
      ],
    }).count();
  } catch (err) {
    return res.status(500).json("Something went wrong.");
  }
  if (count == 0) return res.status(500).json("No data found.");
  let paginateData = pagination(count, page);
  let examData;
  try {
    examData = await Exam.find({
      $and: [
        { courseId: courseIdObj },
        { subjectId: subjectIdObj },
        { status: true },
      ],
    })
      .sort({ createdAt: "desc" })
      .skip(paginateData.skippedIndex)
      .limit(paginateData.perPage)
      .populate("courseId subjectId")
      .exec();
  } catch (err) {
    return res.status(500).json("Something went wrong.");
  }
  let result = [];
  if (examData.length == 0)
    return res
      .status(404)
      .json("Not found any Exam under the course and subject.");
  for (let i = 0; i < examData.length; i++) {
    let data = {};
    data["examId"] = examData[i]._id;
    data["examName"] = examData[i].name;
    data["courseId"] = examData[i].courseId._id;
    data["courseName"] = examData[i].courseId.name;
    data["subjectId"] = examData[i].subjectId._id;
    data["subjectName"] = examData[i].subjectId.name;
    data["status"] = examData[i].status;
    data["sscStatus"] = examData[i].sscStatus;
    data["hscStatus"] = examData[i].hscStatus;
    data["iLink"] = examData[i].iLink;
    data["startTime"] = examData[i].startTime;
    data["endTime"] = examData[i].endTime;
    data["examType"] = examData[i].examType;
    data["examVariation"] = examData[i].variation;
    data["duration"] = examData[i].duration;
    data["examFreeOrNot"] = examData[i].examFreeOrNot;
    data["totalQuestionMcq"] = examData[i].totalQuestionMcq;
    data["marksPerMcq"] = examData[i].marksPerMcq;
    data["totalMarksMcq"] = examData[i].totalMarksMcq;
    data["createdAt"] = examData[i].createdAt;
    result.push(data);
  }
  result.push({ examCount: examData.length });
  return res.status(200).json({ result, paginateData });
};
const slotAvailable = async (req, res, next) => {
  let numberOfSlotAvailable, mcqQData;

  const { examId, setName } = req.query;
  let setName1 = parseInt(setName);

  let examDetails = {};

  try {
    examDetails = await Exam.findOne({
      _id: new mongoose.Types.ObjectId(examId),
    });
  } catch (error) {
    return res.status(404).json("Problem with exam settings");
  }
  if (examDetails) {
    try {
      mcqQData = await McqQuestionVsExam.findOne({
        eId: examId,
        setName: setName1,
      }).select("mId");
    } catch (err) {
      return res.status(500).json(err);
    }
    if (mcqQData) {
      numberOfSlotAvailable =
        examDetails.totalQuestionMcq - mcqQData.mId.length;
    } else {
      numberOfSlotAvailable = examDetails.totalQuestionMcq;
    }
  }
  if (numberOfSlotAvailable === 0) {
    return res.status(200).json({ slots: numberOfSlotAvailable });
  } else if (numberOfSlotAvailable === 1) {
    return res.status(200).json({ slots: numberOfSlotAvailable });
  } else {
    return res.status(200).json({ slots: numberOfSlotAvailable });
  }
};
const addQuestionMcq = async (req, res, next) => {
  let iLinkPath = null;
  let explanationILinkPath = null;
  let examIdObj;
  // console.log(req.file);
  //let type = req.query.type;
  let question;
  let mcqQData,
    doc1,
    mId,
    mIdNew = [];
  const {
    questionText,
    optionCount,
    correctOption,
    status,
    examId,
    type,
    setName,
  } = req.body;
  //const examId = req.body.examId;
  let setName1 = parseInt(setName);

  let examDetails = {};

  try {
    examDetails = await Exam.findOne({
      _id: new mongoose.Types.ObjectId(examId),
    });
  } catch (error) {
    return res.status(404).json("Problem with exam settings");
  }
  if (examDetails) {
    try {
      mcqQData = await McqQuestionVsExam.findOne({
        eId: examId,
        setName: setName1,
      }).select("mId");
    } catch (err) {
      return res.status(500).json(err);
    }
    // console.log(mcqQData);
    if (mcqQData !== null) {
      if (mcqQData.mId.length >= examDetails.totalQuestionMcq) {
        return res.status(405).json("Set of Question reached the limit");
      }
    }
  }
  let options = JSON.parse(req.body.options);
  if (!ObjectId.isValid(examId))
    return res.status(404).json("examId Id is not valid.");
  const file = req.file;
  //question insert for text question(type=true)
  if (JSON.parse(type) == true) {
    question = questionText;
  } else {
    if (!file) {
      return res.status(404).json("Question File not uploaded.");
    }

    //iLinkPath = "uploads/".concat(file.filename);
    iLinkPath = "questions/" + String(examId) + "/" + file.filename;

    question = iLinkPath;
    options = [];
  }
  examIdObj = new mongoose.Types.ObjectId(examId);
  //insert question
  let questions = new QuestionsMcq({
    question: question,
    optionCount: Number(optionCount),
    options: options,
    correctOption: Number(correctOption), //index value
    explanationILink: explanationILinkPath,
    status: JSON.parse(status),
    type: JSON.parse(type),
  });
  let doc;
  try {
    doc = await questions.save();
  } catch (err) {
    ////console.log(err);
    return res.status(500).json(err);
  }
  //end of insert question
  //insert question to reference mcqquestionexam table
  let questionId = doc._id;
  if (!questionId) return res.status(400).send("question not inserted");

  // console.log(mcqQData);
  if (mcqQData == null) {
    mIdNew.push(questionId);
    let questionExam = new McqQuestionVsExam({
      eId: examId,
      mId: mIdNew,
      setName: parseInt(setName),
    });
    try {
      doc1 = await questionExam.save();
    } catch (err) {
      return res.status(500).json(err);
    }
  } else {
    mId = mcqQData.mId;
    mIdNew = mId;
    mIdNew.push(questionId);
    try {
      doc1 = await McqQuestionVsExam.updateOne(
        { eId: examIdObj, setName: setName1 },
        { $set: { mId: mIdNew } }
      );
    } catch (err) {
      return res.status(500).json(err);
    }
  }
  // console.log(setName);
  return res.status(201).json("Saved.");
};
const addQuestionMcqBulk = async (req, res, next) => {
  const { questionArray, examId, setName } = req.body;
  let examIdObj = new mongoose.Types.ObjectId(examId);
  let finalIds = [];
  let examDetails;
  try {
    examDetails = await Exam.findOne({ _id: examIdObj });
  } catch {
    return res.status(404).json("Cannot transfer to this exam");
  }

  // totalQuestionMcq
  for (let i = 0; i < questionArray.length; i++) {
    if (ObjectId.isValid(questionArray[i]))
      finalIds.push(new mongoose.Types.ObjectId(questionArray[i]));
    else continue;
  }
  if (finalIds.length > examDetails.totalQuestionMcq) {
    return res
      .status(400)
      .json(`You can transfer more than ${examDetails.totalQuestionMcq} `);
  }
  ////console.log(finalIds);
  if (finalIds.length == 0)
    return res.status(404).json("question IDs is not valid.");
  let mIdArray = null;
  try {
    mIdArray = await McqQuestionVsExam.findOne(
      { eId: examIdObj, setName: setName },
      "mId"
    );
  } catch (err) {
    return res.status(500).json(err);
  }

  if (mIdArray == null) {
    const newExamQuestinon = new McqQuestionVsExam({
      eId: examIdObj,
      mId: finalIds,
      setName: Number(setName),
    });
    let sav = null;
    try {
      sav = await newExamQuestinon.save();
    } catch (err) {
      return res
        .status(500)
        .json("DB problem Occur when new question insert in exam table.");
    }
    return res.status(201).json("Success.");
  }
  ////console.log(mIdArray);
  mIdArray = mIdArray.mId;
  const prevLength = mIdArray.length;
  let finalIdsString = [];
  finalIdsString = finalIds.map((e) => String(e));
  mIdArray = mIdArray.map((e) => String(e));
  mIdArray = mIdArray.concat(finalIdsString);
  let withoutDuplicate = Array.from(new Set(mIdArray));
  withoutDuplicate = withoutDuplicate.map(
    (e) => new mongoose.Types.ObjectId(e)
  );
  console.log("wd", withoutDuplicate.length);
  const totalLength = prevLength + withoutDuplicate.length;
  console.log("tt", totalLength);
  const reaminingLength =
    examDetails.totalQuestionMcq - withoutDuplicate.length;
  if (withoutDuplicate.length > examDetails.totalQuestionMcq) {
    return res.status(400).json(`You can transfer atmost ${reaminingLength}`);
  }
  try {
    sav = await McqQuestionVsExam.updateOne(
      { eId: examId, setName: setName },
      {
        mId: withoutDuplicate,
      }
    );
  } catch (err) {
    return res.status(500).json(err);
  }
  return res.status(201).json("Inserted question to the exam.");
};
const refillQuestion = async (req, res, next) => {
  const { examId } = req.body;
  let examIdObj = new mongoose.Types.ObjectId(examId);
  let mIdArray = [];
  let noOfQuestions = null;
  let noOfSet = null;
  try {
    mIdArray = await McqQuestionVsExam.find({ eId: examIdObj }, "mId");
    const exam = await Exam.findById(examId);
    noOfQuestions = exam.totalQuestionMcq;
    noOfSet = exam.numberOfSet;
  } catch (err) {
    return res.status(500).json(err);
  }
  if (mIdArray.length == 0)
    return res.status(404).json("Please at least fill one set.");
  if (mIdArray.length > 1)
    return res
      .status(404)
      .json("Cant refill questions.Already added.Please check.");
  if (mIdArray[0].mId.length == 0)
    return res.status(404).json("No Active questions found.");
  if (noOfQuestions != mIdArray[0].mId.length)
    return res
      .status(404)
      .json(
        "Total number of questions & first set all questions number are not same."
      );
  let setNo = mIdArray[0].setName;
  mIdArray = mIdArray[0].mId;
  for (let i = 0; i < noOfSet && i != Number(setNo); i++) {
    let shuffledArray = shuffle(mIdArray);
    let getSetName = Number(i);
    let questionExam = new McqQuestionVsExam({
      eId: examIdObj,
      mId: shuffledArray,
      setName: parseInt(getSetName),
    });
    try {
      doc1 = await questionExam.save();
    } catch (err) {
      return res.status(500).json(err);
    }
  }

  return res.status(201).json("Inserted question to the exam's all sets.");
};

const getAllData = async (req, res, next) => {
  const examId = req.query.examId;
  const setName = Number(req.query.setName);
  const result = await McqQuestionVsExam.find({
    eId: examId,
    setName: setName,
  });
  res.status(200).json(result);
};
//exam rule page
const examRuleSet = async (req, res, next) => {
  const file = req.file;
  let ruleILinkPath = null;
  if (file) {
    ruleILinkPath = "uploads/".concat(file.filename);
  }

  ////console.log(ruleILinkPath);
  const examId = req.body.examId;
  if (!ObjectId.isValid(examId))
    return res.status(404).json("exam Id is not valid.");
  const examIdObj = new mongoose.Types.ObjectId(examId);
  let existingElem = null;
  try {
    existingElem = await ExamRule.findOne({ examId: examIdObj });
  } catch (err) {
    return re.status(500).json(err);
  }

  if (existingElem == null) {
    let examRule = new ExamRule({
      examId: examIdObj,
      ruleILink: ruleILinkPath,
    });
    let data = null;
    try {
      data = await examRule.save();
    } catch (err) {
      return res.status(500).json(err);
    }
    return res.status(201).json({ inserted: data });
  } else {
    let data = null;
    try {
      data = await ExamRule.updateOne(
        { examId: examIdObj },
        { ruleILink: ruleILinkPath }
      );
    } catch (err) {
      return res.status(500).json(err);
    }
    return res.status(201).json({ updated: data });
  }
};

const examRuleGet = async (req, res, next) => {
  let examId = req.query.examId;
  if (!ObjectId.isValid(examId))
    return res.status(422).json("exam Id is not valid.");
  let examIdObj = new mongoose.Types.ObjectId(examId);
  let data = null;
  try {
    data = await ExamRule.findOne({ examId: examIdObj });
  } catch (err) {
    return res.status(500).json(err);
  }
  // if (data) return res.status(200).json(data.ruleILink);
  // else return res.status(404).json("No data found.");
  return res.status(200).json(data);
};
const examRuleGetAll = async (req, res, next) => {
  let page = req.query.page;
  let skippedItem;
  if (page == null) {
    page = Number(1);
    skippedItem = (page - 1) * Limit;
  } else {
    page = Number(page);
    skippedItem = (page - 1) * Limit;
  }
  let data = [];
  try {
    data = await ExamRule.find({}).skip(skippedItem).limit(Limit);
  } catch (err) {
    return res.status(500).json(err);
  }
  if (data) return res.status(200).json(data);
  else return res.status(404).json("No data found.");
};
//add wriiten question function
const addQuestionWritten = async (req, res, next) => {
  let examId = req.body.examId;
  examId = new mongoose.Types.ObjectId(examId);
  let existData = null;
  try {
    existData = await QuestionsWritten.findOne({
      $and: [{ examId: examId }, { status: true }],
    });
  } catch (err) {
    return res.status(500).json("1.Something went wrong.");
  }
  if (existData) return res.status(404).json("Already added question.");
  if (!ObjectId.isValid(examId))
    return res.status(404).json("Exam Id is not valid.");
  const status = req.body.status;
  const totalQuestions = req.body.totalQuestions;
  let marksPerQuestion = req.body.marksPerQuestion; //array
  // for (let i = 0; i < marksPerQuestion.length; i++) {
  //   marksPerQuestion[i] = parseInt(marksPerQuestion[i]);
  // }
  marksPerQuestion = marksPerQuestion.split(",");
  ////console.log(marksPerQuestion);
  const totalMarks = req.body.totalMarks;
  //file upload handle
  const file = req.files;
  ////console.log(file);
  let questionILinkPath = null;
  // //console.log(file.questionILink[0].filename);
  // return res.status(201).json("Ok");
  if (!file.questionILink[0].filename)
    return res.status(400).json("File not uploaded.");
  //questionILinkPath = "uploads/".concat(file.questionILink[0].filename);
  questionILinkPath =
    "questions/" + String(examId) + "/" + file.questionILink[0].filename;
  //written question save to db table
  console.log("totalQuestions:", totalQuestions);
  let question = new QuestionsWritten({
    questionILink: questionILinkPath,
    status: status,
    totalQuestions: totalQuestions,
    marksPerQuestion: marksPerQuestion,
    totalMarks: totalMarks,
    examId: examId,
  });
  let doc;
  try {
    doc = await question.save();
  } catch (err) {
    console.log(err);
    return res.status(500).json("2.Something went wrong!");
  }
  return res.status(200).json("Question save correctly.");
};
const removeQuestionWritten = async (req, res, next) => {
  let examId = req.body.examId;
  if (!ObjectId.isValid(examId))
    return res.status(404).json("Exam Id is not valid.");
  examId = new mongoose.Types.ObjectId(examId);
  // let currentTime = new Date(moment(new Date()).add(6, "hours")).toISOString();
  // let examTime = null;
  // //console.log(currentTime);
  // try {
  //   examTime = await Exam.findOne({
  //     $and: [{ examId: examId }, { startTime: { $gt: currentTime } }],
  //   });
  // } catch (err) {
  //   return res.status(500).json("SOmething went wrong.");
  // }
  // //console.log(examTime);
  // if (!examTime)
  //   return res.status(404).json("Cannot remove question.Exam Already started.");
  let remove = null;
  try {
    remove = await QuestionsWritten.findOneAndRemove({ examId: examId });
  } catch (err) {
    return res.status(500).json("SOmething went wrong.");
  }
  return res.status(200).json("Successfully removed question from the exam.");
};
const getWrittenQuestionByexam = async (req, res, next) => {
  let writtenQuestion = null;
  let examId = req.query.examId;
  examId = new mongoose.Types.ObjectId(examId);
  try {
    writtenQuestion = await QuestionsWritten.findOne({
      examId: examId,
    }).populate("examId");
  } catch (err) {
    return res.status(500).json("SOmething went wrong.");
  }
  if (writtenQuestion == null) return res.status(404).json("No data found.");
  return res.status(200).json(writtenQuestion);
};
const assignStudentToTeacher10 = async (req, res, next) => {
  //new code
  let examId = req.body.examId;
  let teacherId = req.body.teacherId;
  //console.log(req.body);
  //console.log(examId);
  //console.log(examId);
  if (!ObjectId.isValid(examId) || teacherId.length == 0)
    return res.status(404).json("Exam Id or Teacher Id is not valid.");
  let examIdObj = new mongoose.Types.ObjectId(examId);
  let assignedTeacher = null;
  try {
    assignedTeacher = await TeacherVsExam.find({
      $and: [{ examId: examIdObj }],
    });
  } catch (err) {
    return res.status(500).json("Somethhing went wrong.");
  }
  //console.log(assignedTeacher.length);
  //console.log("aaa:", assignedTeacher);
  if (assignedTeacher.length > 0) {
    let del = null;
    try {
      del = await TeacherVsExam.deleteMany({ examId: examIdObj });
    } catch (err) {
      return res.status(500).json("Somethhing went wrong.");
    }
  }
  //console.log("teache", teacherId.length);
  let count = 0;
  try {
    count = await StudentExamVsQuestionsWritten.find({
      examId: examId,
    }).count();
  } catch (err) {
    return res.status(500).json("Something went wrong.");
  }
  if (count == 0)
    return res.status(404).json("No Student participate in the exam.");

  let students = null;
  try {
    students = await StudentExamVsQuestionsWritten.find({
      examId: examId,
    }).select("studentId -_id");
  } catch (err) {
    return res.status(500).json("Something went wrong.");
  }
  //console.log(students);
  let studData = [];
  for (let i = 0; i < students.length; i++) {
    studData[i] = students[i].studentId;
  }
  //console.log(studData);
  students = studData;
  //console.log(students);

  let range = parseInt(students.length / teacherId.length);
  let start = 0;
  let end = range;
  //console.log(start);
  //console.log(end);
  let teacherStudentArr = [];
  for (let i = 0; i < teacherId.length; i++) {
    if (i == 0) {
      start = 0;
      end = range;
    } else if (parseInt(teacherId.length - i) == 1) {
      start = end;
      end = end + range + parseInt(students.length % teacherId.length);
    } else {
      start = end;
      end = end + range;
    }
    let teacherStudent = {};
    teacherStudent["examId"] = examId;
    teacherStudent["teacherId"] = new mongoose.Types.ObjectId(teacherId[i]);
    let std = [];
    for (let j = start; j < end; j++) {
      std.push(students[j]);
    }
    //console.log(std);
    teacherStudent["studentId"] = std;
    teacherStudentArr.push(teacherStudent);
    //console.log("s", start);
    //console.log("e", end);
  }
  let doc = null;
  try {
    doc = await TeacherVsExam.insertMany(teacherStudentArr, { ordered: false });
  } catch (err) {
    return res.status(500).json("1.Something went wrong.");
  }
  return res
    .status(201)
    .json("Successfully assign all student to the teacher.");
};
const assignStudentToTeacher = async (req, res, next) => {
  //new code
  let examId = req.body.examId;
  let teacherId = req.body.teacherId;
  //console.log(req.body);
  //console.log(examId);
  //console.log(examId);
  if (!ObjectId.isValid(examId) || teacherId.length == 0)
    return res.status(404).json("Exam Id or Teacher Id is not valid.");
  let examIdObj = new mongoose.Types.ObjectId(examId);
  let assignedTeacher = null;
  try {
    assignedTeacher = await TeacherVsExam.find({
      $and: [{ examId: examIdObj }],
    });
  } catch (err) {
    return res.status(500).json("Somethhing went wrong.");
  }
  //console.log(assignedTeacher.length);
  //console.log("aaa:", assignedTeacher);
  if (assignedTeacher.length > 0) {
    let del = null;
    try {
      del = await TeacherVsExam.deleteMany({ examId: examIdObj });
    } catch (err) {
      return res.status(500).json("Somethhing went wrong.");
    }
  }
  // let unuploadedStudent = [];
  // let unuploadedStudent1 = [];
  // try {
  //   unuploadedStudent = await StudentExamVsQuestionsWritten.find({
  //     $and: [{ examId: examIdObj }, { uploadStatus: false }],
  //   });
  //   for (let i = 0; i < unuploadedStudent.length; i++) {
  //     unuploadedStudent1.push(unuploadedStudent[i].studentId);
  //   }
  //   delObj = await StudentExamVsQuestionsWritten.deleteMany({
  //     studentId: { $in: unuploadedStudent1 },
  //   });
  //   delObj1 = await StudentMarksRank.deleteMany({
  //     studentId: { $in: unuploadedStudent1 },
  //   });
  // } catch (err) {
  //   return res.status(500).json("Something went wrong.");
  // }
  //console.log("teache", teacherId.length);
  let count = 0;
  let dataAll = [];
  let questionNo = null;
  try {
    dataAll = await StudentExamVsQuestionsWritten.find({
      examId: examId,
    });
    questionNo = await QuestionsWritten.findOne({ examId: examIdObj });
  } catch (err) {
    return res.status(500).json("Something went wrong.");
  }
  questionNo = questionNo.totalQuestions;
  let nullStudentId = [];
  let students = [],
    studData = [];
  for (let i = 0; i < dataAll.length; i++) {
    if (checkIfEmpty(dataAll[i].submittedScriptILink) == true) {
      nullStudentId.push(dataAll[i].studentId);
    } else {
      count++;
      studData.push(dataAll[i].studentId);
    }
  }
  console.log("asdasdasda", count, nullStudentId.length);
  if (count == 0 && nullStudentId.length == 0)
    return res
      .status(404)
      .json("No Student participate in the exam or all Scripts are empty.");

  // for (let i = 0; i < dataAll.length; i++) {
  //   if (dataAll[i].submittedScriptILink.length == 0) continue;
  //   studData.push(dataAll[i].studentId);
  // }
  if (nullStudentId.length != 0) {
    let obtainedMarksPerQuestion = [];
    for (let j = 0; j < questionNo; j++) {
      obtainedMarksPerQuestion[j] = 0;
    }
    let upd = null;
    try {
      upd = await StudentExamVsQuestionsWritten.updateMany(
        { studentId: { $in: nullStudentId } },
        {
          $set: {
            obtainedMarks: obtainedMarksPerQuestion,
            totalObtainedMarks: 0,
            checkStatus: true,
          },
        }
      );
    } catch (err) {
      return res.status(500).json("Something went wrong.");
    }
  }
  //console.log(studData);
  students = studData;
  //console.log(students);

  let range = parseInt(students.length / teacherId.length);
  let start = 0;
  let end = range;
  //console.log(start);
  //console.log(end);
  let teacherStudentArr = [];
  for (let i = 0; i < teacherId.length; i++) {
    if (i == 0) {
      start = 0;
      end = range;
    } else if (parseInt(teacherId.length - i) == 1) {
      start = end;
      end = end + range + parseInt(students.length % teacherId.length);
    } else {
      start = end;
      end = end + range;
    }
    let teacherStudent = {};
    teacherStudent["examId"] = examId;
    teacherStudent["teacherId"] = new mongoose.Types.ObjectId(teacherId[i]);
    let std = [];
    for (let j = start; j < end; j++) {
      std.push(students[j]);
    }
    //console.log(std);
    teacherStudent["studentId"] = std;
    teacherStudentArr.push(teacherStudent);
    //console.log("s", start);
    //console.log("e", end);
  }
  let doc = null;
  try {
    doc = await TeacherVsExam.insertMany(teacherStudentArr, { ordered: false });
  } catch (err) {
    return res.status(500).json("1.Something went wrong.");
  }
  return res
    .status(201)
    .json("Successfully assign all student to the teacher.");
};

const bothAssignStudentToTeacher10 = async (req, res, next) => {
  //new code
  let examId = req.body.examId;
  let teacherId = req.body.teacherId;
  //console.log(req.body);
  //console.log(examId);
  //console.log(examId);
  if (!ObjectId.isValid(examId) || teacherId.length == 0)
    return res.status(404).json("Exam Id or Teacher Id is not valid.");
  let examIdObj = new mongoose.Types.ObjectId(examId);
  let assignedTeacher = null;
  try {
    assignedTeacher = await BothTeacherVsExam.find({
      $and: [{ examId: examIdObj }],
    });
  } catch (err) {
    return res.status(500).json("Somethhing went wrong.");
  }
  //console.log(assignedTeacher.length);
  //console.log("aaa:", assignedTeacher);
  if (assignedTeacher.length > 0) {
    let del = null;
    try {
      del = await BothTeacherVsExam.deleteMany({ examId: examIdObj });
    } catch (err) {
      return res.status(500).json("Somethhing went wrong.");
    }
  }
  //console.log("teache", teacherId.length);
  let count = 0;
  try {
    count = await BothStudentExamVsQuestions.find({
      examId: examId,
    }).count();
  } catch (err) {
    return res.status(500).json("Something went wrong.");
  }
  if (count == 0)
    return res.status(404).json("No Student participate in the exam.");

  let students = null;
  try {
    students = await BothStudentExamVsQuestions.find({
      examId: examId,
    }).select("studentId -_id");
  } catch (err) {
    return res.status(500).json("Something went wrong.");
  }
  //console.log(students);
  let studData = [];
  for (let i = 0; i < students.length; i++) {
    studData[i] = students[i].studentId;
  }
  //console.log(studData);
  students = studData;
  //console.log(students);

  let range = parseInt(students.length / teacherId.length);
  let start = 0;
  let end = range;
  //console.log(start);
  //console.log(end);
  let teacherStudentArr = [];
  for (let i = 0; i < teacherId.length; i++) {
    if (i == 0) {
      start = 0;
      end = range;
    } else if (parseInt(teacherId.length - i) == 1) {
      start = end;
      end = end + range + parseInt(students.length % teacherId.length);
    } else {
      start = end;
      end = end + range;
    }
    let teacherStudent = {};
    teacherStudent["examId"] = examId;
    teacherStudent["teacherId"] = new mongoose.Types.ObjectId(teacherId[i]);
    let std = [];
    for (let j = start; j < end; j++) {
      std.push(students[j]);
    }
    //console.log(std);
    teacherStudent["studentId"] = std;
    teacherStudentArr.push(teacherStudent);
    //console.log("s", start);
    //console.log("e", end);
  }
  let doc = null;
  try {
    doc = await BothTeacherVsExam.insertMany(teacherStudentArr, {
      ordered: false,
    });
  } catch (err) {
    return res.status(500).json("1.Something went wrong.");
  }
  return res
    .status(201)
    .json("Successfully assign all student to the teacher.");
};

const bothAssignStudentToTeacher = async (req, res, next) => {
  //new code
  let examId = req.body.examId;
  let teacherId = req.body.teacherId;
  //console.log(req.body);
  //console.log(examId);
  //console.log(examId);
  if (!ObjectId.isValid(examId) || teacherId.length == 0)
    return res.status(404).json("Exam Id or Teacher Id is not valid.");
  let examIdObj = new mongoose.Types.ObjectId(examId);
  let assignedTeacher = null;
  // let del1 = null;
  // try {
  //   del1 = await BothStudentExamVsQuestions.deleteMany({
  //     $and: [{ examId: examIdObj }, { uploadStatus: false }],
  //   });
  // } catch (err) {
  //   console.log(err);
  //   return res.status(500).json("Something went wrong.");
  // }
  try {
    assignedTeacher = await BothTeacherVsExam.find({
      $and: [{ examId: examIdObj }],
    });
  } catch (err) {
    return res.status(500).json("Somethhing went wrong.");
  }
  //console.log(assignedTeacher.length);
  //console.log("aaa:", assignedTeacher);
  if (assignedTeacher.length > 0) {
    let del = null;
    let delObj = null;
    try {
      del = await BothTeacherVsExam.deleteMany({ examId: examIdObj });
    } catch (err) {
      return res.status(500).json("Somethhing went wrong.");
    }
  }
  //console.log("teache", teacherId.length);
  let count = 0;
  let dataAll = [];
  let questionNo = null;
  try {
    dataAll = await BothStudentExamVsQuestions.find({
      examId: examId,
    });
    questionNo = await BothQuestionsWritten.findOne({ examId: examIdObj });
  } catch (err) {
    return res.status(500).json("Something went wrong.");
  }
  questionNo = questionNo.totalQuestions;
  let nullStudentId = [];
  //13-03-2024
  let students = [],
    studData = [];
  for (let i = 0; i < dataAll.length; i++) {
    if (checkIfEmpty(dataAll[i].submittedScriptILink) == true) {
      nullStudentId.push(dataAll[i].studentId);
    } else {
      count++;
      studData.push(dataAll[i].studentId);
    }
  } //13-03-2024
  // for (let i = 0; i < dataAll.length; i++) {
  //   if (dataAll[i].submittedScriptILink.length > 0) {
  //     count++;
  //   } else {
  //     nullStudentId.push(dataAll[i].studentId);
  //   }
  // }
  if (count == 0 && nullStudentId.length == 0)
    return res
      .status(404)
      .json("No Student participate in the exam or No students upload paper.");
  // for (let i = 0; i < dataAll.length; i++) {
  //   if (dataAll[i].submittedScriptILink.length > 0) {
  //     studData.push(dataAll[i].studentId);
  //   }
  // }
  if (nullStudentId.length > 0) {
    let obtainedMarksPerQuestion = [];
    for (let j = 0; j < questionNo; j++) {
      obtainedMarksPerQuestion[j] = 0;
    }
    let upd = null;
    try {
      upd = await BothStudentExamVsQuestions.updateMany(
        { studentId: { $in: nullStudentId } },
        {
          $set: {
            obtainedMarks: obtainedMarksPerQuestion,
            totalObtainedMarksWritten: 0,
            checkStatus: true,
          },
        }
      );
    } catch (err) {
      return res.status(500).json("Something went wrong.");
    }
  }
  //console.log(studData);
  students = studData;
  //console.log(students);

  let range = parseInt(students.length / teacherId.length);
  let start = 0;
  let end = range;
  //console.log(start);
  //console.log(end);
  let teacherStudentArr = [];
  for (let i = 0; i < teacherId.length; i++) {
    if (i == 0) {
      start = 0;
      end = range;
    } else if (parseInt(teacherId.length - i) == 1) {
      start = end;
      end = end + range + parseInt(students.length % teacherId.length);
    } else {
      start = end;
      end = end + range;
    }
    let teacherStudent = {};
    teacherStudent["examId"] = examId;
    teacherStudent["teacherId"] = new mongoose.Types.ObjectId(teacherId[i]);
    let std = [];
    for (let j = start; j < end; j++) {
      std.push(students[j]);
    }
    //console.log(std);
    teacherStudent["studentId"] = std;
    teacherStudentArr.push(teacherStudent);
    //console.log("s", start);
    //console.log("e", end);
  }
  let doc = null;
  try {
    doc = await BothTeacherVsExam.insertMany(teacherStudentArr, {
      ordered: false,
    });
  } catch (err) {
    return res.status(500).json("1.Something went wrong.");
  }
  return res
    .status(201)
    .json("Successfully assign all student to the teacher.");
};

const assignTeacher = async (req, res, next) => {
  let examId = req.body.examId;
  let teacherId = req.body.teacherId;
  //console.log(req.body);
  //console.log(examId);
  //console.log(examId);
  if (!ObjectId.isValid(examId) || teacherId.length == 0)
    return res.status(404).json("Exam Id or Teacher Id is not valid.");
  let examIdObj = new mongoose.Types.ObjectId(examId);
  for (let i = 0; i < teacherId.length; i++) {
    let teacher = new mongoose.Types.ObjectId(teacherId.length);
    let assignedTeacher = null;
    try {
      assignedTeacher = teacherVsExam.findOne({
        $and: [{ examId: examIdObj }, { teacherId: teacher }],
      });
    } catch (err) {
      return res.status(500).json("Somethhing went wrong.");
    }
    if (!assignedTeacher) continue;
    let teacherVsExam = new TeacherVsExam({
      examId: examIdObj,
      teacherId: teacher,
    });
    let data = null;
    try {
      data = teacherVsExam.save();
    } catch (err) {
      return res.status(500).json("Somethhing went wrong.");
    }
  }
  return res.status(201).json("Successfully assign teacher to exam.");
};

//view questions
const questionByExamId = async (req, res, next) => {
  const examId = req.query.examId;
  if (!ObjectId.isValid(examId))
    return res.status(404).json("exam Id is not valid.");
  const examIdObj = new mongoose.Types.ObjectId(examId);
  let queryResult = null;

  try {
    queryResult = await McqQuestionVsExam.findOne({ eId: examId }).populate({
      path: "mId",
      match: { status: { $eq: true } },
    });
  } catch (err) {
    return res.status(500).json(err);
  }
  if (queryResult == null) return res.status(404).json("No Question added.");
  let resultAll = [];
  for (let i = 0; i < queryResult.mId.length; i++) {
    let result = {};
    // if (queryResult.mId[i] == null) continue;
    result["type"] = queryResult.mId[i].type;
    result["question"] = queryResult.mId[i].question;
    result["options"] = queryResult.mId[i].options;
    result["correctOption"] = queryResult.mId[i].correctOption;
    result["explanation"] = queryResult.mId[i].explanationILink;
    result["questionId"] = queryResult.mId[i]._id;
    result["status"] = queryResult.mId[i].status;
    result["setName"] = queryResult.setName;
    resultAll.push(result);
  }
  // resultAll.push({ totalQuestion: queryResult.mId.length });
  // resultAll.push({ examId: String(queryResult.eId) });
  return res.status(200).json(resultAll);
};

const questionByExamIdAndSet = async (req, res, next) => {
  const examId = req.query.examId;
  const setName = Number(req.query.setName);
  if (!ObjectId.isValid(examId))
    return res.status(404).json("exam Id is not valid.");
  const examIdObj = new mongoose.Types.ObjectId(examId);
  let queryResult = null;

  try {
    queryResult = await McqQuestionVsExam.findOne({
      eId: examId,
      setName: setName,
    }).populate({
      path: "mId",
      match: { status: { $eq: true } },
    });
  } catch (err) {
    return res.status(500).json(err);
  }
  if (queryResult == null) return res.status(404).json("No Question added.");
  let resultAll = [];
  for (let i = 0; i < queryResult.mId.length; i++) {
    let result = {};
    // if (queryResult.mId[i] == null) continue;
    result["type"] = queryResult.mId[i].type;
    result["question"] = queryResult.mId[i].question;
    result["options"] = queryResult.mId[i].options;
    result["correctOption"] = queryResult.mId[i].correctOption;
    result["explanation"] = queryResult.mId[i].explanationILink;
    result["questionId"] = queryResult.mId[i]._id;
    result["status"] = queryResult.mId[i].status;
    result["optionCount"] = queryResult.mId[i].optionCount;
    resultAll.push(result);
  }
  // resultAll.push({ totalQuestion: queryResult.mId.length });
  // resultAll.push({ examId: String(queryResult.eId) });
  return res.status(200).json(resultAll);
};

const updateQuestionStatus = async (req, res, next) => {
  const questionId = req.body.questionId;
  const examId = req.body.examId;
  // console.log(examId);
  const examIdObj = new mongoose.Types.ObjectId(examId);
  const quesObj = new mongoose.Types.ObjectId(questionId);
  if (!ObjectId.isValid(questionId))
    return res.status(404).json("question Id is not valid.");
  //const questionIdObj = new mongoose.Types.ObjectId(questionId);
  let queryResult = null;
  try {
    queryResult = await McqQuestionVsExam.find({ eId: examIdObj });
  } catch (err) {
    return res.status(500).json(err);
  }
  // console.log(quesObj);
  // console.log(queryResult);
  for (let i = 0; i < queryResult.length; i++) {
    let temp = [];
    temp = queryResult[i].mId.filter((q) => String(q) !== String(quesObj));
    // console.log(temp)
    queryResult[i].mId = temp;
  }
  for (let i = 0; i < queryResult.length; i++) {
    let res = null;
    try {
      res = await McqQuestionVsExam.findByIdAndUpdate(queryResult[i]._id, {
        mId: queryResult[i].mId,
      });
    } catch (e) {
      return res.status(500).json("Cannot find data");
    }
  }

  return res.status(201).json("Updated");
};

// const updateQuestionStatus1 = async (req, res, next) => {
//   let questionId = req.body.questionId;
//   let examId = "65f816ce34f65d878daa82e7";
//   if (!ObjectId.isValid(questionId) || !ObjectId.isValid(examId))
//     return res.status(404).json("question Id or examId is not valid.");
//   //const questionIdObj = new mongoose.Types.ObjectId(questionId);
//   //let queryResult = null;
//   examId = new mongoose.Types.ObjectId(examId);
//   let questionVsExam = null;
//   try {
//     questionVsExam = await McqQuestionVsExam.find({ eId: examId });
//   } catch (err) {
//     return res.status(500).json(err);
//   }
//   for (let i = 0; i < questionVsExam.length; i++) {
//     let mId = questionVsExam[i].mId;
//     let indexValue = mId.findIndex((e) => String(e) === String(questionId));
//     mId.splice(indexValue, 1);
//     let upd;
//     try {
//       upd = await McqQuestionVsExam.findByIdAndUpdate(questionVsExam[i]._id, {
//         $set: { mId: mId },
//       });
//     } catch (err) {
//       return res.status(500).json(err);
//     }
//   }
//   return res.status(201).json("successf");
// };

const getStudentByExam = async (req, res, next) => {
  const courseId = req.query.courseId;
  const examId = req.query.examId;
};
const freeExamStatus = async (req, res, next) => {
  let freeExamStatus = [];
  try {
    freeExamStatus = await Exam.find({
      $and: [
        { examFreeOrNot: true },
        { status: true },
        { startTime: { $gt: new Date() } },
      ],
    });
  } catch (err) {
    return res.status(500).json("Something went wrong.");
  }
  if (freeExamStatus.length > 0)
    return res.status(404).json("There is already upcoming free exam.");
  if (freeExamStatus.length == 0) return res.status(200).json(true);
  let data = String(freeExamStatus[0]._id);
  return res.status(200).json({ data });
};
const freeCourseSub = async (req, res, next) => {
  const course = req.query.course;
  const sub = req.query.sub;
  if (!course || !sub) return res.status(404).json("No Data.");
  let data = [];
  try {
    data[0] = await Course.findOne({ name: course });
  } catch (err) {
    return res.status(500).json("Something went wrong.");
  }
  try {
    data[1] = await Subject.findOne({ name: sub });
  } catch (err) {
    return res.status(500).json("Something went wrong.");
  }

  if (data.length < 1) return res.status(404).json("No Data.");
  return res.status(200).json(data);
};
const resetExam = async (req, res, next) => {
  let regNo = req.body.regNo;
  let examId = req.body.examId;
  let type = String(req.body.type);
  let studentIdObj = null;
  if (!regNo || !ObjectId.isValid(examId) || !type)
    return res.status(404).json("regNo or examId is not valid.");
  try {
    studentIdObj = await Student.findOne({ regNo: regNo });
  } catch (err) {
    return res.status(500).json("DBError.");
  }
  if (!studentIdObj) return res.status(200).json("regNo not correct.");
  studentIdObj = studentIdObj._id;
  let examIdObj = new mongoose.Types.ObjectId(examId);
  let delObj = null;
  let delObj1 = null;
  if (type == "0") {
    try {
      delObj = await StudentExamVsQuestionsMcq.deleteOne({
        $and: [{ studentId: studentIdObj }, { examId: examIdObj }],
      });
      delObj1 = await StudentMarksRank.deleteOne({
        $and: [{ studentId: studentIdObj }, { examId: examIdObj }],
      });
    } catch (err) {
      return res.status(500).json("Problem MCQ delete.");
    }
  } else if (type == "1") {
    dirUpload = dir + "/" + examId + "/" + studentIdObj;
    console.log(dirUpload);
    if (fs.existsSync(dirUpload)) {
      fs.rm(dirUpload, { recursive: true, force: true }, (err) => {
        if (err) {
          return res.status(404).json(err);
        } else console.log(`${dirUpload} is deleted!`);
      });
      return res.status(200).json("success");
    }
    try {
      delObj = await StudentExamVsQuestionsWritten.deleteOne({
        $and: [{ studentId: studentIdObj }, { examId: examIdObj }],
      });
      delObj1 = await StudentMarksRank.deleteOne({
        $and: [{ studentId: studentIdObj }, { examId: examIdObj }],
      });
    } catch (err) {
      return res.status(500).json("Problem Written delete.");
    }
  } else if (type == "2") {
    dirUpload = dir + "/" + examId + "/" + studentIdObj;
    console.log(dirUpload);
    if (fs.existsSync(dirUpload)) {
      fs.rm(dirUpload, { recursive: true, force: true }, (err) => {
        if (err) {
          return res.status(404).json(err);
        } else console.log(`${dirUpload} is deleted!`);
      });
      return res.status(200).json("success");
    }
    try {
      delObj = await BothStudentExamVsQuestions.deleteOne({
        $and: [{ studentId: studentIdObj }, { examId: examIdObj }],
      });
    } catch (err) {
      return res.status(500).json("Problem Both delete.");
    }
  } else {
    dirUpload = dir + "/" + examId + "/" + studentIdObj;
    console.log(dirUpload);
    if (fs.existsSync(dirUpload)) {
      fs.rm(dirUpload, { recursive: true, force: true }, (err) => {
        if (err) {
          return res.status(404).json(err);
        } else console.log(`${dirUpload} is deleted!`);
      });
      return res.status(200).json("success");
    }
    try {
      delObj = await SpecialVsStudent.deleteOne({
        $and: [{ studentId: studentIdObj }, { examId: examIdObj }],
      });
    } catch (err) {
      return res.status(500).json("Problem Special delete.");
    }
  }
  return res.status(200).json("Successfully reset exam for student.");
};

const changeCorrectAnswer = async (req, res, next) => {
  const { id, correctAnswer } = req.body;
  let question;
  // console.log(id,correctAnswer);
  try {
    question = await QuestionsMcq.findByIdAndUpdate(id, {
      correctOption: Number(correctAnswer),
    });
  } catch (error) {
    return res.status(400).json(error);
  }
  return res.status(201).json("Updated the question");
};

const resetExam1 = async (req, res, next) => {
  let regNo = req.body.regNo;
  let examId = req.body.examId;
  let type = String(req.body.type);
  let studentIdObj = null;
  if (!regNo || !ObjectId.isValid(examId) || !type)
    return res.status(404).json("regNo or examId is not valid.");
  try {
    studentIdObj = await Student.findOne({ regNo: regNo });
  } catch (err) {
    return res.status(500).json("DBError.");
  }
  if (!studentIdObj) return res.status(200).json("regNo not correct.");
  studentIdObj = studentIdObj._id;
  let examIdObj = new mongoose.Types.ObjectId(examId);
  let delObj = null;
  let delObj1 = null;
  if (type == "0") {
    try {
      delObj = await StudentExamVsQuestionsMcq.deleteOne({
        $and: [{ studentId: studentIdObj }, { examId: examIdObj }],
      });
      delObj1 = await StudentMarksRank.deleteOne({
        $and: [{ studentId: studentIdObj }, { examId: examIdObj }],
      });
    } catch (err) {
      return res.status(500).json("Problem MCQ delete.");
    }
  } else if (type == "1") {
    try {
      delObj = await StudentExamVsQuestionsWritten.deleteOne({
        $and: [{ studentId: studentIdObj }, { examId: examIdObj }],
      });
      delObj1 = await StudentMarksRank.deleteOne({
        $and: [{ studentId: studentIdObj }, { examId: examIdObj }],
      });
    } catch (err) {
      return res.status(500).json("Problem Written delete.");
    }
  } else if (type == "2") {
    try {
      delObj = await BothStudentExamVsQuestions.deleteOne({
        $and: [{ studentId: studentIdObj }, { examId: examIdObj }],
      });
    } catch (err) {
      return res.status(500).json("Problem Both delete.");
    }
  } else {
    try {
      delObj = await SpecialVsStudent.deleteOne({
        $and: [{ studentId: studentIdObj }, { examId: examIdObj }],
      });
    } catch (err) {
      return res.status(500).json("Problem Special delete.");
    }
  }
  return res.status(200).json("Successfully reset exam for student.");
};

const downloadExamImage = async (req, res, next) => {
  let examId = req.body.examId;
  let type = req.body.type;
  if (!ObjectId.isValid(examId) || !type)
    return res.status(404).json("ExamId is not valid.");
  let examIdObj = new mongoose.Types.ObjectId(examId);
  let data = [];
  let imageLink = [];
  let imagelink1 = [];
  let zipFile =
    "zip /Users/shahid/Desktop/node-project/BondiDb/BondiNewRepo/utilities/arch.zip";
  let path = "/Users/shahid/Desktop/node-project/BondiDb/BondiNewRepo/";
  if (Number(type) == 1) {
    try {
      data = await StudentExamVsQuestionsWritten.find({ examId: examIdObj });
    } catch (err) {
      return res.status(500).json("Something went wrong.");
    }
    //return res.status(200).json(data);
    for (let i = 0; i < data.length; i++) {
      if (data[i].submittedScriptILink.length > 0) {
        for (let j = 0; j < data[i].submittedScriptILink.length; j++) {
          imageLink.push(path + data[i].submittedScriptILink[j]);
        }
      }
      if (data[i].ansewerScriptILink.length > 0) {
        for (let j = 0; j < data[i].ansewerScriptILink.length; j++) {
          imagelink1.push(path + data[i].ansewerScriptILink[j]);
          //zipFile = zipFile + " " +;
        }
      }
    }
  }
  return res.status(200).json({ imageLink, imagelink1, zipFile });
};
const columnAdd1 = async (req, res, next) => {
  let data = [];
  let data1 = [];
  let data2 = [];
  let data3 = [];
  let data4 = [];
  let data5 = [];
  try {
    data = await Exam.updateMany({}, { $set: { buetStatus: false } });
    data1 = await Exam.updateMany({}, { $set: { medicalStatus: false } });
    data2 = await Exam.updateMany({}, { $set: { universityStatus: false } });

    data3 = await FreeStudent.updateMany({}, { $set: { buetRoll: null } });
    data4 = await FreeStudent.updateMany({}, { $set: { medicalRoll: null } });
    data5 = await FreeStudent.updateMany(
      {},
      { $set: { universityRoll: null } }
    );
  } catch (err) {
    return res.status(500).json("Something went wrong.");
  }
  try {
    data3 = await Exam.find({});
    data4 = await FreeStudent.find({});
  } catch (err) {
    return res.status(500).json("Something went wrong.1");
  }
  return res.status(200).json({ data3 });
};

const columnAdd10 = async (req, res, next) => {
  let data = [];
  let data1 = [];
  let data2 = [];
  try {
    data = await Exam.updateMany(
      {},
      {
        $set: {
          questionType: null,
          numberOfRetakes: 5,
          numberOfOptions: -1,
          numberOfSet: -1,
        },
      }
    );
    data1 = await BothExam.updateMany(
      {},
      {
        $set: {
          questionType: null,
          numberOfRetakes: 5,
          numberOfOptions: -1,
          numberOfSet: -1,
        },
      }
    );
    data2 = await SpecialExam.updateMany(
      {},
      {
        $set: {
          questionType: null,
          numberOfRetakes: 5,
          numberOfOptions: -1,
          numberOfSet: -1,
        },
      }
    );
  } catch (err) {
    return res.status(500).json("Something went wrong.");
  }

  return res.status(200).json("success!!");
};

const columnAdd11 = async (req, res, next) => {
  let data = [];
  try {
    data = await FreeStudent.updateMany(
      {},
      {
        $set: {
          curriculumRoll: null,
        },
      }
    );
  } catch (err) {
    return res.status(500).json("Something went wrong.");
  }

  return res.status(200).json("SepcialExam success!!");
};

// sollution sheets
// dropping collection

const uploadSollution = async (req, res, next) => {
  let examId = req.body.examId;
  let type = Number(req.body.type);
  let sollution = req.body.sollution;
  //console.log(req.body);
  if (!ObjectId.isValid(examId) || type < 0 || !sollution)
    return res.status(404).json("Data is not valid.");
  let upd = null;
  let data = null;
  examId = new mongoose.Types.ObjectId(examId);
  if (type == 0) {
    data = {
      solutionSheet: sollution,
    };
    try {
      upd = await Exam.updateOne(
        {
          _id: examId,
        },
        { $set: { solutionSheet: sollution } }
      );
    } catch (err) {
      return res.status(500).json("Something went wrong.");
    }
  } else if (type == 1) {
    data = {
      solutionSheet: sollution,
    };
    try {
      upd = await BothExam.updateOne(
        {
          _id: examId,
        },
        { $set: { solutionSheet: sollution } }
      );
    } catch (err) {
      return res.status(500).json("Something went wrong.");
    }
  } else if (type === 2) {
    data = {
      solutionSheet: sollution,
    };
    try {
      upd = await SpecialExam.updateOne(
        {
          _id: examId,
        },
        { $set: { solutionSheet: sollution } }
      );
    } catch (err) {
      return res.status(500).json("Something went wrong.");
    }
  } else {
    data = {
      solutionSheet: sollution,
    };
    try {
      upd = await McqSpecialExam.updateOne(
        {
          _id: examId,
        },
        { $set: { solutionSheet: sollution } }
      );
    } catch (err) {
      return res.status(500).json("Something went wrong.");
    }
  }
  return res.status(201).json("Succesfully uploaded.");
};

const getSollution = async (req, res, next) => {
  let examId = req.query.examId;
  let type = Number(req.query.type);
  if (!ObjectId.isValid(examId) || type < 0)
    return res.status(404).json("Data is not valid.");
  let data = null;
  if (type == 0) {
    try {
      data = await Exam.findOne({
        _id: new mongoose.Types.ObjectId(examId),
      });
    } catch (err) {
      return res.status(500).json("Something went wrong.");
    }
  } else if (type == 1) {
    try {
      data = await BothExam.findOne({
        _id: new mongoose.Types.ObjectId(examId),
      });
    } catch (err) {
      return res.status(500).json("Something went wrong.");
    }
  } else {
    try {
      data = await SpecialExam.findOne({
        _id: new mongoose.Types.ObjectId(examId),
      });
    } catch (err) {
      return res.status(500).json("Something went wrong.");
    }
  }
  data = data.solutionSheet;
  return res.status(200).json(data);
};

const updateExamPhoto = async (req, res, next) => {
  const file = req.file;
  let iLinkPath = null;
  // console.log(file);
  if (file) {
    iLinkPath = "uploads/".concat(file.filename);
  }
  const { examId } = req.body;
  const filter = { _id: examId };
  console.log(filter);
  let update;
  try {
    update = await Exam.findOneAndUpdate(
      filter,
      {
        iLink: iLinkPath,
      },
      { new: true }
    );
  } catch (error) {
    res.status(404).json(error);
  }
  if (update) {
    res.status(202).json("Successfully Uploaded the photo");
  } else {
    res.status(404).json("could not update the photo!");
  }
};

const calculateMarks = async (req, res, next) => {
  let examId = new mongoose.Types.ObjectId(req.body.examId);
  let type = req.query.type;
  console.log(type);
  let data = [];

  if (type == 1) {
    try {
      data = await StudentExamVsQuestionsMcq.find({ examId: examId })
        .populate("mcqQuestionId")
        .populate("examId");
    } catch (err) {
      return res.status(500).json("1.something went wrong.");
    }
    let examData = null;
    try {
      examData = await Exam.findById(req.body.examId);
    } catch (err) {
      console.log("kire beta ki khobor");
      return res.status(500).json("eidke asho");
    }
    // console.log(examData);
    // return ;
    let updArr = [];

    for (let index = 0; index < data.length; index++) {
      let updObj = {};
      let studentId = data[index].studentId;
      let questions = data[index].mcqQuestionId;
      let answered = data[index].answeredOption;
      let cm = 0;
      let wm = 0;
      let tm = 0;
      let na = 0;
      let ca = 0;
      let wa = 0;
      for (let ind = 0; ind < questions.length; ind++) {
        if (Number(answered[ind]) === questions[ind].correctOption) {
          ca++;
        } else if (Number(answered[ind]) === -1) {
          na++;
        } else wa++;
      }
      cm = ca * data[index].examId.marksPerMcq;
      wm =
        (wa * (data[index].examId.marksPerMcq * examData.negativeMarks)) / 100;
      tm = cm - wm;
      let upd = null;
      let saveStudentExamEnd = null;
      try {
        upd = await StudentExamVsQuestionsMcq.updateOne(
          {
            examId: examId,
            studentId: studentId,
            totalObtainedMarks: { $ne: -5000 },
          },
          {
            totalCorrectAnswer: ca,
            totalWrongAnswer: wa,
            totalNotAnswered: na,
            totalCorrectMarks: cm,
            totalWrongMarks: wm,
            totalObtainedMarks: tm,
          }
        );
        saveStudentExamEnd = await StudentMarksRank.updateOne(
          {
            examId: examId,
            studentId: studentId,
            totalObtainedMarks: { $ne: -5000 },
          },
          { totalObtainedMarks: tm }
        );
      } catch (err) {
        return res.status(500).json("Something went wrong.");
      }
    }
  }

  if (type == 100) {
    try {
      data = await FreeStudentExamVsQuestionsMcq.find({ examId: examId })
        .populate("mcqQuestionId")
        .populate("examId");
    } catch (err) {
      return res.status(500).json("1.something went wrong.");
    }
    console.log("now data: ", data);
    let examData = null;
    try {
      examData = await Exam.findById(req.body.examId);
    } catch (err) {
      console.log("kire beta ki khobor");
      return res.status(500).json("eidke asho");
    }
    console.log("now dataL: ", data);
    let updArr = [];

    for (let index = 0; index < data.length; index++) {
      let studentId = data[index].studentId;
      let questions = data[index].mcqQuestionId;
      let answered = data[index].answeredOption;
      let cm = 0;
      let wm = 0;
      let tm = 0;
      let na = 0;
      let ca = 0;
      let wa = 0;
      for (let ind = 0; ind < questions.length; ind++) {
        if (Number(answered[ind]) === questions[ind].correctOption) {
          ca++;
        } else if (Number(answered[ind]) === -1) {
          na++;
        } else wa++;
      }
      cm = ca * data[index].examId.marksPerMcq;
      wm =
        (wa * (data[index].examId.marksPerMcq * examData.negativeMarks)) / 100;
      tm = cm - wm;
      let upd = null;
      let saveStudentExamEnd = null;
      try {
        upd = await FreeStudentExamVsQuestionsMcq.updateOne(
          {
            examId: examId,
            studentId: studentId,
            totalObtainedMarks: { $ne: -5000 },
          },
          {
            totalCorrectAnswer: ca,
            totalWrongAnswer: wa,
            totalNotAnswered: na,
            totalCorrectMarks: cm,
            totalWrongMarks: wm,
            totalObtainedMarks: tm,
          }
        );
        saveStudentExamEnd = await FreestudentMarksRank.updateOne(
          {
            examId: examId,
            studentId: studentId,
            totalObtainedMarks: { $ne: -5000 },
          },
          { totalObtainedMarks: tm }
        );
      } catch (err) {
        return res.status(500).json("Something went wrong.");
      }
    }
  }

  if (type == 2) {
    try {
      data = await BothStudentExamVsQuestions.find({ examId: examId })
        .populate("mcqQuestionId")
        .populate("examId");
    } catch (err) {
      return res.status(500).json("1.something went wrong.");
    }
    let updArr = [];
    for (let index = 0; index < data.length; index++) {
      let updObj = {};
      let studentId = data[index].studentId;
      let questions = data[index].mcqQuestionId;
      let answered = data[index].answeredOption;
      let obtainedMarksWrit = data[index].totalObtainedMarksWritten;
      let cm = 0;
      let wm = 0;
      let tm = 0;
      let na = 0;
      let ca = 0;
      let wa = 0;
      for (let ind = 0; ind < questions.length; ind++) {
        if (Number(answered[ind]) === questions[ind].correctOption) {
          ca++;
        } else if (Number(answered[ind]) === -1) {
          na++;
        } else wa++;
      }
      cm = ca * data[index].examId.marksPerMcq;
      wm =
        (wa *
          (data[index].examId.marksPerMcq *
            data[index].examId.negativeMarksMcq)) /
        100;
      tm = cm - wm;
      let upd = null;
      let saveStudentExamEnd = null;
      try {
        upd = await BothStudentExamVsQuestions.updateOne(
          {
            examId: examId,
            studentId: studentId,
            totalObtainedMarks: { $ne: -5000 },
          },
          {
            totalCorrectAnswer: ca,
            totalWrongAnswer: wa,
            totalNotAnswered: na,
            totalCorrectMarks: cm,
            totalWrongMarks: wm,
            totalObtainedMarksMcq: tm,
            totalObtainedMarks: tm + obtainedMarksWrit,
          }
        );
        // saveStudentExamEnd = await StudentMarksRank.updateOne(
        //   {
        //     examId: examId,
        //     studentId: studentId,
        //     totalObtainedMarks: { $ne: -5000 },
        //   },
        //   { totalObtainedMarks: tm }
        // )
      } catch (err) {
        return res.status(500).json("Something went wrong.");
      }
    }
  }
  if (type == 3) {
    try {
      data = await SpecialVsStudent.find({ examId: examId })
        .populate("questionMcq.mcqId")
        .populate("examId");
    } catch (err) {
      return res.status(500).json("1.something went wrong.");
    }
    // console.log(data[0].questionMcq[0].mcqId);
    // console.log(data[0].questionMcq[0].mcqAnswer);
    // return res.status(200).json(data);
    let updArr = [];

    for (let index = 0; index < data.length; index++) {
      let studentId = data[index].studentId;

      let obtainedMarksWrit = data[index].totalMarksWritten;
      let totMcqMarks = 0;
      for (let j = 0; j < data[index].questionMcq.length; j++) {
        let updObj = {};
        let questions = data[index].questionMcq[j].mcqId;
        let answered = data[index].questionMcq[j].mcqAnswer;
        let cm = 0;
        let wm = 0;
        let tm = 0;
        let na = 0;
        let ca = 0;
        let wa = 0;
        for (let ind = 0; ind < questions.length; ind++) {
          if (Number(answered[ind]) === questions[ind].correctOption) {
            ca++;
          } else if (Number(answered[ind]) === -1) {
            na++;
          } else wa++;
        }
        cm = ca * data[index].examId.marksPerMcq;
        wm =
          (wa *
            (data[index].examId.marksPerMcq *
              data[index].examId.negativeMarksMcq)) /
          100;
        tm = cm - wm;
        totMcqMarks = totMcqMarks + tm;
        data[index].questionMcq[j].mcqMarksPerSub = tm;
        data[index].questionMcq[j].totalCorrectMarks = tm;
        data[index].questionMcq[j].totalCorrectAnswer = ca;
        data[index].questionMcq[j].totalWrongAnswer = wa;
        data[index].questionMcq[j].totalNotAnswered = na;
        data[index].questionMcq[j].totalWrongMarks = wm;
      }
      // console.log(totMcqMarks);
      data[index].totalMarksMcq = totMcqMarks;
      data[index].totalObtainedMarks = totMcqMarks + obtainedMarksWrit;
      // return ;
      let upd = null;
      let saveStudentExamEnd = null;
      try {
        upd = await SpecialVsStudent.updateOne(
          {
            examId: examId,
            studentId: studentId,
          },
          data[index]
        );
        // saveStudentExamEnd = await StudentMarksRank.updateOne(
        //   {
        //     examId: examId,
        //     studentId: studentId,
        //     totalObtainedMarks: { $ne: -5000 },
        //   },
        //   { totalObtainedMarks: tm }
        // )
      } catch (err) {
        return res.status(500).json("Something went wrong.");
      }
    }
  }
  // console.log(data)
  return res.status(200).json(data);
};

const addTextQuestion = async (req, res, next) => {
  const quest = req.body;
  console.log(quest);
  // return;
  // res.status(200).json(quest);
  let iLinkPath = null;
  let explanationILinkPath = null;
  let examIdObj;
  // console.log(req.file);
  //let type = req.query.type;
  let question;
  let mcqQData,
    doc1,
    mId,
    mIdNew = [];

  //const examId = req.body.examId;
  let setName1 = parseInt(quest.setName);

  let examDetails = {};

  try {
    examDetails = await Exam.findOne({
      _id: new mongoose.Types.ObjectId(quest.examId),
    });
  } catch (error) {
    return res.status(404).json("Problem with exam settings");
  }
  if (examDetails) {
    try {
      mcqQData = await McqQuestionVsExam.findOne({
        eId: quest.examId,
        setName: setName1,
      }).select("mId");
    } catch (err) {
      return res.status(500).json(err);
    }
    // console.log(mcqQData);
    if (mcqQData !== null) {
      if (mcqQData.mId.length >= examDetails.totalQuestionMcq) {
        return res.status(405).json("Set of Question reached the limit");
      }
    }
  }
  // let options = JSON.parse(quest.options);
  if (!ObjectId.isValid(quest.examId))
    return res.status(404).json("examId Id is not valid.");
  const file = req.file;
  //question insert for text question(type=true)
  question = quest.question;
  examIdObj = new mongoose.Types.ObjectId(quest.examId);
  //insert question
  let questions = new QuestionsMcq({
    question: question,
    optionCount: Number(quest.optionCount),
    options: quest.options,
    correctOption: Number(quest.correctOption), //index value
    explanationILink: null,
    status: JSON.parse(quest.status),
    type: JSON.parse(quest.type),
  });
  let doc;
  try {
    doc = await questions.save();
  } catch (err) {
    ////console.log(err);
    return res.status(500).json(err);
  }
  //end of insert question
  //insert question to reference mcqquestionexam table
  let questionId = doc._id;
  if (!questionId) return res.status(400).send("question not inserted");

  // console.log(mcqQData);
  if (mcqQData == null) {
    mIdNew.push(questionId);
    let questionExam = new McqQuestionVsExam({
      eId: quest.examId,
      mId: mIdNew,
      setName: parseInt(quest.setName),
    });
    try {
      doc1 = await questionExam.save();
    } catch (err) {
      return res.status(500).json(err);
    }
  } else {
    mId = mcqQData.mId;
    mIdNew = mId;
    mIdNew.push(questionId);
    try {
      doc1 = await McqQuestionVsExam.updateOne(
        { eId: examIdObj, setName: setName1 },
        { $set: { mId: mIdNew } }
      );
    } catch (err) {
      return res.status(500).json(err);
    }
  }
  // console.log(setName);
  return res.status(201).json("Saved.");
};

const updateQuestion = async (req, res, next) => {
  const { questionId, question, options } = req.body;
  console.log(req.body);
  // return
  // let options = JSON.parse(req.body.options)
  let doc;
  try {
    doc = await QuestionsMcq.findByIdAndUpdate(questionId, {
      question: question,
      options: options,
    });
  } catch (err) {
    ////console.log(err);
    return res.status(500).json(err);
  }

  return res.status(201).json("Updated.");
};

const studentUpdate = async (req, res, next) => {
  let students;
  try {
    students = await Student.find({});
  } catch (error) {
    return res.status(400).json("Cannot get students");
  }
  return res.status(200).json(students);
};

const columnAdd = async (req, res, next) => {
  const salt = await bcrypt.genSalt(10);
  let count = 0;
  let studentData;
  let pass = "bpexam";
  let password;
  try {
    password = await bcrypt.hash(pass, salt);
  } catch (error) {
    return res.status(500).json("error found");
  }
  try {
    studentData = await Student.find({});
    console.log("ekhane hishab rakhlam:", studentData.length);
    for (const student of studentData) {
      try {
        await Student.updateOne(
          { _id: student._id },
          { $set: { password: password } }
        );
        count++;
      } catch (err) {
        console.error(`Failed to update student ID ${student._id}:`, err);
      }
    }
  } catch (err) {
    console.error("Error during processing:", err);
    return res.status(500).json("An error occurred during the update process");
  }
  console.log("hoise koyta: ", count);
  return res.status(200).json(`Updated ${count} students`);
};

const updateMarksTask = async (req, res, next) => {
  let details;
  let eId = new mongoose.Types.ObjectId("67c032d2eaf08884cb006a45");
  console.log("hhhohohoh");
  try {
    details = await StudentExamVsQuestionsMcq.find({ examId: eId }).populate(
      "mcqQuestionId"
    );
  } catch (error) {
    return res.status(500).json("No data found");
  }
  console.log(details.length);
  for (let i = 0; i < details.length; i++) {
    for (let j = 0; j < details[i].mcqQuestionId.length; j++) {
      if (String(details[i].mcqQuestionId[j]._id) === "67c042272d9b3d98e1c8ac92") {
        details[i].answeredOption[j] ='-1';
          console.log("ei dhuklo")
      }

      if (String(details[i].mcqQuestionId[j]._id) === "67c04d953e2973354ac6ea56") {
        details[i].answeredOption[j] ='-1';
          console.log("ei dhuklo")
      }
    }
    let result ;
    try {
      result = await StudentExamVsQuestionsMcq.findByIdAndUpdate(details[i]._id,details[i])
    } catch (error) {
      return res.status(500).json("error occured");
    }
  }
  try {
    details = await StudentExamVsQuestionsMcq.find({ examId: eId }).populate(
      "mcqQuestionId"
    );
  } catch (error) {
    return res.status(500).json("No data found");
  }
  return res.status(200).json(details[0]);
};

const courseLessStudents = async(req,res,next)=>{
  let result ;
  try {
    result = await CourseVsStudent.find();
  } catch (error) {
    return res.status(500).json("no data found");
  }
  result = result.splice(0,100);
  // result = result.filter(r=>r.)
  return res.status(200).json(result);
}
//export functions
exports.courseLessStudents = courseLessStudents;
exports.updateMarksTask = updateMarksTask;
exports.studentUpdate = studentUpdate;
exports.updateQuestion = updateQuestion;
exports.calculateMarks = calculateMarks;
exports.columnAdd11 = columnAdd11;
exports.examByCourse = examByCourse;
exports.leaderboard = leaderboard;
exports.addTextQuestion = addTextQuestion;
exports.refillQuestion = refillQuestion;
exports.changeCorrectAnswer = changeCorrectAnswer;
exports.slotAvailable = slotAvailable;
exports.getAllData = getAllData;
exports.questionByExamIdAndSet = questionByExamIdAndSet;
exports.updateExamPhoto = updateExamPhoto;
exports.getSollution = getSollution;
exports.uploadSollution = uploadSollution;
exports.downloadExamImage = downloadExamImage;
exports.columnAdd = columnAdd;
exports.resetExam = resetExam;
exports.getExamBySubAdmin = getExamBySubAdmin;
exports.getExamBySubWritten = getExamBySubWritten;
exports.getExamBySubQuestion = getExamBySubQuestion;
exports.bothAssignStudentToTeacher = bothAssignStudentToTeacher;
exports.getWrittenBySub = getWrittenBySub;
exports.getMcqBySub = getMcqBySub;
exports.createExam = createExam;
exports.getAllExam = getAllExam;
exports.addQuestionMcq = addQuestionMcq;
exports.addQuestionWritten = addQuestionWritten;
exports.getExamBySubject = getExamBySubject;
exports.getExamBySub = getExamBySub;
exports.examRuleSet = examRuleSet;
exports.examRuleGet = examRuleGet;
exports.examRuleGetAll = examRuleGetAll;
exports.examByCourseSubject = examByCourseSubject;
exports.getExamById = getExamById;
exports.questionByExamId = questionByExamId;
exports.updateQuestionStatus = updateQuestionStatus;
exports.updateExam = updateExam;
exports.addQuestionMcqBulk = addQuestionMcqBulk;
exports.deactivateExam = deactivateExam;
exports.freeExamStatus = freeExamStatus;
exports.getExamType = getExamType;
exports.assignTeacher = assignTeacher;
exports.assignStudentToTeacher = assignStudentToTeacher;
exports.removeQuestionWritten = removeQuestionWritten;
exports.freeCourseSub = freeCourseSub;
exports.getWrittenQuestionByexam = getWrittenQuestionByexam;
