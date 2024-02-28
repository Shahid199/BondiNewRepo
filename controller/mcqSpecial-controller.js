const { ObjectId } = require("mongodb");
const { default: mongoose } = require("mongoose");
const McqSpecialExam = require("../model/McqSpecialExam");
const McqSpecialExamRule = require("../model/McqSpecialExamRule");
const McqSpecialVsStudent = require("../model/McqSpecialVsStudent");
const QuestionsMcq = require("../model/QuestionsMcq");
const McqSpecialRank = require("../model/McqSpecialRank");

const createSpecialExam = async (req, res, next) => {
  const file = req.file;
  let iLinkPath = null;
  if (file) {
    iLinkPath = "uploads/".concat(file.filename);
  }
  const {
    courseId,
    name,
    startTime,
    endTime,
    mcqDuration,
    marksPerMcq,
    totalQuestionMcq,
    totalMarksMcq,
    status,
    sscStatus,
    hscStatus,
    noOfTotalSubject,
    noOfExamSubject,
    noOfOptionalSubject,
    noOfFixedSubject,
    allSubject,
    optionalSubject,
    fixedSubject,
    subjectInfo,
    solutionSheet,
    questionType,
    numberOfRetakes,
    numberOfOptions,
    numberOfSet,
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
    subjectsInfos.push(dataOb);
  }
  //console.log(subjectsInfos);
  let startTime1, endTime1;
  startTime1 = new Date(startTime);
  endTime1 = new Date(endTime);
  let courseIdObj;
  courseIdObj = new mongoose.Types.ObjectId(courseId);
  let saveExam = new McqSpecialExam({
    courseId: courseIdObj,
    name: name,
    examVariation: 5,
    startTime: moment(startTime).add(6, "h"),
    endTime: moment(endTime).add(6, "h"),
    mcqDuration: mcqDuration,
    marksPerMcq: marksPerMcq,
    negativeMarksMcq: negative,
    totalQuestionsMcq: totalQuestionMcq,
    totalMarksMcq: totalMarksMcq,
    noOfTotalSubject: noOfTotalSubject,
    noOfExamSubject: noOfExamSubject,
    noOfOptionalSubject: noOfOptionalSubject,
    noOfFixedSubject: noOfFixedSubject,
    subjectInfo: subjectsInfos,
    optionalSubject: optionalSubjects,
    allSubject: allSubjects,
    fixedSubject: fixedSubjects,
    questionMcq: mcqQuestionSub,
    sscStatus: JSON.parse(sscStatus),
    hscStatus: JSON.parse(hscStatus),
    status: JSON.parse(status),
    publishStatus: false,
    iLink: iLinkPath,
    solutionSheet: solutionSheet,
    questionType: questionType,
    numberOfRetakes: Number(numberOfRetakes),
    numberOfOptions: Number(numberOfOptions),
    numberOfSet: Number(numberOfSet),
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
const updateSpecialExam = async (req, res, next) => {
  const file = req.file;
  let iLinkPath = null;
  if (file) {
    iLinkPath = "uploads/".concat(file.filename);
  } else {
    iLinkPath = String(req.body.iLink);
  }
  const {
    examId,
    courseId,
    name,
    startTime,
    endTime,
    mcqDuration,
    marksPerMcq,
    totalQuestionMcq,
    totalMarksMcq,
    status,
    sscStatus,
    hscStatus,
    noOfTotalSubject,
    noOfExamSubject,
    noOfOptionalSubject,
    noOfFixedSubject,
    allSubject,
    optionalSubject,
    fixedSubject,
    subjectInfo,
    solutionSheet,
    questionType,
    numberOfRetakes,
    numberOfOptions,
    numberOfSet,
  } = req.body;
  const negative = req.body.negativeMarks;
  if (!ObjectId.isValid(courseId) || !ObjectId.isValid(examId)) {
    return res.status(404).json("Course Id is not valid.");
  }
  examId = new mongoose.Types.ObjectId(examId);
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
    subjectsInfos.push(dataOb);
  }
  //console.log(subjectsInfos);
  let startTime1, endTime1;
  startTime1 = new Date(startTime);
  endTime1 = new Date(endTime);
  let courseIdObj;
  courseIdObj = new mongoose.Types.ObjectId(courseId);
  let saveExam = {
    courseId: courseIdObj,
    name: name,
    examVariation: 5,
    startTime: moment(startTime).add(6, "h"),
    endTime: moment(endTime).add(6, "h"),
    mcqDuration: mcqDuration,
    marksPerMcq: marksPerMcq,
    negativeMarksMcq: negative,
    totalQuestionsMcq: totalQuestionMcq,
    totalMarksMcq: totalMarksMcq,
    noOfTotalSubject: noOfTotalSubject,
    noOfExamSubject: noOfExamSubject,
    noOfOptionalSubject: noOfOptionalSubject,
    noOfFixedSubject: noOfFixedSubject,
    subjectInfo: subjectsInfos,
    optionalSubject: optionalSubjects,
    allSubject: allSubjects,
    fixedSubject: fixedSubjects,
    questionMcq: mcqQuestionSub,
    sscStatus: JSON.parse(sscStatus),
    hscStatus: JSON.parse(hscStatus),
    status: JSON.parse(status),
    publishStatus: false,
    iLink: iLinkPath,
    solutionSheet: solutionSheet,
    questionType: questionType,
    numberOfRetakes: Number(numberOfRetakes),
    numberOfOptions: Number(numberOfOptions),
    numberOfSet: Number(numberOfSet),
  };
  let updStatus = null;
  //console.log("number of tota subhect:", req.query.noOfTotalSubject);
  try {
    updStatus = await McqSpecialExam.findByIdAndUpdate(examId, saveExam);
  } catch (err) {
    //console.log(err);
    return res.status(500).json("Something went wrong.");
  }
  //console.log(updStatus);
  return res.status(201).json(updStatus);
};
const showSpecialExamById = async (req, res, next) => {
  let examId = req.query.examId;
  if (!ObjectId.isValid(examId))
    return res.status(404).json("Invalid Exam Id.");
  examId = new mongoose.Types.ObjectId(examId);
  let data = null;
  try {
    data = await McqSpecialExam.findOne({
      $and: [{ _id: examId }, { status: true }],
    }).populate({ path: "questionMcq", populate: { path: "subjectId" } });
  } catch (err) {
    return res.status(500).json("Something went wrong.");
  }
  if (data == null) return res.status(404).json("No data found.");
  return res.status(200).json(data);
};
const showSpecialExamByCourse = async (req, res, next) => {
  let courseId = req.query.courseId;
  if (!ObjectId.isValid(courseId))
    return res.status(404).json("Invalid Course Id.");
  courseId = new mongoose.Types.ObjectId(courseId);
  let data = null;
  try {
    data = await McqSpecialExam.find({
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
      dataRule = await McqSpecialExamRule.findOne({
        examId: data[i]._id,
      }).select("ruleILink -_id");
    } catch (err) {
      return res.status(500).json("Something went wrong.");
    }
    if (dataRule == null) {
      data1["RuleImage"] = "0";
      examObj["examImageAdded"] = false;
    } else {
      data1["RuleImage"] = dataRule.ruleILink;
      examObj["examImageAdded"] = true;
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
    data1["totalQuestionsMcq"] = data[i].totalQuestionsMcq;
    data1["marksPerMcq"] = data[i].marksPerMcq;
    data1["totalMarksMcq"] = data[i].totalMarksMcq;
    data1["negativeMarksMcq"] = data[i].negativeMarksMcq;
    data1["status"] = data[i].status;
    data1["sscStatus"] = data[i].sscStatus;
    data1["hscStatus"] = data[i].hscStatus;
    data1["courseId"] = data[i].courseId;
    data1["iLink"] = data[i].iLink;
    data1["questionMcq"] = data[i].questionMcq;
    data1["createdAt"] = data[i].createdAt;
    data1["updatedAt"] = data[i].updatedAt;
    data1["__v"] = data[i].__v;
    dataObj.push(data1);
  }
  data = dataObj;
  //console.log("data", data);
  return res.status(200).json(data);
};
const deactivateSpecialExam = async (req, res, next) => {
  let examId = req.body.examId;
  if (!ObjectId.isValid(examId))
    return res.status(404).json("examId is not valid.");
  let upd = null;
  try {
    upd = await McqSpecialExam.findByIdAndUpdate(examId, { status: false });
  } catch (err) {
    return res.status(500).json("Something went wrong.");
  }
  if (upd == null) return res.status(404).json("No data found.");
  return res.status(201).json("Deactivated.");
};

const showSpecialExamByIdStudent = async (req, res, next) => {
  let examId = req.query.examId;
  let studentId = req.user.studentId;
  if (!ObjectId.isValid(examId))
    return res.status(404).json("Invalid Exam Id.");
  examId = new mongoose.Types.ObjectId(examId);
  let data = null;
  try {
    data = await McqSpecialVsStudent.findOne({
      $and: [{ examId: examId }, { studentId: studentId }],
    }).populate({ path: "questionMcq", populate: { path: "subjectId" } });
  } catch (err) {
    return res.status(500).json("Something went wrong.");
  }
  let dataWritten = null;
  try {
    dataWritten = await McqSpecialExam.findById(examId);
  } catch (err) {
    return res.status(500).json("Something went wrong.");
  }
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
  return res.status(200).json({ data, mcqObj, subjectsId });
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
    existingElem = await McqSpecialExamRule.findOne({ examId: examIdObj });
  } catch (err) {
    return re.status(500).json(err);
  }

  if (existingElem == null) {
    let examRule = new McqSpecialExamRule({
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
      data = await McqSpecialExamRule.updateOne(
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
    data = await McqSpecialExamRule.findOne({ examId: examIdObj });
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
    data = await McqSpecialExamRule.find({}).skip(skippedItem).limit(Limit);
  } catch (err) {
    return res.status(500).json(err);
  }
  if (data) return res.status(200).json(data);
  else return res.status(404).json("No data found.");
};

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
    if (file.explanationILink) {
      question = questionText;
      explanationILinkPath = "uploads/".concat(
        file.explanationILink[0].filename
      );
    }
  } else {
    if (file.iLink) {
      iLinkPath = "uploads/".concat(file.iLink[0].filename);
      explanationILinkPath = "uploads/".concat(
        file.explanationILink[0].filename
      );
    }
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
    mcqData = await McqSpecialExam.findById(examIdObj).select(
      "questionMcq -_id"
    );
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
    doc1 = await McqSpecialExam.findOneAndUpdate(
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
    mIdArray = await McqSpecialExam.findById(examId, "questionMcq");
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
    sav = await McqSpecialExam.findOneAndUpdate(
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
    queryResult = await McqSpecialExam.findById(examId);
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
    data = await McqSpecialVsStudent.findOne({
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

const specialGetHistory = async (req, res, next) => {
  const examId = req.query.examId;
  if (!ObjectId.isValid(examId))
    return res.status(404).json("Student ID not valid.");
  let page = req.query.page || 1;

  let examIdObj = new mongoose.Types.ObjectId(examId);
  let count = [];
  try {
    count = await McqSpecialVsStudent.find({
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
    data1["examEndTime"] = moment(studentIds[i].examEndTimeMcq).format("LLL");
    data1["duration"] = studentIds[i].mcqDuration;
    data1["totalObtainedMarksMcq"] = studentIds[i].totalMarksMcq;
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
    totalMarks: examDetails.totalMarksMcq,
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
    count = await McqSpecialVsStudent.find({
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
    data1["examEndTime"] = moment(studentIds[i].examEndTimeMcq).format("LLL");
    data1["duration"] = studentIds[i].mcqDuration;
    data1["totalObtainedMarksMcq"] = studentIds[i].totalMarksMcq;
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
    totalMarks: examDetails.totalMarksMcq,
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
    data = await McqSpecialVsStudent.findOne({
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

const historyData = async (req, res, next) => {
  const studentId = req.user.studentId;
  if (!ObjectId.isValid(studentId))
    return res.status(404).json("Student ID not valid.");
  let page = req.query.page || 1;

  let studentIdObj = new mongoose.Types.ObjectId(studentId);
  let data;
  let count = 0;
  try {
    count = await McqSpecialVsStudent.find({
      $and: [{ studentId: studentIdObj }, { publishStatus: true }],
    }).count();
  } catch (err) {
    return res.status(500).json("Something went wrong.");
  }
  let paginateData = pagination(count, page);
  try {
    data = await McqSpecialVsStudent.find({
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
    let totalStudent = 0;
    try {
      resultRank = await McqSpecialRank.findOne({
        $and: [{ examId: examIdObj }, { studentId: studentIdObj }],
      });
      totalStudent = await McqSpecialRank.find({
        examId: examIdObj,
      }).count();
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
    data1["examEndTime"] = moment(data[i].examId.endTime)
      .subtract(6, "h")
      .format("LLL");
    data1["variation"] = "Special Exam";
    data1["examType"] = "no";
    data1["totalObtainedMarks"] = data[i].totalMarksMcq.toFixed(2);
    data1["totalMarksMcqExam"] = data[i].totalMarksMcq;
    data1["totalMarksMcq"] = data[i].examId.totalMarksMcq;
    data1["solutionSheet"] = data[i].examId.solutionSheet;
    data1["meritPosition"] = resultRank;
    data1["examStartTimeMcq"] = moment(data[i].startTimeMcq).format("LLL");
    data1["examEndTimeMcq"] = moment(data[i].endTimeMcq).format("LLL");
    data1["mcqDuration"] = data[i].mcqDuration;
    data1["totalDuration"] = data[i].mcqDuration;
    data1["courseName"] = data[i].examId.courseId.name;
    let subObj = [];
    for (let j = 0; j < 4; j++) {
      subObj.push(data[i].questionMcq[j].subjectId.name);
    }
    data1["subjectName"] = subObj.join("+ ");
    data1["totalStudent"] = totalStudent;
    resultData.push(data1);
  }

  return res.status(200).json({ resultData, paginateData });
};
const getOptionalSubects = async (req, res, next) => {
  const examId = req.query.examId;
  const studentId = req.user.studentId;
  if (!ObjectId.isValid(examId) || !ObjectId.isValid(studentId))
    return res.status(404).json("Exam Id or Student Id is not valid.");
  let subjects = null;
  try {
    subjects = await McqSpecialExam.findById(examId).populate({
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
  let selectIdArr = [];
  selectIdArr.push(selectedId);
  let examId = req.query.examId;
  let fixedId = null;
  try {
    fixedId = await McqSpecialExam.findById(examId)
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
  let fSubject = [];
  let k = 0;
  let flag = [];
  let result1 = allId.filter(
    (obj1) => !fixedIds.some((obj2) => String(obj1._id) === String(obj2._id))
  );
  let result3 = allId.filter((obj1) =>
    selectIdArr.some((obj2) => String(obj1._id) === String(obj2))
  );
  let result2 = result1.filter(
    (obj1) => !selectIdArr.some((obj2) => String(obj1._id) === String(obj2))
  );
  console.log(result3);
  let data = [];
  //console.log(optionalId[sIndex]);
  data.push([fixedIds[0], fixedIds[1], result2[0], result3[0]]);
  data.push([fixedIds[0], fixedIds[1], result2[1], result3[0]]);
  data.push([fixedIds[0], fixedIds[1], result2[2], result3[0]]);
  console.log(data);
  return res.status(200).json(data);
};

const updateStudentExamInfo = async (req, res, next) => {
  const examId = req.body.examId;
  if (!ObjectId.isValid(examId))
    return res.status(404).json("Exam Id is not valid.");
  const examIdObj = new mongoose.Types.ObjectId(examId);
  let getEndTime = null;
  try {
    getEndTime = await McqSpecialExam.findById(examId).select("endTime -_id");
  } catch (err) {
    return res.status(500).json("1.Something went wrong.");
  }
  let examUncheckStudent = null;
  try {
    examUncheckStudent = await McqSpecialVsStudent.find(
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
    studentIds = await McqSpecialVsStudent.find(
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
      updateStatus = await McqSpecialVsStudent.updateMany(
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
        examData = await McqSpecialVsStudent.findOne({
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
        totalObtainedMarksMcq: totalMarksMcq,
      };
      try {
        result = await McqSpecialVsStudent.findByIdAndUpdate(id, upd);
      } catch (err) {
        return res
          .status(500)
          .json("Problem when update total obtained marks.");
      }
    }
  }
  return res.status(201).json("Updated successfully.");
};
const updateRank = async (req, res, next) => {
  let examId = req.body.examId;
  if (!ObjectId.isValid(examId))
    return res.status(404).json("Invalid exam Id.");
  let examIdObj = new mongoose.Types.ObjectId(examId);
  let delData = null;
  try {
    delData = await McqSpecialRank.find({ examId: examIdObj });
  } catch (err) {
    //console.log(err);
    return res.status(500).json("1.Something went wrong.");
  }
  if (delData.length > 0) {
    let deleteData = null;
    try {
      deleteData = await McqSpecialRank.deleteMany({ examId: examIdObj });
    } catch (err) {
      return res.status(500).json("2.Something went wrong.");
    }
  }
  let ranks = null;
  try {
    ranks = await McqSpecialVsStudent.find({ examId: examIdObj })
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
    sav = await McqSpecialRank.insertMany(dataIns, { ordered: false });
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
    resultRank = await McqSpecialRank.findOne({
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
    getResult = await McqSpecialVsStudent.findOne({
      $and: [{ examId: examIdObj }, { studentId: studentIdObj }],
    }).populate("examId studentId");
  } catch (err) {
    return res.status(500).json("Problem when get Student Exam info.");
  }
  let totalStudent = null;
  try {
    totalStudent = await McqSpecialVsStudent.find({
      examId: examIdObj,
    }).count();
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
  data1["examVariation"] = "specialExam";
  data1["totalObtainedMarks"] = getResult.totalObtainedMarks;
  data1["studExamStartTime"] = moment(getResult.startTimeMcq).format("LLL");
  data1["studExamEndTime"] = moment(getResult.endTimeMcq).format("LLL");
  data1["studExamTime"] = getResult.mcqDuration;
  return res.status(200).json(data1);
};
const getAllRank = async (req, res, next) => {
  let examId = req.query.examId;
  if (!ObjectId.isValid(examId)) return res.status(200).json("Invalid examId.");
  let examIdObj = new mongoose.Types.ObjectId(examId);
  let resultRank = null;
  try {
    resultRank = await McqSpecialRank.find({ examId: examIdObj })
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
      markData = await McqSpecialVsStudent.findOne({
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
    data1["totalMarks"] = resultRank[i].examId.totalMarksMcq;
    data1["totalMcqMarks"] = resultRank[i].examId.totalMarksMcq;
    data1["totalWrittenMarks"] = resultRank[i].examId.totalMarksWritten;
    data1["totalObtaineMarksMcq"] = markData.totalMarksMcq.toFixed(2);
    data1["totalObtaineMarksWritten"] = markData.totalMarksWritten;
    allData.push(data1);
  }
  return res.status(200).json(allData);
};

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
  // if (data[sIndex].mcqAnswer[questionIndexNumber] != -1)
  //   return res
  //     .status(200)
  //     .json(
  //       "Already rewrite the answer from another device.Please reload the page."
  //     );
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
};

exports.getAllRank = getAllRank;
exports.getRank = getRank;
exports.updateRank = updateRank;
exports.updateStudentExamInfo = updateStudentExamInfo;
exports.getCombination = getCombination;
exports.getOptionalSubects = getOptionalSubects;
exports.historyData = historyData;
exports.viewSollutionMcqAdmin = viewSollutionMcqAdmin;
exports.showSpecialExamByIdStudentAdmin = showSpecialExamByIdStudentAdmin;
exports.showSpecialExamByIdStudent = showSpecialExamByIdStudent;
exports.deactivateSpecialExam = deactivateSpecialExam;
exports.showSpecialExamByCourse = showSpecialExamByCourse;
exports.createSpecialExam = createSpecialExam;
exports.updateSpecialExam = updateSpecialExam;
exports.showSpecialExamById = showSpecialExamById;

exports.specialGetHistoryFilter = specialGetHistoryFilter;
// exports.updateWrittenMinus = updateWrittenMinus;
// exports.specialGetHistoryAdmin = specialGetHistoryAdmin;
exports.specialGetHistory = specialGetHistory;
// exports.studentSubmittedExamDetail = studentSubmittedExamDetail;
// exports.marksCalculationAdmin = marksCalculationAdmin;
// exports.checkScriptSingleAdmin = checkScriptSingleAdmin;
// exports.getRecheckStudentDataAdmin = getRecheckStudentDataAdmin;
// exports.statusUpdate = statusUpdate;
// exports.getStudentDataAdmin = getStudentDataAdmin;
// exports.getWrittenStudentSingleByExamAdmin = getWrittenStudentSingleByExamAdmin;
// exports.getWrittenStudentSingleByExam = getWrittenStudentSingleByExam;
// exports.updateRank = updateRank;
// exports.getRank = getRank;
// exports.getAllRank = getAllRank;
// exports.publishExam = publishExam;
// exports.marksCalculation = marksCalculation;
// exports.checkScriptSingle = checkScriptSingle;
// exports.getWrittenScriptSingle = getWrittenScriptSingle;
// exports.getRecheckStudentData = getRecheckStudentData;
// exports.getStudentData = getStudentData;
// exports.updateStudentExamInfo = updateStudentExamInfo;
// exports.assignStudentToTeacher = assignStudentToTeacher;
// exports.showSpecialExamByIdStudent = showSpecialExamByIdStudent;
// exports.historyData = historyData;
// exports.viewSollutionWrittenAdmin = viewSollutionWrittenAdmin;
// exports.viewSollutionMcqAdmin = viewSollutionMcqAdmin;
// exports.viewSollutionWritten = viewSollutionWritten;
exports.viewSollutionMcq = viewSollutionMcq;
// exports.submitAnswerMcq = submitAnswerMcq;
// exports.submitWritten = submitWritten;
// exports.submitStudentScript = submitStudentScript;
// exports.ruunningWritten = ruunningWritten;
// exports.updateAssignQuestion = updateAssignQuestion;
// exports.getRunningDataMcq = getRunningDataMcq;
// exports.assignQuestionWritten = assignQuestionWritten;
// exports.assignQuestionMcq = assignQuestionMcq;
// exports.getCombination = getCombination;
// exports.getOptionalSubects = getOptionalSubects;
// exports.examCheckMiddleware = examCheckMiddleware;
// exports.addQuestionWritten = addQuestionWritten;
exports.questionByExamSub = questionByExamSub;
exports.addQuestionMcqBulk = addQuestionMcqBulk;
exports.examRuleSet = examRuleSet;
exports.examRuleGet = examRuleGet;
exports.examRuleGetAll = examRuleGetAll;
exports.addQuestionMcq = addQuestionMcq;
// exports.showSpecialExamByCourse = showSpecialExamByCourse;
// exports.createSpecialExam = createSpecialExam;
// exports.updateSpecialExam = updateSpecialExam;
// exports.showSpecialExamById = showSpecialExamById;
// exports.showSpecialExamAll = showSpecialExamAll;
// exports.deactivateSpecialExam = deactivateSpecialExam;
// exports.getWrittenQuestionByExamSub = getWrittenQuestionByExamSub;
// exports.specialGetHistoryAdminFilter = specialGetHistoryAdminFilter;
// exports.showSpecialExamByIdStudentAdmin = showSpecialExamByIdStudentAdmin;
