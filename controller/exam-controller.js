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

const Limit = 100;
//create Exam
const createExam = async (req, res, next) => {
  const file = req.file;
  let iLinkPath = null;
  if (!file) {
    return res.status(404).json("File not uploaded.");
  }
  iLinkPath = "uploads/".concat(file.filename);
  const examFromQuery = JSON.parse(req.query.exam);
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
    status,
    duration,
    sscStatus,
    hscStatus,
    negativeMarks,
  } = examFromQuery;

  //data upload from API
  // const examFromQuery = req.body;
  // const {
  //   courseId,
  //   subjectId,
  //   name,
  //   examType,
  //   examVariation,
  //   examFreeOrNot,
  //   startTime,
  //   endTime,
  //   totalQuestionMcq,
  //   marksPerMcq,
  //   status,
  //   duration,
  //   sscStatus,
  //   hscStatus,
  //   negativeMarks,
  // } = examFromQuery;
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
    courseId: courseId,
    subjectId: subjectId,
    name: name,
    examType: Number(examType),
    examVariation: Number(examVariation),
    examFreeOrNot: JSON.parse(examFreeOrNot),
    startTime: new Date(moment(startTime1).add(6, "hours")),
    endTime: new Date(moment(endTime1).add(6, "hours")),
    duration: Number(duration),
    totalQuestionMcq: tqm,
    marksPerMcq: tmm,
    totalMarksMcq: tmm * tqm,
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
      console.log(err);
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
  let examData = null;
  try {
    examData = await Exam.findOne({
      $and: [{ _id: examId }, { examFreeOrNot: false }, { status: true }],
    }).populate("courseId subjectId");
  } catch (err) {
    return res.status(500).json(err);
  }
  return res.status(200).json(examData);
};
const updateExam = async (req, res, next) => {
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

  let saveExamUpd = {
    courseId: new mongoose.Types.ObjectId(courseId),
    subjectId: new mongoose.Types.ObjectId(subjectId),
    name: name,
    examType: Number(examType),
    examVariation: Number(examVariation),
    examFreeOrNot: JSON.parse(examFreeOrNot),
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
//get all exam for a particular course of particular subject
const getExamBySub = async (req, res, next) => {
  const subjectId = req.query.subjectId;
  if (!ObjectId.isValid(subjectId))
    return res.status(404).json("subject Id is not valid.");
  const subjectIdObj = new mongoose.Types.ObjectId(subjectId);
  let examData = null;
  try {
    examData = await Exam.find({
      $and: [
        { subjectId: subjectIdObj },
        { examFreeOrNot: false },
        { status: true },
      ],
    });
  } catch (err) {
    return res.status(500).json(err);
  }
  return res.status(200).json(examData);
};
const getExamBySubject = async (req, res, next) => {
  let subjectId = req.query.subjectId;
  let variation = req.query.variation;
  console.log(subjectId);
  //let studentId = req.user.studentId;
  if (!ObjectId.isValid(subjectId) || !variation)
    return res.status(404).json("subject Id is not valid.");
  subjectId = new mongoose.Types.ObjectId(subjectId);
  let courseId = null;
  try {
    courseId = await Subject.findById(subjectId).select("courseId");
    courseId = courseId?.courseId;
  } catch (err) {
    console.log(err);
    return res.status(500).json("Something went wrong!");
  }
  let page = Number(req.query.page) || 1;
  let count = 0;
  try {
    count = await Exam.find({
      $and: [
        { status: true },
        { subjectId: subjectId },
        { examVariation: variation },
        { examFreeOrNot: false },
        { endTime: { $gt: new Date() } },
      ],
    }).count();
  } catch (err) {
    return res.status(500).json("something went wrong.");
  }
  if (count == 0) return res.status(404).json("No data found.");
  let paginateData = pagination(count, page);
  let exams = null;
  exams = await Exam.find(
    {
      $and: [
        { status: true },
        { subjectId: subjectId },
        { examVariation: variation },
        { examFreeOrNot: false },
        { endTime: { $gt: new Date() } },
      ],
    },
    "name examVariation startTime endTime examType"
  )
    .populate("courseId subjectId")
    .skip(paginateData.skippedIndex)
    .limit(paginateData.limit);
  let examPage = new Object();
  examPage["exam"] = exams;
  examPage["course"] = exams[0].courseId.name;
  examPage["subject"] = exams[0].subjectId.name;
  if (
    exams.length > 0 &&
    examPage["course"] != null &&
    examPage["subject"] != null
  )
    return res.status(200).json({ examPage, paginateData });
  else return res.status(404).json({ message: "No exam Found." });
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
//add questions
const addQuestionMcq = async (req, res, next) => {
  let iLinkPath = null;
  let explanationILinkPath = null;
  let examIdObj;
  //let type = req.query.type;
  let question;
  const { questionText, optionCount, correctOption, status, examId, type } =
    req.body;
  let options = JSON.parse(req.body.options);
  if (!ObjectId.isValid(examId))
    return res.status(404).json("examId Id is not valid.");
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
    console.log(err);
    return res.status(500).json(err);
  }
  //end of insert question
  //insert question to reference mcqquestionexam table
  let questionId = doc._id;
  if (!questionId) return res.status(400).send("question not inserted");
  let mcqQData,
    doc1,
    mId,
    mIdNew = [];
  try {
    mcqQData = await McqQuestionVsExam.findOne({ eId: examIdObj }).select(
      "mId"
    );
  } catch (err) {
    return res.status(500).json(err);
  }
  if (mcqQData == null) {
    mIdNew.push(questionId);
    let questionExam = new McqQuestionVsExam({
      eId: examId,
      mId: mIdNew,
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
        { eId: examIdObj },
        { $set: { mId: mIdNew } }
      );
    } catch (err) {
      return res.status(500).json(err);
    }
  }
  return res.status(201).json("Saved.");
};

const addQuestionMcqBulk = async (req, res, next) => {
  const { questionArray, examId } = req.body;
  let examIdObj = new mongoose.Types.ObjectId(examId);
  let finalIds = [];
  for (let i = 0; i < questionArray.length; i++) {
    if (ObjectId.isValid(questionArray[i]))
      finalIds.push(new mongoose.Types.ObjectId(questionArray[i]));
    else continue;
  }
  console.log(finalIds);
  if (finalIds.length == 0)
    return res.status(404).json("question IDs is not valid.");
  let mIdArray = null;
  try {
    mIdArray = await McqQuestionVsExam.findOne({ eId: examIdObj }, "mId");
  } catch (err) {
    return res.status(500).json(err);
  }

  if (mIdArray == null) {
    const newExamQuestinon = new McqQuestionVsExam({
      eId: examIdObj,
      mId: finalIds,
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
  console.log(mIdArray);
  mIdArray = mIdArray.mId;
  let finalIdsString = [];
  finalIdsString = finalIds.map((e) => String(e));
  mIdArray = mIdArray.map((e) => String(e));
  mIdArray = mIdArray.concat(finalIdsString);
  let withoutDuplicate = Array.from(new Set(mIdArray));
  withoutDuplicate = withoutDuplicate.map(
    (e) => new mongoose.Types.ObjectId(e)
  );
  console.log(withoutDuplicate);
  try {
    sav = await McqQuestionVsExam.updateOne(
      { eId: examId },
      {
        mId: withoutDuplicate,
      }
    );
  } catch (err) {
    return res.status(500).json(err);
  }
  return res.status(201).json("Inserted question to the exam.");
};
//exam rule page
const examRuleSet = async (req, res, next) => {
  const file = req.file;
  let ruleILinkPath = null;
  if (!file) {
    return res.status(404).jsoon("Exam rule file not uploaded.");
  }
  ruleILinkPath = "uploads/".concat(file.filename);
  console.log(ruleILinkPath);
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
  //file upload handle
  const file = req.files;
  console.log(file);
  let questionILinkPath = null;
  // console.log(file.questionILink[0].filename);
  // return res.status(201).json("Ok");
  if (!file.questionILink[0].filename)
    return res.status(400).json("File not uploaded.");
  questionILinkPath = "uploads/".concat(file.questionILink[0].filename);
  //written question save to db table
  const { status } = req.body;
  let question = new QuestionsWritten({
    questionILink: questionILinkPath,
    status: JSON.parse(status),
  });
  let doc;
  try {
    doc = await question.save();
  } catch (err) {
    console.log(err);
    return res.status(500).json("Something went wrong!");
  }
  //exam block
  let examId = req.body.examId;
  try {
    examId = await Exam.findById(examId).select("_id");
  } catch (err) {
    console.log(err);
    return res.status(500).json("Something went wrong4!");
  }
  //data insert to reference table
  let doc1;
  let questionId = doc._id;
  let questionExam = new WrittenQuestionVsExam({
    writtenQuestionId: questionId,
    examId: examId,
  });
  try {
    doc1 = await questionExam.save();
  } catch (err) {
    console.log(err);
    return res.status(500).json("Something went wrong!");
  }
  if (doc1 == null) {
    let delDoc = await QuestionsWritten.findByIdAndDelete(doc._id);
    return res.status(400).json("DB Error occur for insertion.");
  }
  if (doc != null && doc1 != null) return res.status(201).json(doc);
  else return res.status(404).json("Not save correctly.");
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
    resultAll.push(result);
  }
  // resultAll.push({ totalQuestion: queryResult.mId.length });
  // resultAll.push({ examId: String(queryResult.eId) });
  return res.status(200).json(resultAll);
};

const updateQuestionStatus = async (req, res, next) => {
  const questionId = req.body.questionId;
  if (!ObjectId.isValid(questionId))
    return res.status(404).json("question Id is not valid.");
  //const questionIdObj = new mongoose.Types.ObjectId(questionId);
  let queryResult = null;
  try {
    queryResult = await QuestionsMcq.findByIdAndUpdate(questionId, {
      status: false,
    });
  } catch (err) {
    return res.status(500).json(err);
  }
  return res.status(201).json(queryResult);
};
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
//export functions
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
