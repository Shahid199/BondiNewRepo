const { ObjectId } = require("mongodb");
const { default: mongoose, Mongoose } = require("mongoose");
const SpecialExam = require("../model/SpecialExam");
const pagination = require("../utilities/pagination");
const moment = require("moment");
const QuestionsMcq = require("../model/QuestionsMcq");
const SpecialExamRule = require("../model/SpecialExamRule");
const SpecialVsStudent = require("../model/SpecialVsStudent");
const SpecialRank = require("../model/SpecialRank");
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
  if (!ObjectId.isValid(examId)) return res.staus(404).json("Invalid Exam Id.");
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
  if (data == null) return res.status(404).json("No data found.");
  return res.status(200).json({ data, writtenObj, mcqObj });
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
//others
const viewSollutionMcq = async (req, res, next) => {
  //console.log(req.query);
  const studentId = req.user.studentId;
  const examId = req.query.examId;
  if (!ObjectId.isValid(studentId) || !ObjectId.isValid(examId))
    return res.status(404).json("student Id or examId is not valid.");
  let studentIdObj = new mongoose.Types.ObjectId(studentId);
  let examIdObj = new mongoose.Types.ObjectId(examId);
  //console.log(studentIdObj, examIdObj);
  let data = null;
  try {
    data = await SpecialVsStudent.findOne({
      $and: [{ studentId: studentIdObj }, { examId: examIdObj }],
    })
      .populate({
        path: "questionMcq",
        populate: { path: "mcqId" },
        populate: { path: "subjectId" },
      })
      .populate("examId");
  } catch (err) {
    return res.status(500).json("1.Something went wrong.");
  }
  if (data == null)
    return res.status(404).json("No exam found under this student.");
  let resultData = [];
  let subjectData = [];
  for (let i = 0; i < 4; i++) {
    let data1 = {};
    for (let j = 0; j < data.questionMcq[i].mcqId.length; j++) {
      data1["question"] = data.questionMcq[i].mcqId[j].question;
      data1["options"] = data.questionMcq[i].mcqId[j].options;
      data1["correctOptions"] = Number(
        data.questionMcq[i].mcqId[j].correctOption
      );
      data1["explanationILink"] = data.questionMcq[i].mcqId[j].explanationILink;
      data1["type"] = data.questionMcq[i].mcqId[j].type;
      data1["answeredOption"] = data.questionMcq[i].mcqAnswer[j];
      data1["optionCount"] = data.questionMcq[i].mcqId[j].optionCount;
      subjectData.push(data1);
    }
    subjectData.push({ subjectName: data.questionMcq[i].subjectId.name });
    subjectData.push({ mcqMarksPerSub: data.questionMcq[i].mcqMarksPerSub });
    subjectData.push({
      totalCorrectAnswer: data.questionMcq[i].totalCorrectAnswer,
    });
    subjectData.push({
      totalCorrectMarks: data.questionMcq[i].totalCorrectMarks,
    });
    subjectData.push({
      totalWrongAnswer: data.questionMcq[i].totalWrongAnswer,
    });
    subjectData.push({ totalWrongMarks: data.questionMcq[i].totalWrongMarks });
    subjectData.push({
      totalNotAnswered: data.questionMcq[i].totalNotAnswered,
    });
    resultData.push(subjectData);
  }

  return res.status(200).json(resultData);
};
const viewSollutionWritten = async (req, res, next) => {
  const studentId = req.user.studentId;
  const examId = req.query.examId;
  if (!ObjectId.isValid(studentId) || !ObjectId.isValid(examId))
    return res.status(404).json("student Id or examId is not valid.");
  let studentIdObj = new mongoose.Types.ObjectId(studentId);
  let examIdObj = new mongoose.Types.ObjectId(examId);
  //console.log(studentIdObj, examIdObj);
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
  console.log(data);
  if (data == null)
    return res.status(404).json("No exam found under this student.");
  let subjects = [];
  for (i = 0; i < 4; i++) {
    let sObj = {};
    sObj["id"] = data.questionWritten[i].subjectId._id;
    sObj["name"] = data.questionWritten[i].subjectId.name;
    sObj["iLink"] = null;
    sObj["answerScript"] = null;
    sObj["marksPerSub"] = null;
    sObj["marksPerQuestion"] = null;
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
    for (let j = 0; j < 6; j++) {
      if (
        String(subjects[i].id) ==
        String(writtenQuestion.questionWritten[j].subjectId)
      ) {
        subjects[i].iLink = writtenQuestion.questionWritten[j].writtenILink;
        subjects[i].answerScript =
          writtenQuestion.questionWritten[j].answerScriptILink;
        subjects[i].marksPerSub =
          writtenQuestion.questionWritten[j].totalObtainedMarksWritten;
        subjects[i].marksPerQuestion =
          writtenQuestion.questionWritten[j].obtainedMarks;
        subjects[i].push({
          totalMarksWritten: writtenQuestion.totalMarksWritten,
        });
      }
    }
    dataNew[i] = subjects;
  }
  return res.status(200).json(dataNew);
};
const historyData = async (req, res, next) => {
  const studentId = req.user.studentId;
  if (!ObjectId.isValid(studentId))
    return res.status(404).json("Student ID not valid.");
  let page = req.query.page || 1;

  let studentIdObj = new mongoose.Types.ObjectId(studentId);
  let data;
  // //let count = 0;
  // // try {
  // //   count = await SpecialVsStudent.find({
  // //     $and: [{ studentId: studentIdObj }],
  // //   })
  // //     .populate({ path: "examId", match: { publishStatus: true } })
  // //     .count();
  // // } catch (err) {
  // //   return res.status(500).json("Something went wrong.");
  // // }
  // //return res.status(200).json(count);
  // //console.log(count);
  // if (count == 0) return res.status(404).json("1.No data found.");
  // let paginateData = pagination(count, page);
  try {
    data = await SpecialVsStudent.find({
      $and: [{ studentId: studentIdObj }],
    })
      .populate({
        path: "examId",
        populate: { path: "courseId", select: "name -_id" },
      })
      .populate({
        path: "questionMcq",
        populate: { path: "subjectId", select: "name -_id" },
      });
    // .skip(paginateData.skippedIndex)
    // .limit(paginateData.perPage);
  } catch (err) {
    return res.status(500).json("1.SOmething went wrong.");
  }
  //return res.status(200).json(data);
  console.log(data);
  let resultData = [];
  let flag = false;
  //console.log(data.length);
  for (let i = 0; i < data.length; i++) {
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
    if (resultRank == null) resultRank = "-1";
    else resultRank = resultRank.rank;
    data1["examId"] = data[i].examId._id;
    data1["title"] = data[i].examId.name;
    data1["variation"] = "Special Exam";
    data1["totalObtainedMarks"] = resultRank.totalObtainedMarks;
    data1["totalMarksMcq"] = data[i].totalMarksMcq;
    data1["totalMarksWritten"] = data[i].totalMarksWritten;
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
    data1["subjects"] = subObj;
  }
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
const bothUpdateStudentExamInfo = async (req, res, next) => {
  const examId = req.body.examId;
  if (!ObjectId.isValid(examId))
    return res.status(404).json("Exam Id is not valid.");
  const examIdObj = new mongoose.Types.ObjectId(examId);
  let getEndTime = null;
  try {
    getEndTime = await SpecialExam.findById(examId).select("endTime -_id");
  } catch (err) {
    return res.status(500).json("Something went wrong.");
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
    return res.status(500).json("Something went wrong.");
  }
  let studentIds = [];
  try {
    studentIds = await SpecialExam.find(
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
    return res.status(500).json("Something went wrong.");
  }
  if (examUncheckStudent.length > 0) {
    //return res.status(200).json("All student submit the exam.");
    let updateStatus = null;
    try {
      updateStatus = await SpecialVsStudent.updateMany(
        {
          _id: { $in: examUncheckStudent },
        },
        { $set: { runningStatus: false, finishStatus: true } }
      );
    } catch (err) {
      return res.status(500).json("Something went wrong.");
    }
    for (let i = 0; i < studentIds.length; i++) {
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
        totalObtainedMarksMcq: totalObtainedMarks,
        uploadStatus: true,
      };
      let result = null,
        upd = null;
      try {
        result = await BothStudentExamVsQuestions.findByIdAndUpdate(
          id,
          update1
        );
      } catch (err) {
        console.log(err);
        return res
          .status(500)
          .json("Problem when update total obtained marks.");
      }
    }
  }
  //written
  let writtenUpd = null;
  try {
    writtenUpd = await BothStudentExamVsQuestions.updateMany(
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
  console.log(examData.questionMcq);
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
  if (studExamEndTime >= examData.endTime) studExamEndTime = examData.endTime;
  console.log(examData.mcqDuration);
  console.log("studExamStartTime", studExamStartTime);
  console.log("studExamEndTime", studExamEndTime);
  console.log("duration", (studExamEndTime - studExamStartTime) / 60000);
  let sav = null,
    mcqData = [];
  for (let i = 0; i < 4; i++) {
    let objSub = {};
    objSub["subjectId"] = subjects[i];
    let objMcq = [];
    let dataQ = questionsId[i];

    for (let p = 0; p < dataQ.length; p++) {
      console.log(p);
      console.log("dataQ:", dataQ[p]._id);
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
    startTimeMcq: studExamStartTime,
    endTimeMcq: studExamEndTime,
    mcqDuration: (studExamEndTime - studExamStartTime) / 60000,
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
  questionsId.push({ studStartTime: studExamStartTime });
  questionsId.push({ studEndTime: studExamEndTime });
  questionsId.push({ examStartTime: examData.startTime });
  questionsId.push({ examEndTime: examData.endTime });
  questionsId.push({
    mcqDuration: (studExamEndTime - studExamStartTime) / 60000,
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
  console.log(getQuestionMcq);
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
  examDet["dueDuration"] =
    moment(moment(examData.endTimeMcq) - new Date()) / 60000;

  return res.status(200).json({ data, examDet });
};
const updateAssignQuestion = async (req, res, next) => {
  let studentId = req.user.studentId;
  let examId = req.body.examId;
  let subjectId = req.body.subjectId;
  let questionIndexNumber = Number(req.body.questionIndexNumber);
  let optionIndexNumber = Number(req.body.optionIndexNumber);
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
  data[sIndex].mcqAnswer[questionIndexNumber] = optionIndexNumber;
  let upd = { questionMcq: data };
  console.log("upd:", upd);
  console.log("data:", data);
  try {
    result = await SpecialVsStudent.findByIdAndUpdate(insertId, upd);
  } catch (err) {
    return res.status(500).json("cant save to db");
  }
  console.log("result:", result);
  if (result) return res.status(201).json("Ok");
  else return res.status(201).json("Not updated.");
};
const submitAnswerMcq = async (req, res, next) => {
  const eId = req.body.eId;
  const sId = req.user.studentId;
  if (!ObjectId.isValid(eId) || !ObjectId.isValid(sId))
    return res.status(404).json("Invalid studnet Id or Exam Id");
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
          select: "question type options optionCount status _id",
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
  console.log("studentCheck:", studentCheck.questionMcq);
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
    for (let j = 0; j < studentCheck.questionMcq[i].mcqId.length; i++) {
      let questions = studentCheck.questionMcq[i].mcqId[j];
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
      totalCorrectMarks - totalWrongMarks;
    totalMarksMcq = totalMarksMcq + studentCheck.questionMcq[i].mcqMarksPerSub;
  }
  let dataUpd = {
    totalMarksMcq: totalMarksMcq,
    questionMcq: studentCheck,
    finishStatus: true,
    runningStatus: false,
    endTimeMcq: submitTime,
    mcqDuration: (moment(timeStudent[0]) - moment(submitTime)) / 60000,
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
    console.log("examData:", examData);
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
  if (studExamEndTime >= examData.endTime) studExamEndTime = examData.endTime;
  let objSav = {
    questionWritten: questionWrittenArr,
    startTimeWritten: studExamStartTime,
    endTimeWritten: studExamEndTime,
    writtenDuration: (studExamEndTime - studExamStartTime) / 60000,
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
  data1.push({ studExamStartTime: studExamStartTime });
  data1.push({ studExamEndTime: studExamEndTime });
  data1.push({ examEndTime: examData.endTime });
  data1.push({ duration: (studExamEndTime - studExamStartTime) / 60000 });
  return res.status(200).json(data1);
};
const ruunningWritten = async (req, res, next) => {
  let examId = req.query.examId;
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
    console.log("examData:", examData);
  } catch (err) {
    return res.status(500).json("something went wrong.");
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
  data1.push({ studExamStartTime: examData.startTimeWritten });
  data1.push({ studExamEndTime: examData.endTimeWritten });
  data1.push({ examEndTime: examData.endTime });
  data1.push({
    dueDuration: (moment(new Date()) - examData.endTimeWritten) / 60000,
  });
  data1.push({
    Duration: (examData.endTimeWritten - examData.startTimeWritten) / 60000,
  });
  return res.status(200).json(data1);
};
const submitStudentScript = async (req, res, next) => {
  const files = req.files;
  //file upload handle:start
  const file = req.files;
  //console.log(file);
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
  //console.log(getQuestionScript[questionNo]);
  let upd = {
    questionWritten: submittedScript,
  };
  let doc;
  try {
    doc = await SpecialVsStudent.findByIdAndUpdate(insertId, upd);
  } catch (err) {
    //console.log(err);
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
  let studentIdObj = new mongoose.Types.ObjectId(studentId);
  examId = new mongoose.Types.ObjectId(examId);
  let startTime = null;
  let endTime = new Date();
  try {
    startTime = await SpecialVsStudent.findOne({
      $and: [{ examId: examId }, { studentId: studentIdObj }],
    });
  } catch (err) {
    return res.status(500).json("1.Something went wrong.");
  }
  let insertId = startTime._id;
  startTime = startTime.startTimeWritten;
  console.log(startTime);
  console.log(endTime);
  let upd = {
    endTimeWritten: endTime,
    writtenDuration: (moment(endTime) - moment(startTime)) / 60000,
    uploadStatus: true,
  };
  console.log(upd.writtenDuration);
  let sav = null;
  try {
    sav = await SpecialVsStudent.findByIdAndUpdate(insertId, upd);
  } catch (err) {
    console.log(err);
    return res.status(500).json("2.Something went wrong.");
  }
  return res.status(201).json("Submitted Sccessfully.");
};

exports.showSpecialExamByIdStudent = showSpecialExamByIdStudent;
exports.historyData = historyData;
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
