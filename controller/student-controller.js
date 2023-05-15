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
  const regNo = req.query.studentid;
  //regNo=studentid
  let existingStudent;
  try {
    existingStudent = await Student.findById(regNo).select("_id");
  } catch (err) {
    console.log(err);
    return res.status(500).json("Something went wrong!");
  }
  if (!existingStudent) {
    return res.status(404).json({ message: "student not found." });
  } else {
    if (req.body.sscStatus) {
      let flag = false;
      const { name, institution, mobileNo, sscRoll, sscReg } = req.body;
      const stud = new Student({
        name: name,
        mobileNo: mobileNo,
        sscRoll: sscRoll,
        sscReg: sscReg,
        institution: institution,
      });
      try {
        const id = await Student.findOne({ regNo: regNo }).select("_id");
        const doc = await Student.findOneAndUpdate({ id: id }, stud);
        flag = true;
      } catch (err) {
        console.log(err);
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
      const stud = new Student({
        name: name,
        mobileNo: mobileNo,
        hscRoll: hscRoll,
        hscReg: hscReg,
        institution: institution,
      });
      try {
        const id = await Student.findOne({ regNo: regNo }).select("_id");
        const doc = await Student.findOneAndUpdate({ id: id }, stud);
        flag = true;
      } catch (err) {
        console.log(err);
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
      const stud = new Student({
        name: name,
        mobileNo: mobileNo,
        institution: institution,
      });
      try {
        const id = await Student.findOne({ regNo: regNo }).select("_id");
        const doc = await Student.findOneAndUpdate({ id: id }, stud);
        flag = true;
      } catch (err) {
        console.log(err);
        return res.status(500).json("Something went wrong!");
      }
      if (flag) {
        return res
          .status(201)
          .json({ message: "Succesfully updated student information." });
      }
    }
  }
};
//get student ID
const getStudentId = async (req, res, next) => {
  const regNo = req.query.regno;
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
  let eid = req.query.eid;
  let sid = req.query.sid;

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
    req.body.eid = eid;
    req.body.sid = sid;
    next();
  } else {
    if (finishedStatus.finishedStatus == false) {
      req.body.eid = eid;
      req.body.sid = sid;
      req.body.examStartTime = finishedStatus.examStartTime;
      req.body.examEndTime = finishedStatus.examEndTime;
      next();
    } else return res.status(301).json("exam end.");
  }
};
//assign question
const assignQuestion = async (req, res, next) => {
  const eId = req.body.eid;
  const studentId = req.body.sid;
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
  try {
    sId = await Student.findById(studentId).select("_id");
  } catch (err) {
    return res.status(500).json(err);
  }
  console.log(eId);
  try {
    eId1 = await Exam.findById(eId).select("_id");
  } catch (err) {
    return res.status(500).json(err);
  }
  console.log(eId1);

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
  let studentId = req.query.studentid; //get from payload
  let examId = req.query.examid;
  let questionIndexNumber = Number(req.query.questionindex);
  let optionIndexNumber = Number(req.query.optionindex);
  try {
    studentId = await Student.findById(studentId).select("_id");
  } catch (err) {
    console.log(err);
    return res.status(500).json("problem query searchin student id.");
  }
  try {
    examId = await Exam.findById(examId).select("_id");
  } catch (err) {
    console.log(err);
    return res.status(500).json("problem query searchin exam id.");
  }
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
  answered[questionIndexNumber - 1] = String(optionIndexNumber);
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
  const sId = req.query.sid;
  const eId = req.query.eid;
  let eId1, sId1;
  try {
    sId1 = await Student.findById(sId).select("_id");
  } catch (err) {
    return res.status(500).json(err);
  }
  try {
    eId1 = await Exam.findById(eId).select("_id");
  } catch (err) {
    return res.status(500).json(err);
  }
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
  const eId = req.query.eid;
  const sId = req.query.sid;
  const examEndTime = Date(req.query.endtime);
  let eId1, sId1;
  try {
    sId1 = await Student.findById(sId).select("_id");
  } catch (err) {
    return res.status(500).json(err);
  }
  try {
    eId1 = await Exam.findById(eId).select("_id");
  } catch (err) {
    return res.status(500).json(err);
  }
  let findId;
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
  try {
    saveStudentExamEnd = await StudentMarksRank.findByIdAndUpdate(
      findId,
      update
    );
  } catch (err) {
    console.log(err);
    return res.status(500).json(err);
  }
  return res.status(200).json("Answer Submitted Successfully");
};

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
