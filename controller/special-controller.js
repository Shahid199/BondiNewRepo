const { ObjectId } = require("mongodb");
const { default: mongoose, Mongoose } = require("mongoose");
const SpecialExam = require("../model/SpecialExam");
const pagination = require("../utilities/pagination");
const moment = require("moment");
const QuestionsMcq = require("../model/QuestionsMcq");
const SpecialExamRule = require("../model/SpecialExamRule");
const SpecialVsStudent = require("../model/SpecialVsStudent");
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
  console.log(fixedSubjectsId);
  console.log(req.body.fixedSubject);
  for (let i = 0; i < fixedSubjectsId.length; i++) {
    fixedSubjects[i] = new mongoose.Types.ObjectId(fixedSubjectsId[i].value);
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
  console.log("number of tota subhect:", req.query.noOfTotalSubject);
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
  console.log(finalIds);
  if (finalIds.length == 0)
    return res.status(404).json("question IDs is not valid.");
  let mIdArray = null;
  try {
    mIdArray = await SpecialExam.findById(examId, "questionMcq");
  } catch (err) {
    return res.status(500).json(err);
  }
  console.log("midarray:", mIdArray);
  mIdArray = mIdArray.questionMcq;
  console.log("midarray:", mIdArray);
  let bulkData = [];
  console.log("subdid:", subjectId);
  for (let i = 0; i < mIdArray.length; i++) {
    console.log("subid:", String(mIdArray[i].subjectId));
    if (String(subjectId) == String(mIdArray[i].subjectId)) {
      bulkData = mIdArray[i].mcqId;
      console.log("bulkData:", bulkData);
      break;
    }
  }
  //console.log(mIdArray);
  let finalIdsString = [];
  finalIdsString = finalIds.map((e) => String(e));
  bulkData = bulkData.map((e) => String(e));
  console.log("bulk:", bulkData);
  bulkData = bulkData.concat(finalIdsString);
  console.log("bulk:", bulkData);
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
  console.log(req.body);
  //let subjectId = req.body.subjectId;
  //let marksPerQuestion = req.body.marksPerQuestion;
  if (!ObjectId.isValid(examId) || !ObjectId.isValid(subjectId))
    return res.status(404).json("Exam Id is not valid.");
  let examIdObj = new mongoose.Types.ObjectId(examId);
  let subjectIdObj = new mongoose.Types.ObjectId(subjectId);
  //file upload handle
  const file = req.files;
  console.log(file);
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
      writtenData[i].marksPerQuestion = marksPerQuestion;
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
  console.log(questionData);
  return res.status(200).json(questionData);
};

//exam system
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
  console.log(currentDate, "current Date");
  try {
    query = await SpecialExam.findById(examId, "endTime");
  } catch (err) {
    return res.status(500).json("1.Something went wrong.");
  }
  examEndTime = query.endTime;
  if (moment(examEndTime) < currentDate)
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
  console.log(optionalId[sIndex]);
  data.push([fixedIds[0], fixedIds[1], selectedId, optionalId[sIndex]]);
  data.push([fixedIds[0], fixedIds[1], selectedId, otherId[0]]);
  data.push([fixedIds[0], fixedIds[1], selectedId, otherId[1]]);
  return res.status(200).json(data);
};
const assignQuestionMcq = async (req, res, next) => {
  const eId = req.query.examId;
  const subject1 = req.query.subjectId1;
  const subject2 = req.query.subjectId2;
  const subject3 = req.query.subjectId3;
  const subject4 = req.query.subjectId4;
  let subjects = [subject1, subject2, subject3, subject4];
  console.log("subjects:", subjects);
  const studentId = req.user.studentId;
  let eId1, sId;
  sId = new mongoose.Types.ObjectId(studentId);
  eId1 = new mongoose.Types.ObjectId(eId);
  subjects = subjects.map((e) => new mongoose.Types.ObjectId(e));
  let examData = null,
    min = 0,
    max = 0,
    rand,
    rand1;
  try {
    examData = await SpecialExam.findById(eId);
  } catch (err) {
    return res.status(500).json("1.something went wrong.");
  }
  if (!examData) return res.status(404).json("No Exam found.");
  let questionMcq = examData.questionMcq;
  let mcqIds = [],
    questionPerSub = [];
  questionPerSub = examData.subjectInfo[0].noOfQuestionsMcq;
  let flag = 0;
  let questionsId = [];
  for (let i = 0; i < 4; i++) {
    let doc = [];
    for (let j = 0; j < 4; j++) {
      if (String(questionMcq[j].subjectId) == String(subjects[i])) {
        mcqIds = questionMcq[j].mcqId;
        rand = parseInt(Date.now()) % mcqIds.length;
        max = mcqIds.length - 1;
        if (rand == 0) rand = 1;
        if (rand == questionPerSub - 1) rand = rand - 1;
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
        break;
      }
    }
    questionsId.push(doc);
  }
  return res.status(200).json(questionsId);
  // questions.push({ studStartTime: examStartTime });
  // questions.push({ studEndTime: examEndTime });
  // questions.push({ examEndTime: examFinishTime });
  // questions.push({ answeredOption: answered });
  // if (saveStudentQuestion == null) {
  //   return res.status(404).json("Problem occur to assign question.");
  // }
  // return res.status(201).json(questions);
};

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
