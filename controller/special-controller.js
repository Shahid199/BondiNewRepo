const { ObjectId } = require("mongodb");
const { default: mongoose, Mongoose } = require("mongoose");
const SpecialExam = require("../model/SpecialExam");
const pagination = require("../utilities/pagination");
const moment = require("moment");
const QuestionsMcq = require("../model/QuestionsMcq");
const SpecialExamRule = require("../model/SpecialExamRule");
const updateSpecialExam = async (req, res, next) => {
  const {
    examId,
    courseId,
    name,
    examType,
    startTime,
    endTime,
    mcqDuration,
    marksPerMcq,
    negativeVarks,
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
    optionalSubject, //array of subject Id
    subjectInfo, //array of subjectinfo
  } = req.body;
  console.log(req.body);
  if (!ObjectId.isValid(examId) || !ObjectId.isValid(courseId)) {
    return res.status(404).json("exam Id or course Id is not valid.");
  }
  let optionalSubjects = [];
  for (let i = 0; i < optionalSubject.length; i++) {
    optionalSubjects[i] = new mongoose.Types.ObjectId(optionalSubject[i]);
  }
  let subjectsInfos = [];
  for (let i = 0; i < subjectInfo.length; i++) {
    let dataOb = {};
    dataOb["subjectId"] = new mongoose.Types.ObjectId(subjectInfo[i].subjectId);
    dataOb["noOfQuestionsMcq"] = subjectInfo[i].numberOfMcqQuestions;
    dataOb["noOfQuestionsWritten"] = subjectInfo[i].numberOfWrittenQuestions;
    subjectsInfos.push(dataOb);
  }
  let startTime1, endTime1;
  startTime1 = new Date(startTime);
  endTime1 = new Date(endTime);
  let courseIdObj;
  courseIdObj = new mongoose.Types.ObjectId(courseId);
  let saveExam = new {
    courseId: courseIdObj,
    name: name,
    examType: examType,
    startTime: moment(startTime),
    endTime: moment(endTime),
    mcqDuration: mcqDuration,
    marksPerMcq: marksPerMcq,
    negativeMarks: negativeVarks,
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
    subjectInfo: subjectsInfos,
    optionalSubject: optionalSubject,
    sscStatus: JSON.parse(sscStatus),
    hscStatus: JSON.parse(hscStatus),
    status: JSON.parse(status),
  }();
  let updStatus = null;
  try {
    updStatus = await SpecialExam.findByIdAndUpdate(examId, saveExam);
  } catch (err) {
    console.log(err);
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
    allSubject, //all subject ID in array
    optionalSubject, //array of subject Id
    subjectInfo, //array of subjectinfo
  } = req.body;
  const negative = req.body.negativeMarks;
  if (!ObjectId.isValid(courseId)) {
    return res.status(404).json("Course Id is not valid.");
  }
  let allSubjects = [];
  let subjectId = JSON.parse(allSubject);
  console.log("subjectId", subjectId);
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
  console.log("optionalId", optionalId);
  for (let i = 0; i < optionalId.length; i++) {
    optionalSubjects[i] = new mongoose.Types.ObjectId(optionalId[i]);
  }
  let subjectsInfos = [];
  console.log(subjectInfo);
  console.log(JSON.parse(subjectInfo));
  let subjectInfoId = JSON.parse(subjectInfo);
  console.log("subjectInfoId", subjectInfoId);
  for (let i = 0; i < subjectInfoId.length; i++) {
    let dataOb = {};
    dataOb["subjectId"] = new mongoose.Types.ObjectId(
      subjectInfoId[i].subjectId
    );
    dataOb["noOfQuestionsMcq"] = subjectInfoId[i].numberOfMcqQuestions;
    dataOb["noOfQuestionsWritten"] = subjectInfoId[i].numberOfWrittenQuestions;
    subjectsInfos.push(dataOb);
  }
  console.log(subjectsInfos);
  let startTime1, endTime1;
  startTime1 = new Date(startTime);
  endTime1 = new Date(endTime);
  let courseIdObj;
  courseIdObj = new mongoose.Types.ObjectId(courseId);
  let saveExam = new SpecialExam({
    courseId: courseIdObj,
    name: name,
    examVariation: examVariation,
    startTime: moment(startTime),
    endTime: moment(endTime),
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
    subjectInfo: subjectsInfos,
    optionalSubject: optionalSubjects,
    allSubject: allSubjects,
    questionMcq: mcqQuestionSub,
    sscStatus: JSON.parse(sscStatus),
    hscStatus: JSON.parse(hscStatus),
    status: JSON.parse(status),
    iLink: iLinkPath,
  });
  let updStatus = null;
  try {
    updStatus = await saveExam.save();
  } catch (err) {
    console.log(err);
    return res.status(500).json("Something went wrong.");
  }
  console.log(updStatus);
  return res.status(201).json("Created special exam successfully.");
};

const showSpecialExamById = async (req, res, next) => {
  let examId = req.query.examId;
  if (!ObjectId.isValid(examId)) return res.staus(404).json("Invalid Exam Id.");
  examId = new mongoose.Types.ObjectId(examId);
  let data = null;
  try {
    data = await SpecialExam.findOne({
      $and: [{ _id: examId }, { status: true }],
    });
  } catch (err) {
    return res.status(500).json("Something went wrong.");
  }
  if (data == null) return res.status(404).json("No data found.");
  return res.status(200).json(data);
};
const showSpecialExamByCourse = async (req, res, next) => {
  let courseId = req.query.courseId;
  if (!ObjectId.isValid(courseId))
    return res.staus(404).json("Invalid Course Id.");
  courseId = new mongoose.Types.ObjectId(courseId);
  let data = null;
  try {
    data = await SpecialExam.find({
      $and: [{ courseId: courseId }, { status: true }],
    });
  } catch (err) {
    return res.status(500).json("Something went wrong.");
  }
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
//rule api
const examRuleSet = async (req, res, next) => {
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
    //console.log(err);
    return res.status(500).json(err);
  }
  let questionId = doc._id;
  console.log(questionId);
  if (!questionId) return res.status(400).send("question not inserted");
  let mcqData,
    doc1,
    mcqQuestion = [];
  try {
    mcqData = await SpecialExam.findById(examIdObj).select("questionMcq -_id");
  } catch (err) {
    return res.status(500).json(err);
  }
  //console.log("mcqData:", mcqData);
  mcqData = mcqData.questionMcq;
  let mcqQues = mcqData;
  for (let i = 0; i < mcqQues.length; i++) {
    console.log(i);
    console.log("mcq question:", mcqQues[i].subjectId);
    console.log("subjectId:", subjectIdObj);
    if (subjectId == String(mcqQues[i].subjectId)) {
      console.log(mcqQues[i].subjectId);
      mcqQues[i].mcqId.push(questionId);
      break;
    }
  }
  console.log("mcqQues:", mcqQues);
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
  console.log(examId);
  console.log(subjectId);
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
    mIdArray = await SpecialExam.findById(examIdObj, "questionMcq");
  } catch (err) {
    return res.status(500).json(err);
  }
  mIdArray = mIdArray.questionMcq;
  let bulkData = [];
  for (let i = 0; i < mIdArray[i].length; i++) {
    if (subjectId == String(mIdArray[i].subjectId)) {
      bulkData = mIdArray[i].mcqId;
      break;
    }
  }
  //console.log(mIdArray);
  let finalIdsString = [];
  finalIdsString = finalIds.map((e) => String(e));
  bulkData = bulkData.map((e) => String(e));
  bulkData = bulkData.concat(finalIdsString);
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
  //console.log(withoutDuplicate);
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

//written question
const addQuestionWritten = async (req, res, next) => {
  let examId = req.body.examId;
  let subjectId = req.body.subjectId;
  if (!ObjectId.isValid(examId) || !ObjectId.isValid(subjectId))
    return res.status(404).json("Exam Id is not valid.");
  examId = new mongoose.Types.ObjectId(examId);
  subjectId = new mongoose.Types.ObjectId(subjectId);
  //file upload handle
  const file = req.files;
  let questionILinkPath = null;
  if (!file.questionILink[0].filename)
    return res.status(400).json("File not uploaded.");
  questionILinkPath = "uploads/".concat(file.questionILink[0].filename);
  //written question save to db table
  let question = { questionILink: questionILinkPath };
  let writtenData = null;
  try {
    writtenData = await SpecialExam.findById(examId, "questionWritten -_id");
  } catch (err) {
    return res.status(500).json("Something went wrong.");
  }
  writtenData = writtenData.questionWritten;
  let doc;
  try {
    doc = await question.save();
  } catch (err) {
    //console.log(err);
    return res.status(500).json("2.Something went wrong!");
  }
  return res.status(200).json("Question save correctly.");
};

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
