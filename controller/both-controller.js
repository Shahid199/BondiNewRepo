const Course = require('../model/Course');
const Exam = require('../model/Exam');
const McqQuestionVsExam = require('../model/McqQuestionVsExam');
const QuestionsMcq = require('../model/QuestionsMcq');
const QuestionsWritten = require('../model/QuestionsWritten');
const Subject = require('../model/Subject');
const WrittenQuestionVsExam = require('../model/WrittenQuestionVsExam');
const CourseVsStudent = require('../model/CourseVsStudent');
const fs = require('fs');
const { default: mongoose, mongo } = require('mongoose');
const StudentExamVsQuestionsMcq = require('../model/StudentExamVsQuestionsMcq');
const ObjectId = mongoose.Types.ObjectId;
const moment = require('moment');
const pagination = require('../utilities/pagination');
const examType = require('../utilities/exam-type');
const examVariation = require('../utilities/exam-variation');
const StudentExamVsQuestionsWritten = require('../model/StudentExamVsQuestionsWritten');
const TeacherVsExam = require('../model/TeacherVsExam');
const BothExam = require('../model/BothExam');
const BothExamRule = require('../model/BothExamRule');
const BothMcqQuestionVsExam = require('../model/BothMcqQuestionVsExam');
const BothQuestionsWritten = require('../model/BothQuestionsWritten');
const BothStudentExamVsQuestions = require('../model/BothStudentExamVsQuestions');
const shuffle = (array) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

const refillQuestion = async (req, res, next) => {
  const { examId } = req.body;
  let examIdObj = new mongoose.Types.ObjectId(examId);
  let mIdArray = [];
  let exam = null;
  let noOfQuestions = null;
  let noOfSet = null;
  try {
    mIdArray = await BothMcqQuestionVsExam.find({ eId: examIdObj }, 'mId');
    exam = await BothExam.findById(examId);
    noOfQuestions = exam.totalQuestionMcq;
    noOfSet = exam.numberOfSet;
  } catch (err) {
    return res.status(500).json(err);
  }
  if (mIdArray.length == 0)
    return res.status(404).json('Please at least fill one set.');
  if (mIdArray.length > 1)
    return res
      .status(404)
      .json('Cant refill questions.Already added.Please check.');
  if (mIdArray[0].mId.length == 0)
    return res.status(404).json('No Active questions found.');
  if (noOfQuestions != mIdArray[0].mId.length)
    return res
      .status(404)
      .json(
        'Total number of questions & first set all questions number are not same.'
      );
  let setNo = mIdArray[0].setName;
  mIdArray = mIdArray[0].mId;
  for (let i = 0; i < noOfSet && i != Number(setNo); i++) {
    let questionObj = {};
    let shuffledArray = shuffle(mIdArray);
    let getSetName = Number(i);
    let questionExam = new BothMcqQuestionVsExam({
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
const createBothExam = async (req, res, next) => {
  const file = req.file;
  let iLinkPath = null;
  if (file) {
    iLinkPath = 'uploads/'.concat(file.filename);
  }

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
    //sscStatus,
    //hscStatus,
    curriculumName,
    isAdmission,
    negativeMarks,
    totalMarks,
    questionType,
    numberOfOptions,
    numberOfSet,
    numberOfRetakes,
  } = req.body;

  if (!ObjectId.isValid(courseId) || !ObjectId.isValid(subjectId))
    return res.status(404).json('course Id or subject Id is invalid.');
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
    startTime: moment(startTime).add(6, 'h'),
    endTime: moment(endTime).add(6, 'h'),
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
    isAdmission: JSON.parse(isAdmission),
    curriculumName,
    numberOfRetakes: Number(numberOfRetakes),
    numberOfOptions: Number(numberOfOptions),
    numberOfSet: Number(numberOfSet),
    questionType: Number(questionType),
    iLink: iLinkPath,
  });
  let doc;
  // console.log(saveExam);
  try {
    doc = await saveExam.save();
  } catch (err) {
    //console.log(err);
    return res.status(500).json('This exam name already exists!');
  }
  return res.status(201).json(doc);
};
const updateBothExam = async (req, res, next) => {
  const file = req.file;

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
    curriculumName,
    isAdmission,
    negativeMarks,
    totalMarks,
    examType,
    questionType,
    numberOfOptions,
    numberOfRetakes,
    numberOfSet,
  } = req.body;
  console.log(numberOfOptions);
  if (
    !ObjectId.isValid(examId) ||
    !ObjectId.isValid(courseId) ||
    !ObjectId.isValid(subjectId)
  ) {
    return res
      .status(404)
      .json('exam Id or course Id or subject Id is not valid.');
  }
  let startTime1 = startTime;
  let endTime1 = endTime;
  //console.log(startTime1);
  //console.log(endTime1);
  let examIdObj = new mongoose.Types.ObjectId(examId);
  let saveExamUpd = {
    courseId: new mongoose.Types.ObjectId(courseId),
    subjectId: new mongoose.Types.ObjectId(subjectId),
    name: name,
    startTime: moment(startTime1).add(6, 'h'),
    endTime: moment(endTime1).add(6, 'h'),
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
    curriculumName: curriculumName,
    isAdmission: JSON.parse(isAdmission),
    questionType,
    numberOfOptions: Number(numberOfOptions),
    numberOfRetakes: Number(numberOfRetakes),
    numberOfSet: Number(numberOfSet),
  };
  let updStatus = null;
  try {
    updStatus = await BothExam.updateOne({ _id: examIdObj }, saveExamUpd);
  } catch (err) {
    return res.status(500).json(err);
  }
  if (updStatus == null) return res.status(404).json('Prolem at update.');
  else return res.status(201).json('Updated.');
};
const deactivateBothExam = async (req, res, next) => {
  const examId = req.body.examId;
  if (!ObjectId.isValid(examId))
    return res.status(404).json('Invalid exam Id.');
  //const examIdObj = new mongoose.Types.ObjectId(examId);
  let queryResult = null;
  try {
    queryResult = await BothExam.findByIdAndUpdate(examId, { status: false });
  } catch (err) {
    return res.status(500).json(err);
  }
  if (queryResult) return res.status(201).json('Deactivated.');
  else return res.status(404).json('Something went wrong.');
};
const getBothExamBySubject = async (req, res, next) => {
  let subjectId = req.query.subjectId;
  if (!ObjectId.isValid(subjectId))
    return res.status(404).json('subject Id is not valid.');
  subjectId = new mongoose.Types.ObjectId(subjectId);
  let courseId = null;
  let page = Number(req.query.page) || 1;
  let count = 0;
  try {
    count = await BothExam.find({
      $and: [{ status: true }, { subjectId: subjectId }],
    }).count();
  } catch (err) {
    return res.status(500).json('something went wrong.');
  }
  if (count == 0) return res.status(404).json('No data found.');
  let paginateData = pagination(count, page);
  let exams1 = null;
  exams1 = await BothExam.find({
    $and: [{ status: true }, { subjectId: subjectId }],
  });
  //console.log(exams1);
  let exams = [];
  for (let i = 0; i < exams1.length; i++) {
    let dataRule = null;
    try {
      dataRule = await BothExamRule.findOne({
        bothExamId: exams1[i]._id,
      }).select('ruleILink -_id');
    } catch (err) {
      return res.status(500).json('Something went wrong.');
    }
    let inst = {};
    if (dataRule == null) {
      inst['RuleImage'] = '0';
      // examObj["examImageAdded"] = false;
    } else {
      inst['RuleImage'] = dataRule.ruleILink;
      // examObj["examImageAdded"] = true;
    }
    inst['name'] = exams1[i].name;
    inst['examVariation'] = examType[Number(exams1[i].examType)];
    inst['startTime'] = moment(exams1[i].startTime)
      .subtract(6, 'h')
      .format('MMMM Do YYYY, h:mm:ss a');
    inst['subjectName'] = exams1[i].subjectId.name;
    inst['totalDuration'] = exams1[i].totalDuration;
    inst['endTime'] = moment(exams1[i].endTime)
      .subtract(6, 'h')
      .format('MMMM Do YYYY, h:mm:ss a');
    inst['totalMarks'] = exams1[i].totalMarks;
    inst['solutionSheet'] = exams1[i].solutionSheet;
    inst['iLink'] = exams1[i].iLink;
    inst['questionType'] = exams1[i].questionType;
    inst['_id'] = exams1[i]._id;
    exams.push(inst);
  }
  let examPage = new Object();
  examPage['exam'] = exams;
  examPage['course'] = exams1[0].courseId.name;
  examPage['subject'] = exams1[0].subjectId.name;

  if (exams.length > 0) return res.status(200).json({ examPage, paginateData });
  else return res.status(404).json({ message: 'No exam Found.' });
};

const getBothExamById = async (req, res, next) => {
  const examId = req.query.examId;
  if (!ObjectId.isValid(examId))
    return res.status(404).json('examId is invalid.');
  let examData = null;
  let writtenData = null;
  try {
    examData = await BothExam.findOne({
      $and: [{ _id: examId }, { status: true }],
    }).populate('courseId subjectId');
    writtenData = await BothQuestionsWritten.findOne({
      examId: examId,
    });
  } catch (err) {
    return res.status(500).json('Something went wrong.');
  }
  if (writtenData) {
    examData.totalMarksWritten = writtenData.totalMarks;
  }

  return res.status(200).json(examData);
};
const bothQuestionByExamId = async (req, res, next) => {
  const examId = req.query.examId;
  const type = req.query.type;
  if (!ObjectId.isValid(examId))
    return res.status(404).json('exam Id is not valid.');
  const examIdObj = new mongoose.Types.ObjectId(examId);
  if (type == 1) {
    let queryResult = null;

    try {
      queryResult = await BothMcqQuestionVsExam.findOne({
        eId: examIdObj,
      }).populate({
        path: 'mId',
        match: { status: { $eq: true } },
      });
    } catch (err) {
      return res.status(500).json(err);
    }
    if (queryResult == null) return res.status(404).json('No Question added.');
    let resultAll = [];
    for (let i = 0; i < queryResult.mId.length; i++) {
      let result = {};
      result['type'] = queryResult.mId[i].type;
      result['question'] = queryResult.mId[i].question;
      result['options'] = queryResult.mId[i].options;
      result['correctOption'] = queryResult.mId[i].correctOption;
      result['explanation'] = queryResult.mId[i].explanationILink;
      result['questionId'] = queryResult.mId[i]._id;
      result['status'] = queryResult.mId[i].status;
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
    if (queryResult == null) return res.status(404).json('No Question added.');
    let resultAll = {};
    resultAll['questionILink'] = queryResult.questionILink;
    resultAll['status'] = queryResult.status;
    resultAll['totalQuestions'] = queryResult.totalQuestions;
    resultAll['marksPerQuestion'] = queryResult.marksPerQuestion;
    resultAll['totalMarks'] = queryResult.totalMarks;
    return res.status(200).json(resultAll);
  }
};
const questionByExamIdAndSet = async (req, res, next) => {
  const examId = req.query.examId;
  const setName = Number(req.query.setName);
  if (!ObjectId.isValid(examId))
    return res.status(404).json('exam Id is not valid.');
  const examIdObj = new mongoose.Types.ObjectId(examId);
  let queryResult = null;

  try {
    queryResult = await BothMcqQuestionVsExam.findOne({
      eId: examId,
      setName: setName,
    }).populate({
      path: 'mId',
      match: { status: { $eq: true } },
    });
  } catch (err) {
    return res.status(500).json(err);
  }
  if (queryResult == null) return res.status(404).json('No Question added.');
  let resultAll = [];
  for (let i = 0; i < queryResult.mId.length; i++) {
    let result = {};
    // if (queryResult.mId[i] == null) continue;
    result['type'] = queryResult.mId[i].type;
    result['question'] = queryResult.mId[i].question;
    result['options'] = queryResult.mId[i].options;
    result['correctOption'] = queryResult.mId[i].correctOption;
    result['explanation'] = queryResult.mId[i].explanationILink;
    result['questionId'] = queryResult.mId[i]._id;
    result['status'] = queryResult.mId[i].status;
    resultAll.push(result);
  }
  // resultAll.push({ totalQuestion: queryResult.mId.length });
  // resultAll.push({ examId: String(queryResult.eId) });
  return res.status(200).json(resultAll);
};
//exam rule page
const bothExamRuleSet = async (req, res, next) => {
  const file = req.file;
  let ruleILinkPath = null;
  if (!file) {
    return res.status(404).jsoon('Exam rule file not uploaded.');
  }
  ruleILinkPath = 'uploads/'.concat(file.filename);
  ////console.log(ruleILinkPath);
  const examId = req.body.examId;
  if (!ObjectId.isValid(examId))
    return res.status(404).json('exam Id is not valid.');
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
    return res.status(422).json('exam Id is not valid.');
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
  else return res.status(404).json('No data found.');
};
//add question MCQ
const bothAddQuestionMcq = async (req, res, next) => {
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
    setName,
  } = req.body;
  let setName1 = Number(setName);
  let options = JSON.parse(req.body.options);
  if (!ObjectId.isValid(examId))
    return res.status(404).json('examId Id is not valid.');
  const file = req.file;
  // console.log(JSON.parse(type));
  //question insert for text question(type=true)
  if (JSON.parse(type) == true) {
    question = questionText;
  } else {
    if (!file) {
      return res.status(404).json('Question File not uploaded.');
    }

    iLinkPath = 'questions/' + String(examId) + '/' + file.filename;
    question = iLinkPath;
    options = [];
  }
  console.log(question);
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
    console.log('save time error:', err);
    return res.status(500).json(err);
  }
  //end of insert question
  //insert question to reference mcqquestionexam table
  let questionId = doc._id;
  if (!questionId) return res.status(400).send('question not inserted');
  let mcqQData,
    doc1,
    mId,
    mIdNew = [];
  try {
    mcqQData = await BothMcqQuestionVsExam.findOne({
      eId: examIdObj,
      setName: setName1,
    }).select('mId');
  } catch (err) {
    console.log('get error.');
    return res.status(500).json(err);
  }
  if (mcqQData == null) {
    mIdNew.push(questionId);
    let questionExam = new BothMcqQuestionVsExam({
      eId: examId,
      mId: mIdNew,
      setName: setName1,
    });
    try {
      doc1 = await questionExam.save();
    } catch (err) {
      console.log('save to both exam', err);
      return res.status(500).json(err);
    }
  } else {
    mId = mcqQData.mId;
    mIdNew = mId;
    mIdNew.push(questionId);
    try {
      doc1 = await BothMcqQuestionVsExam.updateOne(
        { eId: examIdObj, setName: setName1 },
        { $set: { mId: mIdNew } }
      );
    } catch (err) {
      console.log('last error', err);
      return res.status(500).json(err);
    }
  }
  return res.status(201).json('Saved.');
};
const bothAddQuestionMcqBulk = async (req, res, next) => {
  const { questionArray, examId, setName } = req.body;
  let examIdObj = new mongoose.Types.ObjectId(examId);
  let finalIds = [];
  for (let i = 0; i < questionArray.length; i++) {
    if (ObjectId.isValid(questionArray[i]))
      finalIds.push(new mongoose.Types.ObjectId(questionArray[i]));
    else continue;
  }
  ////console.log(finalIds);
  if (finalIds.length == 0)
    return res.status(404).json('question IDs is not valid.');
  let mIdArray = null;
  try {
    mIdArray = await BothMcqQuestionVsExam.findOne(
      { eId: examIdObj, setName: Number(setName) },
      'mId'
    );
  } catch (err) {
    return res.status(500).json(err);
  }

  if (mIdArray == null) {
    const newExamQuestinon = new BothMcqQuestionVsExam({
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
        .json('DB problem Occur when new question insert in exam table.');
    }
    return res.status(201).json('Success.');
  }
  ////console.log(mIdArray);
  mIdArray = mIdArray.mId;
  let finalIdsString = [];
  finalIdsString = finalIds.map((e) => String(e));
  mIdArray = mIdArray.map((e) => String(e));
  mIdArray = mIdArray.concat(finalIdsString);
  let withoutDuplicate = Array.from(new Set(mIdArray));
  withoutDuplicate = withoutDuplicate.map(
    (e) => new mongoose.Types.ObjectId(e)
  );
  ////console.log(withoutDuplicate);
  try {
    sav = await BothMcqQuestionVsExam.updateOne(
      { eId: examId, setName: Number(setName) },
      {
        mId: withoutDuplicate,
      }
    );
  } catch (err) {
    return res.status(500).json(err);
  }
  return res.status(201).json('Inserted question to the exam.');
};
const slotAvailable = async (req, res, next) => {
  let numberOfSlotAvailable, mcqQData;
  const { examId, setName } = req.query;
  let setName1 = parseInt(setName);
  let examDetails = {};
  try {
    examDetails = await BothExam.findOne({
      _id: new mongoose.Types.ObjectId(examId),
    });
  } catch (error) {
    return res.status(404).json('Problem with exam settings');
  }
  if (examDetails) {
    try {
      mcqQData = await BothMcqQuestionVsExam.findOne({
        eId: examId,
        setName: setName1,
      }).select('mId');
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

const bothGetMcqQuestionByExamId = async (req, res, next) => {
  const examId = req.body.examId;
  if (!ObjectId.isValid(examId))
    return res.status(404).json('Exam Id is not valid.');
  let questions = null;
  try {
    questions = await BothMcqQuestionVsExam.findOne(
      { eId: examId },
      'mId -_id'
    );
  } catch (err) {
    return res.status(500).json('Something went wrong.');
  }
  if (questions.length == 0) return res.status(404).json('No question found.');
  return res.status.json(questions);
};
//add written Question
const bothAddQuestionWritten = async (req, res, next) => {
  let examId = req.body.examId;
  if (!ObjectId.isValid(examId))
    return res.status(404).json('Exam Id is not valid.');
  examId = new mongoose.Types.ObjectId(examId);
  let existData = null;
  try {
    existData = await BothQuestionsWritten.findOne({
      $and: [{ examId: examId }, { status: true }],
    });
  } catch (err) {
    return res.status(500).json('1.Something went wrong.');
  }
  if (existData) return res.status(404).json('Already added question.');
  const status = req.body.status;
  const totalQuestions = req.body.totalQuestions;
  let marksPerQuestion = req.body.marksPerQuestion; //array
  // for (let i = 0; i < marksPerQuestion.length; i++) {
  //   marksPerQuestion[i] = parseInt(marksPerQuestion[i]);
  // }
  marksPerQuestion = marksPerQuestion.split(',');
  ////console.log(marksPerQuestion);
  const totalMarks = req.body.totalMarks;
  //file upload handle
  const file = req.files;
  ////console.log(file);
  let questionILinkPath = null;
  // //console.log(file.questionILink[0].filename);
  // return res.status(201).json("Ok");
  if (!file.questionILink[0].filename)
    return res.status(400).json('File not uploaded.');
  questionILinkPath =
    'questions/' + String(examId) + '/' + file.questionILink[0].filename;
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
    ////console.log(err);
    return res.status(500).json('2.Something went wrong!');
  }

  return res.status(200).json('Question save correctly.');
};
const bothRemoveQuestionWritten = async (req, res, next) => {
  let examId = req.body.examId;
  if (!ObjectId.isValid(examId))
    return res.status(404).json('Exam Id is not valid.');
  examId = new mongoose.Types.ObjectId(examId);
  let remove = null;
  try {
    remove = await BothQuestionsWritten.findOneAndRemove({ examId: examId });
  } catch (err) {
    return res.status(500).json('SOmething went wrong.');
  }
  return res.status(200).json('Successfully removed question from the exam.');
};
const bothGetWrittenQuestionByexam = async (req, res, next) => {
  let writtenQuestion = null;
  let examId = req.query.examId;
  examId = new mongoose.Types.ObjectId(examId);
  try {
    writtenQuestion = await BothQuestionsWritten.findOne({
      examId: examId,
    }).populate('examId');
  } catch (err) {
    return res.status(500).json('SOmething went wrong.');
  }
  if (writtenQuestion == null) return res.status(404).json('No data found.');
  return res.status(200).json(writtenQuestion);
};
const updateBothExamPhoto = async (req, res, next) => {
  const file = req.file;
  let iLinkPath = null;
  // console.log(file);
  if (file) {
    iLinkPath = 'uploads/'.concat(file.filename);
  }
  const { examId } = req.body;
  const filter = { _id: examId };
  // console.log(filter);
  let update;
  try {
    update = await BothExam.findOneAndUpdate(
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
    res.status(202).json('Successfully Uploaded the photo');
  } else {
    res.status(404).json('could not update the photo!');
  }
};
const updateBothStudentMarks = async (req, res, next) => {
  let getData;
  // let examId = req.query.examId;
  // let studentId = req.query.studentId;
  // let findId =
  try {
    getData = await BothStudentExamVsQuestions.findOne({
      $and: [
        { examId: new mongoose.Types.ObjectId('66e8850490a74961d4389782') },
        { studentId: new mongoose.Types.ObjectId('6637a73dcbafa8a12c615c3f') },
      ],
    });
  } catch (error) {
    return res.status(500).json(error);
  }
  // console.log(getData);
  getData.totalObtainedMarksWritten = 43;
  getData.totalObtainedMarks = 43;
  let updStatus = null;
  try {
    updStatus = await BothStudentExamVsQuestions.updateOne(
      { _id: new mongoose.Types.ObjectId('66e912e67b39a97f78ee6add') },
      getData
    );
  } catch (err) {
    return res.status(500).json(err);
  }

  return res.status(200).json(getData);
};
const updateQuestionStatus = async (req, res, next) => {
  const questionId = req.body.questionId;
  const examId = req.body.examId;
  const examIdObj = new mongoose.Types.ObjectId(examId);
  const quesObj = new mongoose.Types.ObjectId(questionId);
  if (!ObjectId.isValid(questionId))
    return res.status(404).json('question Id is not valid.');
  //const questionIdObj = new mongoose.Types.ObjectId(questionId);
  let queryResult = null;
  try {
    queryResult = await BothMcqQuestionVsExam.find({ eId: examIdObj });
  } catch (err) {
    return res.status(500).json(err);
  }
  for (let i = 0; i < queryResult.length; i++) {
    let temp = [];
    temp = queryResult[i].mId.filter((q) => String(q) !== String(quesObj));
    // console.log(temp)
    queryResult[i].mId = temp;
  }
  for (let i = 0; i < queryResult.length; i++) {
    let res = null;
    try {
      res = await BothMcqQuestionVsExam.findByIdAndUpdate(queryResult[i]._id, {
        mId: queryResult[i].mId,
      });
    } catch (e) {
      return res.status(500).json('Cannot find data');
    }
  }

  return res.status(201).json('Updated');
};
const addTextQuestion = async (req, res, next) => {
  const quest = req.body;
  // console.log(quest)
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
    examDetails = await BothExam.findOne({
      _id: new mongoose.Types.ObjectId(quest.examId),
    });
  } catch (error) {
    return res.status(404).json('Problem with exam settings');
  }
  if (examDetails) {
    try {
      mcqQData = await BothMcqQuestionVsExam.findOne({
        eId: quest.examId,
        setName: setName1,
      }).select('mId');
    } catch (err) {
      return res.status(500).json(err);
    }
    // console.log(mcqQData);
    if (mcqQData !== null) {
      if (mcqQData.mId.length >= examDetails.totalQuestionMcq) {
        return res.status(405).json('Set of Question reached the limit');
      }
    }
  }
  // let options = JSON.parse(quest.options);
  if (!ObjectId.isValid(quest.examId))
    return res.status(404).json('examId Id is not valid.');
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
  if (!questionId) return res.status(400).send('question not inserted');

  // console.log(mcqQData);
  if (mcqQData == null) {
    mIdNew.push(questionId);
    let questionExam = new BothMcqQuestionVsExam({
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
      doc1 = await BothMcqQuestionVsExam.updateOne(
        { eId: examIdObj, setName: setName1 },
        { $set: { mId: mIdNew } }
      );
    } catch (err) {
      return res.status(500).json(err);
    }
  }
  // console.log(setName);
  return res.status(201).json('Saved.');
};
const getStudentExamDetails = async (req, res, next) => {
  let data = null;

  const { examId, studentId } = req.query;

  // Convert strings to ObjectId
  const examIdObj = new mongoose.Types.ObjectId(examId);
  const studentIdObj = new mongoose.Types.ObjectId(studentId);

  console.log('Received IDs:', studentIdObj, examIdObj);

  try {
    // Corrected the query object
    data = await BothStudentExamVsQuestions.findOne({
      examId: examIdObj,
      studentId: studentIdObj,
    });

    if (!data) {
      return res.status(404).json({ message: 'No student exam details found' });
    }
  } catch (error) {
    console.error('Error fetching student exam details:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }

  // console.log("Fetched data:", data);
  return res.status(200).json(data);
};
const updateWrittenMarksBothTest = async (req, res, next) => {
  let examId = req.query.examId;
  if (!ObjectId.isValid(examId))
    return res.status(404).json('Invalid exam Id.');
  let examIdObj = new mongoose.Types.ObjectId(examId);
  let data = null;
  try {
    data = await BothStudentExamVsQuestions.updateMany(
      { examId: examIdObj, totalObtainedMarksWritten: { $eq: 0 } },
      [
        {
          $set: {
            totalObtainedMarksWritten: {
              $subtract: ['$totalObtainedMarks', '$totalObtainedMarksMcq'],
            },
          },
        },
      ]
    );
  } catch (err) {
    return res.status(500).json('Something went wrong.');
  }
  return res.status(201).json(data);
};
const updateWrittenMarksBothNeg = async (req, res, next) => {
  let examId = req.query.examId;
  if (!ObjectId.isValid(examId))
    return res.status(404).json('Invalid exam Id.');
  let examIdObj = new mongoose.Types.ObjectId(examId);
  let data = null;
  try {
    data = await BothStudentExamVsQuestions.updateMany(
      { examId: examIdObj, totalObtainedMarksWritten: { $lt: 0 } },
      [
        {
          $set: {
            totalObtainedMarksWritten: {
              $add: ['$totalObtainedMarksWritten', '$totalObtainedMarksMcq'],
            },
            totalObtainedMarks: '$totalObtainedMarksMcq',
          },
        },
      ]
    );
  } catch (err) {
    return res.status(500).json('Something went wrong.');
  }
  return res.status(201).json(data);
};
exports.updateWrittenMarksBothNeg = updateWrittenMarksBothNeg;
exports.updateWrittenMarksBothTest = updateWrittenMarksBothTest;
exports.getStudentExamDetails = getStudentExamDetails;
exports.addTextQuestion = addTextQuestion;
exports.updateQuestionStatus = updateQuestionStatus;
exports.updateBothStudentMarks = updateBothStudentMarks;
exports.refillQuestion = refillQuestion;
exports.questionByExamIdAndSet = questionByExamIdAndSet;
exports.slotAvailable = slotAvailable;
exports.updateBothExamPhoto = updateBothExamPhoto;
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
