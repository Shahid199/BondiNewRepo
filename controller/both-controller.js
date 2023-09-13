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
const StudentExamVsQuestionsMcq = require("../model/StudentExamVsQuestionsMcq");
const ObjectId = mongoose.Types.ObjectId;
const moment = require("moment");
const pagination = require("../utilities/pagination");
const examType = require("../utilities/exam-type");
const examVariation = require("../utilities/exam-variation");
const StudentExamVsQuestionsWritten = require("../model/StudentExamVsQuestionsWritten");
const TeacherVsExam = require("../model/TeacherVsExam");
const BothExam = require("../model/BothExam");
const BothExamRule = require("../model/BothExamRule");
const BothMcqQuestionVsExam = require("../model/BothMcqQuestionVsExam");
const BothQuestionsWritten = require("../model/BothQuestionsWritten");

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
    writtenDuration,
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
    writtenDuration: Number(writtenDuration),
    totalQuestionWritten: Number(totalQuestionWritten),
    totalMarksWritten: Number(totalMarksWritten),
    totalMarks: Number(totalMarks),
    totalQuestionMcq: tqm,
    marksPerMcq: tmm,
    totalMarksMcq: tqm * tmm,
    negativeMarksMcq: Number(negativeMarks),
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
    mcqDuration,
    totalDuration,
    writtenDuration,
    totalQuestionWritten,
    totalMarksWritten,
    status,
    sscStatus,
    hscStatus,
    negativeMarks,
    totalMarks,
    examType,
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
  let startTime1 = startTime;
  let endTime1 = endTime;
  console.log(startTime1);
  console.log(endTime1);
  let examIdObj = new mongoose.Types.ObjectId(examId);
  let saveExamUpd = {
    courseId: new mongoose.Types.ObjectId(courseId),
    subjectId: new mongoose.Types.ObjectId(subjectId),
    name: name,
    startTime: moment(startTime1),
    endTime: moment(endTime1),
    totalDuration: totalDuration,
    examType: examType,
    mcqDuration: mcqDuration,
    writtenDuration: writtenDuration,
    totalQuestionWritten: totalQuestionWritten,
    totalMarksWritten: totalMarksWritten,
    totalMarks: totalMarks,
    totalQuestionMcq: totalQuestionMcq,
    marksPerMcq: marksPerMcq,
    totalMarksMcq: Number(totalQuestionMcq) * Number(marksPerMcq),
    negativeMarksMcq: negativeMarks,
    status: JSON.parse(status),
    sscStatus: JSON.parse(sscStatus),
    hscStatus: JSON.parse(hscStatus),
  };
  let updStatus = null;
  try {
    updStatus = await BothExam.updateOne({ _id: examIdObj }, saveExamUpd);
  } catch (err) {
    return res.status(500).json(err);
  }
  if (updStatus == null) return res.status(404).json("Prolem at update.");
  else return res.status(201).json("Updated.");
};
const deactivateBothExam = async (req, res, next) => {
  const examId = req.body.examId;
  if (!ObjectId.isValid(examId))
    return res.status(404).json("Invalid exam Id.");
  //const examIdObj = new mongoose.Types.ObjectId(examId);
  let queryResult = null;
  try {
    queryResult = await BothExam.findByIdAndUpdate(examId, { status: false });
  } catch (err) {
    return res.status(500).json(err);
  }
  if (queryResult) return res.status(201).json("Deactivated.");
  else return res.status(404).json("Something went wrong.");
};
const getBothExamBySubject = async (req, res, next) => {
  let subjectId = req.query.subjectId;
  if (!ObjectId.isValid(subjectId))
    return res.status(404).json("subject Id is not valid.");
  subjectId = new mongoose.Types.ObjectId(subjectId);
  let courseId = null;
  let page = Number(req.query.page) || 1;
  let count = 0;
  try {
    count = await BothExam.find({
      $and: [{ status: true }, { subjectId: subjectId }],
    }).count();
  } catch (err) {
    return res.status(500).json("something went wrong.");
  }
  if (count == 0) return res.status(404).json("No data found.");
  let paginateData = pagination(count, page);
  let exams1 = null;
  exams1 = await BothExam.find({
    $and: [{ status: true }, { subjectId: subjectId }],
  });
  console.log(exams1);
  let exams = [];
  for (let i = 0; i < exams1.length; i++) {
    let dataRule = null;
    try {
      dataRule = await BothExamRule.findOne({ bothExamId: exams1[i]._id }).select(
        "ruleILink -_id"
      );
    } catch (err) {
      return res.status(500).json("Something went wrong.");
    }
    let inst = {};
    if (dataRule == null) inst["RuleImage"] = "0";
    else {
      inst["RuleImage"] = dataRule.ruleILink;
    }
    inst["name"] = exams1[i].name;
    inst["examVariation"] = examType[Number(exams1[i].examType)];
    inst["startTime"] = moment(exams1[i].startTime).format(
      "MMMM Do YYYY, h:mm:ss a"
    );
    inst["subjectName"] = exams1[i].subjectId.name;
    inst["totalDuration"] = exams1[i].totalDuration;
    inst["endTime"] = moment(exams1[i].endTime).format(
      "MMMM Do YYYY, h:mm:ss a"
    );
    inst["totalMarks"] = exams1[i].totalMarks;
    inst["_id"] = exams1[i]._id;
    exams.push(inst);
  }
  let examPage = new Object();
  examPage["exam"] = exams;
  examPage["course"] = exams1[0].courseId.name;
  examPage["subject"] = exams1[0].subjectId.name;

  if (exams.length > 0) return res.status(200).json({ examPage, paginateData });
  else return res.status(404).json({ message: "No exam Found." });
};
const getBothExamById = async (req, res, next) => {
  const examId = req.query.examId;
  if (!ObjectId.isValid(examId))
    return res.status(404).json("examId is invalid.");
  let examData = null;
  try {
    examData = await BothExam.findOne({
      $and: [{ _id: examId }, { status: true }],
    }).populate("courseId subjectId");
  } catch (err) {
    return res.status(500).json("Something went wrong.");
  }
  console.log(examData);
  return res.status(200).json(examData);
};
const bothQuestionByExamId = async (req, res, next) => {
  const examId = req.query.examId;
  const type = req.query.type;
  if (!ObjectId.isValid(examId))
    return res.status(404).json("exam Id is not valid.");
  const examIdObj = new mongoose.Types.ObjectId(examId);
  if (type == 1) {
    let queryResult = null;

    try {
      queryResult = await BothMcqQuestionVsExam.findOne({
        eId: examIdObj,
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
      result["type"] = queryResult.mId[i].type;
      result["question"] = queryResult.mId[i].question;
      result["options"] = queryResult.mId[i].options;
      result["correctOption"] = queryResult.mId[i].correctOption;
      result["explanation"] = queryResult.mId[i].explanationILink;
      result["questionId"] = queryResult.mId[i]._id;
      result["status"] = queryResult.mId[i].status;
      resultAll.push(result);
    }
    return res.status(200).json(resultAll);
  } else {
    let queryResult = null;

    try {
      queryResult = await BothQuestionsWritten.findOne({
        $and: [{ examId: examIdObj }, { status: true }],
      });
    } catch (err) {
      return res.status(500).json(err);
    }
    if (queryResult == null) return res.status(404).json("No Question added.");
    let resultAll = {};
    resultAll["questionILink"] = queryResult.questionILink;
    resultAll["status"] = queryResult.status;
    resultAll["totalQuestions"] = queryResult.totalQuestions;
    resultAll["marksPerQuestion"] = queryResult.marksPerQuestion;
    resultAll["totalMarks"] = queryResult.totalMarks;
    return res.status(200).json(resultAll);
  }
};
//exam rule page
const bothExamRuleSet = async (req, res, next) => {
  const file = req.file;
  let ruleILinkPath = null;
  if (!file) {
    return res.status(404).jsoon("Exam rule file not uploaded.");
  }
  ruleILinkPath = "uploads/".concat(file.filename);
  //console.log(ruleILinkPath);
  const examId = req.body.examId;
  if (!ObjectId.isValid(examId))
    return res.status(404).json("exam Id is not valid.");
  const examIdObj = new mongoose.Types.ObjectId(examId);
  let existingElem = null;
  try {
    existingElem = await BothExamRule.findOne({ bothExamId: examIdObj });
  } catch (err) {
    return re.status(500).json(err);
  }

  if (existingElem == null) {
    let examRule = new BothExamRule({
      bothExamId: examIdObj,
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
      data = await BothExamRule.updateOne(
        { bothExamId: examIdObj },
        { ruleILink: ruleILinkPath }
      );
    } catch (err) {
      return res.status(500).json(err);
    }
    return res.status(201).json({ updated: data });
  }
};
const bothExamRuleGet = async (req, res, next) => {
  let examId = req.query.examId;
  if (!ObjectId.isValid(examId))
    return res.status(422).json("exam Id is not valid.");
  let examIdObj = new mongoose.Types.ObjectId(examId);
  let data = null;
  try {
    data = await BothExamRule.findOne({ bothExamId: examIdObj });
  } catch (err) {
    return res.status(500).json(err);
  }
  // if (data) return res.status(200).json(data.ruleILink);
  // else return res.status(404).json("No data found.");
  return res.status(200).json(data);
};
const bothExamRuleGetAll = async (req, res, next) => {
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
    data = await BothExamRule.find({}).skip(skippedItem).limit(Limit);
  } catch (err) {
    return res.status(500).json(err);
  }
  if (data) return res.status(200).json(data);
  else return res.status(404).json("No data found.");
};
//add question MCQ
const bothAddQuestionMcq = async (req, res, next) => {
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
    //console.log(err);
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
    mcqQData = await BothMcqQuestionVsExam.findOne({ eId: examIdObj }).select(
      "mId"
    );
  } catch (err) {
    return res.status(500).json(err);
  }
  if (mcqQData == null) {
    mIdNew.push(questionId);
    let questionExam = new BothMcqQuestionVsExam({
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
      doc1 = await BothMcqQuestionVsExam.updateOne(
        { eId: examIdObj },
        { $set: { mId: mIdNew } }
      );
    } catch (err) {
      return res.status(500).json(err);
    }
  }
  return res.status(201).json("Saved.");
};
const bothAddQuestionMcqBulk = async (req, res, next) => {
  const { questionArray, examId } = req.body;
  let examIdObj = new mongoose.Types.ObjectId(examId);
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
    mIdArray = await BothMcqQuestionVsExam.findOne({ eId: examIdObj }, "mId");
  } catch (err) {
    return res.status(500).json(err);
  }

  if (mIdArray == null) {
    const newExamQuestinon = new BothMcqQuestionVsExam({
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
  //console.log(mIdArray);
  mIdArray = mIdArray.mId;
  let finalIdsString = [];
  finalIdsString = finalIds.map((e) => String(e));
  mIdArray = mIdArray.map((e) => String(e));
  mIdArray = mIdArray.concat(finalIdsString);
  let withoutDuplicate = Array.from(new Set(mIdArray));
  withoutDuplicate = withoutDuplicate.map(
    (e) => new mongoose.Types.ObjectId(e)
  );
  //console.log(withoutDuplicate);
  try {
    sav = await BothMcqQuestionVsExam.updateOne(
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
const bothGetMcqQuestionByExamId = async (req, res, next) => {
  const examId = req.query.examId;
  if (!ObjectId.isValid(examId))
    return res.status(404).json("exam Id is not valid.");
  const examIdObj = new mongoose.Types.ObjectId(examId);
  let queryResult = null;

  try {
    queryResult = await BothMcqQuestionVsExam.findOne({ eId: examId }).populate(
      {
        path: "mId",
        match: { status: { $eq: true } },
      }
    );
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
};
//add written Question
const bothAddQuestionWritten = async (req, res, next) => {
  let examId = req.body.examId;
  if (!ObjectId.isValid(examId))
    return res.status(404).json("Exam Id is not valid.");
  examId = new mongoose.Types.ObjectId(examId);
  let existData = null;
  try {
    existData = await BothQuestionsWritten.findOne({
      $and: [{ examId: examId }, { status: true }],
    });
  } catch (err) {
    return res.status(500).json("1.Something went wrong.");
  }
  if (existData) return res.status(404).json("Already added question.");
  const status = req.body.status;
  const totalQuestions = req.body.totalQuestions;
  let marksPerQuestion = req.body.marksPerQuestion; //array
  // for (let i = 0; i < marksPerQuestion.length; i++) {
  //   marksPerQuestion[i] = parseInt(marksPerQuestion[i]);
  // }
  marksPerQuestion = marksPerQuestion.split(",");
  //console.log(marksPerQuestion);
  const totalMarks = req.body.totalMarks;
  //file upload handle
  const file = req.files;
  //console.log(file);
  let questionILinkPath = null;
  // console.log(file.questionILink[0].filename);
  // return res.status(201).json("Ok");
  if (!file.questionILink[0].filename)
    return res.status(400).json("File not uploaded.");
  questionILinkPath = "uploads/".concat(file.questionILink[0].filename);
  //written question save to db table
  let question = new BothQuestionsWritten({
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
    //console.log(err);
    return res.status(500).json("2.Something went wrong!");
  }

  return res.status(200).json("Question save correctly.");
};
const bothRemoveQuestionWritten = async (req, res, next) => {
  let examId = req.body.examId;
  if (!ObjectId.isValid(examId))
    return res.status(404).json("Exam Id is not valid.");
  examId = new mongoose.Types.ObjectId(examId);
  let remove = null;
  try {
    remove = await BothQuestionsWritten.findOneAndRemove({ examId: examId });
  } catch (err) {
    return res.status(500).json("SOmething went wrong.");
  }
  return res.status(200).json("Successfully removed question from the exam.");
};
const bothGetWrittenQuestionByexam = async (req, res, next) => {
  let writtenQuestion = null;
  let examId = req.query.examId;
  examId = new mongoose.Types.ObjectId(examId);
  try {
    writtenQuestion = await BothQuestionsWritten.findOne({
      examId: examId,
    }).populate("examId");
  } catch (err) {
    return res.status(500).json("SOmething went wrong.");
  }
  if (writtenQuestion == null) return res.status(404).json("No data found.");
  return res.status(200).json(writtenQuestion);
};
exports.bothQuestionByExamId = bothQuestionByExamId;
exports.createBothExam = createBothExam;
exports.updateBothExam = updateBothExam;
exports.deactivateBothExam = deactivateBothExam;
exports.getBothExamBySubject = getBothExamBySubject;
exports.getBothExamById = getBothExamById;
exports.bothExamRuleSet = bothExamRuleSet;
exports.bothExamRuleGet = bothExamRuleGet;
exports.bothExamRuleGetAll = bothExamRuleGetAll;
exports.bothAddQuestionMcq = bothAddQuestionMcq;
exports.bothAddQuestionMcqBulk = bothAddQuestionMcqBulk;
exports.bothGetMcqQuestionByExamId = bothGetMcqQuestionByExamId;
exports.bothAddQuestionWritten = bothAddQuestionWritten;
exports.bothGetWrittenQuestionByexam = bothGetWrittenQuestionByexam;
exports.bothRemoveQuestionWritten = bothRemoveQuestionWritten;
