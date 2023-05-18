const Student = require("../model/Student");
const Course = require("../model/Course");
const CourseVsStudent = require("../model/CourseVsStudent");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const Exam = require("../model/Exam");
const McqQuestionVsExam = require("../model/McqQuestionVsExam");
const QuestionsMcq = require("../model/QuestionsMcq");
const StudentExamVsQuestionsMcq = require("../model/StudentExamVsQuestionsMcq");
const StudentMarksRank = require("../model/StudentMarksRank");
const { connect } = require("../routes/exam-routes");
const fsp = fs.promises;
const mongoose = require("mongoose");
const Subject = require("../model/Subject");

const Limit = 1;

/**
 * login a student to a course
 * @param {Object} req courseId,regNo
 * @returns token
 */
const loginStudent = async (req, res) => {
  const { courseId, regNo } = req.body;
  try {
    const getStudent = await Student.findOne({ regNo: regNo }, "_id").exec();
    if (!getStudent) {
      return res.status(404).json("Student not found");
    }
    const getCourse = await Course.findById({ _id: courseId }).exec();
    if (!getCourse) {
      return res.status(404).json("Course not found");
    }
    const studentvscourse = await CourseVsStudent.findOne({
      courseId,
      studentId: getStudent._id,
      status: true,
    }).exec();
    if (!studentvscourse) {
      return res.status(404).json("Course not registered for the student ID");
    }
    // if all checks passed above now geneate login token
    const token = jwt.sign(
      {
        studentId: String(getStudent._id),
        courseId: String(courseId),
      },
      process.env.SALT,
      { expiresIn: "1d" }
    );

    return res
      .status(200)
      .json({ message: "Student logged into the course", token });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Something went wrong!" });
  }
};
//Create Students
const addStudent = async (req, res, next) => {
  //start file work
  const file = req.file;
  let excelFilePath = null;
  if (!file) {
    return res.status(404).json({ message: "Excel File not uploaded." });
  }
  excelFilePath = "uploads/".concat(file.filename);
  const data1 = await fsp.readFile(excelFilePath, "utf8");
  const linesExceptFirst = data1.split("\n").slice(1);
  const linesArr = linesExceptFirst.map((line) => line.split(","));
  let students = [];
  for (let i = 0; i < linesArr.length; i++) {
    const name = String(linesArr[i][2]).replace(/["]/g, "");
    const regNo = String(linesArr[i][1]).replace(/["]/g, "");
    const mobileNo = String(linesArr[i][3]).replace(/[-]/g, "");
    if (
      name == "undefined" ||
      regNo == "undefined" ||
      mobileNo == "undefined"
    ) {
      continue;
    }
    const users = {};
    users["name"] = name;
    users["regNo"] = regNo;
    users["mobileNo"] = mobileNo;
    students.push(users);
  }
  //end file work
  try {
    const doc = await Student.insertMany(students, { ordered: false });
  } catch (err) {
    console.log(err);
  }
  return res.status(201).json("Success!");
};
//update student
const updateStudent = async (req, res, next) => {
  const studentId = req.user.studentId;
  const id = new mongoose.Types.ObjectId(studentId);
  if (studentId == null) return res.status(404).json("Student not found.");
  if (req.body.sscStatus) {
    let flag = false;
    const { name, institution, mobileNo, sscRoll, sscReg } = req.body;
    const stud = {
      name: name,
      mobileNo: mobileNo,
      sscRoll: sscRoll,
      sscReg: sscReg,
      institution: institution,
    };
    try {
      const doc = await Student.findOneAndUpdate({ id: id }, stud);
      flag = true;
    } catch (err) {
      return res.status(500).json("Something went wrong!");
    }
    if (flag) {
      return res
        .status(201)
        .json({ message: "Succesfully updated student information." });
    }
  } else if (req.body.hscStatus) {
    let flag = false;
    const { name, institution, mobileNo, hscRoll, hscReg } = req.body;
    const stud = {
      name: name,
      mobileNo: mobileNo,
      hscRoll: hscRoll,
      hscReg: hscReg,
      institution: institution,
    };
    try {
      const doc = await Student.findOneAndUpdate({ id: id }, stud);
      flag = true;
    } catch (err) {
      return res.status(500).json("Something went wrong!");
    }
    if (flag) {
      return res
        .status(201)
        .json({ message: "Succesfully updated student information." });
    }
  } else {
    let flag = false;
    const { name, institution, mobileNo } = req.body;
    const stud = {
      name: name,
      mobileNo: mobileNo,
      institution: institution,
    };
    try {
      const doc = await Student.findOneAndUpdate({ id: id }, stud);
      flag = true;
    } catch (err) {
      return res.status(500).json("Something went wrong!");
    }
    if (flag) {
      return res
        .status(201)
        .json({ message: "Succesfully updated student information." });
    }
  }
};
//get student ID
const getStudentId = async (req, res, next) => {
  const regNo = req.query.regNo;
  let studentId;
  try {
    studentId = await Student.findOne({ regNo: regNo }).select("_id");
    studentId = studentId._id;
  } catch (err) {
    console.log(err);
    return res.status(500).json("Something went wrong!");
  }
  if (!studentId)
    return res.status(404).json({ message: "Student Not Found." });
  else {
    return res.status(200).json({ studentId });
  }
};
//get all student info
const getAllStudent = async (req, res, next) => {
  let students;
  let count;
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
    students = await Student.find({}).skip(skippedItem).limit(Limit);
  } catch (err) {
    console.log(err);
    return res.status(500).json("Something went wrong!");
  }
  console.log(count);
  return res.status(200).json(students);
};
//Student have finsihed exam status check
const examCheck = async (req, res, next) => {
  let eid = req.query.eId;
  let sid = req.user.studentId;

  //start:check student already complete the exam or not
  let eId1, sId1;
  try {
    sId1 = await Student.findById(sid).select("_id");
  } catch (err) {
    return res.status(500).json(err);
  }
  try {
    eId1 = await Exam.findById(eid).select("_id");
  } catch (err) {
    return res.status(500).json(err);
  }
  let finishedStatus;
  try {
    finishedStatus = await StudentMarksRank.findOne(
      {
        $and: [{ studentId: sId1 }, { examId: eId1 }],
      },
      "finishedStatus examStartTime examEndTime"
    );
  } catch (err) {
    consoole.log(err);
    return res.status(500).json(err);
  }
  // console.log(eid);
  // console.log(sid);
  console.log(finishedStatus);
  if (finishedStatus == null) {
    req.body.eId = eid;
    next();
  } else {
    if (finishedStatus.finishedStatus == false) {
      req.body.eId = eid;
      req.body.examStartTime = finishedStatus.examStartTime;
      req.body.examEndTime = finishedStatus.examEndTime;
      next();
    } else return res.status(301).json("exam end.");
  }
};
//assign question
const assignQuestion = async (req, res, next) => {
  //data get from examcheck function req.body
  const eId = req.body.eId;
  const studentId = req.user.studentId;
  const examStartTime = req.body.examStartTime;
  const examEndTime = req.body.examEndTime;
  if (examStartTime != null) {
    return res.status(300).json("runnig.");
  }
  if (examEndTime != null) return res.status(301).json("exam end.");
  console.log(eId);
  const startTime = new Date();

  //start:check student already complete the exam or not
  let eId1, sId;
  sId = new mongoose.Types.ObjectId(studentId);
  eId1 = new mongoose.Types.ObjectId(eId);

  // let findStudentExam;
  // try {
  //   findStudentExam = await StudentExamVsQuestionsMcq.findOne({
  //     $and: [{ examId: eId1 }, { studentId: sId }],
  //   }).select("_id");
  // } catch (err) {
  //   return res.status(500).json(err);
  // }
  // //console.log(findStudentExam);
  // if (findStudentExam == null)
  //   return res.status(404).json("student has already completed the exam.");
  //end:check student already complete the exam or not
  let doc = [],
    size,
    min = 0,
    max = 0,
    rand;
  try {
    size = await McqQuestionVsExam.findOne({ eId: eId }).select("sizeMid");
  } catch (err) {
    return res.status(500).json(err);
  }
  let totalQues;
  try {
    totalQues = await Exam.findById(eId).select("totalQuestionMcq");
  } catch (err) {
    return res.status(500).json(err);
  }
  //start:generating random index of questions
  totalQues = Number(totalQues.totalQuestionMcq);
  max = size.sizeMid - 1;
  max = max - min;
  for (let i = 0; ; i++) {
    rand = Math.random();
    rand = rand * Number(max);
    rand = Math.floor(rand);
    rand = rand + Number(min);
    if (!doc.includes(rand)) doc.push(rand);
    if (doc.length == totalQues) break;
  }
  //end:generating random index of questions
  let doc1;
  try {
    doc1 = await McqQuestionVsExam.findOne({ eId: eId1 }).select("mId").lean();
  } catch (err) {
    return res.status(500).json(err);
  }
  let doc2 = [];
  doc1 = doc1.mId;
  for (let i = 0; i < totalQues; i++) {
    let x = doc[i];
    let data = doc1[i];
    doc2.push(data);
  }
  let questions;
  try {
    questions = await QuestionsMcq.find(
      { _id: { $in: doc2 } },
      "question type options"
    );
  } catch (err) {
    return res.status(500).json(err);
  }
  console.log(questions);
  if (sId == null)
    return res
      .status(404)
      .json("student not found or not permissible for the exam");
  let answered = [];
  for (let i = 0; i < totalQues; i++) {
    answered[i] = "-1";
  }
  let studentExamVsQuestionsMcq = new StudentExamVsQuestionsMcq({
    studentId: sId,
    examId: eId1,
    mcqQuestionId: doc2,
    answeredOption: answered,
  });
  let saveStudentQuestion,
    flag = false,
    flag1 = false;
  try {
    saveStudentQuestion = await studentExamVsQuestionsMcq.save();
  } catch (err) {
    flag = true;
    console.log(err);
  }
  let studentMarksRank = new StudentMarksRank({
    studentId: sId,
    examId: eId1,
    examStartTime: startTime,
  });
  try {
    saveStudentExam = await studentMarksRank.save();
  } catch (err) {
    flag = true;
    console.log(err);
  }
  questions.push(startTime);
  console.log(questions);
  if (flag == true || flag1 == true)
    return res.status(404).json("Problem occur to assign question.");

  return res.status(200).json(questions);
};
//update question answer when student select answer
//API:/updateassignquestion?examid=<examid>&questionindex=<questionumber>$optionindex=<optionindex>
const updateAssignQuestion = async (req, res, next) => {
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
    result = await StudentExamVsQuestionsMcq.find(
      {
        $and: [{ studentId: studentId }, { examId: examId }],
      },
      "_id answeredOption"
    );
  } catch (err) {
    return res.status(500).json("cant save to db");
  }
  console.log(result);
  docId = result[0]._id;
  docId1 = String(docId);
  answered = result[0].answeredOption;
  console.log(questionIndexNumber);
  console.log(optionIndexNumber);
  answered[questionIndexNumber] = String(optionIndexNumber);
  try {
    updateAnswer = await StudentExamVsQuestionsMcq.findByIdAndUpdate(docId1, {
      answeredOption: answered,
    });
  } catch (err) {
    return res.status(500).json("DB error!");
  }
  console.log(updateAnswer);
  return res.status(201).json("Ok");
};
//get exam ruuning sheet
//getrunningdata api will call after assignquestion api called.
const getRunningData = async (req, res, next) => {
  const sId = req.user.studentId;
  const eId = req.query.eId;
  let eId1, sId1;
  sId1 = new mongoose.Types.ObjectId(sId);
  eId1 = new mongoose.Types.ObjectId(eId);
  let getQuestionMcq;
  try {
    getQuestionMcq = await StudentExamVsQuestionsMcq.findOne({
      $and: [{ studentId: sId1 }, { examId: eId1 }],
    }).populate("mcqQuestionId");
  } catch (err) {
    return res.status(500).json(err);
  }
  let runningResponseLast = [];
  for (let i = 0; i < getQuestionMcq.mcqQuestionId.length; i++) {
    let runningResponse = {};
    runningResponse["question"] = getQuestionMcq.mcqQuestionId[i].question;
    runningResponse["options"] = getQuestionMcq.mcqQuestionId[i].options;
    runningResponse["type"] = getQuestionMcq.mcqQuestionId[i].type;
    runningResponse["answeredOption"] = getQuestionMcq.answeredOption[i];
    runningResponseLast.push(runningResponse);
  }
  return res.status(200).json(runningResponseLast);
};
//submit answer or end time
const submitAnswer = async (req, res, next) => {
  const eId = req.query.eId;
  const sId = req.user.studentId;
  const examEndTime = Date(req.query.endTime);
  let eId1, sId1;
  sId1 = new mongoose.Types.ObjectId(sId);
  eId1 = new mongoose.Types.ObjectId(eId);
  let findId = null;
  try {
    findId = await StudentMarksRank.find({
      $and: [{ examId: eId1 }, { studentId: sId }],
    }).select("_id");
  } catch (err) {
    console.log(err);
  }
  if (findId == null) return res.status(404).json("data not found.");
  findId = String(findId._id);
  let saveStudentExamEnd;
  let update = { examEndTime: examEndTime, finishedStatus: true };
  let flag = false;
  try {
    saveStudentExamEnd = await StudentMarksRank.findByIdAndUpdate(
      findId,
      update
    );
    flag = true;
  } catch (err) {
    console.log(err);
    return res.status(500).json(err);
  }
  if (flag == true) {
    req.body.eId = eId;
    req.body.sId = sId;
    next();
    return res.status(200).json("Answer Submitted Successfully");
  } else return res.status(200).json("Not saves.");
};
const examCalculation = async (req, res, next) => {
  const eId = re.body.eId;
  const sId = req.body.sId;
  eIdObj = new mongoose.Types.ObjectId(eId);
  sIdObj = new mongoose.Types.ObjectId(sId);
  let examData = null;
  try {
  } catch (err) {
    return res.status(500).json({ errorMessage: "DB error!" }, { error: err });
  }
};

const viewSollution = async (req, res, next) => {
  const studentId = req.user.studentId;
  const examId = req.query.examid;
  let studentIdObj = new mongoose.Types.ObjectId(studentId);
  let examIdObj = new mongoose.Types.ObjectId(examId);
  let data = null;
  try {
    data = await StudentExamVsQuestionsMcq.find({
      $and: [{ studentId: studentIdObj }, { examId: examIdObj }],
    }).populate("mcqQuestionId");
  } catch (err) {
    return res.status(500).json(err);
  }
  let resultData = [];
  console.log(data[0].mcqQuestionId.length);
  for (let i = 0; i < data[0].mcqQuestionId.length; i++) {
    let data1 = {};
    data1["question"] = data[0].mcqQuestionId[i].question;
    data1["options"] = data[0].mcqQuestionId[i].options;
    data1["correctOptions"] = data[0].mcqQuestionId[i].correctOptions;
    data1["explanationILink"] = data[0].mcqQuestionId[i].explanationILink;
    data1["type"] = data[0].mcqQuestionId[i].type;
    data1["answeredOption"] = data[0].answeredOption[i];
    console.log(data1);
    resultData.push(data1);
    i++;
  }
  return res.status(200).json(resultData);
};
const historyData = async (req, res, next) => {
  const studentId = req.user.studentId;
  let page = req.query.page;
  let skippedItem;
  if (page == null) {
    page = Number(1);
    skippedItem = (page - 1) * Limit;
  } else {
    page = Number(page);
    skippedItem = (page - 1) * Limit;
  }
  let studentIdObj = new mongoose.Types.ObjectId(studentId);
  let data;
  try {
    data = await StudentExamVsQuestionsMcq.find({
      studentId: studentIdObj,
    })
      .populate("examId")
      .skip(skippedItem)
      .limit(Limit);
  } catch (err) {
    return res.status(500).json(err);
  }
  if (data == null) return res.status(404).json("data not found.");
  let resultData = [];
  for (let i = 0; i < data.length; i++) {
    let data1 = {};
    data1["title"] = data[i].examId.name;
    data1["type"] = data[i].examId.examVariation;
    data1["variation"] = data[i].examId.examType;
    data1["totalMarksMcq"] = data[0].examId.totalMarksMcq;
    let rank = null;
    let examIdObj = new mongoose.Types.ObjectId(data[i].examId._id);
    try {
      rank = await StudentMarksRank.findOne(
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
      return res.status(500).json("DB Error!");
    }
    let subjectIdObj = String(data[i].examId.subjectId);
    let subjectName = null;
    try {
      subjectName = await Subject.findById(subjectIdObj).select("name");
    } catch (err) {
      return res.status(500).json(err);
    }
    subjectName = subjectName.name;
    if (rank == null || subjectName == null)
      return res.status(404).json("data not found.");
    data1["totalObtainedMarks"] = rank.totalObtainedMarks;
    data1["meritPosition"] = rank.rank;
    data1["examStartTime"] = rank.examStartTime;
    data1["examEndTime"] = rank.examEndTime;
    data1["subjectName"] = subjectName;
    resultData.push(data1);
    i++;
  }
  return res.status(200).json(resultData);
};

const missedExam = async (req, res, next) => {
  const studentId = req.user.studentId;
  const courseId = req.user.courseId;
  //pagination:start
  let page = req.query.page;
  let skippedItem;
  if (page == null) {
    page = Number(1);
    skippedItem = (page - 1) * Limit;
  } else {
    page = Number(page);
    skippedItem = (page - 1) * Limit;
  }
  //pagination:end
  const courseIdObj = new mongoose.Types.ObjectId(courseId);
  let studentIdObj = new mongoose.Types.ObjectId(studentId);
  let allExam = null;
  try {
    allExam = await Exam.find({
      $and: [{ courseId: courseIdObj }, { status: true }],
    }).select("_id");
  } catch (err) {
    return res.status(500).json("DB error");
  }
  let doneExam = null;
  try {
    doneExam = await StudentMarksRank.find(
      {
        studentId: studentIdObj,
      },
      "examId"
    );
  } catch (err) {
    return res.status(500).json("DB error");
  }
  if (allExam == null) return res.status(404).json("data not found.");
  let data = [];
  for (let i = 0; i < allExam.length; i++) {
    data[i] = String(allExam[i]._id);
  }
  let doneExamArr = [];
  for (let i = 0; i < doneExam.length; i++) {
    doneExamArr.push(String(doneExam[i].examId));
  }
  const removedArray = data.filter(function (el) {
    return !doneExamArr.includes(el);
  });
  let resultData = null;
  if (doneExam == null) removedArray = data;
  try {
    resultData = await Exam.find({ _id: { $in: removedArray } })
      .populate("subjectId courseId")
      .skip(skippedItem)
      .limit(Limit);
  } catch (err) {
    return res.status(500).json("DB Error!");
  }
  let resultFinal = [];
  for (let i = 0; i < resultData.length; i++) {
    let result = {};
    result["exanName"] = resultData[i].name;
    result["startTime"] = resultData[i].startTime;
    result["duration"] = resultData[i].duration;
    result["examType"] = resultData[i].examType;
    result["examVariation"] = resultData[i].examVariation;
    result["negativeMarks"] = resultData[i].negativeMarks;
    result["subject"] = resultData[i].subjectId.name;

    resultFinal.push(result);
  }
  return res.status(200).json(resultFinal);
};

const retakeExam = async (req, res, next) => {
  const examId = req.query.examid;
  const examIdObj = new mongoose.Types.ObjectId(examId);
  let examData = null,
    doc = [],
    min = 0,
    max = 0,
    questionData = [],
    rand;
  try {
    examData = await McqQuestionVsExam.find({ eId: examIdObj }).populate(
      "eId mId"
    );
  } catch (err) {
    console.log(err);
    return res.status(500).json(err);
  }
  //start:generating random index of questions
  max = examData[0].sizeMid - 1;
  max = max - min;
  for (let i = 0; ; i++) {
    rand = Math.random();
    rand = rand * Number(max);
    rand = Math.floor(rand);
    rand = rand + Number(min);
    if (!doc.includes(rand)) doc.push(rand);
    if (doc.length == examData[0].eId.totalQuestionMcq) break;
  }
  for (let i = 0; i < doc.length; i++) {
    let questions = {};
    questions["id"] = examData[0].mId[doc[i]]._id;
    questions["question"] = examData[0].mId[doc[i]].question;
    questions["options"] = examData[0].mId[doc[i]].options;
    questions["optionCount"] = examData[0].mId[doc[i]].optionCount;
    questions["type"] = examData[0].mId[doc[i]].type;
    questionData.push(examData);
  }
  //end:generating random index of questions
  if (questionData != null)
    return res.status(200).json({ one: questionData, two: doc });
  else return res.status(404).json("Question not found in the exam.");
};
const retakeSubmit = async (req, res, next) => {
  let examData;
  const examId = req.body.examId;
  const qId = req.body.qId;
  const answerArr = req.body.answerIndex;
  const doc = req.body.doc;
  let marks = Number(0),
    totalCorrect = Number(0),
    totalWrong = Number(0),
    notAnswered = Number(0),
    correctMarks = 0;
  const examIdObj = new mongoose.Types.ObjectId(examId);
  const qIdObj = qId.map((s) => new mongoose.Types.ObjectId(s));
  const answered = answerArr;

  try {
    examData = await McqQuestionVsExam.findOne({ eId: examIdObj })
      .select("mId")
      .populate("mId eId");
  } catch (err) {
    console.log(err);
    return res.status(500).json(err);
  }

  let negativeMarks = Number(examData.eId.negativeMarks);
  let totalMarksMcq = Number(examData.eId.totalMarksMcq);
  examData = examData.mId;

  for (let i = 0; i < 2; i++) {
    let answer = answered[i];
    if (String(examData[doc[i]]._id) == String(qIdObj[i])) {
      console.log(answer);
      if (answer == "-1") notAnswered = notAnswered + 1;
      else if (answer == examData[doc[i]].answeredOption)
        totalCorrect = totalCorrect + 1;
      else totalWrong = totalWrong + 1;
    }
  }
  correctMarks = totalMarksMcq / qIdObj.length;
  let negativeValue = (2 * negativeMarks) / 100;
  marks = totalCorrect * correctMarks - negativeValue * totalWrong;
  let answerScript = {};
  answerScript["totalQuestion"] = qIdObj.length;
  answerScript["negativePercentage"] = negativeMarks;
  answerScript["negativeValue"] = negativeValue;
  answerScript["totalCorrect"] = totalCorrect;
  answerScript["totalWrong"] = totalWrong;
  answerScript["notAnswered"] = notAnswered;
  answerScript["totalMarks"] = marks;
  answerScript["totalWrongMarks"] = negativeValue * totalWrong;
  answerScript["totalCorrectMarks"] = totalCorrect * correctMarks;
  answerScript["questionInfo"] = examData;

  return res.status(200).json(answerScript);
};
const filterHistory = async (req, res, next) => {};

exports.loginStudent = loginStudent;
exports.addStudent = addStudent;
exports.updateStudent = updateStudent;
exports.getStudentId = getStudentId;
exports.getAllStudent = getAllStudent;
exports.assignQuestion = assignQuestion;
exports.updateAssignQuestion = updateAssignQuestion;
exports.examCheck = examCheck;
exports.submitAnswer = submitAnswer;
exports.getRunningData = getRunningData;
exports.viewSollution = viewSollution;
exports.historyData = historyData;
exports.missedExam = missedExam;
exports.retakeExam = retakeExam;
exports.retakeSubmit = retakeSubmit;
