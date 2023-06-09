const { default: mongoose } = require("mongoose");
const FreeStudent = require("../model/FreeStudent");
const jwt = require("jsonwebtoken");
const FreestudentMarksRank = require("../model/FreestudentMarksRank");
const McqQuestionVsExam = require("../model/McqQuestionVsExam");
const Exam = require("../model/Exam");
const QuestionsMcq = require("../model/QuestionsMcq");
const FreeStudentExamVsQuestionsMcq = require("../model/FreeStudentExamVsQuestionsMcq");
const moment = require("moment");
const pagination = require("../utilities/pagination");
const FreeMcqRank = require("../model/FreeMcqRank");
/**
 * login a student to a course
 * @param {Object} req courseId,regNo
 * @returns token
 */
//free student Admin side
const getAllFreeStudent = async (req, res, next) => {
  let page = Number(req.body.page) || 1;
  let count = 0;
  let data;
  try {
    count = await FreeStudent.find({}).count();
  } catch (err) {
    return res.status.json("Something went wrong.");
  }
  if (count == 0) return res.status(404).json("No data found.");
  let paginateData = pagination(count, page);
  try {
    data = await FreeStudent.find({})
      .skip(paginateData.skippedIndex)
      .limit(paginateData.perPage);
  } catch (err) {
    return res.status(500).json(err);
  }
  return res.status(200).json({ data, paginateData });
};
const getFreeStudenInfoById = async (req, res, next) => {
  let studentId = req.query.freeStudentId;
  let data = null;
  if (!ObjectId.isValid(studentId))
    return res.status(404).json("Invalid User Id.");
  try {
    data = await FreeStudent.findById(studentId);
  } catch (err) {
    return res.status(500).json("Something went wrong.");
  }
  return res.status(200).json(data);
};
const getFreeStudenInfoByMobile = async (req, res, next) => {
  let mobileNo = req.query.mobileNo;
  let data = null;
  if (!mobileNo) return res.status(404).json("Invalid mobile No.");
  try {
    data = await FreeStudent.findOne({ mobileNo: mobileNo });
  } catch (err) {
    return res.status(500).json("Something went wrong.");
  }
  return res.status(200).json(data);
};
const freeStudentViewSollutionAdmin = async (req, res, next) => {
  const studentId = req.query.freeStudentId;
  const examId = req.query.examId;
  if (!ObjectId.isValid(studentId) || !ObjectId.isValid(examId))
    return res.status(404).json("student Id or examId is not valid.");
  let studentIdObj = new mongoose.Types.ObjectId(studentId);
  let examIdObj = new mongoose.Types.ObjectId(examId);
  let data = null;
  try {
    data = await FreeStudentExamVsQuestionsMcq.find({
      $and: [{ studentId: studentIdObj }, { examId: examIdObj }],
    }).populate("mcqQuestionId");
  } catch (err) {
    return res.status(500).json("1.Something went wrong.");
  }
  if (data == null)
    return res.status(404).json("No exam found under this student.");
  let resultData = [];
  for (let i = 0; i < data[0].mcqQuestionId.length; i++) {
    let data1 = {};
    data1["id"] = data[0].mcqQuestionId[i]._id;
    data1["question"] = data[0].mcqQuestionId[i].question;
    data1["options"] = data[0].mcqQuestionId[i].options;
    data1["correctOptions"] = Number(data[0].mcqQuestionId[i].correctOption);
    data1["explanationILink"] = data[0].mcqQuestionId[i].explanationILink;
    data1["type"] = data[0].mcqQuestionId[i].type;
    data1["answeredOption"] = data[0].answeredOption[i];
    resultData.push(data1);
  }
  return res.status(200).json(resultData);
};
const freeStudentHistoryDataAdmin = async (req, res, next) => {
  const studentId = req.query.studentId;
  if (!ObjectId.isValid(studentId))
    return res.status(404).json("Student ID not valid.");
  let page = req.query.page || 1;

  let studentIdObj = new mongoose.Types.ObjectId(studentId);
  let data2;
  let count = 0;
  try {
    count = await FreeStudentExamVsQuestionsMcq.find({
      studentId: studentIdObj,
    }).count();
  } catch (err) {
    return res.status(500).json("Something went wrong.");
  }
  //return res.status(200).json(count);
  console.log(count);
  if (count == 0) return res.status(404).json("1.No data found.");
  let paginateData = pagination(count, page);
  try {
    data2 = await FreeStudentExamVsQuestionsMcq.find({
      studentId: studentIdObj,
    })
      .populate("examId")
      .skip(paginateData.skippedIndex)
      .limit(paginateData.perPage);
  } catch (err) {
    return res.status(500).json("1.SOmething went wrong.");
  }
  if (data2 == null)
    return res.status(404).json("No exam data found for the student.");
  let flag = false;
  for (let i = 0; i < data2.length; i++) {
    let data1 = {};
    let rank = null;
    let examIdObj = new mongoose.Types.ObjectId(data2[i].examId._id);
    try {
      rank = await FreestudentMarksRank.findOne(
        {
          $and: [
            { studentId: studentIdObj },
            { examId: examIdObj },
            { finishedStatus: true },
          ],
        },
        "rank totalObtainedMarks examStartTime examEndtime"
      );
    } catch (err) {
      return res.status(500).json("2.Something went wrong.");
    }
    if (rank == null)
      return res.status(404).json("No exam data forunf for the student.");
    let subjectIdObj = String(data2[i].examId.subjectId);
    let subjectName = null;
    try {
      subjectName = await Subject.findById(subjectIdObj).select("name");
    } catch (err) {
      return res.status(500).json("3.Something went wrong.");
    }
    subjectName = subjectName.name;
    if (rank == null || subjectName == null) {
    }
    let data = [];
    data1["examId"] = data2[i].examId._id;
    data1["title"] = data2[i].examId.name;
    data1["type"] = data2[i].examId.examType;
    data1["variation"] = data2[i].examId.examVariation;
    data1["totalMarksMcq"] = data2[i].examId.totalMarksMcq;
    data1["totalObtainedMarks"] = rank.totalObtainedMarks;
    data1["meritPosition"] = rank.rank;
    data1["examStartTime"] = moment(rank.examStartTime).format("LLL");
    data1["examEndTime"] = moment(rank.examEndTime).format("LLL");
    data1["subjectName"] = subjectName;
    data.push(data2);
  }
  return res.status(200).json({ data, paginateData });
};
const freeStudentMissedExamAdmin = async (req, res, next) => {
  const studentId = req.query.studentId;
  const courseId = req.query.courseId;
  if (!ObjectId.isValid(studentId) || !ObjectId.isValid(courseId)) {
    return res.status(404).json("Student Id or Course Id is not valid.");
  }
  const courseIdObj = new mongoose.Types.ObjectId(courseId);
  let studentIdObj = new mongoose.Types.ObjectId(studentId);
  let allExam = null;
  try {
    allExam = await Exam.find({
      $and: [
        { status: true },
        { examFreeOrNot: true },
        { courseId: courseIdObj },
        { endtime: { $lt: new Date() } },
      ],
    }).select("_id");
  } catch (err) {
    return res.status(500).json("1.Sometihing went wrong.");
  }
  let doneExam = null;
  try {
    doneExam = await FreestudentMarksRank.find(
      {
        studentId: studentIdObj,
      },
      "examId"
    );
  } catch (err) {
    return res.status(500).json("2.Something went wrong.");
  }
  if (allExam == null) return res.status(404).json("No Exam data found.");
  let data2 = [];
  for (let i = 0; i < allExam.length; i++) {
    data2[i] = String(allExam[i]._id);
  }
  let doneExamArr = [];
  for (let i = 0; i < doneExam.length; i++) {
    doneExamArr.push(String(doneExam[i].examId));
  }
  let removedArray = null;
  let resultData = null;
  if (doneExam == null) removedArray = data2;
  else {
    removedArray = data2.filter(function (el) {
      return !doneExamArr.includes(el);
    });
  }
  let page = Number(req.query.page) || 1;
  let count = 0;
  try {
    count = await Exam.find({
      $and: [
        { _id: { $in: removedArray } },
        { status: true },
        { examFreeOrNot: true },
      ],
    }).count();
  } catch (err) {
    return res.status(500).json("Something went wrong.");
  }
  if (count == 0) {
    return res.status(404).json("No data found.");
  }
  let paginateData = pagination(count, page);
  try {
    resultData = await Exam.find({
      $and: [
        { _id: { $in: removedArray } },
        { status: true },
        { examFreeOrNot: true },
      ],
    })
      .populate("subjectId courseId")
      .skip(paginateData.skippedIndex)
      .limit(paginateData.perPage);
  } catch (err) {
    return res.status(500).json("3.Something went wrong.");
  }
  if (resultData == null) return res.status(404).json("No missed exam found.");
  let data = [];
  for (let i = 0; i < resultData.length; i++) {
    let result = {};
    result["id"] = resultData[i]._id;
    result["exanName"] = resultData[i].name;
    result["subject"] = resultData[i].subjectId.name;
    result["startTime"] = moment(resultData[i].startTime).format("LL");
    result["duration"] = resultData[i].duration;
    result["examType"] = resultData[i].examType;
    result["examVariation"] = resultData[i].examVariation;
    result["negativeMarks"] = resultData[i].negativeMarks;
    data.push(result);
  }
  return res.status(200).json({ data, paginateData });
};
//free student exam system
const getFreeExamId = async (req, res, next) => {
  let examId = [];
  let currentTime = Date.now();
  try {
    examId = await Exam.find({
      $and: [
        { status: true },
        { examFreeOrNot: true },
        { startTime: { $lt: currentTime } },
        { endTime: { $gt: currentTime } },
      ],
    });
  } catch (err) {
    //console.log(err);
    return res.status(500).json("Something went wrong.");
  }
  // console.log(moment(examId[0].startTime).format("LLL"));
  console.log(examId.length);
  if (examId.length == 0)
    return res
      .status(404)
      .json("No Free exam has been announced yet.Keep follow the site.");
  if (examId.length > 1) return res.status(404).json("Something went wrong.");
  return res.status(200).json(examId[0]);
};
const addFreeStudent = async (req, res, next) => {
  const { name, mobileNo, institution, sscRoll, sscReg, hscRoll, hscReg } =
    req.body;
  let student = new FreeStudent({
    name: name,
    mobileNo: mobileNo,
    institution: institution,
    sscReg: sscReg,
    sscRoll: sscRoll,
    hscReg: hscReg,
    hscRoll: hscRoll,
  });
  let sav = null;
  let upd = null;
  try {
    existMobile = await FreeStudent.findOne({ mobileNo: mobileNo }, "_id");
  } catch (err) {
    return res.status(500).json(err);
  }
  if (existMobile != null) {
    let update = {
      name: name,
      institution: institution,
      sscReg: sscReg,
      sscRoll: sscRoll,
      hscReg: hscReg,
      hscRoll: hscRoll,
    };
    try {
      upd = await FreeStudent.findByIdAndUpdate(
        String(existMobile._id),
        update
      );
    } catch (err) {
      return res.status(500).json("Something went wrong.");
    }
    return res.status(201).json("Updated.");
  } else {
    try {
      sav = await student.save();
    } catch (err) {
      return res.status(500).json("Something went wrong.");
    }
    return res.status(200).json(mobileNo);
  }
};
const freeLoginStudent = async (req, res) => {
  const mobileNo = req.body.mobileNo;
  try {
    const getFreeStudent = await FreeStudent.findOne({
      mobileNo: mobileNo,
    });
    if (!getFreeStudent) {
      return res.status(404).json("Student not found");
    }
    // if all checks passed above now geneate login token
    const studentIdStr = String(getFreeStudent._id);
    const token = jwt.sign(
      {
        studentId: studentIdStr,
        role: 5,
      },
      process.env.SALT,
      { expiresIn: "1d" }
    );

    return res.status(200).json({
      message: "Student logged into the exam",
      token,
      studentIdStr,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Something went wrong!" });
  }
};
const validateToken = async (req, res) => {
  return res.json(req.user);
};
const examCheckMiddlewareFree = async (req, res, next) => {
  const examId = req.query.eId;
  const studentId = req.user.studentId;
  if (!ObjectId.isValid(examId) || !ObjectId.isValid(studentId))
    return res.status(404).json("Exam Id or Student Id is invalid.");
  //start:check student already complete the exam or not
  let examIdObj, studentIdObj;
  studentIdObj = new mongoose.Types.ObjectId(studentId);
  examIdObj = new mongoose.Types.ObjectId(examId);
  let status = null;
  try {
    status = await FreestudentMarksRank.findOne({
      $and: [{ studentId: studentIdObj }, { examId: examIdObj }],
    });
  } catch (err) {
    //console.log(err);
    return res.status(500).json("Soomething went wrong.");
  }
  if (status == null) return res.status(200).json("assign");
  else {
    if (status.finishedStatus == true) return res.status(200).json("ended");
    else return res.status(200).json("running");
  }
};
const assignQuestionFree = async (req, res, next) => {
  //data get from examcheck function req.body
  const eId = req.query.eId;
  const studentId = req.user.studentId;
  //start:check student already complete the exam or not
  let eId1, sId;
  sId = new mongoose.Types.ObjectId(studentId);
  eId1 = new mongoose.Types.ObjectId(eId);
  let doc = [],
    size,
    min = 0,
    max = 0,
    rand;
  try {
    size = await McqQuestionVsExam.findOne({ eId: eId1 }).populate("mId");
    size = size.mId.length;
    //size = await McqQuestionVsExam.findOne({ eId: eId }).select("sizeMid");
  } catch (err) {
    return res.status(500).json("1.something went wrong.");
  }
  if (!size) return res.status(404).json("No question assigned in the exam.");
  let totalQuesData;
  try {
    totalQuesData = await Exam.findById(eId).select(
      "totalQuestionMcq duration endTime"
    );
  } catch (err) {
    return res.status(500).json("2.something went wrong");
  }
  let examFinishTime = totalQuesData.endTime;
  //start:generating random index of questions
  let totalQues = Number(totalQuesData.totalQuestionMcq);
  console.log(totalQues, "totalQues");
  max = size - 1;
  for (let i = 0; ; i++) {
    rand = Math.random();
    rand = rand * Number(max);
    rand = Math.floor(rand);
    rand = rand + Number(min);
    if (!doc.includes(rand)) {
      doc.push(rand);
    }
    if (doc.length == totalQues) break;
  }
  console.log(doc, "doc");
  //end:generating random index of questions
  let doc1;
  try {
    doc1 = await McqQuestionVsExam.findOne({ eId: eId1 }).select("mId");
  } catch (err) {
    return res.status(500).json("3.Something went wrong.");
  }
  let statQues = [];
  // console.log(doc1.mId,'doc1.mId');
  for (let i = 0; i < doc1.mId.length; i++) {
    let quesId = String(doc1.mId[i]);
    let stat;
    try {
      stat = await QuestionsMcq.findById(quesId).select("status");
      stat = stat.status;
    } catch (err) {
      return res.status(500).json("Something went wrong.");
    }
    if (stat == true) statQues.push(new mongoose.Types.ObjectId(quesId));
  }

  if (totalQues > statQues.length)
    return res
      .status(404)
      .json("Total exam questions is less then exam's questions.");
  let doc2 = statQues;
  let resultQuestion = [];
  for (let i = 0; i < totalQues; i++) {
    let data = String(doc2[doc[i]]);
    resultQuestion.push(data);
  }
  // console.log(totalQues,'totalQues')
  console.log(resultQuestion, "resultQuestion");
  let questions = [];
  try {
    questions = await QuestionsMcq.find(
      { _id: { $in: resultQuestion } },
      "question type options"
    );
  } catch (err) {
    return res.status(500).json("Something went wrong.");
  }
  // console.log(questions);
  if (sId == null)
    return res
      .status(404)
      .json("student not found or not permissible for the exam");
  let answered = [];
  for (let i = 0; i < totalQues; i++) {
    answered[i] = "-1";
  }
  let studentExamVsQuestionsMcq = new FreeStudentExamVsQuestionsMcq({
    studentId: sId,
    examId: eId1,
    mcqQuestionId: resultQuestion,
    answeredOption: answered,
  });
  let saveStudentQuestion = null,
    saveStudentExam = null;
  let duration = Number(totalQuesData.duration);
  let examStartTime = moment(Date.now()).add(6, "hours");
  let examEndTime = moment(examStartTime).add(duration, "minutes");
  let studentMarksRank = new FreestudentMarksRank({
    studentId: sId,
    examId: eId1,
    examStartTime: examStartTime,
    runningStatus: true,
    examEndTime: examEndTime,
  });
  try {
    saveStudentQuestion = await studentExamVsQuestionsMcq.save();
  } catch (err) {
    console.log(err);
    return res.status(500).json("4.Something went wrong.");
  }
  try {
    saveStudentExam = await studentMarksRank.save();
  } catch (err) {
    return res.status(500).json("5.Something went wrong.");
  }
  questions.push({ studStartTime: examStartTime });
  questions.push({ studEndTime: examEndTime });
  questions.push({ examEndTime: examFinishTime });
  questions.push({ answeredOption: answered });
  if (saveStudentQuestion == null || saveStudentExam == null) {
    return res.status(404).json("Problem occur to assign question.");
  }
  return res.status(201).json(questions);
};
const updateAssignQuestionFree = async (req, res, next) => {
  let studentId = req.user.studentId;
  let examId = req.body.examId;
  let questionIndexNumber = Number(req.body.questionIndexNumber);
  let optionIndexNumber = Number(req.body.optionIndexNumber);
  studentId = new mongoose.Types.ObjectId(studentId);
  examId = new mongoose.Types.ObjectId(examId);
  let docId,
    docId1,
    result,
    answered = [];
  try {
    result = await FreeStudentExamVsQuestionsMcq.find(
      {
        $and: [{ studentId: studentId }, { examId: examId }],
      },
      "_id answeredOption"
    );
  } catch (err) {
    return res.status(500).json("Something went wrong.");
  }
  console.log(result);
  docId = result[0]._id;
  docId1 = String(docId);
  answered = result[0].answeredOption;
  console.log(questionIndexNumber);
  console.log(optionIndexNumber);
  answered[questionIndexNumber] = String(optionIndexNumber);
  try {
    updateAnswer = await FreeStudentExamVsQuestionsMcq.findByIdAndUpdate(
      docId1,
      {
        answeredOption: answered,
      }
    );
  } catch (err) {
    return res.status(500).json("Something went wrong.");
  }
  console.log(updateAnswer);
  return res.status(201).json("Ok");
};
const getRunningDataFree = async (req, res, next) => {
  const sId = req.user.studentId;
  const eId = req.query.eId;
  if (!ObjectId.isValid(sId) || !ObjectId.isValid(eId))
    return res.status(404).json("invalid student ID or exam ID.");
  let eId1, sId1;
  sId1 = new mongoose.Types.ObjectId(sId);
  eId1 = new mongoose.Types.ObjectId(eId);
  let getQuestionMcq, getExamData;
  try {
    getQuestionMcq = await FreeStudentExamVsQuestionsMcq.findOne({
      $and: [{ studentId: sId1 }, { examId: eId1 }],
    }).populate("mcqQuestionId");
  } catch (err) {
    return res.status(500).json("can't get question.Problem Occur.");
  }
  try {
    getExamData = await FreestudentMarksRank.findOne(
      { $and: [{ examId: eId1 }, { studentId: sId1 }] },
      "examStartTime examEndTime examId"
    )
      .populate({
        path: "examId",
        populate: {
          path: "subjectId",
          select: "name",
          model: "Subject",
        },
      })
      .populate({
        path: "examId",
        populate: {
          path: "courseId",
          select: "name",
          model: "Course",
        },
      });
  } catch (err) {
    return res.status(500).json("Can't get exam info.");
  }
  let runningResponseLast = [];
  let examData = new Object();
  let questionData = new Object();
  let timeData = new Object();
  for (let i = 0; i < getQuestionMcq.mcqQuestionId.length; i++) {
    let runningResponse = {};
    runningResponse["question"] = getQuestionMcq.mcqQuestionId[i].question;
    runningResponse["options"] = getQuestionMcq.mcqQuestionId[i].options;
    runningResponse["type"] = getQuestionMcq.mcqQuestionId[i].type;
    runningResponse["answeredOption"] = getQuestionMcq.answeredOption[i];
    runningResponse["optionCount"] =
      getQuestionMcq.mcqQuestionId[i].optionCount;
    runningResponseLast.push(runningResponse);
  }
  timeData["examDuration"] = getExamData.examId.duration;
  let examStartTime = moment(getExamData.examStartTime);
  let examEndTime = moment(getExamData.examEndTime);
  timeData["startTime"] = examStartTime;
  timeData["endTine"] = examEndTime;
  questionData = runningResponseLast;
  examData = getExamData.examId;
  return res.status(200).json({ timeData, questionData, examData });
};
const submitAnswerFree = async (req, res, next) => {
  const eId = req.query.eId;
  const sId = req.user.studentId;
  if (!ObjectId.isValid(eId) || !ObjectId.isValid(sId))
    return res.status(404).json("Invalid studnet Id or Exam Id");
  const examEndTime = new Date();
  let eId1, sId1;
  sId1 = new mongoose.Types.ObjectId(sId);
  eId1 = new mongoose.Types.ObjectId(eId);
  let findId = null;
  try {
    findId = await FreestudentMarksRank.find({
      $and: [{ examId: eId1 }, { studentId: sId1 }],
    }).select("_id");
  } catch (err) {
    return res
      .status(500)
      .json("Proble when get student info from student marks table.");
  }
  if (findId == null) return res.status(404).json("data not found.");
  findId = String(findId[0]._id);
  let saveStudentExamEnd;
  let update = {
    finishedStatus: true,
    runningStatus: false,
  };
  try {
    saveStudentExamEnd = await FreestudentMarksRank.findByIdAndUpdate(
      findId,
      update
    );
  } catch (err) {
    return res.status(500).json("Problem when updating student marks rank.");
  }
  let sIeIObj = await FreestudentMarksRank.find(
    { $and: [{ studentId: sId1 }, { examId: eId1 }] },
    "_id"
  );
  sIeIObj = sIeIObj[0]._id;
  let examData = null;
  try {
    examData = await FreeStudentExamVsQuestionsMcq.findOne({
      $and: [{ examId: eId1 }, { studentId: sId1 }],
    }).populate("mcqQuestionId examId");
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
    totalObtainedMarks: totalObtainedMarks,
  };
  let result = null,
    getResult = null,
    sendResult = {},
    rank = null,
    dataRank = null,
    upd = null,
    upd1 = null,
    upd2 = null,
    getRank = null;
  try {
    result = await FreeStudentExamVsQuestionsMcq.findByIdAndUpdate(id, update1);
    upd = await StudentMarksRank.updateOne(
      {
        $and: [{ examId: eId1 }, { studentId: sId1 }],
      },
      { totalObtainedMarks: totalObtainedMarks }
    );
  } catch (err) {
    return res.status(500).json("Problem when update total obtained marks.");
  }
  try {
    getResult = await FreeStudentExamVsQuestionsMcq.findById(id).populate(
      "examId"
    );
  } catch (err) {
    return res.status(500).json("Problem when get Student Exam info.");
  }
  try {
    dataRank = await FreestudentMarksRank.find(
      { examId: eId1 },
      "studentId totalObtainedMarks"
    ).sort({ totalObtainedMarks: -1 });
  } catch (err) {
    return res.status(500).json("Problem when get all student of an exam Id.");
  }
  let dataRankId = dataRank.map((e) => e._id.toString());
  rank = dataRankId.findIndex((e) => e == sIeIObj.toString()) + 1;
  try {
    upd1 = await StudentMarksRank.findByIdAndUpdate(String(sIeIObj), {
      rank: rank,
    });
  } catch (err) {
    return res.status(500).json("Problem when update rank.");
  }
  try {
    upd2 = await StudentMarksRank.findById(String(sIeIObj), "rank");
  } catch (err) {
    return res.status(500).json("Problem get rank.");
  }
  getRank = upd2.rank;
  sendResult["totalCrrectAnswer"] = getResult.totalCorrectAnswer;
  sendResult["totalCorrectMarks"] = getResult.totalCorrectMarks;
  sendResult["totalWrongAnswer"] = getResult.totalWrongAnswer;
  sendResult["totalWrongMarks"] = getResult.totalWrongMarks;
  sendResult["totalNotAnswered"] = getResult.totalNotAnswered;
  sendResult["totalObtained"] = getResult.totalObtainedMarks;
  sendResult["totalMarksMcq"] = getResult.examId.totalMarksMcq;
  sendResult["rank"] = getRank;
  console.log(sendResult);
  return res.status(200).json(sendResult);
};
//error handle and ranks update
const updateStudentExamInfoFree = async (req, res, next) => {
  const examId = req.query.examId;
  if (!ObjectId.isValid(examId))
    return res.status(404).json("Exam Id is not valid.");
  const examIdObj = new mongoose.Types.ObjectId(examId);
  console.log(examIdObj, "examIdObj");
  let examUncheckStudent = null;
  try {
    examUncheckStudent = await FreestudentMarksRank.find(
      {
        $and: [
          { examId: examIdObj },
          { finishedStatus: false },
          { runningStatus: true },
        ],
      },
      "_id"
    );
  } catch (err) {
    return res.status(500).json("Something went wrong.");
  }
  console.log(examUncheckStudent, "examUncheckStudent");
  if (examUncheckStudent.length == 0)
    return res.status(200).json("All student submit the exam.");
  let updateStatus = null;
  try {
    updateStatus = await FreestudentMarksRank.updateMany(
      {
        _id: { $in: examUncheckStudent },
      },
      { $set: { runningStatus: false, finishedStatus: true } }
    );
  } catch (err) {
    return res.status(500).json("Something went wrong.");
  }
  console.log(updateStatus, "updateStatus");
  if (updateStatus.modifiedCount == 0)
    return res.status(404).json("Not updated.");
  return res.status(201).json("Updated successfully.");
};
const updateRankFree = async (req, res, next) => {
  let examId = req.query.examId;
  if (!ObjectId.isValid(examId))
    return res.status(404).json("Invalid exam Id.");
  let examIdObj = new mongoose.Types.ObjectId(examId);
  let ranks = null;
  try {
    ranks = await FreestudentMarksRank.find({ examId: examIdObj })
      .select("examId totalObtainedMarks studentId -_id")
      .sort({
        totalObtainedMarks: -1,
      });
  } catch (err) {
    return res.status(500).json("Something went wrong.");
  }
  let dataLength = ranks.length;
  for (let i = 0; i < dataLength; i++) {
    ranks[i].rank = i + 1;
  }
  console.log(ranks);
  let sav = null;
  try {
    sav = await FreeMcqRank.insertMany(ranks, { ordered: false });
  } catch (err) {
    return res.status(500).json("Something went wrong.");
  }
  return res.status(201).json("Success!");
};
const getRankFree = async (req, res, next) => {
  let examId = req.query.examId;
  let studentId = req.query.studentId;
  if (!ObjectId.isValid(examId) || !ObjectId.isValid(studentId))
    return res.status(200).json("Invalid examId or studentId.");
  let examIdObj = new mongoose.Types.ObjectId(examId);
  let studentIdObj = new mongoose.Types.ObjectId(studentId);
  let resultRank = null;
  try {
    resultRank = await FreeMcqRank.findOne({
      $and: [{ examId: examIdObj }, { studentId: studentIdObj }],
    }).select("rank -_id");
  } catch (err) {
    return res.status(500).json("Something went wrong.");
  }
  if (!resultRank) return res.status(404).json("Exam not finshed yet.");
  console.log(resultRank.rank);
  resultRank = Number(resultRank.rank);
  return res.status(200).json(resultRank);
};

exports.addFreeStudent = addFreeStudent;
exports.getAllFreeStudent = getAllFreeStudent;
exports.freeLoginStudent = freeLoginStudent;
exports.examCheckMiddlewareFree = examCheckMiddlewareFree;
exports.validateToken = validateToken;
exports.assignQuestionFree = assignQuestionFree;
exports.updateAssignQuestionFree = updateAssignQuestionFree;
exports.getRunningDataFree = getRunningDataFree;
exports.submitAnswerFree = submitAnswerFree;
exports.freeStudentViewSollutionAdmin = freeStudentViewSollutionAdmin;
exports.freeStudentHistoryDataAdmin = freeStudentHistoryDataAdmin;
exports.freeStudentMissedExamAdmin = freeStudentMissedExamAdmin;
exports.getFreeExamId = getFreeExamId;
exports.getFreeStudenInfoById = getFreeStudenInfoById;
exports.getFreeStudenInfoByMobile = getFreeStudenInfoByMobile;
exports.updateStudentExamInfoFree = updateStudentExamInfoFree;
exports.updateRankFree = updateRankFree;
exports.getRankFree = getRankFree;
