const { ObjectId } = require("mongodb");
const { default: mongoose, Mongoose } = require("mongoose");
const SpecialExam = require("../model/SpecialExam");
const pagination = require("../utilities/pagination");
const moment = require("moment");
const QuestionsMcq = require("../model/QuestionsMcq");
const SpecialExamRule = require("../model/SpecialExamRule");
const SpecialVsStudent = require("../model/SpecialVsStudent");
const SpecialRank = require("../model/SpecialRank");
const fs = require("fs");
const TeacherVsExam = require("../model/TeacherVsExam");
const TeacherVsSpecialExam = require("../model/TeacherVsSpecialExam");
const User = require("../model/User");
const fsp = fs.promises;
const path = require("path");
const Student = require("../model/Student");
const dir = path.resolve(path.join(__dirname, "../uploads/answers/"));
const updateSpecialExam = async (req, res, next) => {
  const {
    examId,
    name,
    startTime,
    endTime,
    mcqDuration,
    marksPerMcq,
    negativeMarks,
    writtenDuration,
    totalMarksWritten,
    totalDuration,
    totalMarksMcq,
    totalMarks,
  } = req.body;
  //console.log(negativeMarks);
  if (!ObjectId.isValid(examId)) {
    return res.status(404).json("exam Id is not valid.");
  }
  let saveExam = {
    name: name,
    startTime: moment(startTime).add(6, "h"),
    endTime: moment(endTime).add(6, "h"),
    mcqDuration: mcqDuration,
    marksPerMcq: marksPerMcq,
    negativeMarksMcq: negativeMarks,
    writtenDuration: writtenDuration,
    totalDuration: totalDuration,
    totalMarksMcq: totalMarksMcq,
    totalMarksWritten: totalMarksWritten,
    totalMarks: totalMarks,
    status: true,
  };
  let updStatus = null;
  try {
    updStatus = await SpecialExam.findByIdAndUpdate(examId, saveExam);
  } catch (err) {
    //console.log(err);
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
    noOfFixedSubject,
    allSubject, //all subject ID in array
    optionalSubject, //array of subject Id
    fixedSubject, //array of fixed subject
    subjectInfo, //array of subjectinfo
  } = req.body;
  const negative = req.body.negativeMarks;
  if (!ObjectId.isValid(courseId)) {
    return res.status(404).json("Course Id is not valid.");
  }
  let fixedSubjects = [];
  let fixedSubjectsId = JSON.parse(fixedSubject);
  //console.log(fixedSubjectsId);
  //console.log(req.body.fixedSubject);
  for (let i = 0; i < fixedSubjectsId.length; i++) {
    fixedSubjects[i] = new mongoose.Types.ObjectId(fixedSubjectsId[i].value);
  }
  let allSubjects = [];
  let subjectId = JSON.parse(allSubject);
  //console.log("subjectId", subjectId);
  for (let i = 0; i < subjectId.length; i++) {
    allSubjects[i] = new mongoose.Types.ObjectId(subjectId[i]);
  }
  let mcqQuestionSub = [];
  for (let i = 0; i < allSubjects.length; i++) {
    let subObj = {};
    subObj["subjectId"] = allSubjects[i];
    subObj["mcqId"] = [];
    mcqQuestionSub.push(subObj);
  }
  let writtenQuestionSub = [];
  for (let i = 0; i < allSubjects.length; i++) {
    let subObj = {};
    subObj["subjectId"] = allSubjects[i];
    subObj["marksPerQuestion"] = [];
    subObj["writtenILink"] = null;
    writtenQuestionSub.push(subObj);
  }
  let optionalSubjects = [];
  let optionalId = JSON.parse(optionalSubject);
  //console.log("optionalId", optionalId);
  for (let i = 0; i < optionalId.length; i++) {
    optionalSubjects[i] = new mongoose.Types.ObjectId(optionalId[i]);
  }
  let subjectsInfos = [];
  //console.log(subjectInfo);
  //console.log(JSON.parse(subjectInfo));
  let subjectInfoId = JSON.parse(subjectInfo);
  //console.log("subjectInfoId", subjectInfoId);
  for (let i = 0; i < subjectInfoId.length; i++) {
    let dataOb = {};
    dataOb["subjectId"] = new mongoose.Types.ObjectId(
      subjectInfoId[i].subjectId
    );
    dataOb["noOfQuestionsMcq"] = subjectInfoId[i].numberOfMcqQuestions;
    dataOb["noOfQuestionsWritten"] = subjectInfoId[i].numberOfWrittenQuestions;
    subjectsInfos.push(dataOb);
  }
  //console.log(subjectsInfos);
  let startTime1, endTime1;
  startTime1 = new Date(startTime);
  endTime1 = new Date(endTime);
  let courseIdObj;
  courseIdObj = new mongoose.Types.ObjectId(courseId);
  let saveExam = new SpecialExam({
    courseId: courseIdObj,
    name: name,
    examVariation: 4,
    startTime: moment(startTime).add(6, "h"),
    endTime: moment(endTime).add(6, "h"),
    mcqDuration: mcqDuration,
    marksPerMcq: marksPerMcq,
    negativeMarksMcq: negative,
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
    noOfFixedSubject: noOfFixedSubject,
    subjectInfo: subjectsInfos,
    optionalSubject: optionalSubjects,
    allSubject: allSubjects,
    fixedSubject: fixedSubjects,
    questionMcq: mcqQuestionSub,
    questionWritten: writtenQuestionSub,
    sscStatus: JSON.parse(sscStatus),
    hscStatus: JSON.parse(hscStatus),
    status: JSON.parse(status),
    publishStatus: false,
    iLink: iLinkPath,
  });
  let updStatus = null;
  //console.log("number of tota subhect:", req.query.noOfTotalSubject);
  try {
    updStatus = await saveExam.save();
  } catch (err) {
    //console.log(err);
    return res.status(500).json("Something went wrong.");
  }
  //console.log(updStatus);
  return res.status(201).json("Created special exam successfully.");
};
const showSpecialExamById = async (req, res, next) => {
  let examId = req.query.examId;
  if (!ObjectId.isValid(examId))
    return res.status(404).json("Invalid Exam Id.");
  examId = new mongoose.Types.ObjectId(examId);
  let data = null;
  try {
    data = await SpecialExam.findOne({
      $and: [{ _id: examId }, { status: true }],
    }).populate({ path: "questionMcq", populate: { path: "subjectId" } });
  } catch (err) {
    return res.status(500).json("Something went wrong.");
  }
  if (data == null) return res.status(404).json("No data found.");
  return res.status(200).json(data);
};
const showSpecialExamByIdStudent = async (req, res, next) => {
  let examId = req.query.examId;
  let studentId = req.user.studentId;
  if (!ObjectId.isValid(examId))
    return res.status(404).json("Invalid Exam Id.");
  examId = new mongoose.Types.ObjectId(examId);
  let data = null;
  try {
    data = await SpecialVsStudent.findOne({
      $and: [{ examId: examId }, { studentId: studentId }],
    })
      .populate({ path: "questionMcq", populate: { path: "subjectId" } })
      .populate({ path: "questionWritten", populate: { path: "subjectId" } });
  } catch (err) {
    return res.status(500).json("Something went wrong.");
  }
  let dataWritten = null;
  try {
    dataWritten = await SpecialExam.findById(examId);
  } catch (err) {
    return res.status(500).json("Something went wrong.");
  }
  let writtenObj = {};
  writtenObj["totalWrittenMarks"] = dataWritten.totalMarksWritten;
  writtenObj["writtenDuration"] = dataWritten.writtenDuration;
  writtenObj["marksPerSub"] = Math.round(dataWritten.totalMarksWritten / 4);
  let mcqObj = {};
  mcqObj["totalMcqMarks"] = dataWritten.totalMarksMcq;
  mcqObj["mcqDuration"] = dataWritten.mcqDuration;
  mcqObj["marksPerSub"] = Math.round(dataWritten.totalMarksMcq / 4);
  mcqObj["negativeMarks"] = dataWritten.negativeMarksMcq;
  mcqObj["negativeValue"] = Math.round(
    (dataWritten.marksPerMcq * dataWritten.negativeMarksMcq) / 100
  );
  mcqObj["totalQuestion"] = dataWritten.totalQuestionsMcq;
  mcqObj["marksPerMcq"] = dataWritten.marksPerMcq;
  //console.log("data", data);
  let subjectsId = [
    data.questionMcq[0].subjectId._id,
    data.questionMcq[1].subjectId._id,
    data.questionMcq[2].subjectId._id,
    data.questionMcq[3].subjectId._id,
  ];
  if (data == null) return res.status(404).json("No data found.");
  return res.status(200).json({ data, writtenObj, mcqObj, subjectsId });
};
const showSpecialExamByIdStudentAdmin = async (req, res, next) => {
  let examId = req.query.examId;
  let studentId = req.query.studentId;
  if (!ObjectId.isValid(examId))
    return res.status(404).json("Invalid Exam Id.");
  examId = new mongoose.Types.ObjectId(examId);
  let data = null;
  try {
    data = await SpecialVsStudent.findOne({
      $and: [{ examId: examId }, { studentId: studentId }],
    })
      .populate({ path: "questionMcq", populate: { path: "subjectId" } })
      .populate({ path: "questionWritten", populate: { path: "subjectId" } });
  } catch (err) {
    return res.status(500).json("Something went wrong.");
  }
  let dataWritten = null;
  try {
    dataWritten = await SpecialExam.findById(examId);
  } catch (err) {
    return res.status(500).json("Something went wrong.");
  }
  let writtenObj = {};
  writtenObj["totalWrittenMarks"] = dataWritten.totalMarksWritten;
  writtenObj["writtenDuration"] = dataWritten.writtenDuration;
  writtenObj["marksPerSub"] = Math.round(dataWritten.totalMarksWritten / 4);
  let mcqObj = {};
  mcqObj["totalMcqMarks"] = dataWritten.totalMarksMcq;
  mcqObj["mcqDuration"] = dataWritten.mcqDuration;
  mcqObj["marksPerSub"] = Math.round(dataWritten.totalMarksMcq / 4);
  mcqObj["negativeMarks"] = dataWritten.negativeMarksMcq;
  mcqObj["negativeValue"] = Math.round(
    (dataWritten.marksPerMcq * dataWritten.negativeMarksMcq) / 100
  );
  mcqObj["totalQuestion"] = dataWritten.totalQuestionsMcq;
  mcqObj["marksPerMcq"] = dataWritten.marksPerMcq;
  //console.log("data", data);
  let subjectsId = [
    data.questionMcq[0].subjectId._id,
    data.questionMcq[1].subjectId._id,
    data.questionMcq[2].subjectId._id,
    data.questionMcq[3].subjectId._id,
  ];
  if (data == null) return res.status(404).json("No data found.");
  return res.status(200).json({ data, writtenObj, mcqObj, subjectsId });
};
const showSpecialExamByCourse = async (req, res, next) => {
  let courseId = req.query.courseId;
  if (!ObjectId.isValid(courseId))
    return res.status(404).json("Invalid Course Id.");
  courseId = new mongoose.Types.ObjectId(courseId);
  let data = null;
  try {
    data = await SpecialExam.find({
      $and: [{ courseId: courseId }, { status: true }],
    });
  } catch (err) {
    return res.status(500).json("Something went wrong.");
  }
  //console.log("data.length", data.length);
  if (data == null) return res.status(404).json("No data found.");
  let dataObj = [];
  for (let i = 0; i < data.length; i++) {
    let data1 = {};
    let dataRule = "0";
    try {
      dataRule = await SpecialExamRule.findOne({
        examId: data[i]._id,
      }).select("ruleILink -_id");
    } catch (err) {
      return res.status(500).json("Something went wrong.");
    }
    if (dataRule == null) data1["RuleImage"] = "0";
    else {
      data1["RuleImage"] = dataRule.ruleILink;
    }
    data1["_id"] = data[i]._id;
    data1["name"] = data[i].name;
    data1["examVariation"] = data[i].examVariation;
    data1["noOfTotalSubject"] = data[i].noOfTotalSubject;
    data1["noOfExamSubject"] = data[i].noOfExamSubject;
    data1["noOfOptionalSubject"] = data[i].noOfOptionalSubject;
    data1["allSubject"] = data[i].allSubject;
    data1["optionalSubject"] = data[i].optionalSubject;
    data1["subjectInfo"] = data[i].subjectInfo;
    data1["startTime"] = data[i].startTime;
    data1["endTime"] = data[i].endTime;
    data1["mcqDuration"] = data[i].mcqDuration;
    data1["writtenDuration"] = data[i].writtenDuration;
    data1["totalQuestionsMcq"] = data[i].totalQuestionsMcq;
    data1["marksPerMcq"] = data[i].marksPerMcq;
    data1["totalMarksMcq"] = data[i].totalMarksMcq;
    data1["negativeMarksMcq"] = data[i].negativeMarksMcq;
    data1["totalQuestionsWritten"] = data[i].totalQuestionsWritten;
    data1["totalMarksWritten"] = data[i].totalMarksWritten;
    data1["totalMarks"] = data[i].totalMarks;
    data1["totalDuration"] = data[i].totalDuration;
    data1["status"] = data[i].status;
    data1["sscStatus"] = data[i].sscStatus;
    data1["hscStatus"] = data[i].hscStatus;
    data1["courseId"] = data[i].courseId;
    data1["iLink"] = data[i].iLink;
    data1["questionMcq"] = data[i].questionMcq;
    data1["questionWritten"] = data[i].questionWritten;
    data1["createdAt"] = data[i].createdAt;
    data1["updatedAt"] = data[i].updatedAt;
    data1["__v"] = data[i].__v;
    dataObj.push(data1);
  }
  data = dataObj;
  //console.log("data", data);
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
const studentSubmittedExamDetail = async (req, res, next) => {
  const studentId = req.user.studentId;
  const examId = req.query.examId;
  if (!ObjectId.isValid(studentId) || !ObjectId.isValid(examId))
    return res.status(404).json("Student Id is not valid.");
  const studentIdObj = new mongoose.Types.ObjectId(studentId);
  const examIdObj = new mongoose.Types.ObjectId(examId);
  let data = null;
  try {
    data = await SpecialVsStudent.findOne({
      $and: [{ studentId: studentIdObj }, { examId: examIdObj }],
    })
      .populate("examId")
      .populate({ path: "questionMcq", populate: { path: "subjectId" } })
      .populate({ path: "questionWritten", populate: { path: "subjectId" } });
  } catch (err) {
    return res.status(500).json("1.Something went wrong.");
  }
  if (data == null) return res.status(404).json("No data found.");
  //star rank
  let mcqRank = null;
  try {
    mcqRank = await SpecialRank.findOne({
      $and: [{ studentId: studentIdObj }, { examId: examIdObj }],
    });
  } catch (err) {
    return res.status(500).json("2.Something went wrong.");
  }
  if (mcqRank != null) mcqRank = mcqRank.rank;
  else mcqRank = "-1";
  //end rank
  let dataEx = [];
  for (let i = 0; i < 4; i++) {
    let dataObject = {};
    dataObject["subjectId"] = data.questionMcq[i].subjectId._id;
    dataObject["subjectName"] = data.questionMcq[i].subjectId.name;
    dataObject["marksMcqPerSub"] =
      data.questionMcq[i].mcqMarksPerSub.toFixed(2);
    dataObject["marksWrittenPerSub"] =
      data.questionWritten[i].totalObtainedMarksWritten.toFixed(2);
    dataObject["totalMarksMcqPerSub"] = data.examId.totalMarksMcq / 4;
    dataObject["totalMarksWrittenPerSub"] = (
      data.examId.totalMarksWritten / 4
    ).toFixed(2);
    dataEx.push(dataObject);
  }
  dataEx.push({
    totalMarks: data.examId.totalMarksMcq + data.examId.totalMarksWritten,
  });
  dataEx.push({ totalObtainedMarks: data.totalObtainedMarks.toFixed(2) });
  dataEx.push({ rank: mcqRank });
  dataEx.push({ studDuration: data.mcqDuration + data.writtenDuration });
  dataEx.push({
    studExamStartTimeMcq: moment(data.startTimeMcq).format("LLLL"),
  });
  dataEx.push({
    studExamEndTimeMcq: moment(data.endTimeMcq).format("LLLL"),
  });
  dataEx.push({
    studExamStartTimeWritten: moment(data.startTimeWritten).format("LLLL"),
  });
  dataEx.push({
    studExamEndTimeWritten: moment(data.endTimeWritten).format("LLLL"),
  });
  dataEx.push({
    startTime: moment(data.examId.tartTime).format("LLLL"),
  });
  dataEx.push({
    endTime: moment(data.examId.endTime).format("LLLL"),
  });
  dataEx.push({ examVariation: "Special Exam" });
  dataEx.push({ examName: data.examId.name });
  return res.status(200).json(dataEx);
};
const studentSubmittedExamDetail1 = async (req, res, next) => {
  const studentId = req.user.studentId;
  const examId = req.query.examId;
  if (!ObjectId.isValid(studentId) || !ObjectId.isValid(examId))
    return res.status(404).json("Student Id is not valid.");
  const studentIdObj = new mongoose.Types.ObjectId(studentId);
  const examIdObj = new mongoose.Types.ObjectId(examId);
  let data = null;
  try {
    data = await SpecialVsStudent.find({
      $and: [
        { studentId: studentIdObj },
        { examId: examIdObj },
        { questionWritten: { $ne: null } },
      ],
    })
      .populate("examId")
      .populate({ path: "questionMcq", populate: { path: "subjectId" } })
      .populate({ path: "questionWritten", populate: { path: "subjectId" } });
  } catch (err) {
    return res.status(500).json("1.Something went wrong.");
  }
  if (data == null) return res.status(404).json("No data found.");
  //star rank
  let mcqRank = null;
  try {
    mcqRank = await SpecialRank.find({
      $and: [{ studentId: studentIdObj }, { examId: examIdObj }],
    });
  } catch (err) {
    return res.status(500).json("2.Something went wrong.");
  }
  if (mcqRank != null) mcqRank = mcqRank.rank;
  else mcqRank = "-1";
  //end rank
  let dataEx = [];
  for (let i = 0; i < 4; i++) {
    let dataObject = {};
    dataObject["subjectId"] = data.questionMcq[i].subjectId._id;
    dataObject["subjectName"] = data.questionMcq[i].subjectId.name;
    dataObject["marksMcqPerSub"] =
      data.questionMcq[i].mcqMarksPerSub.toFixed(2);
    dataObject["marksWrittenPerSub"] =
      data.questionWritten[i].totalObtainedMarksWritten.toFixed(2);
    dataObject["totalMarksMcqPerSub"] = data.examId.totalMarksMcq / 4;
    dataObject["totalMarksWrittenPerSub"] = (
      data.examId.totalMarksWritten / 4
    ).toFixed(2);
    dataEx.push(dataObject);
  }
  dataEx.push({
    totalMarks: data.examId.totalMarksMcq + data.examId.totalMarksWritten,
  });
  dataEx.push({ totalObtainedMarks: data.totalObtainedMarks });
  dataEx.push({ rank: mcqRank });
  dataEx.push({ studDuration: data.mcqDuration + data.writtenDuration });
  dataEx.push({
    studExamStartTimeMcq: moment(data.startTimeMcq).format("LLLL"),
  });
  dataEx.push({
    studExamEndTimeMcq: moment(data.endTimeMcq).format("LLLL"),
  });
  dataEx.push({
    studExamStartTimeWritten: moment(data.startTimeWritten).format("LLLL"),
  });
  dataEx.push({
    studExamEndTimeWritten: moment(data.endTimeWritten).format("LLLL"),
  });
  dataEx.push({
    startTime: moment(data.examId.tartTime).format("LLLL"),
  });
  dataEx.push({
    endTime: moment(data.examId.endTime).format("LLLL"),
  });
  dataEx.push({ examVariation: "Special Exam" });
  dataEx.push({ examName: data.examId.name });
  return res.status(200).json(dataEx);
};
//rule api
const examRuleSet = async (req, res, next) => {
  const file = req.file;
  let ruleILinkPath = null;
  if (!file) {
    return res.status(404).jsoon("Exam rule file not uploaded.");
  }
  ruleILinkPath = "uploads/".concat(file.filename);
  ////console.log(ruleILinkPath);
  const examId = req.body.examId;
  if (!ObjectId.isValid(examId))
    return res.status(404).json("exam Id is not valid.");
  const examIdObj = new mongoose.Types.ObjectId(examId);
  let existingElem = null;
  try {
    existingElem = await SpecialExamRule.findOne({ examId: examIdObj });
  } catch (err) {
    return re.status(500).json(err);
  }

  if (existingElem == null) {
    let examRule = new SpecialExamRule({
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
      data = await SpecialExamRule.updateOne(
        { examId: examIdObj },
        { rulILink: ruleILinkPath }
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
    data = await SpecialExamRule.findOne({ examId: examIdObj });
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
    data = await SpecialExamRule.find({}).skip(skippedItem).limit(Limit);
  } catch (err) {
    return res.status(500).json(err);
  }
  if (data) return res.status(200).json(data);
  else return res.status(404).json("No data found.");
};
//mcq question
const addQuestionMcq = async (req, res, next) => {
  let iLinkPath = null;
  let explanationILinkPath = null;
  let examIdObj;
  //let type = req.query.type;
  let question;
  const {
    questionText,
    optionCount,
    correctOption,
    status,
    examId,
    type,
    subjectId,
  } = req.body;
  let options = JSON.parse(req.body.options);
  if (!ObjectId.isValid(examId) || !ObjectId.isValid(subjectId))
    return res.status(404).json("examId Id or subject Id is not valid.");
  const file = req.files;
  //question insert for text question(type=true)
  if (JSON.parse(type) == true) {
    if (!file.explanationILink) {
      return res.status(404).json("Expalnation File not uploaded.");
    }
    question = questionText;
    explanationILinkPath = "uploads/".concat(file.explanationILink[0].filename);
  } else {
    if (!file.iLink) {
      return res.status(404).json("Question File not uploaded.");
    }
    iLinkPath = "uploads/".concat(file.iLink[0].filename);
    explanationILinkPath = "uploads/".concat(file.explanationILink[0].filename);
    question = iLinkPath;
    options = [];
  }
  examIdObj = new mongoose.Types.ObjectId(examId);
  let subjectIdObj = new mongoose.Types.ObjectId(subjectId);
  //insert question
  let questions = new QuestionsMcq({
    question: question,
    optionCount: Number(optionCount),
    options: options,
    correctOption: Number(correctOption),
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
  let questionId = doc._id;
  //console.log(questionId);
  if (!questionId) return res.status(400).send("question not inserted");
  let mcqData,
    doc1,
    mcqQuestion = [];
  try {
    mcqData = await SpecialExam.findById(examIdObj).select("questionMcq -_id");
  } catch (err) {
    return res.status(500).json(err);
  }
  ////console.log("mcqData:", mcqData);
  mcqData = mcqData.questionMcq;
  let mcqQues = mcqData;
  for (let i = 0; i < mcqQues.length; i++) {
    //console.log(i);
    //console.log("mcq question:", mcqQues[i].subjectId);
    //console.log("subjectId:", subjectIdObj);
    if (subjectId == String(mcqQues[i].subjectId)) {
      //console.log(mcqQues[i].subjectId);
      mcqQues[i].mcqId.push(questionId);
      break;
    }
  }
  //console.log("mcqQues:", mcqQues);
  try {
    doc1 = await SpecialExam.findOneAndUpdate(
      { _id: examIdObj },
      {
        questionMcq: mcqQues,
      }
    );
  } catch (err) {
    return res.status(500).json(err);
  }

  return res.status(201).json("Saved.");
};
const addQuestionMcqBulk = async (req, res, next) => {
  const questionArray = req.body.questionArray;
  const examId = req.body.examId;
  const subjectId = req.body.subjectId;
  //console.log(examId);
  //console.log(subjectId);
  if (!ObjectId.isValid(examId) || !ObjectId.isValid(subjectId))
    return res.status(404).json("exam Id or subject Id is invalid.");
  let examIdObj = new mongoose.Types.ObjectId(examId);
  let subjectIdObj = new mongoose.Types.ObjectId(subjectId);
  let finalIds = [];
  for (let i = 0; i < questionArray.length; i++) {
    if (ObjectId.isValid(questionArray[i]))
      finalIds.push(new mongoose.Types.ObjectId(questionArray[i]));
    else continue;
  }
  //console.log(finalIds);
  if (finalIds.length == 0)
    return res.status(404).json("question IDs is not valid.");
  let mIdArray = null;
  try {
    mIdArray = await SpecialExam.findById(examId, "questionMcq");
  } catch (err) {
    return res.status(500).json(err);
  }
  //console.log("midarray:", mIdArray);
  mIdArray = mIdArray.questionMcq;
  //console.log("midarray:", mIdArray);
  let bulkData = [];
  //console.log("subdid:", subjectId);
  for (let i = 0; i < mIdArray.length; i++) {
    //console.log("subid:", String(mIdArray[i].subjectId));
    if (String(subjectId) == String(mIdArray[i].subjectId)) {
      bulkData = mIdArray[i].mcqId;
      //console.log("bulkData:", bulkData);
      break;
    }
  }
  ////console.log(mIdArray);
  let finalIdsString = [];
  finalIdsString = finalIds.map((e) => String(e));
  bulkData = bulkData.map((e) => String(e));
  //console.log("bulk:", bulkData);
  bulkData = bulkData.concat(finalIdsString);
  //console.log("bulk:", bulkData);
  let withoutDuplicate = Array.from(new Set(bulkData));
  withoutDuplicate = withoutDuplicate.map(
    (e) => new mongoose.Types.ObjectId(e)
  );
  for (let i = 0; i < mIdArray.length; i++) {
    if (subjectId == String(mIdArray[i].subjectId)) {
      mIdArray[i].mcqId = withoutDuplicate;
      break;
    }
  }
  ////console.log(withoutDuplicate);
  try {
    sav = await SpecialExam.findOneAndUpdate(
      { _id: examIdObj },
      {
        questionMcq: mIdArray,
      }
    );
  } catch (err) {
    return res.status(500).json(err);
  }
  return res.status(201).json("Inserted question to the exam.");
};
const questionByExamSub = async (req, res, next) => {
  const examId = req.query.examId;
  const subjectId = req.query.subjectId;
  if (!ObjectId.isValid(examId) || !ObjectId.isValid(subjectId))
    return res.status(404).json("exam Id is not valid.");
  const examIdObj = new mongoose.Types.ObjectId(examId);
  const subjectIdIdObj = new mongoose.Types.ObjectId(subjectId);
  let queryResult = null;

  try {
    queryResult = await SpecialExam.findById(examId);
  } catch (err) {
    return res.status(500).json(err);
  }
  queryResult = queryResult.questionMcq;
  let mcqId = [];
  for (let i = 0; i < queryResult.length; i++) {
    if (subjectId == String(queryResult[i].subjectId)) {
      mcqId = queryResult[i].mcqId;
      break;
    }
  }
  mcqId = mcqId.map((e) => new mongoose.Types.ObjectId(e));
  let quesData = [];
  try {
    quesData = await QuestionsMcq.find({
      $and: [{ _id: { $in: mcqId } }, { status: true }],
    });
  } catch (err) {
    return res.status(500).json(err);
  }
  let resultAll = [];
  for (let i = 0; i < quesData.length; i++) {
    let result = {};
    // if (queryResult.mId[i] == null) continue;
    result["type"] = quesData[i].type;
    result["question"] = quesData[i].question;
    result["options"] = quesData[i].options;
    result["correctOption"] = quesData[i].correctOption;
    result["explanation"] = quesData[i].explanationILink;
    result["questionId"] = quesData[i]._id;
    result["status"] = quesData[i].status;
    resultAll.push(result);
  }
  // resultAll.push({ totalQuestion: queryResult.mId.length });
  // resultAll.push({ examId: String(queryResult.eId) });
  return res.status(200).json(resultAll);
};
//written question
const addQuestionWritten = async (req, res, next) => {
  const examId = req.body.examId;
  const subjectId = req.body.subjectId;
  const marksPerQuestion = req.body.marksPerQuestion; //array
  let marksAll = marksPerQuestion.split(",");
  marksAll = marksAll.map((str) => {
    return Number(str);
  });
  //console.log(marksAll);
  //let subjectId = req.body.subjectId;
  //let marksPerQuestion = req.body.marksPerQuestion;
  if (!ObjectId.isValid(examId) || !ObjectId.isValid(subjectId))
    return res.status(404).json("Exam Id is not valid.");
  let examIdObj = new mongoose.Types.ObjectId(examId);
  let subjectIdObj = new mongoose.Types.ObjectId(subjectId);
  //file upload handle
  const file = req.files;
  //console.log(file);
  let questionILinkPath = null;
  if (!file.iLink[0].filename)
    return res.status(400).json("File not uploaded.");
  questionILinkPath = "uploads/".concat(file.iLink[0].filename);
  //written question save to db table
  let writtenData = null;
  try {
    writtenData = await SpecialExam.findById(examId, "questionWritten -_id");
  } catch (err) {
    return res.status(500).json("Something went wrong.");
  }
  writtenData = writtenData.questionWritten;
  for (let i = 0; i < writtenData.length; i++) {
    if (String(subjectIdObj) == String(writtenData[i].subjectId)) {
      writtenData[i].marksPerQuestion = marksAll;
      writtenData[i].writtenILink = questionILinkPath;
      break;
    }
  }
  let doc1 = null;
  try {
    doc1 = await SpecialExam.findOneAndUpdate(
      { _id: examIdObj },
      {
        questionWritten: writtenData,
      }
    );
  } catch (err) {
    return res.status(500).json(err);
  }
  return res.status(200).json("Question save correctly.");
};
const getWrittenQuestionByExamSub = async (req, res, next) => {
  let writtenQuestion = null;
  let examId = req.query.examId;
  let subjectId = req.query.subjectId;
  examId = new mongoose.Types.ObjectId(examId);
  subjectId = new mongoose.Types.ObjectId(subjectId);
  try {
    writtenQuestion = await SpecialExam.findById(examId);
  } catch (err) {
    return res.status(500).json("SOmething went wrong.");
  }
  if (writtenQuestion == null) return res.status(404).json("No data found.");
  writtenQuestion = writtenQuestion.questionWritten;
  let questionData = [];
  for (let i = 0; i < writtenQuestion.length; i++) {
    if (String(subjectId) == String(writtenQuestion[i].subjectId)) {
      questionData = writtenQuestion[i];
      break;
    }
  }
  //console.log(questionData);
  return res.status(200).json(questionData);
};
//others
const viewSollutionMcq = async (req, res, next) => {
  ////console.log(req.query);
  const studentId = req.user.studentId;
  const examId = req.query.examId;
  if (!ObjectId.isValid(studentId) || !ObjectId.isValid(examId))
    return res.status(404).json("student Id or examId is not valid.");
  let studentIdObj = new mongoose.Types.ObjectId(studentId);
  let examIdObj = new mongoose.Types.ObjectId(examId);
  ////console.log(studentIdObj, examIdObj);
  let data = null;
  try {
    data = await SpecialVsStudent.findOne({
      $and: [{ studentId: studentIdObj }, { examId: examIdObj }],
    })
      .populate({
        path: "questionMcq",
        populate: { path: "mcqId" },
      })
      .populate({
        path: "questionMcq",
        populate: { path: "subjectId" },
      })
      .populate("examId");
  } catch (err) {
    return res.status(500).json("1.Something went wrong.");
  }

  if (data == null)
    return res.status(404).json("No exam found under this student.");
  let resultData = [];
  for (let i = 0; i < 4; i++) {
    //console.log("data", data.questionMcq[i].mcqId);
    let data1 = {};
    data1["subjectName"] = data.questionMcq[i].subjectId.name;
    data1["totalObtainedMarksPerSub"] =
      data.questionMcq[i].mcqMarksPerSub.toFixed(2);
    data1["totalMarksPerSub"] = data.examId.totalMarksMcq / 4;
    data1["questions"] = [];
    for (let j = 0; j < data.questionMcq[i].mcqId.length; j++) {
      let qData = {};
      qData["iLink"] = data.questionMcq[i].mcqId[j].question;
      qData["options"] = data.questionMcq[i].mcqId[j].options;
      qData["correctOptions"] = data.questionMcq[i].mcqId[j].correctOption;
      qData["explanationILink"] = data.questionMcq[i].mcqId[j].explanationILink;
      qData["type"] = data.questionMcq[i].mcqId[j].type;
      qData["answeredOption"] = data.questionMcq[i].mcqAnswer[j];
      qData["correctOption"] = data.questionMcq[i].mcqId[j].correctOption;
      qData["optionCount"] = data.questionMcq[i].mcqId[j].optionCount;
      data1["questions"].push(qData);
    }

    resultData.push(data1);
  }
  resultData.push({ totalMarks: data.examId.totalMarksMcq });
  resultData.push({ totalObtainedMarks: data.totalObtainedMarks.toFixed(2) });
  return res.status(200).json(resultData);
};
const viewSollutionWritten = async (req, res, next) => {
  const studentId = req.user.studentId;
  const examId = req.query.examId;
  if (!ObjectId.isValid(studentId) || !ObjectId.isValid(examId))
    return res.status(404).json("student Id or examId is not valid.");
  let studentIdObj = new mongoose.Types.ObjectId(studentId);
  let examIdObj = new mongoose.Types.ObjectId(examId);
  ////console.log(studentIdObj, examIdObj);
  let data = null;
  try {
    data = await SpecialVsStudent.findOne({
      $and: [{ studentId: studentIdObj }, { examId: examIdObj }],
    }).populate({
      path: "questionWritten",
      populate: { path: "subjectId" },
    });
  } catch (err) {
    return res.status(500).json("2.Something went wrong.");
  }
  //console.log(data);
  if (data == null)
    return res.status(404).json("No exam found under this student.");
  let subjects = [];
  for (i = 0; i < 4; i++) {
    let sObj = {};
    sObj["id"] = data.questionWritten[i].subjectId._id;
    sObj["name"] = data.questionWritten[i].subjectId.name;
    sObj["iLink"] = null;
    sObj["answerScript"] = null;
    sObj["marksPerQuestion"] = null;
    sObj["marksPerSub"] = 0;
    subjects[i] = sObj;
  }
  let writtenQuestion = null;
  try {
    writtenQuestion = await SpecialExam.findById(examId);
  } catch (err) {
    return res.status(500).json("3.Something went wrong.");
  }
  let dataNew = [];
  for (let i = 0; i < 4; i++) {
    //console.log("subject i Id", subjects[i].id);
    for (let j = 0; j < 6; j++) {
      if (
        String(subjects[i].id) ==
        String(writtenQuestion.questionWritten[j].subjectId)
      ) {
        subjects[i].iLink = writtenQuestion.questionWritten[j].writtenILink;
        subjects[i].answerScript = data.questionWritten[i].answerScriptILink;
        subjects[i].marksPerSub =
          data.questionWritten[i].totalObtainedMarksWritten;
        subjects[i].marksPerQuestion = data.questionWritten[i].obtainedMarks;
        //console.log("examQ", writtenQuestion.questionWritten[j].subjectId);
        break;
      }
    }
    dataNew.push(subjects[i]);
  }
  return res.status(200).json(dataNew);
};
const specialGetHistory1 = async (req, res, next) => {
  const examId = req.query.examId;
  if (!ObjectId.isValid(examId))
    return res.status(404).json("Student ID not valid.");
  let page = req.query.page || 1;

  let examIdObj = new mongoose.Types.ObjectId(examId);
  let count = 0;
  try {
    count = await SpecialVsStudent.find({
      $and: [{ examId: examIdObj }],
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
    rank = await SpecialVsStudent.find({
      $and: [{ examId: examIdObj }],
    })
      .populate("studentId")
      .skip(paginateData.skippedIndex)
      .limit(paginateData.perPage);
  } catch (err) {
    ////console.log(err);
    return res.status(500).json("2.Something went wrong.");
  }
  let qWritten = null;
  try {
    qWritten = await SpecialVsStudent.findOne({ examId: examIdObj });
  } catch (err) {
    return res.status(500).json("Something went wrong.");
  }
  for (let i = 0; i < rank.length; i++) {
    let mcqRank = null;
    try {
      mcqRank = await SpecialRank.findOne({
        $and: [{ examId: examIdObj }, { studentId: rank[i].studentId._id }],
      });
    } catch (err) {
      return res.status(500).json("3.Something went wrong.");
    }
    if (mcqRank == null) mcqRank = "-1";
    else mcqRank = mcqRank.rank;
    let data1 = {},
      examStud = null;
    data1["studentId"] = rank[i].studentId._id;
    try {
      examStud = await SpecialVsStudent.findOne({
        $and: [{ examId: examIdObj }, { studentId: data1["studentId"] }],
      }).populate("studentId");
    } catch (err) {
      return res.status(500).json("4.Something went wrong.");
    }
    data1["examStud"] = examStud;
    data1["totalObtainedMarks"] = examStud.totalObtainedMarks;
    data1["meritPosition"] = mcqRank;
    data1["examStartTime"] = moment(rank[i].examStartTimeMcq).format("LLL");
    data1["examEndTime"] = moment(rank[i].examEndTimeWritten).format("LLL");
    data1["duration"] = rank[i].totalDuration;
    data1["totalObtainedMarksMcq"] = examStud.totalMarksMcq;
    data1["totalObtainedMarksWritten"] = examStud.totalMarksWritten;
    data.push(data1);
  }
  examDetails = null;
  try {
    examDetails = await SpecialExam.findById(String(examIdObj)).populate(
      "courseId"
    );
  } catch (err) {
    return res.status(500).json("5.Something went wrong.");
  }
  //console.log(examDetails.totalMarksMcq);
  //console.log(examDetails.totalMarksWritten);
  let examInfo = {
    id: String(examDetails._id),
    name: examDetails.name,
    courseName: examDetails.courseId.name,
    startTime: moment(examDetails.examStartTime).format("LLL"),
    endTime: moment(examDetails.examEndTime).format("LLL"),
    totalQuestion: qWritten.totalQuestions,
    totalMarks: examDetails.totalMarksMcq + examDetails.totalMarksWritten,
  };
  return res.status(200).json({ data, examInfo, paginateData });
};
const specialGetHistory = async (req, res, next) => {
  const examId = req.query.examId;
  if (!ObjectId.isValid(examId))
    return res.status(404).json("Student ID not valid.");
  let page = req.query.page || 1;

  let examIdObj = new mongoose.Types.ObjectId(examId);
  let count = [];
  try {
    count = await SpecialVsStudent.find({
      $and: [{ examId: examIdObj }],
    })
      .sort({ totalObtainedMarks: -1 })
      .populate("studentId")
      .populate("examId");
  } catch (err) {
    return res.status(500).json("1.Something went wrong.");
  }
  if (count.length == 0) {
    return res.status(404).json("No data found.");
  }
  let uniqueIds = [];
  let studentIds = count.filter((element) => {
    const isDuplicate = uniqueIds.includes(element.studentId._id);

    if (!isDuplicate) {
      uniqueIds.push(element.studentId._id);
      return true;
    }
    return false;
  });
  let data = [];
  for (let i = 0; i < studentIds.length; i++) {
    let data1 = {};
    studentIds[i].rank = i + 1;
    data1["studentId"] = studentIds[i].studentId._id;
    data1["examStud"] = studentIds[i];
    data1["totalObtainedMarks"] = studentIds[i].totalObtainedMarks.toFixed(2);
    data1["meritPosition"] = studentIds[i].rank;
    data1["examStartTime"] = moment(studentIds[i].examStartTimeMcq).format(
      "LLL"
    );
    data1["examEndTime"] = moment(studentIds[i].examEndTimeWritten).format(
      "LLL"
    );
    data1["duration"] = studentIds[i].totalDuration;
    data1["totalObtainedMarksMcq"] = studentIds[i].totalMarksMcq;
    data1["totalObtainedMarksWritten"] = studentIds[i].totalMarksWritten;
    data.push(data1);
  }
  examDetails = studentIds[0].examId;
  //let paginateData = pagination(studentIds.length, page);

  let examInfo = {
    id: String(examDetails._id),
    name: examDetails.name,
    courseName: examDetails.courseId.name,
    startTime: moment(examDetails.examStartTime).format("LLL"),
    endTime: moment(examDetails.examEndTime).format("LLL"),
    totalMarks: examDetails.totalMarksMcq + examDetails.totalMarksWritten,
  };
  let count1 = data.length;
  let paginateData = pagination(count1, page);
  let start, end;
  start = (page - 1) * paginateData.perPage;
  end = page * paginateData.perPage;
  // //console.log(paginateData);
  // //console.log(start);
  // //console.log(end);
  // //console.log(data.length);
  let data2 = [];
  if (count1 > 0) {
    for (let i = start; i < end; i++) {
      if (i == data.length) break;
      //console.log("i value:", i, data[i]);
      data2.push(data[i]);
    }
  }
  ////console.log("data1", data2);
  data = data2;
  return res.status(200).json({ data, examInfo, paginateData });
};
const specialGetHistoryFilter = async (req, res, next) => {
  const examId = req.query.examId;
  const regNo = req.query.regNo;
  if (!ObjectId.isValid(examId) || !regNo)
    return res.status(404).json("Student ID not valid.");
  let page = req.query.page || 1;

  let examIdObj = new mongoose.Types.ObjectId(examId);
  let count = [];
  try {
    count = await SpecialVsStudent.find({
      $and: [{ examId: examIdObj }],
    })
      .sort({ totalObtainedMarks: -1 })
      .populate("studentId")
      .populate("examId");
  } catch (err) {
    return res.status(500).json("1.Something went wrong.");
  }
  if (count.length == 0) {
    return res.status(404).json("No data found.");
  }
  let uniqueIds = [];
  let studentIds = count.filter((element) => {
    const isDuplicate = uniqueIds.includes(element.studentId._id);

    if (!isDuplicate) {
      uniqueIds.push(element.studentId._id);
      return true;
    }
    return false;
  });
  let data = [];
  for (let i = 0; i < studentIds.length; i++) {
    let data1 = {};
    studentIds[i].rank = i + 1;
    data1["studentId"] = studentIds[i].studentId._id;
    data1["regNo"] = studentIds[i].studentId.regNo;
    data1["examStud"] = studentIds[i];
    data1["totalObtainedMarks"] = studentIds[i].totalObtainedMarks.toFixed(2);
    data1["meritPosition"] = studentIds[i].rank;
    data1["examStartTime"] = moment(studentIds[i].examStartTimeMcq).format(
      "LLL"
    );
    data1["examEndTime"] = moment(studentIds[i].examEndTimeWritten).format(
      "LLL"
    );
    data1["duration"] = studentIds[i].totalDuration;
    data1["totalObtainedMarksMcq"] = studentIds[i].totalMarksMcq;
    data1["totalObtainedMarksWritten"] = studentIds[i].totalMarksWritten;
    data.push(data1);
  }
  const regex = new RegExp(".*" + regNo.toLowerCase() + ".*", "i");
  data = data.filter(({ regNo }) => regNo.match(regex));
  examDetails = studentIds[0].examId;
  //let paginateData = pagination(studentIds.length, page);

  let examInfo = {
    id: String(examDetails._id),
    name: examDetails.name,
    courseName: examDetails.courseId.name,
    startTime: moment(examDetails.examStartTime).format("LLL"),
    endTime: moment(examDetails.examEndTime).format("LLL"),
    totalMarks: examDetails.totalMarksMcq + examDetails.totalMarksWritten,
  };
  let count1 = data.length;
  let paginateData = pagination(count1, page);
  let start, end;
  start = (page - 1) * paginateData.perPage;
  end = page * paginateData.perPage;
  // //console.log(paginateData);
  // //console.log(start);
  // //console.log(end);
  // //console.log(data.length);
  let data2 = [];
  if (count1 > 0) {
    for (let i = start; i < end; i++) {
      if (i == data.length) break;
      //console.log("i value:", i, data[i]);
      data2.push(data[i]);
    }
  }
  ////console.log("data1", data2);
  data = data2;

  return res.status(200).json({ data, examInfo, paginateData });
};
const specialGetHistory2 = async (req, res, next) => {
  const examId = req.query.examId;
  if (!ObjectId.isValid(examId))
    return res.status(404).json("Student ID not valid.");
  let page = req.query.page || 1;

  let examIdObj = new mongoose.Types.ObjectId(examId);
  let count = [];
  try {
    count = await SpecialVsStudent.find({
      $and: [{ examId: examIdObj }],
    })
      .sort({ totalObtainedMarks })
      .populate("studentId");
  } catch (err) {
    return res.status(500).json("1.Something went wrong.");
  }
  if (count.length == 0) {
    return res.status(404).json("No data found.");
  }
  let uniqueIds = [];
  let studentIds = count.filter((element) => {
    const isDuplicate = uniqueIds.includes(element.studentId._id);

    if (!isDuplicate) {
      uniqueIds.push(element.studentId._id);
      return true;
    }
    return false;
  });
  //console.log(studentIds);
  let paginateData = pagination(studentIds.length, page);
  let data = [];
  let qWritten = null;
  try {
    qWritten = await SpecialVsStudent.findOne({ examId: examIdObj });
  } catch (err) {
    return res.status(500).json("Something went wrong.");
  }
  let mcqRank = [];
  try {
    mcqRank = await SpecialRank.find({
      $and: [{ examId: examIdObj }, { studentId: { $in: uniqueIds } }],
    });
  } catch (err) {
    return res.status(500).json("3.Something went wrong.");
  }
  for (let i = 0; i < uniqueIds.length; i++) {
    if (mcqRank[i] == null) mcqRank = "-1";
    else mcqRank = mcqRank.rank;
    let data1 = {},
      examStud = null;
    data1["studentId"] = uniqueIds[i];
    try {
      examStud = await SpecialVsStudent.findOne({
        $and: [{ examId: examIdObj }, { studentId: data1["studentId"] }],
      }).populate("studentId");
    } catch (err) {
      return res.status(500).json("4.Something went wrong.");
    }
    data1["examStud"] = examStud;
    data1["totalObtainedMarks"] = examStud.totalObtainedMarks;
    data1["meritPosition"] = mcqRank;
    data1["examStartTime"] = moment(studentIds[i].examStartTimeMcq).format(
      "LLL"
    );
    data1["examEndTime"] = moment(studentIds[i].examEndTimeWritten).format(
      "LLL"
    );
    data1["duration"] = studentIds[i].totalDuration;
    data1["totalObtainedMarksMcq"] = examStud.totalMarksMcq;
    data1["totalObtainedMarksWritten"] = examStud.totalMarksWritten;
    data.push(data1);
  }
  examDetails = null;
  try {
    examDetails = await SpecialExam.findById(String(examIdObj)).populate(
      "courseId"
    );
  } catch (err) {
    return res.status(500).json("5.Something went wrong.");
  }
  // //console.log(examDetails.totalMarksMcq);
  // //console.log(examDetails.totalMarksWritten);
  let examInfo = {
    id: String(examDetails._id),
    name: examDetails.name,
    courseName: examDetails.courseId.name,
    startTime: moment(examDetails.examStartTime).format("LLL"),
    endTime: moment(examDetails.examEndTime).format("LLL"),
    totalQuestion: qWritten.totalQuestions,
    totalMarks: examDetails.totalMarksMcq + examDetails.totalMarksWritten,
  };
  return res.status(200).json({ data, examInfo, paginateData });
};
const specialGetHistoryAdmin = async (req, res, next) => {
  const examId = req.query.examId;
  if (!ObjectId.isValid(examId))
    return res.status(404).json("Exam Id or RegNo is not valid.");
  let page = req.query.page || 1;
  let examIdObj = new mongoose.Types.ObjectId(examId);
  let count = 0;
  try {
    count = await SpecialVsStudent.find({
      $and: [{ examId: examIdObj }],
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
    rank = await SpecialVsStudent.find({
      $and: [{ examId: examIdObj }],
    })
      .populate("studentId")
      .skip(paginateData.skippedIndex)
      .limit(paginateData.perPage);
  } catch (err) {
    ////console.log(err);
    return res.status(500).json("2.Something went wrong.");
  }
  let qWritten = null;
  try {
    qWritten = await SpecialVsStudent.findOne({ examId: examIdObj });
  } catch (err) {
    return res.status(500).json("Something went wrong.");
  }
  for (let i = 0; i < rank.length; i++) {
    let mcqRank = null;
    try {
      mcqRank = await SpecialRank.findOne({
        $and: [{ examId: examIdObj }, { studentId: rank[i].studentId._id }],
      });
    } catch (err) {
      return res.status(500).json("3.Something went wrong.");
    }
    if (mcqRank == null) mcqRank = "-1";
    else mcqRank = mcqRank.rank;
    let data1 = {},
      examStud = null;
    data1["studentId"] = rank[i].studentId._id;
    try {
      examStud = await SpecialVsStudent.findOne({
        $and: [{ examId: examIdObj }, { studentId: data1["studentId"] }],
      }).populate("studentId");
    } catch (err) {
      return res.status(500).json("4.Something went wrong.");
    }
    data1["examStud"] = examStud;
    data1["totalObtainedMarks"] = examStud.totalObtainedMarks;
    data1["meritPosition"] = mcqRank;
    data1["examStartTime"] = moment(rank[i].examStartTimeMcq)
      .subtract(6, "h")
      .format("LLL");
    data1["examEndTime"] = moment(rank[i].examEndTimeWritten)
      .subtract(6, "h")
      .format("LLL");
    data1["duration"] = rank[i].totalDuration;
    data1["totalObtainedMarksMcq"] = examStud.totalMarksMcq;
    data1["totalObtainedMarksWritten"] = examStud.totalMarksWritten;
    data.push(data1);
  }
  examDetails = null;
  try {
    examDetails = await SpecialExam.findById(String(examIdObj)).populate(
      "courseId"
    );
  } catch (err) {
    return res.status(500).json("5.Something went wrong.");
  }
  //console.log(examDetails.totalMarksMcq);
  //console.log(examDetails.totalMarksWritten);
  let examInfo = {
    id: String(examDetails._id),
    name: examDetails.name,
    courseName: examDetails.courseId.name,
    startTime: moment(examDetails.startTime).format("LLL"),
    endTime: moment(examDetails.endTime).subtract(6, "h").format("LLL"),
    totalQuestion: qWritten.totalQuestions,
    totalMarks: examDetails.totalMarksMcq + examDetails.totalMarksWritten,
  };
  return res.status(200).json({ data, examInfo, paginateData });
};
const specialGetHistoryAdminFilter = async (req, res, next) => {
  const examId = req.query.examId;
  const regNo = req.query.regNo;
  if (!ObjectId.isValid(examId) || !regNo)
    return res.status(404).json("Exam Id or RegNo is not valid.");
  let page = req.query.page || 1;
  let studentId = null;
  let examIdObj = new mongoose.Types.ObjectId(examId);
  try {
    studentId = await Student.find({
      regNo: {
        $regex: new RegExp(".*" + regNo.toLowerCase() + ".*", "i"),
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
    count = await SpecialVsStudent.find({
      $and: [{ examId: examIdObj }, { studentId: { $in: studIds } }],
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
    rank = await SpecialVsStudent.find({
      $and: [{ examId: examIdObj }, { studentId: { $in: studIds } }],
    })
      .populate("studentId")
      .skip(paginateData.skippedIndex)
      .limit(paginateData.perPage);
  } catch (err) {
    ////console.log(err);
    return res.status(500).json("2.Something went wrong.");
  }
  let qWritten = null;
  try {
    qWritten = await SpecialVsStudent.findOne({ examId: examIdObj });
  } catch (err) {
    return res.status(500).json("Something went wrong.");
  }
  for (let i = 0; i < rank.length; i++) {
    let mcqRank = null;
    try {
      mcqRank = await SpecialRank.findOne({
        $and: [{ examId: examIdObj }, { studentId: rank[i].studentId._id }],
      });
    } catch (err) {
      return res.status(500).json("3.Something went wrong.");
    }
    if (mcqRank == null) mcqRank = "-1";
    else mcqRank = mcqRank.rank;
    let data1 = {},
      examStud = null;
    data1["studentId"] = rank[i].studentId._id;
    try {
      examStud = await SpecialVsStudent.findOne({
        $and: [{ examId: examIdObj }, { studentId: data1["studentId"] }],
      }).populate("studentId");
    } catch (err) {
      return res.status(500).json("4.Something went wrong.");
    }
    data1["examStud"] = examStud;
    data1["totalObtainedMarks"] = examStud.totalObtainedMarks;
    data1["meritPosition"] = mcqRank;
    data1["examStartTime"] = moment(rank[i].examStartTimeMcq)
      .subtract(6, "h")
      .format("LLL");
    data1["examEndTime"] = moment(rank[i].examEndTimeWritten)
      .subtract(6, "h")
      .format("LLL");
    data1["duration"] = rank[i].totalDuration;
    data1["totalObtainedMarksMcq"] = examStud.totalMarksMcq;
    data1["totalObtainedMarksWritten"] = examStud.totalMarksWritten;
    data.push(data1);
  }
  examDetails = null;
  try {
    examDetails = await SpecialExam.findById(String(examIdObj)).populate(
      "courseId"
    );
  } catch (err) {
    return res.status(500).json("5.Something went wrong.");
  }
  //console.log(examDetails.totalMarksMcq);
  //console.log(examDetails.totalMarksWritten);
  let examInfo = {
    id: String(examDetails._id),
    name: examDetails.name,
    courseName: examDetails.courseId.name,
    startTime: moment(examDetails.startTime).subtract(6, "h").format("LLL"),
    endTime: moment(examDetails.endTime).subtract(6, "h").format("LLL"),
    totalQuestion: qWritten.totalQuestions,
    totalMarks: examDetails.totalMarksMcq + examDetails.totalMarksWritten,
  };
  return res.status(200).json({ data, examInfo, paginateData });
};
const viewSollutionMcqAdmin = async (req, res, next) => {
  ////console.log(req.query);
  const studentId = req.query.studentId;
  const examId = req.query.examId;
  if (!ObjectId.isValid(studentId) || !ObjectId.isValid(examId))
    return res.status(404).json("student Id or examId is not valid.");
  let studentIdObj = new mongoose.Types.ObjectId(studentId);
  let examIdObj = new mongoose.Types.ObjectId(examId);
  ////console.log(studentIdObj, examIdObj);
  let data = null;
  try {
    data = await SpecialVsStudent.findOne({
      $and: [{ studentId: studentIdObj }, { examId: examIdObj }],
    })
      .populate({
        path: "questionMcq",
        populate: { path: "mcqId" },
      })
      .populate({
        path: "questionMcq",
        populate: { path: "subjectId" },
      })
      .populate("examId");
  } catch (err) {
    return res.status(500).json("1.Something went wrong.");
  }

  if (data == null)
    return res.status(404).json("No exam found under this student.");
  let resultData = [];
  for (let i = 0; i < 4; i++) {
    //console.log("data", data.questionMcq[i].mcqId);
    let data1 = {};
    data1["subjectName"] = data.questionMcq[i].subjectId.name;
    data1["totalObtainedMarksPerSub"] = data.questionMcq[i].mcqMarksPerSub;
    data1["totalMarksPerSub"] = data.examId.totalMarksMcq / 4;
    data1["questions"] = [];
    for (let j = 0; j < data.questionMcq[i].mcqId.length; j++) {
      let qData = {};
      qData["iLink"] = data.questionMcq[i].mcqId[j].question;
      qData["options"] = data.questionMcq[i].mcqId[j].options;
      qData["correctOptions"] = data.questionMcq[i].mcqId[j].correctOption;
      qData["explanationILink"] = data.questionMcq[i].mcqId[j].explanationILink;
      qData["type"] = data.questionMcq[i].mcqId[j].type;
      qData["answeredOption"] = data.questionMcq[i].mcqAnswer[j];
      qData["correctOption"] = data.questionMcq[i].mcqId[j].correctOption;
      qData["optionCount"] = data.questionMcq[i].mcqId[j].optionCount;
      data1["questions"].push(qData);
    }

    resultData.push(data1);
  }
  resultData.push({ totalMarks: data.examId.totalMarksMcq });
  resultData.push({ totalObtainedMarks: data.totalObtainedMarks });
  return res.status(200).json(resultData);
};
const viewSollutionWrittenAdmin = async (req, res, next) => {
  const studentId = req.query.studentId;
  const examId = req.query.examId;
  if (!ObjectId.isValid(studentId) || !ObjectId.isValid(examId))
    return res.status(404).json("student Id or examId is not valid.");
  let studentIdObj = new mongoose.Types.ObjectId(studentId);
  let examIdObj = new mongoose.Types.ObjectId(examId);
  ////console.log(studentIdObj, examIdObj);
  let data = null;
  try {
    data = await SpecialVsStudent.findOne({
      $and: [{ studentId: studentIdObj }, { examId: examIdObj }],
    }).populate({
      path: "questionWritten",
      populate: { path: "subjectId" },
    });
  } catch (err) {
    return res.status(500).json("2.Something went wrong.");
  }
  //console.log(data);
  if (data == null)
    return res.status(404).json("No exam found under this student.");
  let subjects = [];
  for (i = 0; i < 4; i++) {
    let sObj = {};
    sObj["id"] = data.questionWritten[i].subjectId._id;
    sObj["name"] = data.questionWritten[i].subjectId.name;
    sObj["iLink"] = null;
    sObj["answerScript"] = null;
    sObj["marksPerQuestion"] = null;
    sObj["marksPerSub"] = 0;
    subjects[i] = sObj;
  }
  let writtenQuestion = null;
  try {
    writtenQuestion = await SpecialExam.findById(examId);
  } catch (err) {
    return res.status(500).json("3.Something went wrong.");
  }
  let dataNew = [];
  for (let i = 0; i < 4; i++) {
    //console.log("subject i Id", subjects[i].id);
    for (let j = 0; j < 6; j++) {
      if (
        String(subjects[i].id) ==
        String(writtenQuestion.questionWritten[j].subjectId)
      ) {
        subjects[i].iLink = writtenQuestion.questionWritten[j].writtenILink;
        subjects[i].answerScript = data.questionWritten[i].answerScriptILink;
        subjects[i].marksPerSub =
          data.questionWritten[i].totalObtainedMarksWritten;
        subjects[i].marksPerQuestion = data.questionWritten[i].obtainedMarks;
        //console.log("examQ", writtenQuestion.questionWritten[j].subjectId);
        break;
      }
    }
    dataNew.push(subjects[i]);
  }
  return res.status(200).json(dataNew);
};
const historyData1 = async (req, res, next) => {
  //console.log(req.user);
  const studentId = req.user.studentId;
  if (!ObjectId.isValid(studentId))
    return res.status(404).json("Student ID not valid.");
  let page = req.query.page || 1;

  let studentIdObj = new mongoose.Types.ObjectId(studentId);
  let data;
  let count = 0;
  try {
    count = await SpecialVsStudent.find({
      $and: [{ studentId: studentIdObj }, { publishStatus: true }],
    }).count();
  } catch (err) {
    return res.status(500).json("Something went wrong.");
  }
  let paginateData = pagination(count, page);
  try {
    data = await SpecialVsStudent.find({
      $and: [{ studentId: studentIdObj }, { publishStatus: true }],
    })
      .populate({
        path: "examId",
        populate: { path: "courseId", select: "name -_id" },
      })
      .populate({
        path: "questionMcq",
        populate: { path: "subjectId", select: "name -_id" },
      })
      .skip(paginateData.skippedIndex)
      .limit(paginateData.perPage);
  } catch (err) {
    return res.status(500).json("1.SOmething went wrong.");
  }
  //return res.status(200).json(data);
  //console.log(data);
  let resultData = [];
  let flag = false;
  ////console.log(data.length);
  for (let i = 0; i < data.length; i++) {
    // if (
    //   data[i].questionWritten == null ||
    //   data[i].questionWritten.length <= 0
    // ) {
    //   continue;
    // }
    let data1 = {};
    let rank = null;
    let examIdObj = new mongoose.Types.ObjectId(data[i].examId._id);
    let resultRank = null;
    try {
      resultRank = await SpecialRank.findOne({
        $and: [{ examId: examIdObj }, { studentId: studentIdObj }],
      });
    } catch (err) {
      return res.status(500).json("Something went wrong.");
    }
    //console.log("res", resultRank);
    if (resultRank == null) resultRank = "-1";
    else resultRank = resultRank.rank;
    data1["examId"] = data[i].examId._id;
    data1["title"] = data[i].examId.name;
    data1["examStartTime"] = moment(data[i].examId.startTime)
      .subtract(6, "h")
      .format("LLL");
    data1["variation"] = "Special Exam";
    data1["examType"] = "no";
    data1["totalObtainedMarks"] =
      data[i].totalMarksMcq + data[i].totalMarksWritten;
    data1["totalMarksMcqExam"] = data[i].totalMarksMcq;
    data1["totalMarksWrittenExam"] = data[i].totalMarksWritten;
    data1["totalMarksMcq"] =
      data[i].examId.totalMarksMcq + data[i].examId.totalMarksWritten;
    data1["meritPosition"] = resultRank;
    data1["examStartTimeMcq"] = moment(data[i].startTimeMcq).format("LLL");
    data1["examEndTimeMcq"] = moment(data[i].endTimeMcq).format("LLL");
    data1["examStartTimeWritten"] = moment(data[i].startTimeWritten).format(
      "LLL"
    );
    data1["examEndTimeWritten"] = moment(data[i].endTimeWritten).format("LLL");
    data1["mcqDuration"] = data[i].mcqDuration;
    data1["writtenDuration"] = data[i].writtenDuration;
    data1["totalDuration"] = data[i].mcqDuration + data[i].writtenDuration;
    data1["courseName"] = data[i].examId.courseId.name;
    let subObj = [];
    for (let j = 0; j < 4; j++) {
      subObj.push(data[i].questionMcq[j].subjectId.name);
    }
    data1["subjectName"] = subObj.join("+");
    resultData.push(data1);
  }

  return res.status(200).json({ resultData, paginateData });
};
const historyData = async (req, res, next) => {
  const studentId = req.user.studentId;
  if (!ObjectId.isValid(studentId))
    return res.status(404).json("Student ID not valid.");
  let page = req.query.page || 1;

  let studentIdObj = new mongoose.Types.ObjectId(studentId);
  let data;
  let count = 0;
  try {
    count = await SpecialVsStudent.find({
      $and: [{ studentId: studentIdObj }, { publishStatus: true }],
    }).count();
  } catch (err) {
    return res.status(500).json("Something went wrong.");
  }
  let paginateData = pagination(count, page);
  try {
    data = await SpecialVsStudent.find({
      $and: [{ studentId: studentIdObj }, { publishStatus: true }],
    })
      .populate({
        path: "examId",
        populate: { path: "courseId", select: "name -_id" },
      })
      .populate({
        path: "questionMcq",
        populate: { path: "subjectId", select: "name -_id" },
      })
      .skip(paginateData.skippedIndex)
      .limit(paginateData.perPage);
  } catch (err) {
    return res.status(500).json("1.SOmething went wrong.");
  }
  //return res.status(200).json(data);
  // //console.log(data);
  let resultData = [];
  let flag = false;
  ////console.log(data.length);
  let examIdObTest = "-1";
  for (let i = 0; i < data.length; i++) {
    let data1 = {};
    let rank = null;
    examIdObj = new mongoose.Types.ObjectId(data[i].examId._id);
    if (String(examIdObj) == String(examIdObTest)) {
      //console.log(" examIdObTest:", examIdObTest);
      continue;
    }
    examIdObTest = examIdObj;
    let resultRank = null;
    try {
      resultRank = await SpecialRank.findOne({
        $and: [{ examId: examIdObj }, { studentId: studentIdObj }],
      });
    } catch (err) {
      return res.status(500).json("Something went wrong.");
    }
    ////console.log("res", resultRank);
    if (resultRank == null) resultRank = "-1";
    else resultRank = resultRank.rank;
    data1["examId"] = data[i].examId._id;
    data1["title"] = data[i].examId.name;
    data1["examStartTime"] = moment(data[i].examId.startTime)
      .subtract(6, "h")
      .format("LLL");
    data1["variation"] = "Special Exam";
    data1["examType"] = "no";
    data1["totalObtainedMarks"] = (
      data[i].totalMarksMcq + data[i].totalMarksWritten
    ).toFixed(2);
    data1["totalMarksMcqExam"] = data[i].totalMarksMcq;
    data1["totalMarksWrittenExam"] = data[i].totalMarksWritten;
    data1["totalMarksMcq"] =
      data[i].examId.totalMarksMcq + data[i].examId.totalMarksWritten;
    data1["meritPosition"] = resultRank;
    data1["examStartTimeMcq"] = moment(data[i].startTimeMcq).format("LLL");
    data1["examEndTimeMcq"] = moment(data[i].endTimeMcq).format("LLL");
    data1["examStartTimeWritten"] = moment(data[i].startTimeWritten).format(
      "LLL"
    );
    data1["examEndTimeWritten"] = moment(data[i].endTimeWritten).format("LLL");
    data1["mcqDuration"] = data[i].mcqDuration;
    data1["writtenDuration"] = data[i].writtenDuration;
    data1["totalDuration"] = data[i].mcqDuration + data[i].writtenDuration;
    data1["courseName"] = data[i].examId.courseId.name;
    let subObj = [];
    for (let j = 0; j < 4; j++) {
      subObj.push(data[i].questionMcq[j].subjectId.name);
    }
    data1["subjectName"] = subObj.join("+ ");
    resultData.push(data1);
  }

  return res.status(200).json({ resultData, paginateData });
};
const historyData2 = async (req, res, next) => {
  const studentId = req.user.studentId;
  const courseId = req.query.courseId;
  if (!ObjectId.isValid(studentId) || !ObjectId.isValid(courseId))
    return res.status(404).json("Student ID or Course ID not valid.");
  let page = req.query.page || 1;

  let studentIdObj = new mongoose.Types.ObjectId(studentId);
  let courseIdObj = new mongoose.Types.ObjectId(courseId);
  let data = [];
  try {
    data = await SpecialVsStudent.find({
      $and: [{ studentId: studentIdObj }, { publishStatus: true }],
    })
      .populate({
        path: "examId",
        populate: { path: "courseId", select: "name -_id" },
      })
      .populate({
        path: "questionMcq",
        populate: { path: "subjectId", select: "name -_id" },
      });
  } catch (err) {
    return res.status(500).json("1.SOmething went wrong.");
  }
  if (data.length == 0) return res.status(404).json("No data found.");
  //return res.status(200).json(data);
  // //console.log(data);
  let resultData = [];
  let flag = false;
  ////console.log(data.length);
  let examIdObTest = "-1";
  for (let i = 0; i < data.length; i++) {
    let data1 = {};
    let rank = null;
    examIdObj = new mongoose.Types.ObjectId(data[i].examId._id);
    if (
      String(courseId) != String(data[i].examId.courseId) ||
      String(examIdObj) == String(examIdObTest)
    )
      continue;
    examIdObTest = examIdObj;
    let resultRank = null;
    try {
      resultRank = await SpecialRank.findOne({
        $and: [{ examId: examIdObj }, { studentId: studentIdObj }],
      });
    } catch (err) {
      return res.status(500).json("Something went wrong.");
    }
    ////console.log("res", resultRank);
    if (resultRank == null) resultRank = "-1";
    else resultRank = resultRank.rank;
    data1["examId"] = data[i].examId._id;
    data1["title"] = data[i].examId.name;
    data1["examStartTime"] = moment(data[i].examId.startTime)
      .subtract(6, "h")
      .format("LLL");
    data1["variation"] = "Special Exam";
    data1["examType"] = "no";
    data1["totalObtainedMarks"] = (
      data[i].totalMarksMcq + data[i].totalMarksWritten
    ).toFixed(2);
    data1["totalMarksMcqExam"] = data[i].totalMarksMcq.toFixed(2);
    data1["totalMarksWrittenExam"] = data[i].totalMarksWritten.toFixed(2);
    data1["totalMarksMcq"] = (
      data[i].examId.totalMarksMcq + data[i].examId.totalMarksWritten
    ).toFixed(2);
    data1["meritPosition"] = resultRank;
    data1["examStartTimeMcq"] = moment(data[i].startTimeMcq).format("LLL");
    data1["examEndTimeMcq"] = moment(data[i].endTimeMcq).format("LLL");
    data1["examStartTimeWritten"] = moment(data[i].startTimeWritten).format(
      "LLL"
    );
    data1["examEndTimeWritten"] = moment(data[i].endTimeWritten).format("LLL");
    data1["mcqDuration"] = data[i].mcqDuration.toFixed(2);
    data1["writtenDuration"] = data[i].writtenDuration.toFixed(2);
    data1["totalDuration"] = (
      data[i].mcqDuration + data[i].writtenDuration
    ).toFixed(2);
    data1["courseName"] = data[i].examId.courseId.name;
    let subObj = [];
    for (let j = 0; j < 4; j++) {
      subObj.push(data[i].questionMcq[j].subjectId.name);
    }
    data1["subjectName"] = subObj.join("+ ");
    resultData.push(data1);
  }
  let count = resultData.length;
  if (count == 0) return res.status(404).json("no data found.");
  let paginateData = pagination(count, page);
  let start, end;
  start = (page - 1) * paginateData.perPage;
  end = page * paginateData.perPage;
  ////console.log(paginateData);
  ////console.log(start);
  ////console.log(end);
  let data3 = [];
  if (count > 0) {
    for (let i = start; i < end; i++) {
      if (i == resultData.length) break;
      data3.push(resultData[i]);
    }
  }
  resultData = data3;
  return res.status(200).json({ resultData, paginateData });
};
const examCheckMiddleware = async (req, res, next) => {
  const examId = req.query.examId;
  const studentId = req.user.studentId;
  let examIdObj, studentIdObj;
  studentIdObj = new mongoose.Types.ObjectId(studentId);
  examIdObj = new mongoose.Types.ObjectId(examId);
  let status = null;
  let query = null;
  let examEndTime = null;
  let currentDate = moment(new Date());
  //console.log(currentDate, "current Date");
  try {
    query = await SpecialExam.findById(examId, "endTime");
  } catch (err) {
    return res.status(500).json("1.Something went wrong.");
  }
  examEndTime = query.endTime;
  if (moment(examEndTime) < moment(currentDate))
    return res.status(200).json("Exam ended");
  try {
    status = await SpecialVsStudent.findOne({
      $and: [{ studentId: studentIdObj }, { examId: examIdObj }],
    });
  } catch (err) {
    return res.status(500).json("2.Something went wrong.");
  }

  if (status == null) return res.status(200).json("Mcq assign");
  else {
    if (status.finishStatus == true && status.uploadStatus == true)
      return res.status(200).json("ended");
    if (status.finishStatus == true) return res.status(200).json("Mcq ended");
    return res.status(200).json("Mcq running");
  }
};
const getOptionalSubects = async (req, res, next) => {
  const examId = req.query.examId;
  const studentId = req.user.studentId;
  if (!ObjectId.isValid(examId) || !ObjectId.isValid(studentId))
    return res.status(404).json("Exam Id or Student Id is not valid.");
  let subjects = null;
  try {
    subjects = await SpecialExam.findById(examId).populate({
      path: "optionalSubject",
      select: "name",
    });
  } catch (err) {
    return res.status(500).json("1.sonmething went wrong.");
  }
  let optionalSubjects = subjects;

  return res.status(200).json(optionalSubjects.optionalSubject);
};
const getCombination = async (req, res, next) => {
  let selectedId = req.query.optionalSubjectId;
  let examId = req.query.examId;
  let fixedId = null;
  try {
    fixedId = await SpecialExam.findById(examId)
      .select("fixedSubject allSubject optionalSubject -_id")
      .populate({
        path: "fixedSubject",
        select: "name",
      })
      .populate({
        path: "optionalSubject",
        select: "name",
      })
      .populate({
        path: "allSubject",
        select: "name",
      });
  } catch (err) {
    return res.status(500).json(err);
  }
  let fixedIds = fixedId.fixedSubject;
  let optionalId = fixedId.optionalSubject;
  let allId = fixedId.allSubject;
  let data = [];
  let otherId = [],
    ind = 0,
    temp = null,
    allIdsTemp = allId;
  sIndex = null;
  for (let i = 0; i < optionalId.length; i++) {
    if (String(optionalId[i]._id) == selectedId) {
      selectedId = optionalId[i];
    } else sIndex = i;
  }
  for (let i = 0; i < allId.length; i++) {
    temp = allIdsTemp.pop();
    if (
      String(temp._id) == String(optionalId[0]._id) ||
      String(temp._id) == String(optionalId[1])
    ) {
      continue;
    } else if (
      String(temp._id) == String(fixedId[0]) ||
      String(temp._id) == String(fixedId[1])
    ) {
      continue;
    } else {
      let others = {};
      others["_id"] = temp._id;
      others["name"] = temp.name;
      otherId.push(others);
      ind++;
    }
  }
  //console.log(optionalId[sIndex]);
  data.push([fixedIds[0], fixedIds[1], selectedId, optionalId[sIndex]]);
  data.push([fixedIds[0], fixedIds[1], selectedId, otherId[0]]);
  data.push([fixedIds[0], fixedIds[1], selectedId, otherId[1]]);
  return res.status(200).json(data);
};
const updateStudentExamInfo = async (req, res, next) => {
  const examId = req.body.examId;
  if (!ObjectId.isValid(examId))
    return res.status(404).json("Exam Id is not valid.");
  const examIdObj = new mongoose.Types.ObjectId(examId);
  let getEndTime = null;
  try {
    getEndTime = await SpecialExam.findById(examId).select("endTime -_id");
  } catch (err) {
    return res.status(500).json("1.Something went wrong.");
  }
  let examUncheckStudent = null;
  try {
    examUncheckStudent = await SpecialVsStudent.find(
      {
        $and: [
          { examId: examIdObj },
          { finishStatus: false },
          { runningStatus: true },
        ],
      },
      "_id"
    );
  } catch (err) {
    return res.status(500).json("2.Something went wrong.");
  }
  let studentIds = [];
  try {
    studentIds = await SpecialVsStudent.find(
      {
        $and: [
          { examId: examIdObj },
          { finishStatus: false },
          { runningStatus: true },
        ],
      },
      "studentId -_id"
    );
  } catch (err) {
    return res.status(500).json("3.Something went wrong.");
  }
  if (examUncheckStudent.length > 0) {
    let updateStatus = null;
    try {
      updateStatus = await SpecialVsStudent.updateMany(
        {
          _id: { $in: examUncheckStudent },
        },
        { $set: { runningStatus: false, finishStatus: true } }
      );
    } catch (err) {
      return res.status(500).json("4.Something went wrong.");
    }
    for (let i = 0; i < studentIds.length; i++) {
      let totalMarksMcq = 0;
      let examData = null;
      try {
        examData = await SpecialVsStudent.findOne({
          $and: [{ studentId: studentIds[i] }, { examId: examIdObj }],
        })
          .populate({
            path: "questionMcq",
            populate: { path: "mcqId" },
            populate: { path: "subjectId" },
          })
          .populate("examId");
      } catch (err) {
        return res.status(500).json("Problem when get exam data.");
      }

      let id = String(examData._id);
      let correctMarks = examData.examId.marksPerMcq;
      let negativeMarks = examData.examId.negativeMarks;
      let negativeMarksValue = (correctMarks * negativeMarks) / 100;
      for (let j = 0; j < 4; j++) {
        let examDataMcq = examData.questionMcq[j].mcqId;
        let answered = examData.mcqAnswer;
        let notAnswered = 0;
        let totalCorrectAnswer = 0;
        let totalWrongAnswer = 0;
        let totalObtainedMarks = 0;
        let totalCorrectMarks = 0;
        let totalWrongMarks = 0;
        for (let p = 0; p < examDataMcq.length; p++) {
          if (answered[p] == "-1") {
            notAnswered = notAnswered + 1;
          } else if (answered[p] == examDataMcq.mcqId[p].correctOption) {
            totalCorrectAnswer = totalCorrectAnswer + 1;
          } else totalWrongAnswer = totalWrongAnswer + 1;
        }
        totalCorrectMarks = totalCorrectAnswer * correctMarks;
        totalWrongMarks = totalWrongAnswer * negativeMarksValue;
        totalObtainedMarks = totalCorrectMarks - totalWrongMarks;
        examData.questionMcq[j].totalCorrectMarks = totalCorrectMarks;
        examData.questionMcq[j].totalWrongMarks = totalWrongMarks;
        examData.questionMcq[j].mcqMarksPerSub = totalObtainedMarks;
        examData.questionMcq[j].totalCorrectAnswer = totalCorrectAnswer;
        examData.questionMcq[j].totalWrongAnswer = totalWrongAnswer;
        examData.questionMcq[j].totalNotAnswered = notAnswered;
        totalMarksMcq = totalMarksMcq + totalObtainedMarks;
      }
      let result = null;
      let upd = {
        questionMcq: examData.questionMcq,
        totalMarksMcq: totalMarksMcq,
      };
      try {
        result = await SpecialVsStudent.findByIdAndUpdate(id, upd);
      } catch (err) {
        return res
          .status(500)
          .json("Problem when update total obtained marks.");
      }
    }
  }
  //written
  let writtenUpd = null;
  try {
    writtenUpd = await SpecialVsStudent.updateMany(
      {
        $and: [{ examId: examIdObj }, { uploadStatus: false }],
      },
      { $set: { uploadStatus: true } }
    );
  } catch (err) {
    return res.status(500).json("55.Something went wrong.");
  }
  return res.status(201).json("Updated successfully.");
};

const updateRank1 = async (req, res, next) => {
  let examId = req.body.examId;
  if (!ObjectId.isValid(examId))
    return res.status(404).json("Invalid exam Id.");
  let examIdObj = new mongoose.Types.ObjectId(examId);
  let delData = null;
  try {
    delData = await SpecialRank.find({ examId: examIdObj });
  } catch (err) {
    //console.log(err);
    return res.status(500).json("1.Something went wrong.");
  }
  if (delData.length > 0) {
    let deleteData = null;
    try {
      deleteData = await SpecialRank.deleteMany({ examId: examIdObj });
    } catch (err) {
      return res.status(500).json("2.Something went wrong.");
    }
  }
  let ranks = null;
  try {
    ranks = await SpecialVsStudent.find({ examId: examIdObj })
      .select("examId totalObtainedMarks studentId -_id")
      .sort({
        totalObtainedMarks: -1,
      });
  } catch (err) {
    return res.status(500).json("3.Something went wrong.");
  }
  ////console.log("ranks:", ranks);
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
  ////console.log("dataIns:", dataIns);
  let sav = null;
  try {
    sav = await SpecialRank.insertMany(dataIns, { ordered: false });
  } catch (err) {
    return res.status(500).json("4.Something went wrong.");
  }
  return res.status(201).json("Success!");
};
const updateRank = async (req, res, next) => {
  let examId = req.body.examId;
  if (!ObjectId.isValid(examId))
    return res.status(404).json("Invalid exam Id.");
  let examIdObj = new mongoose.Types.ObjectId(examId);
  let delData = null;
  try {
    delData = await SpecialRank.find({ examId: examIdObj });
  } catch (err) {
    //console.log(err);
    return res.status(500).json("1.Something went wrong.");
  }
  if (delData.length > 0) {
    let deleteData = null;
    try {
      deleteData = await SpecialRank.deleteMany({ examId: examIdObj });
    } catch (err) {
      return res.status(500).json("2.Something went wrong.");
    }
  }
  let ranks = null;
  try {
    ranks = await SpecialVsStudent.find({ examId: examIdObj })
      .sort({
        totalObtainedMarks: -1,
      })
      .populate("studentId");
  } catch (err) {
    return res.status(500).json("3.Something went wrong.");
  }
  let uniqueIds = [];
  ranks = ranks.filter((element) => {
    const isDuplicate = uniqueIds.includes(element.studentId._id);

    if (!isDuplicate) {
      uniqueIds.push(element.studentId._id);
      return true;
    }
    return false;
  });
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
  ////console.log("dataIns:", dataIns);
  let sav = null;
  try {
    sav = await SpecialRank.insertMany(dataIns, { ordered: false });
  } catch (err) {
    return res.status(500).json("4.Something went wrong.");
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
    resultRank = await SpecialRank.findOne({
      $and: [{ examId: examIdObj }, { studentId: studentIdObj }],
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
    getResult = await SpecialVsStudent.findOne({
      $and: [{ examId: examIdObj }, { studentId: studentIdObj }],
    }).populate("examId studentId");
  } catch (err) {
    return res.status(500).json("Problem when get Student Exam info.");
  }
  let totalStudent = null;
  try {
    totalStudent = await SpecialVsStudent.find({ examId: examIdObj }).count();
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
  data1["examVariation"] = "specialExam";
  data1["totalObtainedMarks"] = getResult.totalObtainedMarks;
  data1["studExamStartTime"] = moment(getResult.startTimeMcq).format("LLL");
  data1["studExamEndTime"] = moment(getResult.endTimeWritten).format("LLL");
  data1["studExamTime"] = getResult.mcqDuration + getResult.writtenDuration;
  return res.status(200).json(data1);
};
const getAllRank = async (req, res, next) => {
  let examId = req.query.examId;
  if (!ObjectId.isValid(examId)) return res.status(200).json("Invalid examId.");
  let examIdObj = new mongoose.Types.ObjectId(examId);
  let resultRank = null;
  try {
    resultRank = await SpecialRank.find({ examId: examIdObj })
      .sort("rank")
      .populate("examId studentId");
  } catch (err) {
    return res.status(500).json("Something went wrong.");
  }
  if (!resultRank) return res.status(404).json("Exam not finshed yet.");
  ////console.log(resultRank);
  //eturn res.status(200).json(resultRank);
  let allData = [];
  let totalStudent = null;
  for (let i = 0; i < resultRank.length; i++) {
    let markData = null;
    try {
      markData = await SpecialVsStudent.findOne({
        $and: [
          { examId: resultRank[i].examId._id },
          { studentId: resultRank[i].studentId._id },
        ],
      });
    } catch (err) {
      return res.status(500).json("something went wrong.");
    }
    let data1 = {};
    let conData = "*******";
    data1["examName"] = resultRank[i].examId.name;
    data1["studentName"] = resultRank[i].studentId.name;
    data1["mobileNoOrg"] = resultRank[i].studentId.mobileNo;
    data1["mobileNo"] = conData.concat(
      resultRank[i].studentId.mobileNo.slice(7)
    );
    data1["institution"] = resultRank[i].studentId.institution;
    data1["totalObtainedMarks"] = resultRank[i].totalObtainedMarks.toFixed(2);
    data1["rank"] = resultRank[i].rank;
    data1["totalStudent"] = resultRank.length;
    data1["totalMarks"] =
      resultRank[i].examId.totalMarksMcq +
      resultRank[i].examId.totalMarksWritten;
    data1["totalMcqMarks"] = resultRank[i].examId.totalMarksMcq;
    data1["totalWrittenMarks"] = resultRank[i].examId.totalMarksWritten;
    data1["totalObtaineMarksMcq"] = markData.totalMarksMcq.toFixed(2);
    data1["totalObtaineMarksWritten"] = markData.totalMarksWritten;
    allData.push(data1);
  }
  return res.status(200).json(allData);
};
// const examHistory = async (req, res, next) => {
//   const studentId = req.user.studentId;
//   const eId = req.query.examId;
//   let data;
//   let count = 0;
//   try {
//     count = await SpecialVsStudent.find({
//       $and: [{ studentId: studentIdObj }, { publishStatus: false }],
//     }).count();
//   } catch (err) {
//     return res.status(500).json("Something went wrong.");
//   }
//   let paginateData = pagination(count, page);
//   try {
//     data = await SpecialVsStudent.find({
//       $and: [{ studentId: studentIdObj }, { publishStatus: false }],
//     })
//       .populate({
//         path: "examId",
//         populate: { path: "courseId", select: "name -_id" },
//       })
//       .populate({
//         path: "questionMcq",
//         populate: { path: "subjectId", select: "name -_id" },
//       })
//       .skip(paginateData.skippedIndex)
//       .limit(paginateData.perPage);
//   } catch (err) {
//     return res.status(500).json("1.SOmething went wrong.");
//   }
//   //return res.status(200).json(data);
//   //console.log(data);
//   let resultData = [];
//   let flag = false;
//   ////console.log(data.length);
//   for (let i = 0; i < data.length; i++) {
//     let data1 = {};
//     let rank = null;
//     let examIdObj = new mongoose.Types.ObjectId(data[i].examId._id);
//     let resultRank = null;
//     try {
//       resultRank = await SpecialRank.findOne({
//         $and: [{ examId: examIdObj }, { studentId: studentIdObj }],
//       });
//     } catch (err) {
//       return res.status(500).json("Something went wrong.");
//     }
//     //console.log("res", resultRank);
//     if (resultRank == null) resultRank = "-1";
//     else resultRank = resultRank.rank;
//     data1["examId"] = data[i].examId._id;
//     data1["title"] = data[i].examId.name;
//     data1["variation"] = "Special Exam";
//     data1["examType"] = "no";
//     data1["totalObtainedMarks"] =
//       data[i].totalMarksMcq + data[i].totalMarksWritten;
//     data1["totalMarksMcqExam"] = data[i].totalMarksMcq;
//     data1["totalMarksWrittenExam"] = data[i].totalMarksWritten;
//     data1["totalMarksMcq"] =
//       data[i].examId.totalMarksMcq + data[i].totalMarksWritten;
//     data1["meritPosition"] = resultRank;
//     data1["examStartTimeMcq"] = moment(data[i].startTimeMcq).format("LLL");
//     data1["examEndTimeMcq"] = moment(data[i].endTimeMcq).format("LLL");
//     data1["examStartTimeWritten"] = moment(data[i].startTimeWritten).format(
//       "LLL"
//     );
//     data1["examEndTimeWritten"] = moment(data[i].endTimeWritten).format("LLL");
//     data1["mcqDuration"] = data[i].mcqDuration;
//     data1["writtenDuration"] = data[i].writtenDuration;
//     data1["totalDuration"] = data[i].mcqDuration + data[i].writtenDuration;
//     data1["courseName"] = data[i].examId.courseId.name;
//     let subObj = [];
//     for (let j = 0; j < 4; j++) {
//       subObj.push(data[i].questionMcq[j].subjectId.name);
//     }
//     data1["subjects"] = subObj;
//     resultData.push(data1);
//   }
// };
//exam system
const assignQuestionMcq = async (req, res, next) => {
  const eId = req.query.examId;
  const subject1 = req.query.subjectId1;
  const subject2 = req.query.subjectId2;
  const subject3 = req.query.subjectId3;
  const subject4 = req.query.subjectId4;
  let subjects = [subject1, subject2, subject3, subject4];
  const studentId = req.user.studentId;
  let eId1, sId;
  sId = new mongoose.Types.ObjectId(studentId);
  eId1 = new mongoose.Types.ObjectId(eId);
  let existData = [];
  try {
    existData = await SpecialVsStudent.find({
      $and: [{ examId: eId1 }, { studentId: sId }],
    });
  } catch (err) {
    return res.status(500).json("1.something went wrong.");
  }
  if (existData.length > 0) return res.status(200).json("Mcq running");
  subjects = subjects.map((e) => new mongoose.Types.ObjectId(e));
  let examData = null,
    rand;
  try {
    examData = await SpecialExam.findById(eId).populate({
      path: "questionMcq",
      populate: {
        path: "mcqId",
        match: { status: true },
        select: "question type options optionCount status _id",
      },
    });
  } catch (err) {
    return res.status(500).json("1.something went wrong.");
  }
  ////console.log(examData.questionMcq);
  if (!examData) return res.status(404).json("No Exam found.");
  let questionMcq = examData.questionMcq;
  let mcqIds = [],
    questionPerSub = [];
  questionPerSub = examData.subjectInfo[0].noOfQuestionsMcq;
  let questionsId = [];
  for (let i = 0; i < 4; i++) {
    let flag = 0;
    let doc = [];
    for (let j = 0; j < 6; j++) {
      if (String(questionMcq[j].subjectId) == String(subjects[i])) {
        mcqIds = questionMcq[j].mcqId;
        break;
      }
    }
    rand = parseInt(Date.now()) % mcqIds.length;
    for (let j = rand; j >= 0; j--) {
      if (doc.length == questionPerSub) {
        flag = 1;
        break;
      }
      doc.push(mcqIds[j]);
    }
    if (flag == 0) {
      for (let j = rand + 1; j < mcqIds.length; j++) {
        if (doc.length == questionPerSub) {
          flag = 1;
          break;
        }
        doc.push(mcqIds[j]);
      }
    }
    questionsId.push(doc);
  }
  let studExamStartTime = moment(new Date());
  let studExamEndTime = moment(studExamStartTime).add(
    examData.mcqDuration,
    "m"
  );
  //console.log("studExamEndTime", studExamEndTime);
  //console.log("exam end:", examData.endTime);
  if (
    Number(moment(studExamEndTime).add(6, "h") - moment(examData.endTime)) > 0
  )
    studExamEndTime = examData.endTime;
  else studExamEndTime = moment(studExamEndTime).add(6, "h");
  //console.log(examData.mcqDuration);
  //console.log("studExamStartTime", studExamStartTime);
  //console.log("studExamEndTime", studExamEndTime);
  //console.log("duration", (studExamEndTime - studExamStartTime) / 60000);
  let sav = null,
    mcqData = [];
  for (let i = 0; i < 4; i++) {
    let objSub = {};
    objSub["subjectId"] = subjects[i];
    let objMcq = [];
    let dataQ = questionsId[i];

    for (let p = 0; p < dataQ.length; p++) {
      //console.log(p);
      //console.log("dataQ:", dataQ[p]._id);
      objMcq[p] = dataQ[p]._id;
    }
    objSub["mcqId"] = objMcq;
    let answerArr = [];
    for (let j = 0; j < questionsId[i].length; j++) {
      answerArr[j] = -1;
    }
    objSub["mcqAnswer"] = answerArr;
    objSub["mcqMarksPerSub"] = parseInt(
      examData.totalQuestionsMcq * examData.marksPerMcq
    );
    objSub["totalCorrectAnswer"] = 0;
    objSub["totalWrongAnswer"] = 0;
    objSub["totalCorrectMarks"] = 0;
    objSub["totalWrongMarks"] = 0;
    mcqData[i] = objSub;
  }
  let upd = new SpecialVsStudent({
    studentId: sId,
    examId: eId1,
    startTimeMcq: moment(studExamStartTime).add(6, "h"),
    endTimeMcq: moment(studExamEndTime),
    mcqDuration:
      (studExamEndTime - moment(studExamStartTime).add(6, "h")) / 60000,
    questionMcq: mcqData,
    runningStatus: true,
    finishStatus: false,
  });
  try {
    sav = await upd.save();
  } catch (err) {
    return res.status(500).json("Something went wrong.");
  }
  if (!sav) return res.status(404).json("not assign mcq questions.");
  //return res.status(200).json(questionsId);
  questionsId.push({ studStartTime: moment(studExamStartTime).add(6, "h") });
  questionsId.push({ studEndTime: moment(studExamEndTime) });
  questionsId.push({ examStartTime: examData.startTime });
  questionsId.push({ examEndTime: examData.endTime });
  questionsId.push({
    mcqDuration:
      (studExamEndTime - moment(studExamStartTime).add(6, "h")) / 60000,
  });
  questionsId.push({ data: sav });

  return res.status(201).json(questionsId);
};
const getRunningDataMcq = async (req, res, next) => {
  const sId = req.user.studentId;
  const eId = req.query.examId;
  if (!ObjectId.isValid(sId) || !ObjectId.isValid(eId))
    return res.status(404).json("invalid student ID or exam ID.");
  let eId1, sId1;
  sId1 = new mongoose.Types.ObjectId(sId);
  eId1 = new mongoose.Types.ObjectId(eId);
  //exam status Check:start
  let studentCheck = null;
  let getQuestionMcq, getExamData;
  try {
    getQuestionMcq = await SpecialVsStudent.findOne({
      $and: [{ studentId: sId1 }, { examId: eId1 }],
    })
      .populate({
        path: "questionMcq",
        populate: {
          path: "mcqId",
          match: { status: true },
          select: "question type options optionCount status _id",
        },
      })
      .populate("examId")
      .populate({
        path: "questionMcq",
        populate: { path: "subjectId", select: "name" },
      });
  } catch (err) {
    return res.status(500).json("can't get question.Problem Occur.");
  }
  //console.log(getQuestionMcq);
  let examData = getQuestionMcq;
  //exam status Check:end
  getQuestionMcq = getQuestionMcq.questionMcq;
  let data = [];
  for (let i = 0; i < getQuestionMcq.length; i++) {
    let dataQ = {};
    dataQ["questions"] = getQuestionMcq[i].mcqId;
    dataQ["answeredOptions"] = getQuestionMcq[i].mcqAnswer;
    dataQ["subjectId"] = getQuestionMcq[i].subjectId._id;
    dataQ["subjectName"] = getQuestionMcq[i].subjectId.name;
    data[i] = dataQ;
  }
  let examDet = {};
  examDet["studExamStartTime"] = examData.startTimeMcq;
  examDet["studExamEndTime"] = examData.endTimeMcq;
  examDet["duration"] = examData.mcqDuration;
  //console.log("start");
  let timeS = moment(new Date());
  //console.log(timeS);
  //console.log(examData.endTimeMcq);
  examDet["dueDuration"] =
    (moment(examData.endTimeMcq) - moment(timeS).add(12, "h")) / 60000;

  return res.status(200).json({ data, examDet });
};
const updateAssignQuestion = async (req, res, next) => {
  let studentId = req.user.studentId;
  let examId = req.body.examId;
  let subjectId = req.body.subjectId;
  let questionIndexNumber = Number(req.body.questionIndexNumber);
  let optionIndexNumber = Number(req.body.optionIndexNumber);
  //console.log(questionIndexNumber);
  //console.log(optionIndexNumber);
  studentId = new mongoose.Types.ObjectId(studentId);
  examId = new mongoose.Types.ObjectId(examId);
  subjectId = new mongoose.Types.ObjectId(subjectId);
  let result;
  let studentCheck = null;
  try {
    studentCheck = await SpecialVsStudent.findOne({
      $and: [{ examId: examId }, { studentId: studentId }],
    });
  } catch (err) {
    return res.status(500).json("Something went wrong.");
  }
  if (studentCheck.finishStatus == true)
    return res
      .status(200)
      .json(
        "Already Submitted from another device.You will be redirected to written exam within 5 seconds."
      );
  let data = [],
    insertId,
    sIndex = 0;
  insertId = studentCheck._id;
  for (let i = 0; i < 4; i++) {
    if (String(subjectId) == String(studentCheck.questionMcq[i].subjectId)) {
      data = studentCheck.questionMcq;
      sIndex = i;
      break;
    }
  }
  if (data[sIndex].mcqAnswer[questionIndexNumber] != -1)
    return res
      .status(200)
      .json(
        "Already rewrite the answer from another device.Please reload the page."
      );
  data[sIndex].mcqAnswer[questionIndexNumber] = optionIndexNumber;
  let upd = { questionMcq: data };
  try {
    result = await SpecialVsStudent.findByIdAndUpdate(insertId, upd);
  } catch (err) {
    return res.status(500).json("cant save to db");
  }
  if (result) return res.status(201).json("Ok");
  else return res.status(201).json("Not updated.");
};
const submitAnswerMcq = async (req, res, next) => {
  const eId = req.body.eId;
  const sId = req.user.studentId;
  if (!ObjectId.isValid(eId) || !ObjectId.isValid(sId))
    return res.status(404).json("Invalid studnet Id or Exam Id");
  let studentIdObj = new mongoose.Types.ObjectId(sId);
  let examIdObj = new mongoose.Types.ObjectId(eId);
  let status = null;
  try {
    status = await SpecialVsStudent.findOne({
      $and: [{ studentId: studentIdObj }, { examId: examIdObj }],
    });
  } catch (err) {
    return res.status(500).json("2.Something went wrong.");
  }
  if (status.finishStatus == true) return res.status(200).json("ended");
  const examEndTime = new Date();
  let eId1, sId1;
  sId1 = new mongoose.Types.ObjectId(sId);
  eId1 = new mongoose.Types.ObjectId(eId);
  //exam status Check:start
  let studentCheck = null;
  try {
    studentCheck = await SpecialVsStudent.findOne({
      $and: [{ examId: eId1 }, { studentId: sId1 }],
    })
      .populate({
        path: "questionMcq",
        populate: {
          path: "mcqId",
          match: { status: true },
          select: "question type options optionCount status correctOption _id",
        },
      })
      .populate("examId")
      .populate({
        path: "questionMcq",
        populate: { path: "subjectId", select: "name" },
      });
  } catch (err) {
    return res.status(500).json("Something went wrong.");
  }
  ////console.log("studentCheck:", studentCheck.questionMcq[i].mcqId.length);
  //exam status Check:end
  let findId = studentCheck._id;
  let timeStudent = [];
  timeStudent[0] = studentCheck.startTimeMcq;
  timeStudent[1] = studentCheck.endTimeMcq;
  let submitTime = moment(new Date());
  let totalMarksMcq = 0;
  for (let i = 0; i < 4; i++) {
    let totalCorrectAnswer = 0,
      totalCorrectMarks = 0,
      totalWrongAnswer = 0,
      totalWrongMarks = 0,
      totalNotAnswered = 0;
    let subjectId = studentCheck.questionMcq[i].subjectId;
    let lengthMcq = studentCheck.questionMcq[i].mcqId.length;
    for (let j = 0; j < lengthMcq; j++) {
      let questions = studentCheck.questionMcq[i].mcqId[j];
      ////console.log("questions:", questions);
      if (studentCheck.questionMcq[i].mcqAnswer[j] == -1) {
        totalNotAnswered++;
      } else if (
        questions.correctOption == studentCheck.questionMcq[i].mcqAnswer[j]
      ) {
        totalCorrectAnswer++;
      } else totalWrongAnswer++;
    }
    studentCheck.questionMcq[i].totalCorrectAnswer = totalCorrectAnswer;
    studentCheck.questionMcq[i].totalWrongAnswer = totalWrongAnswer;
    studentCheck.questionMcq[i].totalNotAnswered = totalNotAnswered;
    studentCheck.questionMcq[i].totalCorrectMarks =
      totalCorrectAnswer * studentCheck.examId.marksPerMcq;
    studentCheck.questionMcq[i].totalWrongMarks =
      totalWrongAnswer * (studentCheck.examId.negativeMarksMcq / 100);
    studentCheck.questionMcq[i].mcqMarksPerSub =
      totalCorrectAnswer * studentCheck.examId.marksPerMcq -
      totalWrongAnswer * (studentCheck.examId.negativeMarksMcq / 100);
    totalMarksMcq = totalMarksMcq + studentCheck.questionMcq[i].mcqMarksPerSub;
  }
  ////console.log("studentCheck:", studentCheck.questionMcq);
  let dataUpd = {
    totalMarksMcq: totalMarksMcq,
    questionMcq: studentCheck.questionMcq,
    finishStatus: true,
    runningStatus: false,
    endTimeMcq: moment(submitTime).add(6, "h"),
    mcqDuration:
      (moment(submitTime).add(6, "h") - moment(timeStudent[0])) / 60000,
  };

  let sav = null;
  try {
    sav = await SpecialVsStudent.findByIdAndUpdate(findId, dataUpd);
  } catch (err) {
    return res.status(500).json("Problem when updating student marks.");
  }
  return res.status(201).json("submited mcq Successfully.");
  // let data1 = {};
  // data1["examId"] = studentCheck.examId.name;
  // data1["startTime"] = moment(studentCheck.examId.startTime).format("LLL");
  // data1["endTime"] = moment(studentCheck.examId.endTime).format("LLL");
  // data1["totalMarksMcq"] = studentCheck.examId.totalMarksMcq;
  // data1["examVariation"] = 4;
  // data1["totalCorrectAnswer"] =
  //   studentCheck.questionMcq[0].totalCorrectAnswer +
  //   studentCheck.questionMcq[1].totalCorrectAnswer +
  //   studentCheck.questionMcq[2].totalCorrectAnswer +
  //   studentCheck.questionMcq[3].totalCorrectAnswer;

  // data1["totalWrongAnswer"] =
  //   studentCheck.questionMcq[0].totalWrongAnswer +
  //   studentCheck.questionMcq[1].totalWrongAnswer +
  //   studentCheck.questionMcq[2].totalWrongAnswer +
  //   studentCheck.questionMcq[3].totalWrongAnswer;
  // data1["totalCorrectMarks"] =
  //   studentCheck.questionMcq[0].totalCorrectMarks +
  //   studentCheck.questionMcq[1].totalCorrectMarks +
  //   studentCheck.questionMcq[2].totalCorrectMarks +
  //   studentCheck.questionMcq[3].totalCorrectMarks;
  // data1["totalWrongMarks"] =
  //   studentCheck.questionMcq[0].totalWrongMarks +
  //   studentCheck.questionMcq[1].totalWrongMarks +
  //   studentCheck.questionMcq[2].totalWrongMarks +
  //   studentCheck.questionMcq[3].totalWrongMarks;
  // data1["totalNotAnswered"] =
  //   studentCheck.questionMcq[0].totalNotAnswered +
  //   studentCheck.questionMcq[1].totalNotAnswered +
  //   studentCheck.questionMcq[2].totalNotAnswered +
  //   studentCheck.questionMcq[3].totalNotAnswered;
  // data1["rank"] = -1;
  // data1["studExamStartTime"] = moment(timeStudent[0]).format("LLL");
  // data1["studExamEndTime"] = moment(submitTime).format("LLL");
  // data1["studExamTime"] = (moment(timeStudent[0]) - moment(submitTime)) / 60000;

  // return res.status(200).json(data1);
};
//written
const assignQuestionWritten = async (req, res, next) => {
  let examId = req.query.examId;
  let studentId = req.user.studentId;
  const subject1 = req.query.subjectId1;
  const subject2 = req.query.subjectId2;
  const subject3 = req.query.subjectId3;
  const subject4 = req.query.subjectId4;
  let subjects = [subject1, subject2, subject3, subject4];
  //console.log("subjects:", subjects);
  examId = new mongoose.Types.ObjectId(examId);
  studentId = new mongoose.Types.ObjectId(studentId);
  let updId = null;
  try {
    updId = await SpecialVsStudent.findOne({
      $and: [{ examId: examId }, { studentId: studentId }],
    });
  } catch (err) {
    return res.status(500).json("something went wrong.");
  }
  let insertId = updId._id;
  if (updId.startTimeWritten != null) return res.status(200).json(false);
  let examData = null;
  try {
    examData = await SpecialExam.findById(examId).populate({
      path: "questionWritten",
      populate: { path: "subjectId", select: "_id name" },
    });
  } catch (err) {
    return res.status(500).json("something went wrong.");
  }
  let questionWrittenArr = [];
  for (let i = 0; i < 4; i++) {
    let subObj = {};
    subObj["subjectId"] = new mongoose.Types.ObjectId(subjects[i]);
    subObj["submittedScriptILink"] = [];
    subObj["answerScriptILink"] = [];
    subObj["obtainedMarks"] = [];
    subObj["totalObtainedMarksWritten"] = 0;
    questionWrittenArr.push(subObj);
  }
  let studExamStartTime = moment(new Date());
  let studExamEndTime = moment(studExamStartTime).add(
    examData.writtenDuration,
    "m"
  );
  if (
    Number(moment(studExamEndTime).add(6, "h") - moment(examData.endTime)) > 0
  )
    studExamEndTime = examData.endTime;
  else studExamEndTime = moment(studExamEndTime).add(6, "h");
  let objSav = {
    questionWritten: questionWrittenArr,
    startTimeWritten: moment(studExamStartTime).add(6, "h"),
    endTimeWritten: moment(studExamEndTime),
    writtenDuration:
      (moment(studExamEndTime) - moment(studExamStartTime).add(6, "h")) / 60000,
  };
  let sav = null;
  try {
    sav = await SpecialVsStudent.findByIdAndUpdate(insertId, objSav);
  } catch (err) {
    return res.status(500).json("Something went wrong.");
  }
  let data1 = [];
  for (let i = 0; i < 4; i++) {
    let objWritten = {};
    objWritten["subjectId"] = examData.questionWritten[i].subjectId._id;
    objWritten["subjectName"] = examData.questionWritten[i].subjectId.name;
    objWritten["marksPerQuestion"] =
      examData.questionWritten[i].marksPerQuestion;
    objWritten["totalQuestion"] =
      examData.questionWritten[i].marksPerQuestion.length;
    objWritten["writtenILink"] = examData.questionWritten[i].writtenILink;
    data1.push(objWritten);
  }
  data1.push({ studExamStartTime: moment(studExamStartTime).add(6, "h") });
  data1.push({ studExamEndTime: moment(studExamEndTime) });
  data1.push({ examEndTime: examData.endTime });
  data1.push({
    duration:
      (moment(studExamEndTime) - moment(studExamStartTime).add(6, "h")) / 60000,
  });
  return res.status(200).json(data1);
};
const ruunningWritten = async (req, res, next) => {
  let examId = req.query.examId;
  let studentId = req.user.studentId;
  examId = new mongoose.Types.ObjectId(examId);
  studentId = new mongoose.Types.ObjectId(studentId);
  let updId = null;
  try {
    updId = await SpecialVsStudent.findOne({
      $and: [{ examId: examId }, { studentId: studentId }],
    });
  } catch (err) {
    return res.status(500).json("something went wrong.");
  }
  let examData = null;
  try {
    examData = await SpecialExam.findById(examId).populate({
      path: "questionWritten",
      populate: { path: "subjectId", select: "_id name" },
    });
    //console.log("examData:", examData);
  } catch (err) {
    return res.status(500).json("something went wrong.");
  }
  let timeData = null;
  try {
    timeData = await SpecialVsStudent.findOne({
      $and: [{ examId: examId }, { studentId: studentId }],
    }).populate({ path: "questionWritten", populate: { path: "subjectId" } });
  } catch (err) {
    return res.status(500).json("something went wrong.");
  }
  //console.log("timeData:", timeData);
  let data1 = [];
  let subjectsId = [];
  for (let i = 0; i < 4; i++) {
    let objWritten = {};
    subjectsId[i] = timeData.questionWritten[i].subjectId._id;
    objWritten["subjectId"] = timeData.questionWritten[i].subjectId._id;
    objWritten["subjectName"] = timeData.questionWritten[i].subjectId.name;
    for (let j = 0; j < 6; j++) {
      if (
        String(examData.questionWritten[j].subjectId._id) ==
        String(subjectsId[i])
      ) {
        objWritten["marksPerQuestion"] =
          examData.questionWritten[j].marksPerQuestion;
        objWritten["totalQuestion"] =
          examData.questionWritten[j].marksPerQuestion.length;
        objWritten["writtenILink"] = examData.questionWritten[j].writtenILink;
      } else continue;
    }
    data1.push(objWritten);
  }
  data1.push({ studExamStartTime: timeData.startTimeWritten });
  data1.push({ studExamEndTime: timeData.endTimeWritten });
  data1.push({ examEndTime: examData.endTime });
  data1.push({
    dueDuration:
      (moment(timeData.endTimeWritten) - moment(new Date()).add(12, "h")) /
      60000,
  });
  data1.push({
    Duration: examData.writtenDuration,
  });
  data1.push({ subectsId: subjectsId });

  return res.status(200).json(data1);
};
const submitStudentScript = async (req, res, next) => {
  const files = req.files;
  //file upload handle:start
  const file = req.files;
  ////console.log(file);
  let questionILinkPath = [];
  if (!file.questionILink) return res.status(400).json("Files not uploaded.");
  for (let i = 0; i < file.questionILink.length; i++) {
    questionILinkPath[i] = "uploads/".concat(file.questionILink[i].filename);
  }
  //file upload handle:end
  let examId = req.body.examId;
  let studentId = req.user.studentId;
  let subjectId = req.body.subjectId;
  let questionNo = Number(req.body.questionNo);
  if (
    !ObjectId.isValid(studentId) ||
    !ObjectId.isValid(examId) ||
    !ObjectId.isValid(subjectId) ||
    questionNo <= 0
  ) {
    return res
      .status(404)
      .json("Student Id or Exam Id or question Id is not valid.");
  }
  questionNo = questionNo - 1;
  let studentIdObj = new mongoose.Types.ObjectId(studentId);
  examId = new mongoose.Types.ObjectId(examId);
  subjectId = new mongoose.Types.ObjectId(subjectId);
  let getQuestionScript = null;
  try {
    getQuestionScript = await SpecialVsStudent.findOne({
      $and: [{ studentId: studentIdObj }, { examId: examId }],
    });
  } catch (err) {
    return res.status(500).json("Something went wrong.");
  }
  let insertId = getQuestionScript._id;
  let uploadStatus = getQuestionScript.uploadStatus;
  let checkStatus = getQuestionScript.checkStatus;
  if (uploadStatus == true || checkStatus == true)
    return res.status(404).json("Can not upload file.");
  let submittedScript = [];
  let sIndex = null;
  for (let i = 0; i < 4; i++) {
    if (String(subjectId) == getQuestionScript.questionWritten[i].subjectId) {
      submittedScript = getQuestionScript.questionWritten;
      sIndex = i;
      break;
    }
  }
  if (submittedScript[sIndex].submittedScriptILink[questionNo]) {
    for (
      let i = 0;
      i < submittedScript[sIndex].submittedScriptILink[questionNo].length;
      i++
    ) {
      fs.unlinkSync(
        submittedScript[sIndex].submittedScriptILink[questionNo][i]
      );
    }
  }

  submittedScript[sIndex].submittedScriptILink[questionNo] = questionILinkPath;
  ////console.log(getQuestionScript[questionNo]);
  let upd = {
    questionWritten: submittedScript,
  };
  let doc;
  try {
    doc = await SpecialVsStudent.findByIdAndUpdate(insertId, upd);
  } catch (err) {
    ////console.log(err);
    return res.status(500).json("Something went wrong!");
  }
  return res.status(201).json("Submitted Successfully.");
};
const submitWritten = async (req, res, next) => {
  let examId = req.query.examId;
  let studentId = req.user.studentId;
  if (!ObjectId.isValid(studentId) || !ObjectId.isValid(examId)) {
    return res
      .status(404)
      .json("Student Id or Exam Id or subject Id is not valid.");
  }
  let studentIdObj1 = new mongoose.Types.ObjectId(studentId);
  let examIdObj = new mongoose.Types.ObjectId(examId);
  let status = null;
  try {
    status = await SpecialVsStudent.findOne({
      $and: [{ studentId: studentIdObj1 }, { examId: examIdObj }],
    });
  } catch (err) {
    return res.status(500).json("2.Something went wrong.");
  }
  if (status.uploadStatus == true) return res.status(200).json("ended");
  let studentIdObj = new mongoose.Types.ObjectId(studentId);
  examId = new mongoose.Types.ObjectId(examId);
  let startTime = null;
  let endTime = moment(new Date());
  try {
    startTime = await SpecialVsStudent.findOne({
      $and: [{ examId: examId }, { studentId: studentIdObj }],
    });
  } catch (err) {
    return res.status(500).json("1.Something went wrong.");
  }
  let insertId = startTime._id;
  startTime = startTime.startTimeWritten;
  //console.log(startTime);
  //console.log(endTime);
  let upd = {
    endTimeWritten: moment(endTime).add(6, "h"),
    writtenDuration: (moment(endTime).add(6, "h") - moment(startTime)) / 60000,
    uploadStatus: true,
  };
  //console.log(upd.writtenDuration);
  let sav = null;
  try {
    sav = await SpecialVsStudent.findByIdAndUpdate(insertId, upd);
  } catch (err) {
    //console.log(err);
    return res.status(500).json("2.Something went wrong.");
  }
  return res.status(201).json("Submitted Sccessfully.");
};
//assign teacher
const assignStudentToTeacher = async (req, res, next) => {
  //new code
  let examId = req.body.examId;
  let teacherId = req.body.teacherId;
  console.log(teacherId);
  console.log(examId);
  if (!ObjectId.isValid(examId) || teacherId.length == 0)
    return res.status(404).json("Exam Id or Teacher Id is not valid.");
  let examIdObj = new mongoose.Types.ObjectId(examId);
  let assignedTeacher = null;
  try {
    assignedTeacher = await TeacherVsSpecialExam.find({
      $and: [{ examId: examIdObj }],
    });
  } catch (err) {
    return res.status(500).json("Somethhing went wrong.");
  }
  if (assignedTeacher.length > 0) {
    let del = null;
    try {
      del = await TeacherVsSpecialExam.deleteMany({ examId: examIdObj });
    } catch (err) {
      return res.status(500).json("Somethhing went wrong.");
    }
  }
  let count = 0;
  try {
    count = await SpecialVsStudent.find({
      examId: examIdObj,
    }).count();
  } catch (err) {
    return res.status(500).json("Something went wrong.");
  }
  if (count == 0)
    return res.status(404).json("No Student participate in the exam.");
  let subjects = null;
  try {
    subjects = await SpecialExam.findById(examId);
  } catch (err) {
    return res.status(500).json("Something went wrong.");
  }
  let students = null;
  let studentCount = 0;
  try {
    students = await SpecialVsStudent.find({ examId: examIdObj });
  } catch (err) {
    return res.status(500).json("Something went wrong.");
  }

  try {
    studentCount = await SpecialVsStudent.find({
      examId: examIdObj,
    }).count();
  } catch (err) {
    return res.status(500).json("Something went wrong.");
  }
  subjects = subjects.allSubject;
  let perSubSt = [];
  for (let i = 0; i < 6; i++) {
    let sub = subjects[i];
    let data = [];
    for (let j = 0; j < studentCount; j++) {
      //console.log("length:", students[j].questionWritten.length);
      if (
        students[j].questionWritten != null &&
        students[j].questionWritten.length > 0
      ) {
        ////console.log("students[j].questionWritten", students[j].questionWritten);
        //console.log("students:", students[j]);
        for (let p = 0; p < 4; p++) {
          ////console.log("STUDENTS:", students[j].questionWritten[p]);
          if (String(students[j].questionWritten[p].subjectId) == String(sub)) {
            data.push(students[j].studentId);
            break;
          }
        }
      }
    }
    perSubSt.push(data);
  }
  for (let i = 0; i < 6; i++) {
    let sub = subjects[i];
    let studentNo = perSubSt[i].length;
    let teachers = [];
    try {
      teachers = await User.find({ subjectId: sub }, "_id");
    } catch (err) {
      return res.status(500).json("Something went wrong.");
    }
    //console.log("teachersFirst:", teachers);
    let teach = [];
    for (let i = 0; i < teachers.length; i++) {
      teach[i] = String(teachers[i]._id);
    }
    teachers = teach;
    //console.log("teachers:", teachers);
    let intersection = teacherId.filter((x) => teachers.includes(x));
    console.log(intersection);
    teachers = intersection;
    ////console.log("teachersNext:", teachers);
    let range = parseInt(studentNo / teachers.length);
    let start = 0;
    let teacherStudentArr = [];
    for (let j = 0; j < teachers.length; j++) {
      let std = [];
      for (let p = start; p < range; p++) {
        std.push(perSubSt[i][p]);
      }
      if (j == teachers.length - 2) {
        start = range;
        range =
          range +
          parseInt(studentNo / teachers.length) +
          (studentNo % teachers.length);
      } else {
        start = range;
        range = range + parseInt(studentNo / teachers.length);
      }
      let teacherStudent = {};
      teacherStudent["examId"] = examIdObj;
      teacherStudent["teacherId"] = new mongoose.Types.ObjectId(teachers[j]);
      teacherStudent["studentId"] = std;
      teacherStudentArr.push(teacherStudent);
    }
    let doc = null;
    try {
      doc = await TeacherVsSpecialExam.insertMany(teacherStudentArr, {
        ordered: false,
      });
    } catch (err) {
      return res.status(500).json("1.Something went wrong.");
    }
    console.log("eacherStudentArr", teacherStudentArr);
  }

  return res
    .status(201)
    .json("Successfully assign all student to the teacher.");
};
const getStudentData = async (req, res, next) => {
  let page = req.query.page || 1;
  let teacherId = req.user.id;
  console.log("teacherId", teacherId);
  teacherId = new mongoose.Types.ObjectId(teacherId);
  let subjectRole = null;
  try {
    subjectRole = await User.findOne({ _id: teacherId }, "subjectId -_id");
  } catch (err) {
    //console.log(err);
    return res.status(500).json("Something went wrong.");
  }
  subjectRole = subjectRole.subjectId;
  let examId = req.query.examId;
  examId = new mongoose.Types.ObjectId(examId);
  ////console.log(teacherId);
  ////console.log(examId);
  ////console.log(subjectRole);
  let students = [];
  let questionData = null;
  let dataEx = null;
  try {
    dataEx = await SpecialExam.findById(examId);
  } catch (err) {
    return res.status(500).json("Something went wrong.");
  }
  ////console.log(questionData);
  // //console.log(indexValue);
  // //console.log("dataex:", dataEx.questionWritten[indexValue]);
  try {
    students = await TeacherVsSpecialExam.findOne({
      $and: [{ teacherId: teacherId }, { examId: examId }],
    });
  } catch (err) {
    // //console.log(err);
    return res.status(500).json("Something went wrong.");
  }
  console.log(students);
  if (!students) return res.status(404).json("No student assigned.");
  let studentData = students.studentId;
  // //console.log(studentData);
  let studId = [];
  for (let i = 0; i < studentData.length; i++) {
    //if (students[i].questionWritten.length == 0) continue;
    studId[i] = studentData[i]._id;
  }
  ////console.log(studId);
  let checkStatus = [];
  try {
    checkStatus = await SpecialVsStudent.find({
      $and: [{ studentId: { $in: studId } }, { examId: examId }],
    }).populate("studentId examId");
  } catch (err) {
    ////console.log(err);
    return res.status(500).json("Something went wrong.");
  }
  let indexValue1 = null;
  for (let j = 0; j < 6; j++) {
    if (String(dataEx.questionWritten[j].subjectId) == String(subjectRole)) {
      indexValue1 = j;
      ////console.log(j);
      break;
    }
  }
  let data = [];
  for (let i = 0; i < checkStatus.length; i++) {
    let questionData = null;
    let indexValue = null;
    ////console.log("checkStatus.questionWritten:", checkStatus[i].questionWritten);
    if (checkStatus[i].questionWritten.length > 0) {
      for (let j = 0; j < 4; j++) {
        if (
          String(checkStatus[i].questionWritten[j].subjectId) ==
          String(subjectRole)
        ) {
          questionData = checkStatus[i].questionWritten[j];
          indexValue = j;
          ////console.log(j);
          break;
        }
      }
    }
    if (indexValue == null || questionData.subStatus == true) continue;
    //console.log(i);
    // //console.log(
    //   "check status",
    //   checkStatus[i].examId.questionWritten[indexValue1].marksPerQuestion
    // );
    let dataObj = {};
    dataObj["examName"] = checkStatus[i].examId.name;
    dataObj["examVariation"] = "specialExam";
    dataObj["studentName"] = checkStatus[i].studentId.name;
    dataObj["studentId"] = checkStatus[i].studentId._id;
    dataObj["checkStatus"] = checkStatus[i].checkStatus;
    dataObj["totalQuestions"] =
      checkStatus[i].examId.questionWritten[
        indexValue1
      ].marksPerQuestion.length;
    dataObj["totalMarks"] = checkStatus[i].examId.totalMarksWritten / 4;
    dataObj["marksPerQuestion"] =
      checkStatus[i].examId.questionWritten[indexValue1].marksPerQuestion;
    data.push(dataObj);
  }
  let count = data.length;
  let paginateData = pagination(count, page);
  let start, end;
  start = (page - 1) * paginateData.perPage;
  end = page * paginateData.perPage;
  //console.log(paginateData);
  //console.log(start);
  //console.log(end);
  let data1 = [];
  if (count > 0) {
    for (let i = start; i < end; i++) {
      if (i == data.length) break;
      data1.push(data[i]);
    }
  }
  return res.status(200).json({ data1, paginateData });
};
const getRecheckStudentData = async (req, res, next) => {
  let page = req.query.page || 1;
  let teacherId = req.user.id;
  teacherId = new mongoose.Types.ObjectId(teacherId);
  let subjectRole = null;
  try {
    subjectRole = await User.findOne({ _id: teacherId }, "subjectId -_id");
  } catch (err) {
    ////console.log(err);
    return res.status(500).json("Something went wrong.");
  }
  subjectRole = subjectRole.subjectId;
  let examId = req.query.examId;
  examId = new mongoose.Types.ObjectId(examId);
  // //console.log(teacherId);
  // //console.log(examId);
  // //console.log(subjectRole);
  let students = [];
  let questionData = null;
  let dataEx = null;
  try {
    dataEx = await SpecialExam.findById(examId);
  } catch (err) {
    return res.status(500).json("Something went wrong.");
  }
  ////console.log(questionData);
  // //console.log(indexValue);
  // //console.log("dataex:", dataEx.questionWritten[indexValue]);
  try {
    students = await TeacherVsSpecialExam.findOne({
      $and: [{ teacherId: teacherId }, { examId: examId }],
    });
  } catch (err) {
    // //console.log(err);
    return res.status(500).json("Something went wrong.");
  }
  ////console.log(students);
  if (!students) return res.status(404).json("No student assigned.");
  let studentData = students.studentId;
  ////console.log("studentData.length:", studentData.length);
  let studId = [];
  ////console.log("studentData:", studentData);
  for (let i = 0; i < studentData.length; i++) {
    studId[i] = studentData[i]._id;
  }
  // //console.log(studId);
  //console.log("studId.length", studId.length);
  let checkStatus = [];
  //{ studentId: { $in: studId } },
  try {
    checkStatus = await SpecialVsStudent.find({
      $and: [{ examId: examId }],
    }).populate("studentId examId");
  } catch (err) {
    ////console.log(err);
    return res.status(500).json("Something went wrong.");
  }
  ////console.log("checkStatus", checkStatus);
  let checkStatus1 = [];
  for (let i = 0; i < studId.length; i++) {
    for (let j = 0; j < checkStatus.length; j++) {
      if (String(studId[i]) == String(checkStatus[j].studentId._id)) {
        checkStatus1.push(checkStatus[j]);
        break;
      }
    }
  }
  // for (let i = 0; i < checkStatus1.length; i++) {
  //   if (checkStatus1[i].questionWritten.length == 0)
  //     //console.log(i, checkStatus1[i]);
  // }
  ////console.log("checkStatus1:", checkStatus1);
  checkStatus = checkStatus1;
  ////console.log("C S L:", checkStatus1.length);
  let indexValue1 = null;
  for (let j = 0; j < 6; j++) {
    if (String(dataEx.questionWritten[j].subjectId) == String(subjectRole)) {
      indexValue1 = j;
      ////console.log(j);
      break;
    }
  }
  // for (let i = 0; i < checkStatus.length; i++) {
  //   ////console.log(i, checkStatus[i].questionWritten);
  //   // if (
  //   //   checkStatus[i].questionWritten &&
  //   //   checkStatus[i].questionWritten.length > 0
  //   // )
  //   //   for (let j = 0; j < checkStatus[i].questionWritten.length; j++) {
  //   //     //console.log("checkStatus:", checkStatus[i].questionWritten[j]);
  //   //   }
  // }

  let data = [];
  for (let i = 0; i < checkStatus.length; i++) {
    let questionData = null;
    let indexValue = null;
    // if (checkStatus[i].questionWritten != undefined) {
    //   //console.log("checkStatus", checkStatus[i].questionWritten);
    // }
    for (let j = 0; j < 4; j++) {
      ////console.log("j", j);
      if (
        String(checkStatus[i].questionWritten[j].subjectId) ==
        String(subjectRole)
      ) {
        questionData = checkStatus[i].questionWritten[j];
        indexValue = j;
        ////console.log(j);
        break;
      }
    }
    if (indexValue == null || questionData.subStatus == false) continue;
    ////console.log(i);
    // //console.log(
    //   "check status",
    //   checkStatus[i].examId.questionWritten[indexValue1].marksPerQuestion
    // );
    let dataObj = {};
    dataObj["examName"] = checkStatus[i].examId.name;
    dataObj["examVariation"] = "specialExam";
    dataObj["studentName"] = checkStatus[i].studentId.name;
    dataObj["studentId"] = checkStatus[i].studentId._id;
    dataObj["checkStatus"] = checkStatus[i].checkStatus;
    dataObj["totalQuestions"] =
      checkStatus[i].examId.questionWritten[
        indexValue1
      ].marksPerQuestion.length;
    dataObj["totalMarks"] = checkStatus[i].examId.totalMarksWritten / 4;
    dataObj["marksPerQuestion"] =
      checkStatus[i].examId.questionWritten[indexValue1].marksPerQuestion;
    data.push(dataObj);
  }
  let count = data.length;
  let paginateData = pagination(count, page);
  let start, end;
  start = (page - 1) * paginateData.perPage;
  end = page * paginateData.perPage;
  // //console.log(paginateData);
  // //console.log(start);
  // //console.log(end);
  let data1 = [];
  if (count > 0) {
    for (let i = start; i < end; i++) {
      if (i == data.length) break;
      data1.push(data[i]);
    }
  }
  //console.log(data1.length);
  return res.status(200).json({ data1, paginateData });
};
const getRecheckStudentData1 = async (req, res, next) => {
  let page = req.query.page || 1;
  let teacherId = req.user.id;
  teacherId = new mongoose.Types.ObjectId(teacherId);
  let subjectRole = null;
  try {
    subjectRole = await User.findOne({ _id: teacherId }, "subjectId -_id");
  } catch (err) {
    //console.log(err);
    return res.status(500).json("Something went wrong.");
  }
  subjectRole = subjectRole.subjectId;
  //console.log(req.user);
  let examId = req.query.examId;
  examId = new mongoose.Types.ObjectId(examId);
  teacherId = new mongoose.Types.ObjectId(teacherId);
  let subjectId = new mongoose.Types.ObjectId(subjectRole);
  //console.log(teacherId);
  //console.log(examId);
  let students = [];
  let questionData = null;
  let dataEx = null;
  try {
    dataEx = await SpecialExam.findById(examId);
  } catch (err) {
    //console.log(err);
    return res.status(500).json("Something went wrong.");
  }
  questionData = dataEx.questionWritten;
  let indexValue = null;
  for (let i = 0; i < 4; i++) {
    if (String(questionData[i].subjectId) == String(subjectId)) {
      questionData = questionData[i];
      indexValue = i;
      break;
    }
  }
  try {
    students = await TeacherVsSpecialExam.findOne({
      $and: [{ teacherId: teacherId }, { examId: examId }],
    });
  } catch (err) {
    //console.log(err);
    return res.status(500).json("Something went wrong.");
  }
  //console.log(students);
  if (students.studentId.length == 0)
    return res.status(404).json("No student assigned.");
  let studentData = students.studentId;
  //console.log(studentData);
  let studId = [];
  for (let i = 0; i < studentData.length; i++) {
    studId[i] = studentData[i]._id;
  }
  //console.log(studId);
  let checkStatus = null;
  try {
    checkStatus = await SpecialVsStudent.find({
      $and: [{ studentId: { $in: studId } }, { examId: examId }],
    }).populate("studentId examId");
  } catch (err) {
    //console.log(err);
    return res.status(500).json("Something went wrong.");
  }
  //console.log("check status", checkStatus);
  let data = [];
  for (let i = 0; i < checkStatus.length; i++) {
    let dataObj = {};
    //console.log(checkStatus[i].questionWritten[indexValue].subStatus);
    if (checkStatus[i].questionWritten[indexValue].subStatus == false) continue;
    dataObj["examName"] = checkStatus[i].examId.name;
    dataObj["examVariation"] = 4;
    dataObj["studentName"] = checkStatus[i].studentId.name;
    dataObj["studentId"] = checkStatus[i].studentId._id;
    dataObj["checkStatus"] = checkStatus[i].checkStatus;
    dataObj["totalQuestions"] =
      dataEx.questionWritten[indexValue].marksPerQuestion.length;
    dataObj["totalMarks"] = dataEx.totalMarksWritten / 4;
    dataObj["marksPerQuestion"] =
      dataEx.questionWritten[indexValue].marksPerQuestion;
    data.push(dataObj);
  }
  let count = data.length;
  let paginateData = pagination(count, page);
  let start, end;
  start = (page - 1) * paginateData.perPage;
  end = page * paginateData.perPage;
  //console.log(paginateData);
  //console.log(start);
  //console.log(end);
  let data1 = [];
  if (count > 0) {
    for (let i = start; i < end; i++) {
      if (i == data.length) break;
      data1.push(data[i]);
    }
  }
  return res.status(200).json({ data1, paginateData });
};
const getWrittenScriptSingle = async (req, res, next) => {
  let studentId = req.query.studentId;
  let examId = req.query.examId;
  let subjectId = req.query.subjectId;
  if (
    !ObjectId.isValid(studentId) ||
    !ObjectId.isValid(examId) ||
    !ObjectId.isValid(subjectId)
  ) {
    return res
      .status(404)
      .json("Student Id or Exam Id or question Id is not valid.");
  }
  let studentIdObj = new mongoose.Types.ObjectId(studentId);
  let examIdObj = new mongoose.Types.ObjectId(examId);
  let subId = new mongoose.Types.ObjectId(subjectId);
  let getData = null;
  try {
    getData = await SpecialVsStudent.findOne({
      $and: [{ studentId: studentIdObj }, { examId: examIdObj }],
    });
  } catch (err) {
    //console.log(err);
    return res.status(500).json("Something went wrong.");
  }
  let indexValue = null;
  for (let i = 0; i < 4; i++) {
    if (String(getData.questionWritten[i].subjectId) == subjectId) {
      indexValue = i;
      break;
    }
  }
  // if (getData.checkStatus != true)
  //   return res.status(404).json("Not checked yet.");
  let data = {};
  data["studentId"] = studentId;
  data["answerScript"] =
    getData.questionWritten[indexValue].submittedScriptILink;
  data["checkScript"] = getData.questionWritten[indexValue].answerScriptILink;
  data["obtainedMarks"] = getData.totalObtainedMarks;
  data["totalObtainedMarks"] = getData.totalObtainedMarks;
  data["examId"] = examId;
  data["checkStatus"] = getData.checkStatus;
  data["uploadStatus"] = getData.uploadStatus;
  let getQuestion = null;
  try {
    getQuestion = await SpecialExam.findById(examId);
  } catch (err) {
    return res.status(500).json("Something went wrong.");
  }
  data["question"] = getQuestion.questionWritten[indexValue].writtenILink;
  data["totalQuestions"] =
    getQuestion.questionWritten[indexValue].marksPerQuestion.length;
  data["marksPerQuestion"] =
    getQuestion.questionWritten[indexValue].marksPerQuestion;
  data["totalMarks"] = getQuestion.totalObtainedMarks;
  //console.log(getQuestion);
  return res.status(200).json(data);
};
const checkScriptSingle = async (req, res, next) => {
  let questionNo = Number(req.body.questionNo);
  let obtainedMarks = Number(req.body.obtainedMarks);
  let studentId = req.body.studentId;
  let examId = req.body.examId;
  let images = req.body.uploadImages;
  let teacherId = req.user.id;
  teacherId = new mongoose.Types.ObjectId(teacherId);
  let subjectId = null;
  try {
    subjectId = await User.findOne({ _id: teacherId }, "subjectId -_id");
  } catch (err) {
    //console.log(err);
    return res.status(500).json("Something went wrong.");
  }
  subjectId = subjectId.subjectId;
  //console.log(req.body.obtainedMarks);
  //console.log(obtainedMarks);
  //console.log(req.body.uploadImages);
  if (
    !ObjectId.isValid(studentId) ||
    !ObjectId.isValid(examId) ||
    questionNo < 0 ||
    obtainedMarks < 0 ||
    !ObjectId.isValid(subjectId)
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

    let fileNameDis =
      String(examId) +
      "-" +
      String(studentId) +
      "_" +
      String(subjectId) +
      "_" +
      String(questionNo + 1) +
      "-" +
      String(i + 1) +
      ".png";
    let fileName =
      dir +
      "/" +
      String(examId) +
      "-" +
      String(studentId) +
      "_" +
      String(subjectId) +
      "_" +
      String(questionNo + 1) +
      "-" +
      String(i + 1) +
      ".png";
    try {
      fs.writeFileSync(fileName, matches, { encoding: "base64" });
    } catch (e) {
      //console.log(e);
      return res.status(500).json(e);
    }
    uploadImages[i] = "uploads/answers/" + fileNameDis;
  }
  let studentIdObj = new mongoose.Types.ObjectId(studentId);
  let examIdObj = new mongoose.Types.ObjectId(examId);
  let subjectIdObj = new mongoose.Types.ObjectId(subjectId);
  let getData = null;
  try {
    getData = await SpecialVsStudent.findOne({
      $and: [{ studentId: studentIdObj }, { examId: examIdObj }],
    });
  } catch (err) {
    return res.status(500).json("Something went wrong.");
  }
  let insertId = getData._id;
  let indexValue = null;
  for (let i = 0; i < 4; i++) {
    if (String(getData.questionWritten[i].subjectId) == String(subjectIdObj)) {
      indexValue = i;
      break;
    }
  }
  getData.questionWritten[indexValue].answerScriptILink[questionNo] =
    uploadImages;
  getData.questionWritten[indexValue].obtainedMarks[questionNo] = obtainedMarks;
  let upd = {
    questionWritten: getData.questionWritten,
  };
  let doc;
  try {
    doc = await SpecialVsStudent.findByIdAndUpdate(insertId, upd);
  } catch (err) {
    ////console.log(err);
    return res.status(500).json("Something went wrong!");
  }
  return res.status(201).json("Updated Successfully.");
};
const marksCalculation = async (req, res, next) => {
  let studentId = req.body.studentId;
  let examId = req.body.examId;
  let teacherId = req.user.id;
  teacherId = new mongoose.Types.ObjectId(teacherId);
  let subjectId = null;
  try {
    subjectId = await User.findOne({ _id: teacherId }, "subjectId -_id");
  } catch (err) {
    //console.log(err);
    return res.status(500).json("Something went wrong.");
  }
  subjectId = subjectId.subjectId;
  //console.log(req.body);
  if (
    !ObjectId.isValid(studentId) ||
    !ObjectId.isValid(examId) ||
    !ObjectId.isValid(subjectId)
  ) {
    return res
      .status(404)
      .json("Student Id or Exam Id or question Id is not valid.");
  }
  let studentIdObj = new mongoose.Types.ObjectId(studentId);
  let examIdObj = new mongoose.Types.ObjectId(examId);
  let subjectIdObj = new mongoose.Types.ObjectId(subjectId);
  //console.log(studentIdObj);
  let getData;
  try {
    getData = await SpecialVsStudent.findOne({
      $and: [{ examId: examIdObj }, { studentId: studentIdObj }],
    }).populate("examId");
    // getData = await StudentExamVsQuestionsWritten.findById(
    //   "64f5a1dd50c6b7e0c5f3549c"
    // );
  } catch (err) {
    return res.status(500).json("Something went wrong.");
  }
  let indexValue = null;
  for (let i = 0; i < 4; i++) {
    if (String(getData.questionWritten[i].subjectId) == String(subjectIdObj)) {
      indexValue = i;
      break;
    }
  }
  let totalMarks = 0;
  let marks = getData.questionWritten[indexValue].obtainedMarks;
  // //console.log(getData);
  // //console.log(marks);
  // //console.log(marks);
  marks.forEach((value) => {
    totalMarks = totalMarks + value;
  });
  getData.questionWritten[indexValue].totalObtainedMarksWritten = totalMarks;
  getData.questionWritten[indexValue].subStatus = true;
  // //console.log(totalMarks);
  let insertId = getData._id;
  let doc;
  try {
    doc = await SpecialVsStudent.findByIdAndUpdate(insertId, {
      questionWritten: getData.questionWritten,
    });
  } catch (err) {
    return res.status(500).json("Something went wrong!");
  }

  let flag = true;
  for (let i = 0; i < getData.questionWritten.length; i++) {
    if (getData.questionWritten[i].totalObtainedMarksWritten == -1) {
      flag = false;
      break;
    }
  }
  let upd = {};
  if (flag == true) {
    upd = { checkStatus: true };
    let subData = null;
    try {
      subData = await SpecialVsStudent.findByIdAndUpdate(insertId, upd);
    } catch (err) {
      return res.status(500).json("Something went wrong!");
    }
  }

  return res.status(201).json("Status Change Successfully.");
};
const publishExam = async (req, res, next) => {
  let examId = req.body.examId;
  if (!ObjectId.isValid(examId)) {
    return res.status(404).json("Exam Id is not valid.");
  }
  let examIdObj = new mongoose.Types.ObjectId(examId);
  let upd = null;
  try {
    upd = await SpecialExam.findByIdAndUpdate(examId, {
      publishStatus: true,
    });
  } catch (err) {
    return res.status(500).json("1.Something went wrong.");
  }
  let upd1 = null;
  try {
    upd1 = await SpecialVsStudent.updateMany(
      { examId: examIdObj },
      {
        publishStatus: true,
      }
    );
  } catch (err) {
    return res.status(500).json("2.Something went wrong.");
  }
  let dataStud = null;
  try {
    dataStud = await SpecialVsStudent.find({
      $and: [{ examId: examIdObj }, { publishStatus: true }],
    });
  } catch (err) {
    return res.status(500).json("3.Something went wrong.");
  }

  for (let i = 0; i < dataStud.length; i++) {
    let marks = 0;
    //console.log(i);
    //console.log("data Stud:", dataStud[i]);
    if (dataStud[i].questionWritten.length == 0) marks = 0;
    else {
      for (let j = 0; j < 4; j++) {
        marks =
          marks + dataStud[i].questionWritten[j].totalObtainedMarksWritten;
      }
    }
    //console.log("marks", marks);
    let upd2 = null;
    try {
      upd2 = await SpecialVsStudent.updateOne(
        {
          $and: [{ examId: examIdObj }, { studentId: dataStud[i].studentId }],
        },
        {
          $set: {
            totalObtainedMarks: marks + dataStud[i].totalMarksMcq,
            totalMarksWritten: marks,
          },
        }
      );
    } catch (err) {
      return res.status(500).json("4.Something went wrong.");
    }
  }
  return res.status(201).json("successfully!");
};
const getWrittenStudentSingleByExam = async (req, res, next) => {
  let examId = req.query.examId;
  let studentId = req.query.studentId;
  let teacherId = req.user.id;

  if (
    !ObjectId.isValid(examId) ||
    !ObjectId.isValid(studentId) ||
    !ObjectId.isValid(teacherId)
  )
    return res
      .status(404)
      .json("exam ID or student ID or Teacher ID is not valid.");
  examId = new mongoose.Types.ObjectId(examId);
  studentId = new mongoose.Types.ObjectId(studentId);
  teacherId = new mongoose.Types.ObjectId(teacherId);
  let subjectId = null;
  try {
    subjectId = await User.findById(teacherId, "subjectId -_id");
  } catch (err) {
    return res.status(500).json("1.Something went wrong.");
  }
  subjectId = subjectId.subjectId;
  let data = null,
    data1 = [];
  try {
    data = await SpecialVsStudent.findOne({
      $and: [
        { examId: examId },
        { studentId: studentId },
        { uploadStatus: true },
      ],
    }).populate("studentId examId");
  } catch (err) {
    return res.status(500).json("Something went wrong.");
  }
  //console.log("data", data);
  let indexValue1 = null;
  for (let i = 0; i < 4; i++) {
    if (String(data.questionWritten[i].subjectId) == String(subjectId)) {
      indexValue1 = i;
      break;
    }
  }
  let data2 = null;
  try {
    data2 = await SpecialExam.findById(examId);
  } catch (err) {
    return res.status(500).json("Something went wrong.");
  }
  let indexValue = null;
  for (let i = 0; i < 6; i++) {
    if (String(data2.questionWritten[i].subjectId) == String(subjectId)) {
      indexValue = i;
      break;
    }
  }
  let dataObj = {};
  dataObj["examName"] = data.examId.name;
  dataObj["examVariation"] = "specialExam";
  dataObj["studentName"] = data.studentId.name;
  dataObj["studentId"] = data.studentId._id;
  dataObj["answerScript"] = [];
  for (
    let i = 0;
    i < data2.questionWritten[indexValue].marksPerQuestion.length;
    i++
  ) {
    dataObj["answerScript"][i] = null;
    if (data.questionWritten[indexValue1].submittedScriptILink[i])
      dataObj["answerScript"][i] =
        data.questionWritten[indexValue1].submittedScriptILink[i];
  }
  dataObj["totalQuestions"] =
    data2.questionWritten[indexValue].marksPerQuestion.length;
  dataObj["totalMarks"] = data2.totalMarksWritten / 4;
  dataObj["marksPerQuestion"] =
    data2.questionWritten[indexValue].marksPerQuestion;
  //dataObj["checkStatus"] = data.checkStatus;
  ////console.log(data.checkStatus);
  return res.status(200).json(dataObj);
};
const getWrittenStudentSingleByExamAdmin = async (req, res, next) => {
  let examId = req.query.examId;
  let studentId = req.query.studentId;
  let subjectId = req.query.subjectId;

  if (
    !ObjectId.isValid(examId) ||
    !ObjectId.isValid(studentId) ||
    !ObjectId.isValid(subjectId)
  )
    return res
      .status(404)
      .json("exam ID or student ID or Teacher ID is not valid.");
  examId = new mongoose.Types.ObjectId(examId);
  studentId = new mongoose.Types.ObjectId(studentId);
  subjectId = new mongoose.Types.ObjectId(subjectId);
  let data = null,
    data1 = [];
  try {
    data = await SpecialVsStudent.findOne({
      $and: [
        { examId: examId },
        { studentId: studentId },
        { uploadStatus: true },
      ],
    }).populate("studentId examId");
  } catch (err) {
    return res.status(500).json("Something went wrong.");
  }
  //console.log("data", data);
  let indexValue1 = null;
  for (let i = 0; i < 4; i++) {
    if (String(data.questionWritten[i].subjectId) == String(subjectId)) {
      indexValue1 = i;
      break;
    }
  }
  let data2 = null;
  try {
    data2 = await SpecialExam.findById(examId);
  } catch (err) {
    return res.status(500).json("Something went wrong.");
  }
  let indexValue = null;
  for (let i = 0; i < 4; i++) {
    if (String(data2.questionWritten[i].subjectId) == String(subjectId)) {
      indexValue = i;
      break;
    }
  }
  let dataObj = {};
  dataObj["examName"] = data.examId.name;
  dataObj["examVariation"] = "specialExam";
  dataObj["studentName"] = data.studentId.name;
  dataObj["studentId"] = data.studentId._id;
  dataObj["answerScript"] = [];
  for (
    let i = 0;
    i < data2.questionWritten[indexValue].marksPerQuestion.length;
    i++
  ) {
    dataObj["answerScript"][i] = null;
    if (data.questionWritten[indexValue1].submittedScriptILink[i])
      dataObj["answerScript"][i] =
        data.questionWritten[indexValue1].submittedScriptILink[i];
  }
  dataObj["totalQuestions"] =
    data2.questionWritten[indexValue].marksPerQuestion.length;
  dataObj["totalMarks"] = data2.totalMarksWritten / 4;
  dataObj["marksPerQuestion"] =
    data2.questionWritten[indexValue].marksPerQuestion;

  //dataObj["checkStatus"] = data.checkStatus;
  ////console.log(data.checkStatus);
  return res.status(200).json(dataObj);
};
const getStudentDataAdmin = async (req, res, next) => {
  let page = req.query.page || 1;
  let examId = req.query.examId;
  if (!ObjectId.isValid(examId))
    return res.status(404).json("exam Id is not valid.");
  examId = new mongoose.Types.ObjectId(examId);
  let students = [];
  try {
    students = await SpecialVsStudent.find({
      $and: [{ examId: examId }],
    })
      .populate("studentId examId")
      .populate({ path: "questionWritten", populate: { path: "subjectId" } });
  } catch (err) {
    return res.status(500).json("Something went wrong.");
  }
  ////console.log("students:", students);
  if (students.length == 0) return res.status(404).json("No student assigned.");
  let studId = [];
  for (let i = 0; i < students.length; i++) {
    if (
      students[i].questionWritten.length > 0 &&
      students[i].questionWritten != null
    ) {
      studId.push(students[i]);
      ////console.log(studId[i]);
    }
  }
  ////console.log("stud length:", studId.length, students.length);
  ////console.log(studId);
  let checkStatus = studId;
  // try {
  //   checkStatus = await SpecialVsStudent.find({
  //     $and: [{ studentId: { $in: studId } }, { examId: examId }],
  //   })
  //     .populate("studentId examId")
  //     .populate({ path: "questionWritten", populate: { path: "subjectId" } });
  // } catch (err) {
  //   //console.log(err);
  //   return res.status(500).json("Something went wrong.");
  // }
  let data = [];
  ////console.log("check Status length:", checkStatus.length);
  for (let i = 0; i < checkStatus.length; i++) {
    //console.log(checkStatus[i].studentId._id);
    let dataObj = {};
    //if (checkStatus[i].checkStatus == true) continue;
    dataObj["examName"] = checkStatus[i].examId.name;
    dataObj["examVariation"] = "specialExam";
    dataObj["studentName"] = checkStatus[i].studentId.name;
    dataObj["studentId"] = checkStatus[i].studentId._id;
    dataObj["checkStatus"] = checkStatus[i].checkStatus;
    ////console.log("check ", i);
    dataObj["subject1"] = {
      id: checkStatus[i].questionWritten[0].subjectId._id,
      name: checkStatus[i].questionWritten[0].subjectId.name,
      status: checkStatus[i].questionWritten[0].subStatus,
    };
    dataObj["subject2"] = {
      id: checkStatus[i].questionWritten[1].subjectId._id,
      name: checkStatus[i].questionWritten[1].subjectId.name,
      status: checkStatus[i].questionWritten[1].subStatus,
    };
    dataObj["subject3"] = {
      id: checkStatus[i].questionWritten[2].subjectId._id,
      name: checkStatus[i].questionWritten[2].subjectId.name,
      status: checkStatus[i].questionWritten[2].subStatus,
    };
    dataObj["subject4"] = {
      id: checkStatus[i].questionWritten[3].subjectId._id,
      name: checkStatus[i].questionWritten[3].subjectId.name,
      status: checkStatus[i].questionWritten[3].subStatus,
    };
    data.push(dataObj);
  }
  let count = data.length;
  let paginateData = pagination(count, page);
  let start, end;
  start = (page - 1) * paginateData.perPage;
  end = page * paginateData.perPage;
  ////console.log(paginateData);
  ////console.log(start);
  ////console.log(end);
  let data1 = [];
  if (count > 0) {
    for (let i = start; i < end; i++) {
      if (i == data.length) break;
      data1.push(data[i]);
    }
  }
  return res.status(200).json({ data1, paginateData });
};
const getRecheckStudentDataAdmin = async (req, res, next) => {
  let page = req.query.page || 1;
  let examId = req.query.examId;
  if (!ObjectId.isValid(examId))
    return res.status(404).json("exam Id is not valid.");
  examId = new mongoose.Types.ObjectId(examId);
  let students = [];
  try {
    students = await SpecialVsStudent.find({
      $and: [{ examId: examId }],
    });
  } catch (err) {
    return res.status(500).json("Something went wrong.");
  }
  //console.log("students:", students);
  if (students.length == 0) return res.status(404).json("No student assigned.");
  let studId = [];
  for (let i = 0; i < students.length; i++) {
    studId[i] = students[i].studentId._id;
  }
  //console.log(studId);
  let checkStatus = null;
  try {
    checkStatus = await SpecialVsStudent.find({
      $and: [{ studentId: { $in: studId } }, { examId: examId }],
    })
      .populate("studentId examId")
      .populate({ path: "questionWritten", populate: { path: "subjectId" } });
  } catch (err) {
    //console.log(err);
    return res.status(500).json("Something went wrong.");
  }
  //console.log("CC:", checkStatus.length);
  let data = [];
  for (let i = 0; i < checkStatus.length; i++) {
    let dataObj = {};
    dataObj["examName"] = checkStatus[i].examId.name;
    dataObj["examVariation"] = "specialExam";
    dataObj["studentName"] = checkStatus[i].studentId.name;
    dataObj["studentId"] = checkStatus[i].studentId._id;
    dataObj["checkStatus"] = checkStatus[i].checkStatus;
    dataObj["subject1"] = {
      id: checkStatus[i].questionWritten[0].subjectId._id,
      name: checkStatus[i].questionWritten[0].subjectId.name,
    };
    dataObj["subject2"] = {
      id: checkStatus[i].questionWritten[1].subjectId._id,
      name: checkStatus[i].questionWritten[1].subjectId.name,
    };
    dataObj["subject3"] = {
      id: checkStatus[i].questionWritten[2].subjectId._id,
      name: checkStatus[i].questionWritten[2].subjectId.name,
    };
    dataObj["subject4"] = {
      id: checkStatus[i].questionWritten[3].subjectId._id,
      name: checkStatus[i].questionWritten[3].subjectId.name,
    };
    data.push(dataObj);
  }
  let count = data.length;
  let paginateData = pagination(count, page);
  let start, end;
  start = (page - 1) * paginateData.perPage;
  end = page * paginateData.perPage;
  //console.log(paginateData);
  //console.log(start);
  //console.log(end);
  let data1 = [];
  if (count > 0) {
    for (let i = start; i < end; i++) {
      if (i == data.length) break;
      data1.push(data[i]);
    }
  }
  return res.status(200).json({ data1, paginateData });
};
const checkScriptSingleAdmin = async (req, res, next) => {
  let questionNo = Number(req.body.questionNo);
  let obtainedMarks = Number(req.body.obtainedMarks);
  let studentId = req.body.studentId;
  let examId = req.body.examId;
  let images = req.body.uploadImages;
  let subjectId = req.body.subjectId;
  //console.log(req.body.obtainedMarks);
  //console.log(obtainedMarks);
  //console.log(req.body.uploadImages);
  if (
    !ObjectId.isValid(studentId) ||
    !ObjectId.isValid(examId) ||
    questionNo < 0 ||
    obtainedMarks < 0 ||
    !ObjectId.isValid(subjectId)
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

    let fileNameDis =
      String(examId) +
      "-" +
      String(studentId) +
      "_" +
      String(subjectId) +
      "_" +
      String(questionNo + 1) +
      "-" +
      String(i + 1) +
      ".png";
    let fileName =
      dir +
      "/" +
      String(examId) +
      "-" +
      String(studentId) +
      "_" +
      String(subjectId) +
      "_" +
      String(questionNo + 1) +
      "-" +
      String(i + 1) +
      ".png";
    try {
      fs.writeFileSync(fileName, matches, { encoding: "base64" });
    } catch (e) {
      //console.log(e);
      return res.status(500).json(e);
    }
    uploadImages[i] = "uploads/answers/" + fileNameDis;
  }
  let studentIdObj = new mongoose.Types.ObjectId(studentId);
  let examIdObj = new mongoose.Types.ObjectId(examId);
  let subjectIdObj = new mongoose.Types.ObjectId(subjectId);
  let getData = null;
  try {
    getData = await SpecialVsStudent.findOne({
      $and: [{ studentId: studentIdObj }, { examId: examIdObj }],
    });
  } catch (err) {
    return res.status(500).json("Something went wrong.");
  }
  let insertId = getData._id;
  let indexValue = null;
  for (let i = 0; i < 4; i++) {
    if (String(getData.questionWritten[i].subjectId) == String(subjectIdObj)) {
      indexValue = i;
      break;
    }
  }
  getData.questionWritten[indexValue].answerScriptILink[questionNo] =
    uploadImages;
  getData.questionWritten[indexValue].obtainedMarks[questionNo] = obtainedMarks;
  let upd = {
    questionWritten: getData.questionWritten,
  };
  let doc;
  try {
    doc = await SpecialVsStudent.findByIdAndUpdate(insertId, upd);
  } catch (err) {
    ////console.log(err);
    return res.status(500).json("Something went wrong!");
  }
  return res.status(201).json("Updated Successfully.");
};
const marksCalculationAdmin = async (req, res, next) => {
  let studentId = req.body.studentId;
  let examId = req.body.examId;
  let subjectId = req.body.subjectId;
  //console.log(req.body);
  if (
    !ObjectId.isValid(studentId) ||
    !ObjectId.isValid(examId) ||
    !ObjectId.isValid(subjectId)
  ) {
    return res
      .status(404)
      .json("Student Id or Exam Id or question Id is not valid.");
  }
  let studentIdObj = new mongoose.Types.ObjectId(studentId);
  let examIdObj = new mongoose.Types.ObjectId(examId);
  let subjectIdObj = new mongoose.Types.ObjectId(subjectId);
  //console.log(studentIdObj);
  let getData;
  try {
    getData = await SpecialVsStudent.findOne({
      $and: [{ examId: examIdObj }, { studentId: studentIdObj }],
    });
    // getData = await StudentExamVsQuestionsWritten.findById(
    //   "64f5a1dd50c6b7e0c5f3549c"
    // );
  } catch (err) {
    return res.status(500).json("Something went wrong.");
  }
  let indexValue = null;
  for (let i = 0; i < 4; i++) {
    if (String(getData.questionWritten[i].subjectId) == String(subjectIdObj)) {
      indexValue = i;
      break;
    }
  }
  let totalMarks = 0;
  let marks = getData.questionWritten[indexValue].obtainedMarks;
  // //console.log(getData);
  // //console.log(marks);
  // //console.log(marks);
  marks.forEach((value) => {
    totalMarks = totalMarks + value;
  });
  getData.questionWritten[indexValue].totalObtainedMarksWritten = totalMarks;
  // //console.log(totalMarks);
  let insertId = getData._id;
  let upd = {
    questionWritten: getData.questionWritten,
    checkStatus: true,
  };
  let doc;
  try {
    doc = await SpecialVsStudent.findByIdAndUpdate(insertId, upd);
  } catch (err) {
    ////console.log(err);
    return res.status(500).json("Something went wrong!");
  }

  return res.status(201).json("Status Change Successfully.");
};
const statusUpdate = async (req, res, next) => {
  let examId = req.body.examId;
  //console.log(examId);
  if (!ObjectId.isValid(examId))
    return res.status(404).json("exam Id is not valid.");
  examId = new mongoose.Types.ObjectId(examId);
  let upd = null;
  try {
    upd = await SpecialVsStudent.updateOne(
      { examId: examId },
      { $set: { checkStatus: false } }
    );
  } catch (err) {
    //console.log(err);
    return res.status(500).json("problem!");
  }
};

const updateWrittenMinus = async (req, res, next) => {
  let examId = "652bc1f1370db18e26399ad9";
  examId = new mongoose.Types.ObjectId(examId);
  let studData = [];
  try {
    studData = await SpecialVsStudent.find({ examId: examId });
  } catch (err) {
    return res.status(500).json(err);
  }
  // for(let i=0;i<studData)
};
exports.specialGetHistoryFilter = specialGetHistoryFilter;
exports.updateWrittenMinus = updateWrittenMinus;
exports.specialGetHistoryAdmin = specialGetHistoryAdmin;
exports.specialGetHistory = specialGetHistory;
exports.studentSubmittedExamDetail = studentSubmittedExamDetail;
exports.marksCalculationAdmin = marksCalculationAdmin;
exports.checkScriptSingleAdmin = checkScriptSingleAdmin;
exports.getRecheckStudentDataAdmin = getRecheckStudentDataAdmin;
exports.statusUpdate = statusUpdate;
exports.getStudentDataAdmin = getStudentDataAdmin;
exports.getWrittenStudentSingleByExamAdmin = getWrittenStudentSingleByExamAdmin;
exports.getWrittenStudentSingleByExam = getWrittenStudentSingleByExam;
exports.updateRank = updateRank;
exports.getRank = getRank;
exports.getAllRank = getAllRank;
exports.publishExam = publishExam;
exports.marksCalculation = marksCalculation;
exports.checkScriptSingle = checkScriptSingle;
exports.getWrittenScriptSingle = getWrittenScriptSingle;
exports.getRecheckStudentData = getRecheckStudentData;
exports.getStudentData = getStudentData;
exports.updateStudentExamInfo = updateStudentExamInfo;
exports.assignStudentToTeacher = assignStudentToTeacher;
exports.showSpecialExamByIdStudent = showSpecialExamByIdStudent;
exports.historyData = historyData;
exports.viewSollutionWrittenAdmin = viewSollutionWrittenAdmin;
exports.viewSollutionMcqAdmin = viewSollutionMcqAdmin;
exports.viewSollutionWritten = viewSollutionWritten;
exports.viewSollutionMcq = viewSollutionMcq;
exports.submitAnswerMcq = submitAnswerMcq;
exports.submitWritten = submitWritten;
exports.submitStudentScript = submitStudentScript;
exports.ruunningWritten = ruunningWritten;
exports.updateAssignQuestion = updateAssignQuestion;
exports.getRunningDataMcq = getRunningDataMcq;
exports.assignQuestionWritten = assignQuestionWritten;
exports.assignQuestionMcq = assignQuestionMcq;
exports.getCombination = getCombination;
exports.getOptionalSubects = getOptionalSubects;
exports.examCheckMiddleware = examCheckMiddleware;
exports.addQuestionWritten = addQuestionWritten;
exports.questionByExamSub = questionByExamSub;
exports.addQuestionMcqBulk = addQuestionMcqBulk;
exports.examRuleSet = examRuleSet;
exports.examRuleGet = examRuleGet;
exports.examRuleGetAll = examRuleGetAll;
exports.addQuestionMcq = addQuestionMcq;
exports.showSpecialExamByCourse = showSpecialExamByCourse;
exports.createSpecialExam = createSpecialExam;
exports.updateSpecialExam = updateSpecialExam;
exports.showSpecialExamById = showSpecialExamById;
exports.showSpecialExamAll = showSpecialExamAll;
exports.deactivateSpecialExam = deactivateSpecialExam;
exports.getWrittenQuestionByExamSub = getWrittenQuestionByExamSub;
exports.specialGetHistoryAdminFilter = specialGetHistoryAdminFilter;
exports.showSpecialExamByIdStudentAdmin = showSpecialExamByIdStudentAdmin;
