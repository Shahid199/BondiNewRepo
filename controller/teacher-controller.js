const { default: mongoose } = require("mongoose");
const TeacherVsExam = require("../model/TeacherVsExam");
const { ObjectId } = require("mongodb");
const StudentExamVsQuestionsWritten = require("../model/StudentExamVsQuestionsWritten");
const QuestionsWritten = require("../model/QuestionsWritten");
var base64Img = require("base64-img");
const path = require("path");
const fs = require("fs");
const mime = require("mime");
const BothStudentExamVsQuestions = require("../model/BothStudentExamVsQuestions");
const BothRank = require("../model/BothRank");
const BothQuestionsWritten = require("../model/BothQuestionsWritten");
const McqRank = require("../model/McqRank");
const examVariation = require("../utilities/exam-variation");
const examType = require("../utilities/exam-type");
const pagination = require("../utilities/pagination");
const BothTeacherVsExam = require("../model/BothTeacherVsExam");
//const sharp = require("sharp");

const dir = path.resolve(path.join(__dirname, "../uploads/answers/"));
const getStudentData = async (req, res, next) => {
  let page = req.query.page || 1;
  let teacherId = req.user.id;
  //console.log(req.user);
  let examId = req.query.examId;
  examId = new mongoose.Types.ObjectId(examId);
  teacherId = new mongoose.Types.ObjectId(teacherId);
  //console.log(teacherId);
  //console.log(examId);
  let students = [];
  let questionData = null;
  try {
    questionData = await QuestionsWritten.findOne({ examId: examId });
  } catch (err) {
    //console.log(err);
    return res.status(500).json("Something went wrong.");
  }
  try {
    students = await TeacherVsExam.findOne({
      $and: [{ teacherId: teacherId }, { examId: examId }],
    });
  } catch (err) {
    //console.log(err);
    return res.status(500).json("Something went wrong.");
  }
  //console.log(students);
  if (!students) return res.status(404).json("No student assigned.");
  let studentData = students.studentId;
  //console.log(studentData);
  let studId = [];
  for (let i = 0; i < studentData.length; i++) {
    studId[i] = studentData[i]._id;
  }
  //console.log(studId);
  let checkStatus = null;
  try {
    checkStatus = await StudentExamVsQuestionsWritten.find(
      {
        $and: [
          { studentId: { $in: studId } },
          { examId: examId },
          { checkStatus: false },
        ],
      },
      "studentId checkStatus -_id"
    ).populate("studentId examId");
  } catch (err) {
    //console.log(err);
    return res.status(500).json("Something went wrong.");
  }
  //console.log("check status", checkStatus);
  let data = [];
  for (let i = 0; i < checkStatus.length; i++) {
    let dataObj = {};
    dataObj["examName"] = checkStatus[i].examId.name;
    dataObj["examVariation"] =
      examVariation[checkStatus[i].examId.examVariation];
    dataObj["examType"] = examType[checkStatus[i].examId.examType];
    dataObj["studentName"] = checkStatus[i].studentId.name;
    dataObj["studentId"] = checkStatus[i].studentId._id;
    dataObj["checkStatus"] = checkStatus[i].checkStatus;
    dataObj["totalQuestions"] = questionData.totalQuestions;
    dataObj["totalMarks"] = questionData.totalMarks;
    dataObj["marksPerQuestion"] = questionData.marksPerQuestion;
    data.push(dataObj);
  }
  let count = data.length;
  let paginateData = pagination(count, page);
  let start, end;
  start = (page - 1) * paginateData.perPage;
  end = page * paginateData.perPage;
  //console.log(paginateData);
  //console.log(start);
  //console.log(end);
  let data1 = [];
  if (count > 0) {
    for (let i = start; i < end; i++) {
      if (i == data.length) break;
      data1.push(data[i]);
    }
  }
  return res.status(200).json({ data1, paginateData });
};
const getRecheckStudentData = async (req, res, next) => {
  let page = req.query.page || 1;
  let teacherId = req.user.id;
  //console.log(req.user);
  let examId = req.query.examId;
  examId = new mongoose.Types.ObjectId(examId);
  teacherId = new mongoose.Types.ObjectId(teacherId);
  //console.log(teacherId);
  //console.log(examId);
  let students = [];
  let questionData = null;
  try {
    questionData = await QuestionsWritten.findOne({ examId: examId });
  } catch (err) {
    //console.log(err);
    return res.status(500).json("Something went wrong.");
  }
  try {
    students = await TeacherVsExam.findOne({
      $and: [{ teacherId: teacherId }, { examId: examId }],
    });
  } catch (err) {
    //console.log(err);
    return res.status(500).json("Something went wrong.");
  }
  //console.log(students);
  if (!students) return res.status(404).json("No student assigned.");
  let studentData = students.studentId;
  //console.log(studentData);
  let studId = [];
  for (let i = 0; i < studentData.length; i++) {
    studId[i] = studentData[i]._id;
  }
  //console.log(studId);
  let checkStatus = null;
  try {
    checkStatus = await StudentExamVsQuestionsWritten.find(
      {
        $and: [
          { studentId: { $in: studId } },
          { examId: examId },
          { checkStatus: true },
        ],
      },
      "studentId checkStatus -_id"
    ).populate("studentId examId");
  } catch (err) {
    //console.log(err);
    return res.status(500).json("Something went wrong.");
  }
  //console.log("check status", checkStatus);
  let data = [];
  for (let i = 0; i < checkStatus.length; i++) {
    let dataObj = {};
    dataObj["examName"] = checkStatus[i].examId.name;
    dataObj["examVariation"] =
      examVariation[checkStatus[i].examId.examVariation];
    dataObj["examType"] = examType[checkStatus[i].examId.examType];
    dataObj["studentName"] = checkStatus[i].studentId.name;
    dataObj["studentId"] = checkStatus[i].studentId._id;
    dataObj["checkStatus"] = checkStatus[i].checkStatus;
    dataObj["totalQuestions"] = questionData.totalQuestions;
    dataObj["totalMarks"] = questionData.totalMarks;
    dataObj["marksPerQuestion"] = questionData.marksPerQuestion;
    data.push(dataObj);
  }
  let count = data.length;
  let paginateData = pagination(count, page);
  let start, end;
  start = (page - 1) * paginateData.perPage;
  end = page * paginateData.perPage;
  //console.log(paginateData);
  //console.log(start);
  //console.log(end);
  let data1 = [];
  if (count > 0) {
    for (let i = start; i < end; i++) {
      if (i == data.length) break;
      data1.push(data[i]);
    }
  }
  return res.status(200).json({ data1, paginateData });
};
const checkScriptSingle10 = async (req, res, next) => {
  let questionNo = Number(req.body.questionNo);
  let obtainedMarks = Number(req.body.obtainedMarks);
  let studentId = req.body.studentId;
  let examId = req.body.examId;
  let images = req.body.uploadImages;
  const dirNew = path.resolve(
    path.join(__dirname, "../uploads/answers/" + examId)
  );
  console.log(dirNew);
  if (!fs.existsSync(dirNew)) {
    fs.mkdirSync(dirNew);
  }
  //console.log(req.body.obtainedMarks);
  //console.log(obtainedMarks);
  //console.log(req.body.uploadImages);
  if (
    !ObjectId.isValid(studentId) ||
    !ObjectId.isValid(examId) ||
    questionNo < 0 ||
    obtainedMarks < 0
  ) {
    return res
      .status(404)
      .json("Student Id or Exam Id or question Id is not valid.");
  }
  questionNo = questionNo - 1;
  let uploadImages = [];
  for (let i = 0; i < images.length; i++) {
    const matches = String(images[i]).replace(
      /^data:([A-Za-z-+/]+);base64,/,
      ""
    );

    let fileNameDis =
      String(examId) +
      "-" +
      String(studentId) +
      "_" +
      String(questionNo + 1) +
      "-" +
      String(i + 1) +
      ".jpeg";
    let fileName =
      dirNew +
      "/" +
      String(examId) +
      "-" +
      String(studentId) +
      "_" +
      String(questionNo + 1) +
      "-" +
      String(i + 1) +
      ".jpeg";
    try {
      fs.writeFileSync(fileName, matches, { encoding: "base64" });
    } catch (e) {
      //console.log(e);
      return res.status(500).json(e);
    }
    uploadImages[i] = "uploads/answers/" + examId + "/" + fileNameDis;
  }
  let studentIdObj = new mongoose.Types.ObjectId(studentId);
  let examIdObj = new mongoose.Types.ObjectId(examId);
  let getData = null;
  try {
    getData = await StudentExamVsQuestionsWritten.findOne({
      $and: [{ studentId: studentIdObj }, { examId: examIdObj }],
    });
  } catch (err) {
    return res.status(500).json("Something went wrong.");
  }
  let insertId = getData._id;
  let checkScript = getData.ansewerScriptILink;
  let obtainedMarksArr = [];
  checkScript[questionNo] = uploadImages;
  obtainedMarksArr = getData.obtainedMarks;
  obtainedMarksArr[questionNo] = obtainedMarks;
  let upd = {
    ansewerScriptILink: checkScript,
    obtainedMarks: obtainedMarksArr,
  };
  let doc;
  try {
    doc = await StudentExamVsQuestionsWritten.findByIdAndUpdate(insertId, upd);
  } catch (err) {
    ////console.log(err);
    return res.status(500).json("Something went wrong!");
  }
  return res.status(201).json("Updated Successfully.");
};
const checkScriptSingle = async (req, res, next) => {
  let questionNo = Number(req.body.questionNo);
  let obtainedMarks = Number(req.body.obtainedMarks);
  let studentId = req.body.studentId;
  let examId = req.body.examId;
  let images = req.body.uploadImages;
  const dir = path.resolve(
    path.join(__dirname, "../uploads/answers/" + String(examId) + "/")
  );
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }
  const dir1 = path.resolve(
    path.join(
      __dirname,
      "../uploads/answers/" + String(examId) + "/" + String(studentId) + "/"
    )
  );
  if (!fs.existsSync(dir1)) {
    fs.mkdirSync(dir1);
  }
  //console.log(req.body.obtainedMarks);
  //console.log(obtainedMarks);
  //console.log(req.body.uploadImages);
  if (
    !ObjectId.isValid(studentId) ||
    !ObjectId.isValid(examId) ||
    questionNo < 0 ||
    obtainedMarks < 0
  ) {
    return res
      .status(404)
      .json("Student Id or Exam Id or question Id is not valid.");
  }
  questionNo = questionNo - 1;
  let uploadImages = [];
  for (let i = 0; i < images.length; i++) {
    const matches = String(images[i]).replace(
      /^data:([A-Za-z-+/]+);base64,/,
      ""
    );

    let fileNameDis =
      String(examId) +
      "-" +
      String(studentId) +
      "_" +
      String(questionNo + 1) +
      "-" +
      String(i + 1) +
      ".jpeg";
    let fileName =
      dir1 +
      "/" +
      String(examId) +
      "-" +
      String(studentId) +
      "_" +
      String(questionNo + 1) +
      "-" +
      String(i + 1) +
      ".jpeg";
    try {
      fs.writeFileSync(fileName, matches, { encoding: "base64" });
    } catch (e) {
      //console.log(e);
      return res.status(500).json(e);
    }
    uploadImages[i] =
      "uploads/answers/" +
      String(examId) +
      "/" +
      String(studentId) +
      "/" +
      fileNameDis;
  }
  let studentIdObj = new mongoose.Types.ObjectId(studentId);
  let examIdObj = new mongoose.Types.ObjectId(examId);
  let getData = null;
  try {
    getData = await StudentExamVsQuestionsWritten.findOne({
      $and: [{ studentId: studentIdObj }, { examId: examIdObj }],
    });
  } catch (err) {
    return res.status(500).json("Something went wrong.");
  }
  let insertId = getData._id;
  let checkScript = getData.ansewerScriptILink;
  let obtainedMarksArr = [];
  checkScript[questionNo] = uploadImages;
  obtainedMarksArr = getData.obtainedMarks;
  obtainedMarksArr[questionNo] = obtainedMarks;
  let upd = {
    ansewerScriptILink: checkScript,
    obtainedMarks: obtainedMarksArr,
  };
  let doc;
  try {
    doc = await StudentExamVsQuestionsWritten.findByIdAndUpdate(insertId, upd);
  } catch (err) {
    ////console.log(err);
    return res.status(500).json("Something went wrong!");
  }
  return res.status(201).json("Updated Successfully.");
};
const checkScriptSingle1 = async (req, res, next) => {
  let questionNo = Number(req.body.questionNo);
  let obtainedMarks = Number(req.body.obtainedMarks);
  let studentId = req.body.studentId;
  let examId = req.body.examId;
  let images = req.body.uploadImages;
  //console.log(req.body.obtainedMarks);
  //console.log(obtainedMarks);
  //console.log(req.body.uploadImages);
  if (
    !ObjectId.isValid(studentId) ||
    !ObjectId.isValid(examId) ||
    questionNo < 0 ||
    obtainedMarks < 0
  ) {
    return res
      .status(404)
      .json("Student Id or Exam Id or question Id is not valid.");
  }
  questionNo = questionNo - 1;
  let uploadImages = [];
  for (let i = 0; i < images.length; i++) {
    const matches = String(images[i]).replace(
      /^data:([A-Za-z-+/]+);base64,/,
      ""
    );

    let fileNameDis =
      "UPD_" +
      String(examId) +
      "-" +
      String(studentId) +
      "_" +
      String(questionNo + 1) +
      "-" +
      String(i + 1) +
      ".png";
    let fileName =
      dir +
      "/" +
      String(examId) +
      "-" +
      String(studentId) +
      "_" +
      String(questionNo + 1) +
      "-" +
      String(i + 1) +
      ".png";
    let fileNameUpd =
      dir +
      "/" +
      "UPD_" +
      String(examId) +
      "-" +
      String(studentId) +
      "_" +
      String(questionNo + 1) +
      "-" +
      String(i + 1) +
      ".png";
    let res1 = null;
    try {
      fs.writeFileSync(fileName, matches, { encoding: "base64" });
      res1 = await sharp(fileName).png({ quality: 10 }).toFile(fileNameUpd);
    } catch (e) {
      console.log(e);
      console.log("cccd");
      return res.status(500).json(e);
    }
    if (res1) fs.unlinkSync(fileName);
    uploadImages[i] = "uploads/answers/" + fileNameDis;
  }
  let studentIdObj = new mongoose.Types.ObjectId(studentId);
  let examIdObj = new mongoose.Types.ObjectId(examId);
  let getData = null;
  try {
    getData = await StudentExamVsQuestionsWritten.findOne({
      $and: [{ studentId: studentIdObj }, { examId: examIdObj }],
    });
  } catch (err) {
    return res.status(500).json("Something went wrong.");
  }
  let insertId = getData._id;
  let checkScript = getData.ansewerScriptILink;
  let obtainedMarksArr = [];
  checkScript[questionNo] = uploadImages;
  obtainedMarksArr = getData.obtainedMarks;
  obtainedMarksArr[questionNo] = obtainedMarks;
  let upd = {
    ansewerScriptILink: checkScript,
    obtainedMarks: obtainedMarksArr,
  };
  let doc;
  try {
    doc = await StudentExamVsQuestionsWritten.findByIdAndUpdate(insertId, upd);
  } catch (err) {
    ////console.log(err);
    return res.status(500).json("Something went wrong!");
  }
  return res.status(201).json("Updated Successfully.");
};
const checkStatusUpdate = async (req, res, next) => {
  let studentId = req.body.studentId;
  let examId = req.body.examId;
  let status = JSON.parse(req.body.status);
  if (!ObjectId.isValid(studentId) || !ObjectId.isValid(examId)) {
    return res
      .status(404)
      .json("Student Id or Exam Id or question Id is not valid.");
  }
  let studentIdObj = new mongoose.Types.ObjectId(studentId);
  let examIdObj = new mongoose.Types.ObjectId(examId);
  let getData = null;
  try {
    getData = await StudentExamVsQuestionsWritten.findOne({
      $and: [{ studentId: studentIdObj }, { examId: examIdObj }],
    });
  } catch (err) {
    return res.status(500).json("Something went wrong.");
  }
  let insertId = getData._id;
  let upd = {
    checkStatus: status,
  };
  let doc;
  try {
    doc = await StudentExamVsQuestionsWritten.findByIdAndUpdate(insertId, upd);
  } catch (err) {
    ////console.log(err);
    return res.status(500).json("Something went wrong!");
  }
  return res.status(201).json("Status Change Successfully.");
};
const marksCalculation = async (req, res, next) => {
  let studentId = req.body.studentId;
  let examId = req.body.examId;
  //console.log(req.body);
  if (!ObjectId.isValid(studentId) || !ObjectId.isValid(examId)) {
    return res
      .status(404)
      .json("Student Id or Exam Id or question Id is not valid.");
  }
  let studentIdObj = new mongoose.Types.ObjectId(studentId);
  let examIdObj = new mongoose.Types.ObjectId(examId);
  //console.log(studentIdObj);
  let getData;
  try {
    getData = await StudentExamVsQuestionsWritten.findOne({
      $and: [{ examId: examIdObj }, { studentId: studentIdObj }],
    });
    // getData = await StudentExamVsQuestionsWritten.findById(
    //   "64f5a1dd50c6b7e0c5f3549c"
    // );
  } catch (err) {
    return res.status(500).json("Something went wrong.");
  }
  let totalMarks = 0;
  let marks = getData.obtainedMarks;
  // //console.log(getData);
  // //console.log(marks);
  // //console.log(marks);
  marks.forEach((value) => {
    totalMarks = totalMarks + value;
  });
  // //console.log(totalMarks);
  let insertId = getData._id;
  let upd = {
    totalObtainedMarks: totalMarks,
  };
  let doc;
  try {
    doc = await StudentExamVsQuestionsWritten.findByIdAndUpdate(insertId, upd);
  } catch (err) {
    ////console.log(err);
    return res.status(500).json("Something went wrong!");
  }
  // try {
  //   getData = await StudentExamVsQuestionsWritten.findOne({
  //     $and: [{ examId: examIdObj }, { studentId: studentIdObj }],
  //   });
  // } catch (err) {
  //   ////console.log(err);
  //   return res.status(500).json("Something went wrong!");
  // }
  // //console.log(getData);
  return res.status(201).json("Status Change Successfully.");
};
const getCheckStatus = async (req, res, next) => {
  let studentId = req.body.studentId;
  let examId = req.body.examId;
  if (!ObjectId.isValid(studentId) || !ObjectId.isValid(examId)) {
    return res
      .status(404)
      .json("Student Id or Exam Id or question Id is not valid.");
  }
  let studentIdObj = new mongoose.Types.ObjectId(studentId);
  let examIdObj = new mongoose.Types.ObjectId(examId);
  let getData = null;
  try {
    getData = await StudentExamVsQuestionsWritten.findOne({
      $and: [{ studentId: studentIdObj }, { examId: examIdObj }],
    });
  } catch (err) {
    return res.status(500).json("Something went wrong.");
  }
  let status = getData.checkStatus;
  return res.status(200).json(status);
};
const getWrittenScriptSingle = async (req, res, next) => {
  let studentId = req.query.studentId;
  let examId = req.query.examId;
  if (!ObjectId.isValid(studentId) || !ObjectId.isValid(examId)) {
    return res
      .status(404)
      .json("Student Id or Exam Id or question Id is not valid.");
  }
  let studentIdObj = new mongoose.Types.ObjectId(studentId);
  let examIdObj = new mongoose.Types.ObjectId(examId);
  let getData = null;
  try {
    getData = await StudentExamVsQuestionsWritten.findOne({
      $and: [{ studentId: studentIdObj }, { examId: examIdObj }],
    });
  } catch (err) {
    //console.log(err);
    return res.status(500).json("Something went wrong.");
  }
  // if (getData.checkStatus != true)
  //   return res.status(404).json("Not checked yet.");
  let data = {};
  data["studentId"] = studentId;
  data["answerScript"] = getData.submittedScriptILink;
  data["checkScript"] = getData.ansewerScriptILink;
  data["obtainedMarks"] = getData.obtainedMarks;
  data["totalObtainedMarks"] = getData.totalObtainedMarks;
  data["examId"] = examId;
  data["checkStatus"] = getData.checkStatus;
  data["uploadStatus"] = getData.uploadStatus;
  let getQuestion = null;
  try {
    getQuestion = await QuestionsWritten.findOne({
      examId: examIdObj,
    });
  } catch (err) {
    return res.status(500).json("Something went wrong.");
  }
  data["question"] = getQuestion.questionILink;
  data["totalQuestions"] = getQuestion.totalQuestions;
  data["marksPerQuestion"] = getQuestion.marksPerQuestion;
  data["totalMarks"] = getQuestion.totalMarks;
  //console.log(getQuestion);
  return res.status(200).json(data);
};
const updateRank = async (req, res, next) => {
  let examId = req.body.examId;
  if (!ObjectId.isValid(examId))
    return res.status(404).json("Invalid exam Id.");
  let examIdObj = new mongoose.Types.ObjectId(examId);
  let delData = null;
  try {
    delData = await McqRank.find({ examId: examIdObj });
  } catch (err) {
    //console.log(err);
    return res.status(500).json("1.Something went wrong.");
  }
  if (delData.length > 0) {
    let deleteData = null;
    try {
      deleteData = await McqRank.deleteMany({ examId: examIdObj });
    } catch (err) {
      return res.status(500).json("2.Something went wrong.");
    }
  }
  let ranks = null;
  try {
    ranks = await StudentExamVsQuestionsWritten.find({ examId: examIdObj })
      .select("examId totalObtainedMarks studentId -_id")
      .sort({
        totalObtainedMarks: -1,
      });
  } catch (err) {
    return res.status(500).json("3.Something went wrong.");
  }
  ////console.log("ranks:", ranks);
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
    sav = await McqRank.insertMany(dataIns, { ordered: false });
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
    resultRank = await McqRank.findOne({
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
    getResult = await StudentExamVsQuestionsWritten.findOne({
      $and: [{ examId: examIdObj }, { studentId: studentIdObj }],
    }).populate("examId studentId");
  } catch (err) {
    return res.status(500).json("Problem when get Student Exam info.");
  }
  let dataTime = null;
  try {
    dataTime = await StudentMarksRank.findOne({
      $and: [{ examId: examIdObj }, { studentId: studentIdObj }],
    });
  } catch (err) {
    return res.status(500).json("Something went wrong.");
  }
  let totalStudent = null;
  try {
    totalStudent = await StudentMarksRank.find({ examId: examIdObj }).count();
  } catch (err) {
    return res.status(500).json("Something went wrong.");
  }
  let totalMarksWritten = null;
  try {
    totalMarksWritten = await QuestionsWritten.find({ examId: examIdObj });
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
  data1["totalMarks"] = totalMarksWritten.totalMarks;
  data1["examVariation"] = examType[Number(getResult.examId.examType)];
  data1["examType"] = examVariation[Number(getResult.examId.examVariation)];
  data1["totalObtainedMarks"] = getResult.totalObtainedMarks;
  data1["studExamStartTime"] = moment(dataTime.examStartTime).format("LLL");
  data1["studExamEndTime"] = moment(dataTime.examEndTime).format("LLL");
  data1["studExamTime"] = dataTime.duration;
  return res.status(200).json(data1);
};
const getAllRank = async (req, res, next) => {
  let examId = req.query.examId;
  if (!ObjectId.isValid(examId)) return res.status(200).json("Invalid examId.");
  let examIdObj = new mongoose.Types.ObjectId(examId);
  let resultRank = null;
  try {
    resultRank = await McqRank.find({ examId: examIdObj })
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
    let data1 = {};
    let conData = "*******";
    data1["examName"] = resultRank[i].examId.name;
    data1["studentName"] = resultRank[i].studentId.name;
    data1["mobileNoOrg"] = resultRank[i].studentId.mobileNo;
    data1["mobileNo"] = conData.concat(
      resultRank[i].studentId.mobileNo.slice(7)
    );
    data1["institution"] = resultRank[i].studentId.institution;
    data1["totalObtainedMarks"] = resultRank[i].totalObtainedMarks;
    data1["rank"] = resultRank[i].rank;
    data1["totalStudent"] = resultRank.length;
    data1["totalMarks"] = resultRank[i].examId.totalMarksMcq;
    allData.push(data1);
  }
  return res.status(200).json(allData);
};

//both
const bothGetStudentData = async (req, res, next) => {
  let page = req.query.page || 1;
  let teacherId = req.user.id;
  //console.log(req.user);
  let examId = req.query.examId;
  examId = new mongoose.Types.ObjectId(examId);
  teacherId = new mongoose.Types.ObjectId(teacherId);
  //console.log(teacherId);
  //console.log(examId);
  let students = [];
  let questionData = null;
  try {
    questionData = await BothQuestionsWritten.findOne({ examId: examId });
  } catch (err) {
    //console.log(err);
    return res.status(500).json("Something went wrong.");
  }
  try {
    students = await BothTeacherVsExam.findOne({
      $and: [{ teacherId: teacherId }, { examId: examId }],
    });
  } catch (err) {
    //console.log(err);
    return res.status(500).json("Something went wrong.");
  }
  //console.log(students);
  if (!students) return res.status(404).json("No student assigned.");
  let studentData = students.studentId;
  //console.log(studentData);
  let studId = [];
  for (let i = 0; i < studentData.length; i++) {
    studId[i] = studentData[i]._id;
  }
  //console.log(studId);
  let checkStatus = null;
  try {
    checkStatus = await BothStudentExamVsQuestions.find(
      {
        $and: [
          { studentId: { $in: studId } },
          { examId: examId },
          { checkStatus: false },
        ],
      },
      "studentId checkStatus -_id"
    ).populate("studentId examId");
  } catch (err) {
    //console.log(err);
    return res.status(500).json("Something went wrong.");
  }
  //console.log("check status", checkStatus);
  let data = [];
  for (let i = 0; i < checkStatus.length; i++) {
    let dataObj = {};
    dataObj["examName"] = checkStatus[i].examId.name;
    dataObj["examVariation"] =
      examVariation[checkStatus[i].examId.examVariation];
    dataObj["examType"] = examType[checkStatus[i].examId.examType];
    dataObj["studentName"] = checkStatus[i].studentId.name;
    dataObj["regNo"] = checkStatus[i].studentId.regNo;
    dataObj["studentId"] = checkStatus[i].studentId._id;
    dataObj["checkStatus"] = checkStatus[i].checkStatus;
    dataObj["totalQuestions"] = questionData.totalQuestions;
    dataObj["totalMarks"] = questionData.totalMarks;
    dataObj["marksPerQuestion"] = questionData.marksPerQuestion;
    data.push(dataObj);
  }
  let count = data.length;
  let paginateData = pagination(count, page);
  let start, end;
  start = (page - 1) * paginateData.perPage;
  end = page * paginateData.perPage;
  //console.log(paginateData);
  //console.log(start);
  //console.log(end);
  let data1 = [];
  if (count > 0) {
    for (let i = start; i < end; i++) {
      if (i == data.length) break;
      data1.push(data[i]);
    }
  }
  return res.status(200).json({ data1, paginateData });
};
const bothGetRecheckStudentData = async (req, res, next) => {
  let page = req.query.page || 1;
  let teacherId = req.user.id;
  //console.log(req.user);
  let examId = req.query.examId;
  examId = new mongoose.Types.ObjectId(examId);
  teacherId = new mongoose.Types.ObjectId(teacherId);
  //console.log(teacherId);
  //console.log(examId);
  let students = [];
  let questionData = null;
  try {
    questionData = await BothQuestionsWritten.findOne({ examId: examId });
  } catch (err) {
    //console.log(err);
    return res.status(500).json("Something went wrong.");
  }
  try {
    students = await BothTeacherVsExam.findOne({
      $and: [{ teacherId: teacherId }, { examId: examId }],
    });
  } catch (err) {
    //console.log(err);
    return res.status(500).json("Something went wrong.");
  }
  //console.log(students);
  if (!students) return res.status(404).json("No student assigned.");
  let studentData = students.studentId;
  //console.log(studentData);
  let studId = [];
  for (let i = 0; i < studentData.length; i++) {
    studId[i] = studentData[i]._id;
  }
  //console.log(studId);
  let checkStatus = null;
  try {
    checkStatus = await BothStudentExamVsQuestions.find(
      {
        $and: [
          { studentId: { $in: studId } },
          { examId: examId },
          { checkStatus: true },
        ],
      },
      "studentId checkStatus -_id"
    ).populate("studentId examId");
  } catch (err) {
    //console.log(err);
    return res.status(500).json("Something went wrong.");
  }
  //console.log("check status", checkStatus);
  let data = [];
  for (let i = 0; i < checkStatus.length; i++) {
    let dataObj = {};
    dataObj["examName"] = checkStatus[i].examId.name;
    dataObj["examVariation"] =
      examVariation[checkStatus[i].examId.examVariation];
    dataObj["examType"] = examType[checkStatus[i].examId.examType];
    dataObj["studentName"] = checkStatus[i].studentId.name;
    dataObj["studentId"] = checkStatus[i].studentId._id;
    dataObj["checkStatus"] = checkStatus[i].checkStatus;
    dataObj["totalQuestions"] = questionData.totalQuestions;
    dataObj["totalMarks"] = questionData.totalMarks;
    dataObj["marksPerQuestion"] = questionData.marksPerQuestion;
    data.push(dataObj);
  }
  let count = data.length;
  let paginateData = pagination(count, page);
  let start, end;
  start = (page - 1) * paginateData.perPage;
  end = page * paginateData.perPage;
  //console.log(paginateData);
  //console.log(start);
  //console.log(end);
  let data1 = [];
  if (count > 0) {
    for (let i = start; i < end; i++) {
      if (i == data.length) break;
      data1.push(data[i]);
    }
  }
  return res.status(200).json({ data1, paginateData });
};
const bothCheckScriptSingle10 = async (req, res, next) => {
  let questionNo = Number(req.body.questionNo);
  let obtainedMarks = Number(req.body.obtainedMarks);
  let studentId = req.body.studentId;
  let examId = req.body.examId;
  let images = req.body.uploadImages;
  //console.log(req.body.obtainedMarks);
  //console.log(obtainedMarks);
  //console.log(req.body.uploadImages);
  if (
    !ObjectId.isValid(studentId) ||
    !ObjectId.isValid(examId) ||
    questionNo < 0 ||
    obtainedMarks < 0
  ) {
    return res
      .status(404)
      .json("Student Id or Exam Id or question Id is not valid.");
  }
  questionNo = questionNo - 1;
  let uploadImages = [];
  for (let i = 0; i < images.length; i++) {
    const matches = String(images[i]).replace(
      /^data:([A-Za-z-+/]+);base64,/,
      ""
    );

    let fileNameDis =
      String(examId) +
      "-" +
      String(studentId) +
      "_" +
      String(questionNo + 1) +
      "-" +
      String(i + 1) +
      ".jpeg";
    let fileName =
      dir +
      "/" +
      String(examId) +
      "-" +
      String(studentId) +
      "_" +
      String(questionNo + 1) +
      "-" +
      String(i + 1) +
      ".jpeg";
    try {
      fs.writeFileSync(fileName, matches, { encoding: "base64" });
    } catch (e) {
      //console.log(e);
      return res.status(500).json(e);
    }
    uploadImages[i] = "uploads/answers/" + fileNameDis;
  }
  let studentIdObj = new mongoose.Types.ObjectId(studentId);
  let examIdObj = new mongoose.Types.ObjectId(examId);
  let getData = null;
  try {
    getData = await BothStudentExamVsQuestions.findOne({
      $and: [{ studentId: studentIdObj }, { examId: examIdObj }],
    });
  } catch (err) {
    return res.status(500).json("Something went wrong.");
  }
  let insertId = getData._id;
  let checkScript = getData.ansewerScriptILink;
  let obtainedMarksArr = [];
  checkScript[questionNo] = uploadImages;
  obtainedMarksArr = getData.obtainedMarks;
  obtainedMarksArr[questionNo] = obtainedMarks;
  let upd = {
    ansewerScriptILink: checkScript,
    obtainedMarks: obtainedMarksArr,
  };
  let doc;
  try {
    doc = await BothStudentExamVsQuestions.findByIdAndUpdate(insertId, upd);
  } catch (err) {
    ////console.log(err);
    return res.status(500).json("Something went wrong!");
  }
  return res.status(201).json("Updated Successfully.");
};
const bothCheckScriptSingle = async (req, res, next) => {
  let questionNo = Number(req.body.questionNo);
  let obtainedMarks = Number(req.body.obtainedMarks);
  let studentId = req.body.studentId;
  let examId = req.body.examId;
  let images = req.body.uploadImages;
  const dir = path.resolve(
    path.join(__dirname, "../uploads/answers/" + String(examId) + "/")
  );
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }
  const dir1 = path.resolve(
    path.join(
      __dirname,
      "../uploads/answers/" + String(examId) + "/" + String(studentId) + "/"
    )
  );
  if (!fs.existsSync(dir1)) {
    fs.mkdirSync(dir1);
  }
  //console.log(req.body.obtainedMarks);
  //console.log(obtainedMarks);
  //console.log(req.body.uploadImages);
  if (
    !ObjectId.isValid(studentId) ||
    !ObjectId.isValid(examId) ||
    obtainedMarks < 0
  ) {
    return res
      .status(404)
      .json("Student Id or Exam Id or question Id is not valid.");
  }
  questionNo = questionNo - 1;

  let uploadImages = [];
  for (let i = 0; i < images.length; i++) {
    const matches = String(images[i]).replace(
      /^data:([A-Za-z-+/]+);base64,/,
      ""
    );

    let fileNameDis =
      String(examId) +
      "-" +
      String(studentId) +
      "_" +
      String(questionNo + 1) +
      "-" +
      String(i + 1) +
      ".jpeg";
    let fileName =
      dir1 +
      "/" +
      String(examId) +
      "-" +
      String(studentId) +
      "_" +
      String(questionNo + 1) +
      "-" +
      String(i + 1) +
      ".jpeg";
    try {
      fs.writeFileSync(fileName, matches, { encoding: "base64" });
    } catch (e) {
      //console.log(e);
      return res.status(500).json(e);
    }
    uploadImages[i] =
      "uploads/answers/" +
      String(examId) +
      "/" +
      String(studentId) +
      "/" +
      fileNameDis;
  }
  let studentIdObj = new mongoose.Types.ObjectId(studentId);
  let examIdObj = new mongoose.Types.ObjectId(examId);
  let getData = null;
  try {
    getData = await BothStudentExamVsQuestions.findOne({
      $and: [{ studentId: studentIdObj }, { examId: examIdObj }],
    });
  } catch (err) {
    return res.status(500).json("Something went wrong.");
  }
  let insertId = getData._id;
  let checkScript = getData.ansewerScriptILink;
  let obtainedMarksArr = [];
  checkScript[questionNo] = uploadImages;
  obtainedMarksArr = getData.obtainedMarks;
  obtainedMarksArr[questionNo] = obtainedMarks;
  let upd = {
    ansewerScriptILink: checkScript,
    obtainedMarks: obtainedMarksArr,
  };
  let doc;
  try {
    doc = await BothStudentExamVsQuestions.findByIdAndUpdate(insertId, upd);
  } catch (err) {
    ////console.log(err);
    return res.status(500).json("Something went wrong!");
  }
  return res.status(201).json("Updated Successfully.");
};
const bothMarksCalculation = async (req, res, next) => {
  let studentId = req.body.studentId;
  let examId = req.body.examId;
  //console.log(req.body);
  if (!ObjectId.isValid(studentId) || !ObjectId.isValid(examId)) {
    return res
      .status(404)
      .json("Student Id or Exam Id or question Id is not valid.");
  }
  let studentIdObj = new mongoose.Types.ObjectId(studentId);
  let examIdObj = new mongoose.Types.ObjectId(examId);
  //console.log(studentIdObj);
  let getData;
  try {
    getData = await BothStudentExamVsQuestions.findOne({
      $and: [{ examId: examIdObj }, { studentId: studentIdObj }],
    });
    // getData = await StudentExamVsQuestionsWritten.findById(
    //   "64f5a1dd50c6b7e0c5f3549c"
    // );
  } catch (err) {
    return res.status(500).json("Something went wrong.");
  }
  let totalMarks = 0.0;
  let marks = getData.obtainedMarks;
  // //console.log(getData);
  // //console.log(marks);
  // //console.log(marks);
  marks.forEach((value) => {
    totalMarks = totalMarks + value;
  });
  let totalObtainedMarksWritten = totalMarks;
  totalMarks = totalMarks + getData.totalObtainedMarksMcq;
  // //console.log(totalMarks);
  let insertId = getData._id;
  let upd = {
    totalObtainedMarks: totalMarks,
    totalObtainedMarksWritten: totalObtainedMarksWritten,
    checkStatus: true,
  };
  let doc;
  try {
    doc = await BothStudentExamVsQuestions.findByIdAndUpdate(insertId, upd);
  } catch (err) {
    ////console.log(err);
    return res.status(500).json("Something went wrong!");
  }

  return res.status(201).json("Status Change Successfully.");
};
const bothGetCheckStatus = async (req, res, next) => {
  let studentId = req.body.studentId;
  let examId = req.body.examId;
  if (!ObjectId.isValid(studentId) || !ObjectId.isValid(examId)) {
    return res
      .status(404)
      .json("Student Id or Exam Id or question Id is not valid.");
  }
  let studentIdObj = new mongoose.Types.ObjectId(studentId);
  let examIdObj = new mongoose.Types.ObjectId(examId);
  let getData = null;
  try {
    getData = await BothStudentExamVsQuestions.findOne({
      $and: [{ studentId: studentIdObj }, { examId: examIdObj }],
    });
  } catch (err) {
    return res.status(500).json("Something went wrong.");
  }
  let status = getData.checkStatus;
  return res.status(200).json(status);
};
const bothUpdateRank = async (req, res, next) => {
  let examId = req.body.examId;
  if (!ObjectId.isValid(examId))
    return res.status(404).json("Invalid exam Id.");
  let examIdObj = new mongoose.Types.ObjectId(examId);
  let delData = null;
  try {
    delData = await BothRank.deleteMany({ examId: examIdObj });
  } catch (err) {
    return res.status(500).json("Something went wrong.");
  }
  let ranks = null;
  try {
    ranks = await BothStudentExamVsQuestions.find({
      $and: [{ examId: examIdObj }, { checkStatus: true }],
    });
    // .select("examId totalObtainedMarks studentId -_id")
    // .sort({
    //   totalObtainedMarks: -1,
    // });
  } catch (err) {
    return res.status(500).json("Something went wrong.");
  }

  //   ranks = await BothStudentExamVsQuestions.aggregate([
  //   {
  //     $project: {
  //       examId: "$examId",
  //       studentId: "$studentId",
  //       sum: { $add: ["$totalObtainedMarksMcq", "$totalObtainedMarksWritten"] },
  //     },
  //   },
  //   {
  //     $sort: { sum: -1 },
  //   },
  // ]);

  ranks.forEach(obj => {
    obj.sum = obj.totalObtainedMarksMcq + obj.totalObtainedMarksWritten;
});
  ranks.sort((a, b) => b.sum - a.sum);
  console.log("ranks:", ranks);
  let dataLength = ranks.length;
  let dataIns = [];
  for (let i = 0; i < dataLength; i++) {
    let dataFree = {};
    dataFree["examId"] = ranks[i].examId;
    dataFree["studentId"] = ranks[i].studentId;
    // dataFree["totalObtainedMarks"] = ranks[i].totalObtainedMarks;
    dataFree["totalObtainedMarks"] = ranks[i].sum;
    dataFree["rank"] = i + 1;
    dataIns.push(dataFree);
  }
  ////console.log("dataIns:", dataIns);
  let sav = null;
  try {
    sav = await BothRank.insertMany(dataIns, { ordered: false });
  } catch (err) {
    return res.status(500).json("Something went wrong.");
  }
  return res.status(201).json("Success!");
};
const bothGetAllRank = async (req, res, next) => {
  let examId = req.query.examId;
  if (!ObjectId.isValid(examId)) return res.status(200).json("Invalid examId.");
  let examIdObj = new mongoose.Types.ObjectId(examId);
  let resultRank = null;
  try {
    resultRank = await BothRank.find({ examId: examIdObj })
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
    let data1 = {};
    let conData = "*******";
    data1["examName"] = resultRank[i].examId.name;
    data1["studentName"] = resultRank[i].studentId.name;
    data1["mobileNoOrg"] = resultRank[i].studentId.mobileNo;
    data1["mobileNo"] = conData.concat(
      resultRank[i].studentId.mobileNo.slice(7)
    );
    data1["institution"] = resultRank[i].studentId.institution;
    data1["totalObtainedMarks"] = resultRank[i].totalObtainedMarks;
    data1["rank"] = resultRank[i].rank;
    data1["totalStudent"] = resultRank.length;
    data1["totalMarks"] = resultRank[i].examId.totalMarks;
    allData.push(data1);
  }
  return res.status(200).json(allData);
};
const bothGetWrittenScriptSingle = async (req, res, next) => {
  let studentId = req.query.studentId;
  let examId = req.query.examId;
  if (!ObjectId.isValid(studentId) || !ObjectId.isValid(examId)) {
    return res
      .status(404)
      .json("Student Id or Exam Id or question Id is not valid.");
  }
  let studentIdObj = new mongoose.Types.ObjectId(studentId);
  let examIdObj = new mongoose.Types.ObjectId(examId);
  let getData = null;
  try {
    getData = await BothStudentExamVsQuestions.findOne({
      $and: [{ studentId: studentIdObj }, { examId: examIdObj }],
    });
  } catch (err) {
    //console.log(err);
    return res.status(500).json("Something went wrong.");
  }
  // if (getData.checkStatus != true)
  //   return res.status(404).json("Not checked yet.");
  let data = {};
  data["studentId"] = studentId;
  data["answerScript"] = getData.submittedScriptILink;
  data["checkScript"] = getData.ansewerScriptILink;
  data["obtainedMarks"] = getData.obtainedMarks;
  data["totalObtainedMarks"] = getData.totalObtainedMarks;
  data["examId"] = examId;
  data["checkStatus"] = getData.checkStatus;
  data["uploadStatus"] = getData.uploadStatus;
  let getQuestion = null;
  try {
    getQuestion = await BothQuestionsWritten.findOne({
      examId: examIdObj,
    });
  } catch (err) {
    return res.status(500).json("Something went wrong.");
  }
  data["question"] = getQuestion.questionILink;
  data["totalQuestions"] = getQuestion.totalQuestions;
  data["marksPerQuestion"] = getQuestion.marksPerQuestion;
  data["totalMarks"] = getQuestion.totalMarks;
  //console.log(getQuestion);
  return res.status(200).json(data);
};
exports.bothGetRecheckStudentData = bothGetRecheckStudentData;
exports.bothGetStudentData = bothGetStudentData;
exports.getRecheckStudentData = getRecheckStudentData;
exports.bothGetWrittenScriptSingle = bothGetWrittenScriptSingle;
exports.bothGetAllRank = bothGetAllRank;
exports.bothUpdateRank = bothUpdateRank;
exports.bothGetCheckStatus = bothGetCheckStatus;
exports.bothCheckScriptSingle = bothCheckScriptSingle;
exports.bothMarksCalculation = bothMarksCalculation;
exports.getStudentData = getStudentData;
exports.checkScriptSingle = checkScriptSingle;
exports.checkStatusUpdate = checkStatusUpdate;
exports.getCheckStatus = getCheckStatus;
exports.getWrittenScriptSingle = getWrittenScriptSingle;
exports.marksCalculation = marksCalculation;
exports.updateRank = updateRank;
exports.getRank = getRank;
exports.getAllRank = getAllRank;
