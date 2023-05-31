const Student = require("../model/Student");
const Course = require("../model/Course");
const CourseVsStudent = require("../model/CourseVsStudent");
const jwt = require("jsonwebtoken");
const Exam = require("../model/Exam");
const McqQuestionVsExam = require("../model/McqQuestionVsExam");
const QuestionsMcq = require("../model/QuestionsMcq");
const StudentExamVsQuestionsMcq = require("../model/StudentExamVsQuestionsMcq");
const StudentMarksRank = require("../model/StudentMarksRank");
const fs = require("fs");
const fsp = fs.promises;
const mongoose = require("mongoose");
const Subject = require("../model/Subject");
const { fork } = require("child_process");
const ISODate = require("isodate");
const moment = require("moment");
const path = require("path");
const { ObjectId } = require("mongodb");
const pagination = require("../utilities/pagination");
const examType = require("../utilities/exam-type");
const examVariation = require("../utilities/exam-variation");

const Limit = 100;

/**
 * login a student to a course
 * @param {Object} req courseId,regNo
 * @returns token
 */
const loginStudent = async (req, res) => {
  const { courseId, regNo } = req.body;
  const ObjectId = mongoose.Types.ObjectId;
  if (!ObjectId.isValid(courseId))
    return res.status(422).json("Course Id not valid");
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
    const studentIdStr = String(getStudent._id);
    const courseIdStr = String(courseId);
    const token = jwt.sign(
      {
        studentId: studentIdStr,
        courseId: courseIdStr,
        role: 4,
      },
      process.env.SALT,
      { expiresIn: "1d" }
    );

    return res.status(200).json({
      message: "Student logged into the course",
      token,
      studentIdStr,
      courseIdStr,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Something went wrong!" });
  }
};
/**
 * validate if the token is valid or retur to login state
 */
const validateToken = async (req, res) => {
  return res.json(req.user);
};
//Create Students
const addStudent = async (req, res, next) => {
  //start file work
  const file = req.file;
  let excelFilePath = null;
  if (!file) {
    return res
      .status(404)
      .json("CSV File not uploaded or filename is not valid.");
  }
  excelFilePath = "uploads/".concat(file.filename);
  const data1 = await fsp.readFile(excelFilePath, "utf8");
  const linesExceptFirst = data1.split("\n").slice(1);
  const linesArr = linesExceptFirst.map((line) => line.split(","));
  let students = [];
  for (let i = 0; i < linesArr.length; i++) {
    const name = String(linesArr[i][2]).replace(/[-"\r]/g, "");
    const regNo = String(linesArr[i][1]).replace(/[-"\r]/g, "");
    const mobileNo = String(linesArr[i][3]).replace(/[-"\r]/g, "");
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
  let page = Number(req.query.page) || 1;
  let count = 0;

  if (count == 0) return res.status(200).json("No data found.");
  let paginateData = pagination(count, page);
  try {
    students = await Student.find({})
      .skip(paginateData.skippedIndex)
      .limit(paginateData.perPage);
  } catch (err) {
    console.log(err);
    return res.status(500).json("Something went wrong!");
  }
  return res.status(200).json({ students, paginateData });
};
const examCheckMiddleware = async (req, res, next) => {
  const examId = req.query.eId;
  const studentId = req.user.studentId;
  //start:check student already complete the exam or not
  let examIdObj, studentIdObj;
  studentIdObj = new mongoose.Types.ObjectId(studentId);
  examIdObj = new mongoose.Types.ObjectId(examId);
  let status = null;
  try {
    status = await StudentMarksRank.findOne({
      $and: [{ studentId: studentIdObj }, { examId: examIdObj }],
    });
  } catch (err) {
    return res.status(500).json("DB error");
  }
  if (status == null) return res.status(200).json("assign");
  else {
    if (status.finishedStatus == true) return res.status(200).json("ended");
    else return res.status(200).json("running");
  }
};
//assign question
const assignQuestion = async (req, res, next) => {
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
  //end:generating random index of questions
  let doc1;
  try {
    doc1 = await McqQuestionVsExam.findOne({ eId: eId1 }).select("mId");
  } catch (err) {
    return res.status(500).json("3.Something went wrong.");
  }
  let statQues = [];
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
    let data = doc2[doc[i]];
    resultQuestion.push(data);
  }
  let questions;
  try {
    questions = await QuestionsMcq.find(
      { _id: { $in: resultQuestion } },
      "question type options"
    );
  } catch (err) {
    return res.status(500).json("Something went wrong.");
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
  let saveStudentQuestion = null,
    saveStudentExam = null;
  let duration = totalQues.duration;
  const examStartTime = new Date();
  const examEndTime = new Date(moment(examStartTime).add(duration, "minutes"));
  let studentMarksRank = new StudentMarksRank({
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
  if (!ObjectId.isValid(sId) || !ObjectId.isValid(eId))
    return res.status(404).json("invalid student ID or exam ID.");
  let eId1, sId1;
  sId1 = new mongoose.Types.ObjectId(sId);
  eId1 = new mongoose.Types.ObjectId(eId);
  let getQuestionMcq, getExamData;
  try {
    getQuestionMcq = await StudentExamVsQuestionsMcq.findOne({
      $and: [{ studentId: sId1 }, { examId: eId1 }],
    }).populate("mcqQuestionId");
  } catch (err) {
    return res.status(500).json("can't get question.Problem Occur.");
  }
  try {
    getExamData = await StudentMarksRank.findOne(
      { examId: eId1 },
      { studentId: sId1 }
    )
      .select("examStartTime examEndTime examId")
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
  console.log(getQuestionMcq);
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
    runningResponseLast.push(runningResponse);
  }
  timeData["startTime"] = getExamData.examStartTime;
  timeData["endTine"] = getExamData.examEndTime;
  timeData["examDuration"] = getExamData.examId.duration;
  questionData = runningResponseLast;
  examData = getExamData.examId;

  return res.status(200).json({ timeData, questionData, examData });
};
//submit answer or end time
const submitAnswer = async (req, res, next) => {
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
    findId = await StudentMarksRank.find({
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
    saveStudentExamEnd = await StudentMarksRank.findByIdAndUpdate(
      findId,
      update
    );
  } catch (err) {
    return res.status(500).json("Problem when updating student marks rank.");
  }
  let sIeIObj = await StudentMarksRank.find(
    { $and: [{ studentId: sId1 }, { examId: eId1 }] },
    "_id"
  );
  sIeIObj = sIeIObj[0]._id;
  let examData = null;
  try {
    examData = await StudentExamVsQuestionsMcq.findOne({
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
    result = await StudentExamVsQuestionsMcq.findByIdAndUpdate(id, update1);
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
    getResult = await StudentExamVsQuestionsMcq.findById(id).populate("examId");
  } catch (err) {
    return res.status(500).json("Problem when get Student Exam info.");
  }
  try {
    dataRank = await StudentMarksRank.find(
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
//student can view the following info
const viewSollution = async (req, res, next) => {
  const studentId = req.user.studentId;
  const examId = req.query.examId;
  if (!ObjectId.isValid(studentId) || !ObjectId.isValid(examId))
    return res.status(404).json("student Id or examId is not valid.");
  let studentIdObj = new mongoose.Types.ObjectId(studentId);
  let examIdObj = new mongoose.Types.ObjectId(examId);
  let data = null;
  try {
    data = await StudentExamVsQuestionsMcq.find({
      $and: [{ studentId: studentIdObj }, { examId: examIdObj }],
    }).populate("mcqQuestionId");
  } catch (err) {
    return res.status(500).json("1.Something went wrong.");
  }
  if (data == null)
    return res.status(200).json("No exam found under this student.");
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
const historyData = async (req, res, next) => {
  const studentId = req.user.studentId;
  if (!ObjectId.isValid(studentId))
    return res.status(404).json("Student ID not valid.");
  let page = req.query.page || 1;

  let studentIdObj = new mongoose.Types.ObjectId(studentId);
  let data;
  let count = 0;
  try {
    count = await StudentExamVsQuestionsMcq.find({
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
    data = await StudentExamVsQuestionsMcq.find({
      studentId: studentIdObj,
    })
      .populate("examId")
      .skip(paginateData.skippedIndex)
      .limit(paginateData.perPage);
  } catch (err) {
    return res.status(500).json("1.SOmething went wrong.");
  }
  if (data == null)
    return res.status(404).json("No exam data found for the student.");
  let resultData = [];
  let flag = false;
  for (let i = 0; i < data.length; i++) {
    let data1 = {};
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
      return res.status(500).json("2.Something went wrong.");
    }
    if (rank == null)
      return res.status(404).json("No exam data forunf for the student.");
    let subjectIdObj = String(data[i].examId.subjectId);
    let subjectName = null;
    try {
      subjectName = await Subject.findById(subjectIdObj).select("name");
    } catch (err) {
      return res.status(500).json("3.Something went wrong.");
    }
    subjectName = subjectName.name;
    if (rank == null || subjectName == null) {
    }
    data1["examId"] = data[i].examId._id;
    data1["title"] = data[i].examId.name;
    data1["type"] = data[i].examId.examType;
    data1["variation"] = data[i].examId.examVariation;
    data1["totalMarksMcq"] = data[i].examId.totalMarksMcq;
    data1["totalObtainedMarks"] = rank.totalObtainedMarks;
    data1["meritPosition"] = rank.rank;
    data1["examStartTime"] = moment(rank.examStartTime).format("LLL");
    data1["examEndTime"] = moment(rank.examEndTime).format("LLL");
    data1["subjectName"] = subjectName;
    resultData.push(data1);
  }
  return res.status(200).json({ resultData, paginateData });
};
const missedExam = async (req, res, next) => {
  const studentId = req.user.studentId;
  const courseId = req.user.courseId;
  if (!ObjectId.isValid(studentId) || !ObjectId.isValid(courseId)) {
    return res.status(404).json("Student Id or Course Id is not valid.");
  }
  const courseIdObj = new mongoose.Types.ObjectId(courseId);
  let studentIdObj = new mongoose.Types.ObjectId(studentId);
  let allExam = null;
  try {
    allExam = await Exam.find({
      $and: [
        { courseId: courseIdObj },
        { status: true },
        { endtime: { $lt: new Date() } },
      ],
    }).select("_id");
  } catch (err) {
    return res.status(500).json("1.Sometihing went wrong.");
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
    return res.status(500).json("2.Something went wrong.");
  }
  if (allExam == null) return res.status(404).json("No Exam data found.");
  let data = [];
  for (let i = 0; i < allExam.length; i++) {
    data[i] = String(allExam[i]._id);
  }
  let doneExamArr = [];
  for (let i = 0; i < doneExam.length; i++) {
    doneExamArr.push(String(doneExam[i].examId));
  }
  let removedArray = null;
  let resultData = null;
  if (doneExam == null) removedArray = data;
  else {
    removedArray = data.filter(function (el) {
      return !doneExamArr.includes(el);
    });
  }
  let page = Number(req.query.page) || 1;
  let count = 0;
  try {
    count = await Exam.find({
      $and: [{ _id: { $in: removedArray } }, { status: true }],
    }).count();
  } catch (err) {
    return res.status(200).json("Something went wrong.");
  }
  if (count == 0) {
    return res.status(200).json("No data found.");
  }
  let paginateData = pagination(count, page);
  try {
    resultData = await Exam.find({
      $and: [{ _id: { $in: removedArray } }, { status: true }],
    })
      .populate("subjectId courseId")
      .skip(paginateData.skippedIndex)
      .limit(paginateData.perPage);
  } catch (err) {
    return res.status(500).json("3.Something went wrong.");
  }
  if (resultData == null) return res.status(200).json("No missed exam found.");
  let resultFinal = [];
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
    resultFinal.push(result);
  }
  return res.status(200).json({ resultFinal, paginateData });
};
const retakeExam = async (req, res, next) => {
  const examId = req.query.examId;
  if (!ObjectId.isValid(examId))
    return res.status(404).json("examId is not valid.");
  const examIdObj = new mongoose.Types.ObjectId(examId);
  let examData = null,
    doc = [],
    min = 0,
    max = 0,
    questionData = [],
    rand;
  try {
    examData = await McqQuestionVsExam.findOne({ eId: examIdObj })
      .select("_id mId eId")
      .populate("eId mId");
  } catch (err) {
    console.log(err);
    return res.status(500).json("1.Something went wrong.");
  }
  if (examData == null)
    return res.status(404).json("No data found against this exam.");
  let examDataNew = examData;
  examData = examData.mId;
  let questData = [];
  for (let i = 0; i < examData.length; i++) {
    let quesId = String(examData[i]._id);
    let status = null;
    try {
      status = await QuestionsMcq.findById(quesId);
      status = status.status;
    } catch (err) {
      return res.status(500).json("Something went wrong.");
    }
    if (status == true) questData.push(examData[i]._id);
  }
  let questDataFull = [];
  try {
    questDataFull = await QuestionsMcq.find({ _id: { $in: questData } });
  } catch (err) {
    return res.status(500).json("Something went wrong.");
  }
  //return res.status(200).json(examData);
  //start:generating random index of questions
  max = questData.length - 1;
  max = max - min;
  for (let i = 0; ; i++) {
    rand = Math.random();
    rand = rand * Number(max);
    rand = Math.floor(rand);
    rand = rand + Number(min);
    if (!doc.includes(rand)) doc.push(rand);
    if (doc.length == examDataNew.eId.totalQuestionMcq) break;
  }
  examData = questDataFull;
  for (let i = 0; i < doc.length; i++) {
    let questions = {};
    questions["id"] = examData[doc[i]]._id;
    questions["question"] = examData[doc[i]].question;
    questions["options"] = examData[doc[i]].options;
    questions["optionCount"] = examData[doc[i]].optionCount;
    questions["type"] = examData[doc[i]].type;
    questionData.push(questions);
  }
  let duration = examDataNew.eId.duration;
  //end:generating random index of questions
  return res.status(200).json({ question: questionData, two: doc, duration });
};
const retakeSubmit = async (req, res, next) => {
  let examData;
  const examId = req.body.examId;
  const qId = req.body.qId; //qId=Array
  const answerArr = req.body.answerIndex;
  const doc = req.body.doc; //doc=array which get from retake exam.
  if (!ObjectId.isValid(examId) || !qId || !answerArr || !doc) {
    return res.status(404).json("Data not fond.");
  }
  console.log(qId);
  console.log(answerArr);
  console.log(doc);
  let marks = Number(0),
    totalCorrect = Number(0),
    totalWrong = Number(0),
    notAnswered = Number(0),
    negativeMarks = 0,
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
    return res.status(500).json("1.Something went wrong.");
  }
  if (examData == null)
    return res.status(404).json("No exam data found for the student.");

  negativeMarks = Number(examData.eId.negativeMarks);
  correctMarks = Number(examData.eId.marksPerMcq); //totalMarksMcq / qIdObj.length;
  examData = examData.mId;

  for (let i = 0; i < qIdObj.length; i++) {
    //console.log(examData[doc[i]]);
    let answer = answered[i];
    console.log(answer);
    console.log(examData[doc[i]]);
    if (String(examData[doc[i]]._id) == String(qIdObj[i])) {
      if (answer == "-1") notAnswered = notAnswered + 1;
      else if (answer == examData[doc[i]].correctOption)
        totalCorrect = totalCorrect + 1;
      else totalWrong = totalWrong + 1;
    }
  }
  let negativeValue = (correctMarks * negativeMarks) / 100;
  marks = totalCorrect * correctMarks - negativeValue * totalWrong;
  let answerScript = {};
  answerScript["totalQuestion"] = qIdObj.length;
  answerScript["negativePercentage"] = negativeMarks;
  answerScript["correcMarks"] = correctMarks;
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
const studentSubmittedExamDetail = async (req, re, snext) => {
  const studentId = req.user.studentId;
  const examId = req.query.examId;
  if (!ObjectId.isValid(studentId) || !ObjectId.isValid(examId))
    return res.status(404).json("Student Id is not valid.");
  const studentIdObj = new mongoose.Types.ObjectId(studentId);
  const examIdObj = new mongoose.Types.ObjectId(examId);
  let data = null;
  try {
    data = await StudentExamVsQuestionsMcq.findOne({
      $and: [{ studentId: studentIdObj }, { examId: examIdObj }],
    }).populate("examId");
  } catch (err) {
    return res.status(500).json("1.Something went wrong.");
  }
  if (data == null) return res.status(404).json("No data found.");
  let dataRank = null;
  try {
    dataRank = await StudentMarksRank.findOne({
      $and: [{ studentId: studentIdObj }, { examId: examIdObj }],
    });
  } catch (err) {
    return res.status(500).json("2.Something went wrong.");
  }
  if (dataRank == null) return res.status(404).json("No data found.");

  let dataObject = {};
  dataObject["examName"] = data.examId.name;
  dataObject["totalMarksMcq"] = data.examId.totalMarksMcq;
  dataObject["startTime"] = data.examId.startTime;
  dataObject["endTime"] = data.examId.endTime;
  dataObject["examType"] = examType[Number(data.examId.examType)];
  dataObject["examVariation"] =
    examVariation[Number(data.examId.examVariation)];
  dataObject["studExamTime"] = dataObject["totalCorrectAnswer"] =
    data.totalCorrectAnswer;
  dataObject["studExamStartTime"] = dataRank.examStartTime;
  dataObject["studExamEndTime"] = dataRank.examEndTime;
  dataObject["studDuration"] = dataRank.duration;
  dataObject["rank"] = dataRank.rank;
  dataObject["totalObtainedMarks"] = dataRank.totalObtainedMarks;
  dataObject["totalWrongAnswer"] = data.totalWrongAnswer;
  dataObject["totalCorrectMarks"] = data.totalCorrectMarks;
  dataObject["totalWrongMarks"] = data.totalWrongMarks;
  dataObject["totalNotAnswered"] = data.totalNotAnswered;
  return res.status(200).json(dataObject);
};

const studentSubmittedExamDetailAdmin = async (req, re, snext) => {
  const studentId = req.query.studentId;
  const examId = req.query.examId;
  if (!ObjectId.isValid(studentId) || !ObjectId.isValid(examId))
    return res.status(404).json("Student Id is not valid.");
  const studentIdObj = new mongoose.Types.ObjectId(studentId);
  const examIdObj = new mongoose.Types.ObjectId(examId);
  let data = null;
  try {
    data = await StudentExamVsQuestionsMcq.findOne({
      $and: [{ studentId: studentIdObj }, { examId: examIdObj }],
    }).populate("examId");
  } catch (err) {
    return res.status(500).json("1.Something went wrong.");
  }
  if (data == null) return res.status(404).json("No data found.");
  let dataRank = null;
  try {
    dataRank = await StudentMarksRank.findOne({
      $and: [{ studentId: studentIdObj }, { examId: examIdObj }],
    });
  } catch (err) {
    return res.status(500).json("2.Something went wrong.");
  }
  if (dataRank == null) return res.status(404).json("No data found.");

  let dataObject = {};
  dataObject["examName"] = data.examId.name;
  dataObject["totalMarksMcq"] = data.examId.totalMarksMcq;
  dataObject["startTime"] = data.examId.startTime;
  dataObject["endTime"] = data.examId.endTime;
  dataObject["examType"] = examType[Number(data.examId.examType)];
  dataObject["examVariation"] =
    examVariation[Number(data.examId.examVariation)];
  dataObject["studExamTime"] = dataObject["totalCorrectAnswer"] =
    data.totalCorrectAnswer;
  dataObject["studExamStartTime"] = dataRank.examStartTime;
  dataObject["studExamEndTime"] = dataRank.examEndTime;
  dataObject["studDuration"] = dataRank.duration;
  dataObject["rank"] = dataRank.rank;
  dataObject["totalObtainedMarks"] = dataRank.totalObtainedMarks;
  dataObject["totalWrongAnswer"] = data.totalWrongAnswer;
  dataObject["totalCorrectMarks"] = data.totalCorrectMarks;
  dataObject["totalWrongMarks"] = data.totalWrongMarks;
  dataObject["totalNotAnswered"] = data.totalNotAnswered;
  return res.status(200).json(dataObject);
};

const filterHistory = async (req, res, next) => {
  const sId = new mongoose.Types.ObjectId(req.user.studentId);
  const startDate = ISODate(req.body.start);
  const endDate = ISODate(req.body.end);
  const eId = new mongoose.Types.ObjectId(req.body.examId);
  const type = req.body.type;
  const variation = req.body.variation;
  const subjectId = req.body.subjectId;
  let result = null;
  try {
    result = await StudentExamVsQuestionsMcq.find({
      $sand: [{ examId: eId }, { startTime: { $gte: start1, $lt: end } }],
    })
      .populate("examId")
      .skip(skippedItem)
      .limit(Limit);
  } catch (err) {
    console.log(err);
  }
};
//use for admin
const viewSollutionAdmin = async (req, res, next) => {
  const studentId = req.query.studentId;
  const examId = req.query.examId;
  if (!ObjectId.isValid(studentId) || !ObjectId.isValid(examId))
    return res.status(404).json("student Id or examId is not valid.");
  let studentIdObj = new mongoose.Types.ObjectId(studentId);
  let examIdObj = new mongoose.Types.ObjectId(examId);
  let data = null;
  try {
    data = await StudentExamVsQuestionsMcq.find({
      $and: [{ studentId: studentIdObj }, { examId: examIdObj }],
    }).populate("mcqQuestionId");
  } catch (err) {
    return res.status(500).json("1.Something went wrong.");
  }
  if (data == null)
    return res.status(200).json("No exam found under this student.");
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
const missedExamAdmin = async (req, res, next) => {
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
        { courseId: courseIdObj },
        { status: true },
        { endtime: { $lt: new Date() } },
      ],
    }).select("_id");
  } catch (err) {
    return res.status(500).json("1.Sometihing went wrong.");
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
    return res.status(500).json("2.Something went wrong.");
  }
  if (allExam == null) return res.status(404).json("No Exam data found.");
  let data = [];
  for (let i = 0; i < allExam.length; i++) {
    data[i] = String(allExam[i]._id);
  }
  let doneExamArr = [];
  for (let i = 0; i < doneExam.length; i++) {
    doneExamArr.push(String(doneExam[i].examId));
  }
  let removedArray = null;
  let resultData = null;
  if (doneExam == null) removedArray = data;
  else {
    removedArray = data.filter(function (el) {
      return !doneExamArr.includes(el);
    });
  }
  let page = Number(req.query.page) || 1;
  let count = 0;
  try {
    count = await Exam.find({
      $and: [{ _id: { $in: removedArray } }, { status: true }],
    }).count();
  } catch (err) {
    return res.status(200).json("Something went wrong.");
  }
  if (count == 0) {
    return res.status(200).json("No data found.");
  }
  let paginateData = pagination(count, page);
  try {
    resultData = await Exam.find({
      $and: [{ _id: { $in: removedArray } }, { status: true }],
    })
      .populate("subjectId courseId")
      .skip(paginateData.skippedIndex)
      .limit(paginateData.perPage);
  } catch (err) {
    return res.status(500).json("3.Something went wrong.");
  }
  if (resultData == null) return res.status(200).json("No missed exam found.");
  let resultFinal = [];
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
    resultFinal.push(result);
  }
  return res.status(200).json({ resultFinal, paginateData });
};
const historyDataAdmin = async (req, res, next) => {
  const studentId = req.query.studentId;
  if (!ObjectId.isValid(studentId))
    return res.status(404).json("Student ID not valid.");
  let page = req.query.page || 1;

  let studentIdObj = new mongoose.Types.ObjectId(studentId);
  let data;
  let count = 0;
  try {
    count = await StudentExamVsQuestionsMcq.find({
      studentId: studentIdObj,
    }).count();
  } catch (err) {
    return res.status(500).json("Something went wrong.");
  }
  if (count == 0) res.status(200).json("No data found.");
  let paginateData = pagination(count, page);
  try {
    data = await StudentExamVsQuestionsMcq.find({
      studentId: studentIdObj,
    })
      .populate("examId")
      .skip(paginateData.skippedIndex)
      .limit(paginateData.perPage);
  } catch (err) {
    return res.status(500).json("1.SOmething went wrong.");
  }
  if (data == null)
    return res.status(404).json("No exam data found for the student.");
  let resultData = [];
  let flag = false;
  for (let i = 0; i < data.length; i++) {
    let data1 = {};
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
      return res.status(500).json("2.Something went wrong.");
    }
    if (rank == null)
      return res.status(404).json("No exam data forunf for the student.");
    let subjectIdObj = String(data[i].examId.subjectId);
    let subjectName = null;
    try {
      subjectName = await Subject.findById(subjectIdObj).select("name");
    } catch (err) {
      return res.status(500).json("3.Something went wrong.");
    }
    subjectName = subjectName.name;
    if (rank == null || subjectName == null) {
      flag = true;
      break;
    }
    data1["examId"] = data[i].examId._id;
    data1["title"] = data[i].examId.name;
    data1["type"] = data[i].examId.examType;
    data1["variation"] = data[i].examId.examVariation;
    data1["totalMarksMcq"] = data[i].examId.totalMarksMcq;
    data1["totalObtainedMarks"] = rank.totalObtainedMarks;
    data1["meritPosition"] = rank.rank;
    data1["examStartTime"] = moment(rank.examStartTime).format("LLL");
    data1["examEndTime"] = moment(rank.examEndTime).format("LLL");
    data1["subjectName"] = subjectName;
    resultData.push(data1);
    i++;
  }
  if (flag == true) return res.status(404).json("data not found.");
  else return res.status(200).json({ resultData, paginateData });
};

const getHistoryByExamId = async (req, res, next) => {
  const examId = req.query.examId;
  if (!ObjectId.isValid(examId))
    return res.status(404).json("Student ID not valid.");
  let page = req.query.page || 1;

  let examIdObj = new mongoose.Types.ObjectId(examId);
  let data;
  let count = 0;
  try {
    count = await StudentExamVsQuestionsMcq.find({
      examId: examIdObj,
    }).count();
  } catch (err) {
    return res.status(500).json("Something went wrong.");
  }
  if (count == 0) res.status(200).json("No data found.");
  let paginateData = pagination(count, page);
  try {
    data = await StudentExamVsQuestionsMcq.find({
      examId: examIdObj,
    })
      .populate("examId")
      .skip(paginateData.skippedIndex)
      .limit(paginateData.perPage);
  } catch (err) {
    return res.status(500).json("1.SOmething went wrong.");
  }
  if (data == null)
    return res.status(404).json("No exam data found for the student.");
  let resultData = [];
  let flag = false;
  for (let i = 0; i < data.length; i++) {
    let data1 = {};
    let rank = null;
    let examIdObj = new mongoose.Types.ObjectId(data[i].examId._id);
    try {
      rank = await StudentMarksRank.findOne(
        {
          $and: [{ examId: examIdObj }, { finishedStatus: true }],
        },
        "rank totalObtainedMarks examStartTime examEndtime"
      );
    } catch (err) {
      return res.status(500).json("2.Something went wrong.");
    }
    if (rank == null)
      return res.status(404).json("No exam data forunf for the student.");
    let subjectIdObj = String(data[i].examId.subjectId);
    let subjectName = null;
    try {
      subjectName = await Subject.findById(subjectIdObj).select("name");
    } catch (err) {
      return res.status(500).json("3.Something went wrong.");
    }
    subjectName = subjectName.name;
    if (rank == null || subjectName == null) {
      flag = true;
      break;
    }
    data1["examId"] = data[i].examId._id;
    data1["title"] = data[i].examId.name;
    data1["type"] = data[i].examId.examType;
    data1["variation"] = data[i].examId.examVariation;
    data1["totalMarksMcq"] = data[i].examId.totalMarksMcq;
    data1["totalObtainedMarks"] = rank.totalObtainedMarks;
    data1["meritPosition"] = rank.rank;
    data1["examStartTime"] = moment(rank.examStartTime).format("LLL");
    data1["examEndTime"] = moment(rank.examEndTime).format("LLL");
    data1["subjectName"] = subjectName;
    resultData.push(data1);
    i++;
  }
  if (flag == true) return res.status(404).json("data not found.");
  else return res.status(200).json({ resultData, paginateData });
};
exports.loginStudent = loginStudent;
exports.validateToken = validateToken;
exports.addStudent = addStudent;
exports.updateStudent = updateStudent;
exports.getStudentId = getStudentId;
exports.getAllStudent = getAllStudent;
exports.assignQuestion = assignQuestion;
exports.updateAssignQuestion = updateAssignQuestion;
exports.submitAnswer = submitAnswer;
exports.getRunningData = getRunningData;
exports.viewSollution = viewSollution;
exports.studentSubmittedExamDetail = studentSubmittedExamDetail;
exports.historyData = historyData;
exports.missedExam = missedExam;
exports.retakeExam = retakeExam;
exports.retakeSubmit = retakeSubmit;
exports.examCheckMiddleware = examCheckMiddleware;
exports.viewSollutionAdmin = viewSollutionAdmin;
exports.missedExamAdmin = missedExamAdmin;
exports.historyDataAdmin = historyDataAdmin;
exports.studentSubmittedExamDetailAdmin = studentSubmittedExamDetailAdmin;
exports.getHistoryByExamId = getHistoryByExamId;
