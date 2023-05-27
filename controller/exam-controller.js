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
const ObjectId = mongoose.Types.ObjectId;
const Limit = 100;

//create Exam
const createExam = async (req, res, next) => {
  const file = req.file;
  let iLinkPath = null;
  if (!file) {
    return res.status(404).json("Fil not uploaded.");
  }
  iLinkPath = process.env.HOSTNAME.concat("uploads/".concat(file.filename));
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
    startTime: startTime1,
    endTime: endTime1,
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
  let exams;
  let page = req.query.page;
  let skippedItem;
  if (page == null) {
    page = Number(1);
    skippedItem = (page - 1) * Limit;
  } else {
    page = Number(page);
    skippedItem = (page - 1) * Limit;
  }
  try {
    exams = await Exam.find({}).skip(skippedItem).limit(Limit);
  } catch (err) {
    console.log(err);
    return res.status(500).json("Something went wrong!");
  }
  return res.status(200).send(exams);
};
const getExamById = async (req, res, next) => {
  const examId = req.query.examId;
  if (!ObjectId.isValid(examId))
    return res.status(404).json("examId is invalid.");
  let examData = null;
  try {
    examData = await Exam.findById(examId);
  } catch (err) {
    return res.status(500).json(err);
  }
  return res.status(200).json(examData);
};

const updateExam = async (req, res, next) => {
  const examFromQuery = req.query;
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
  } = examFromQuery;
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
    courseId: courseId,
    subjectId: subjectId,
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
    updStatus = await Exam.findByIdAndUpdate(examId, saveExamUpd);
  } catch (err) {
    return res.status(500).json(err);
  }
  if (updStatus == null) return res.status(404).json("Prolem at update.");
  else return res.status(201).json("Updated.");
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
  if (!ObjectId.isValid(subjectId))
    return res.status(404).json("subject Id is not valid.");
  let page = req.query.page;
  let skippedItem;
  if (page == null) {
    page = Number(1);
    skippedItem = (page - 1) * Limit;
  } else {
    page = Number(page);
    skippedItem = (page - 1) * Limit;
  }
  if (subjectId == null || variation == null) {
    return res.status(404).json("not found data.");
  }

  //let studentId = req.payload.studnetId;
  let courseId = null;
  try {
    courseId = await Subject.findById(subjectId).select("courseId");
    courseId = courseId.courseId;
  } catch (err) {
    console.log(err);
    return res.status(500).json("Something went wrong!");
  }
  let doc = "Sdf";
  // try {
  //   doc = await CourseVsStudent.findOne(
  //     {
  //       $and: [
  //         { status: true },
  //         { courseId: courseId },
  //         { studentId: studentId },
  //       ],
  //     },
  //     "_id"
  //   );
  // } catch (err) {
  //   console.log(err);
  //   return res.status(500).json("Something went wrong!");
  // }
  if (doc != null) {
    let exams = null;
    exams = await Exam.find(
      {
        $and: [
          { status: true },
          { subjectId: subjectId },
          { examVariation: variation },
          { examFreeOrNot: false },
          { endTime: { $gt: Date.now() } },
        ],
      },
      "name examVariation startTime endTime"
    )
      .skip(skippedItem)
      .limit(Limit);
    let courseName, subjectName;
    try {
      courseName = await Course.findById(String(courseId), "name");
      subjectName = await Subject.findById(String(subjectId), "name");
    } catch (err) {
      console.log(err);
      return res.status(500).json("Something went wrong!");
    }
    let examPage = new Object();
    examPage["exam"] = exams;
    examPage["course"] = courseName;
    examPage["subject"] = subjectName;
    if (exams.length > 0 && courseName != null && subjectName != null)
      return res.status(200).json(examPage);
    else return res.status(404).json({ message: "No exam Found." });
  } else
    return res
      .status(404)
      .json({ message: "Student not allowed to the subject." });
};
const examByCourseSubject = async (req, res, next) => {
  const { courseId, subjectId, page } = req.query;
  if (!ObjectId.isValid(subjectId) || !ObjectId.isValid(courseId))
    return res.status(404).json("subject Id or course Id is not valid.");
  const courseIdObj = new mongoose.Types.ObjectId(courseId);
  const subjectIdObj = new mongoose.Types.ObjectId(subjectId);
  let skippedItem;
  if (page == null) {
    page = Number(1);
    skippedItem = (page - 1) * Limit;
  } else {
    page = Number(page);
    skippedItem = (page - 1) * Limit;
  }
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
      .skip(skippedItem)
      .limit(Limit)
      .populate("courseId subjectId")
      .exec();
  } catch (err) {
    return res.status(500).json(err);
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
  return res.status(200).json(result);
};
//add questions
const addQuestionMcq = async (req, res, next) => {
  let iLinkPath = null;
  let explanationILinkPath = null;
  let examIdObj;
  //let type = req.query.type;
  let question;
  const {
    questionText,
    optionCount,
    options,
    correctOption,
    status,
    examId,
    type,
  } = req.body;
  console.log(status);
  if (!ObjectId.isValid(examId))
    return res.status(404).json("examId Id is not valid.");
  const file = req.files;
  //question insert for text question(type=true)
  if (JSON.parse(type) == true) {
    if (!file.explanationILink) {
      return res.status(404).json("Expalnation File not uploaded.");
    }
    question = questionText;
    explanationILinkPath = process.env.HOSTNAME.concat(
      "uploads/".concat(file.explanationILink[0].filename)
    );
  } else {
    if (!file.iLink) {
      return res.status(404).json("Question File not uploaded.");
    }

    iLinkPath = process.env.HOSTNAME.concat(
      "uploads/".concat(file.iLink[0].filename)
    );
    explanationILinkPath = process.env.HOSTNAME.concat(
      "uploads/".concat(file.explanationILink[0].filename)
    );
    question = iLinkPath;
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
//exam rule page
const examRuleSet = async (req, res, next) => {
  const file = req.file;
  let ruleILinkPath = null;
  if (!file) {
    return res.status(404).jsoon("Exam rule file not uploaded.");
  }
  ruleILinkPath = process.env.HOSTNAME.concat("uploads/".concat(file.filename));
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
  let examId = req.body.examId;
  if (!ObjectId.isValid(examId))
    return res.status(404).json("exam Id is not valid.");
  let examIdObj = new mongoose.Types.ObjectId(examId);
  console.log(examIdObj);
  let data = null;
  try {
    data = await ExamRule.findOne({ examId: examIdObj });
  } catch (err) {
    return res.status(500).json(err);
  }
  if (data) return res.status(200).json(data.ruleILink);
  else return res.status(404).json("No data found.");
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
  resultAll.push({ totalQuestion: queryResult.mId.length });
  resultAll.push({ examId: String(queryResult.eId) });
  return res.status(200).json(resultAll);
};

const updateQuestionStatus = async (req, res, next) => {
  const questionId = req.query.questionId;
  if (!ObjectId.isValid(questionId))
    return res.status(404).json("question Id is not valid.");
  const questionIdObj = new mongoose.Types.ObjectId(questionId);
  let queryResult = null;
  try {
    queryResult = await QuestionsMcq.findByIdAndUpdate(questionIdObj, {
      status: false,
    });
  } catch (err) {
    return res.status(500).json(err);
  }
  return res.status(201).json(queryResult);
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
