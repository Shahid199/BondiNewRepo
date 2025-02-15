const Student = require('../model/Student');
const Course = require('../model/Course');
const CourseVsStudent = require('../model/CourseVsStudent');
const jwt = require('jsonwebtoken');
const Exam = require('../model/Exam');
const McqQuestionVsExam = require('../model/McqQuestionVsExam');
const QuestionsMcq = require('../model/QuestionsMcq');
const StudentExamVsQuestionsMcq = require('../model/StudentExamVsQuestionsMcq');
const StudentMarksRank = require('../model/StudentMarksRank');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const fsp = fs.promises;
const mongoose = require('mongoose');
const Subject = require('../model/Subject');
const { fork } = require('child_process');
const ISODate = require('isodate');
const moment = require('moment');
const path = require('path');
const { ObjectId, MongoAPIError } = require('mongodb');
const pagination = require('../utilities/pagination');
const examType = require('../utilities/exam-type');
const examVariation = require('../utilities/exam-variation');
const isodate = require('isodate');
const McqRank = require('../model/McqRank');
//const BothMcqRank = require("../model/BothMcqRank");
const passport = require('passport');
const FreeMcqRank = require('../model/FreeMcqRank');
const StudentExamVsQuestionsWritten = require('../model/StudentExamVsQuestionsWritten');
const QuestionsWritten = require('../model/QuestionsWritten');
const FreeStudentExamVsQuestionsMcq = require('../model/FreeStudentExamVsQuestionsMcq');
const WrittenQuestionVsExam = require('../model/WrittenQuestionVsExam');
const BothStudentExamVsQuestions = require('../model/BothStudentExamVsQuestions');
const BothMcqQuestionVsExam = require('../model/BothMcqQuestionVsExam');
const BothQuestionsWritten = require('../model/BothQuestionsWritten');
const BothExam = require('../model/BothExam');
const BothRank = require('../model/BothRank');
const SpecialRank = require('../model/SpecialRank');
//const SpecialExam = require("../model/SpecialExam");
const SpecialExam = require('../model/SpecialExamNew');
const { options } = require('pdfkit');
const Remark = require('../model/Remark');

//const sharp = require("sharp");

const Limit = 100;

/**
 * login a student to a course
 * @param {Object} req courseId,regNo
 * @returns token
 */

const newLoginStudent = async (req, res) => {
  const { courseId, regNo, password } = req.body;
  const ObjectId = mongoose.Types.ObjectId;
  if (!ObjectId.isValid(courseId))
    return res.status(422).json('Course Id not valid');
  try {
    const getStudent = await Student.findOne({ regNo: regNo }).exec();
    if (!getStudent) {
      return res.status(404).json('Student not found');
    }
    const getCourse = await Course.findById({ _id: courseId }).exec();
    if (!getCourse) {
      return res.status(404).json('Course not found');
    }
    const studentvscourse = await CourseVsStudent.findOne({
      courseId,
      studentId: getStudent._id,
      status: true,
    }).exec();
    if (!studentvscourse) {
      return res.status(404).json('Course not registered for the student ID');
    }
    console.log('chchch', getStudent.password);
    // if all checks passed above now geneate login token
    let match = false;
    bcrypt.compare(password, getStudent.password, function (err, result) {
      // console.log("result:",res);
      if (result === true) {
        // console.log("result:",res);
        const studentIdStr = String(getStudent._id);
        const courseIdStr = String(courseId);
        const token = jwt.sign(
          {
            studentId: studentIdStr,
            courseId: courseIdStr,
            role: 4,
          },
          process.env.SALT,
          { expiresIn: '1d' },
        );

        return res.status(200).json({
          message: 'Student logged into the course',
          token,
          studentIdStr,
          courseIdStr,
        });
      } else {
        return res.status(500).json({ message: 'Password is not matching!' });
      }
    });
  } catch (error) {
    ////console.log(error);
    return res.status(500).json({ message: 'Something went wrong!' });
  }
};

const editStudent = async (req, res, next) => {
  const { name, institution, regNo, curriculumRoll } = req.body;
  // console.log(req.body);
  // console.log(req.file);
  // return res.status(200).json("dhukse");
  let file;
  let displayPicture;
  let studentId = req.user.studentId;
  let data;
  try {
    data = await Student.findById(studentId);
  } catch (error) {
    return res.status(500).json('No student found');
  }
  if (req.file) {
    file = req.file;
    displayPicture = 'profile-pictures/'.concat(file.filename);
  } else {
    displayPicture = data.displayPicture;
  }
  const studentIdObj = new mongoose.Types.ObjectId(data._id);
  const updatedStudent = {
    name,
    institution,
    regNo,
    curriculumRoll,
    displayPicture,
  };
  let updateStatus;
  try {
    updateStatus = await Student.updateOne(
      { _id: studentIdObj },
      updatedStudent,
    );
  } catch (error) {
    return res.status(500).json('Student cannot be found !!');
  }

  return res.status(201).json('updated');
};

const loginStudent = async (req, res) => {
  const { courseId, regNo } = req.body;
  const ObjectId = mongoose.Types.ObjectId;
  if (!ObjectId.isValid(courseId))
    return res.status(422).json('Course Id not valid');
  try {
    const getStudent = await Student.findOne({ regNo: regNo }, '_id').exec();
    if (!getStudent) {
      return res.status(404).json('Student not found');
    }
    const getCourse = await Course.findById({ _id: courseId }).exec();
    if (!getCourse) {
      return res.status(404).json('Course not found');
    }
    const studentvscourse = await CourseVsStudent.findOne({
      courseId,
      studentId: getStudent._id,
      status: true,
    }).exec();
    if (!studentvscourse) {
      return res.status(404).json('Course not registered for the student ID');
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
      { expiresIn: '1d' },
    );

    return res.status(200).json({
      message: 'Student logged into the course',
      token,
      studentIdStr,
      courseIdStr,
    });
  } catch (error) {
    ////console.log(error);
    return res.status(500).json({ message: 'Something went wrong!' });
  }
};

const checkPassword = async (req, res, next) => {
  let studentId = req.user.studentId;
  let password = req.query.password;
  let studentData;
  try {
    studentData = await Student.findById(studentId);
  } catch (error) {
    return res.status(500).jsone('cannot find student');
  }
  bcrypt.compare(password, studentData.password, function (err, result) {
    // console.log("result:",res);
    if (result === true) {
      // console.log("result:",res);
      res.status(200).json({ check: true });
    } else {
      return res.status(200).json({ check: false });
    }
  });
};

const changePassword = async (req, res, next) => {
  const salt = await bcrypt.genSalt(10);
  let studentId;
  if (req.query.studentId) {
    studentId = req.query.studentId;
  } else {
    studentId = req.user.studentId;
  }
  const password = req.body.password;
  let studentData;
  try {
    studentData = await Student.findById(studentId);
  } catch (errror) {
    return res.status(500).json({ message: 'student not found' });
  }
  studentData.password = await bcrypt.hash(password, salt);
  // console.log(studentData.password);
  let doc;
  try {
    doc = await Student.updateOne({ _id: studentData._id }, studentData);
  } catch (error) {
    return res.status(500).json(error);
  }
  return res.status(201).json({ message: 'password updated' });
};

// const logoutStudent = async (req, res, next) => {
//   req.logout();
//   res.redirect("/");
// };
/**
 * validate if the token is valid or retur to login state
 */
const validateToken = async (req, res) => {
  return res.json(req.user);
};
//Create Students
const addStudent = async (req, res, next) => {
  //start file work
  const salt = await bcrypt.genSalt(10);
  const file = req.file;
  let excelFilePath = null;
  if (!file) {
    return res
      .status(404)
      .json('CSV File not uploaded or filename is not valid.');
  }
  excelFilePath = 'uploads/'.concat(file.filename);
  const data1 = await fsp.readFile(excelFilePath, 'utf8');
  const linesExceptFirst = data1.split('\n').slice(1);
  const linesArr = linesExceptFirst.map((line) => line.split(','));
  let students = [];
  let rNo = [];
  let pass = 'bpexam';
  let password;
  try {
    password = await bcrypt.hash(pass, salt);
  } catch (error) {
    return res.status(500).json('error found');
  }
  for (let i = 0; i < linesArr.length; i++) {
    const name = String(linesArr[i][2]).replace(/[-"\r]/g, '');
    let regNo = String(linesArr[i][1]).replace(/[-"\r]/g, '');
    const mobileNo = String(linesArr[i][3]).replace(/[-"\r]/g, '');

    if (
      name == 'undefined' ||
      regNo == 'undefined' ||
      mobileNo == 'undefined'
    ) {
      continue;
    }
    const users = new Student({
      regNo: regNo,
      name: name,
      institution: null,
      mobileNo: mobileNo,
      password,
    });
    // users["regNo"] = regNo;
    // users["name"] = name;
    // users["institution"] = "new";
    // users["mobileNo"] = mobileNo;

    students.push(users);
    rNo.push(regNo);
  }
  ////console.log(students);
  //end file work
  let doc = [],
    doc2 = [],
    doc3 = [],
    doc4 = [];
  try {
    doc = await Student.insertMany(students, { ordered: false });
  } catch (err) {
    ////console.log(err);
  }
  //, { ordered: false }
  try {
    doc2 = await Student.find({ regNo: { $in: rNo } }).select('_id');
  } catch (err) {
    ////console.log(err);
  }
  // {
  // }
  // for (let i = 0; i < doc.insertedDocs.length; i++) {
  //   doc3.push(String(doc.insertedDocs[i]._id));
  // }
  for (let i = 0; i < doc2.length; i++) {
    doc4.push(String(doc2[i]._id));
  }
  ////console.log(students);
  ////console.log(doc4);
  return res.status(201).json(doc4);
};
//update student
const updateStudent1 = async (req, res, next) => {
  const studentId = req.user.studentId;
  const id = new mongoose.Types.ObjectId(studentId);
  if (studentId == null) return res.status(404).json('Student not found.');
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
      return res.status(500).json('Something went wrong!');
    }
    if (flag) {
      return res
        .status(201)
        .json({ message: 'Succesfully updated student information.' });
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
      return res.status(500).json('Something went wrong!');
    }
    if (flag) {
      return res
        .status(201)
        .json({ message: 'Succesfully updated student information.' });
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
      const doc = await Student.findByIdAndUpdate(studentId, stud);
      flag = true;
    } catch (err) {
      return res.status(500).json('Something went wrong!');
    }
    if (flag) {
      return res
        .status(201)
        .json({ message: 'Succesfully updated student information.' });
    }
  }
};

const updateStudent = async (req, res, next) => {
  const studentId = req.user.studentId;
  if (!ObjectId.isValid(studentId))
    return res.status(404).json('Student not found.');
  const id = new mongoose.Types.ObjectId(studentId);
  ////console.log(req.body);
  const { name, institution, mobileNo, sscRoll, sscReg, hscRoll, hscReg } =
    req.body;
  const stud = {
    name: name,
    mobileNo: mobileNo,
    curriculumRoll: sscRoll,
    sscReg: sscReg,
    hscRoll: hscRoll,
    hscReg: hscReg,
    institution: institution,
  };
  let doc = null;
  try {
    doc = await Student.findByIdAndUpdate(studentId, stud);
  } catch (err) {
    return res.status(500).json('Something went wrong!');
  }
  if (doc == null) return res.status(404).json('Data not updated.');
  return res
    .status(201)
    .json({ message: 'Succesfully updated student information.' });
};

//get student ID
const getStudentId = async (req, res, next) => {
  const regNo = req.query.regNo;
  let studentId;
  try {
    studentId = await Student.findOne({ regNo: regNo }).select('_id');
    studentId = studentId._id;
  } catch (err) {
    ////console.log(err);
    return res.status(500).json('Something went wrong!');
  }
  if (!studentId)
    return res.status(404).json({ message: 'Student Not Found.' });
  else {
    return res.status(200).json({ studentId });
  }
};
const getStudenInfoById = async (req, res, next) => {
  let studentId = req.user.studentId;
  console.log(req.user);
  let data = null;
  if (!ObjectId.isValid(studentId))
    return res.status(404).json('Invalid User Id.');
  try {
    data = await Student.findById(studentId);
  } catch (err) {
    return res.status(500).json('Something went wrong.');
  }
  return res.status(200).json(data);
};
//get all student info
const getAllStudent = async (req, res, next) => {
  let students;
  let page = Number(req.query.page) || 1;
  let count = 0;

  if (count == 0) return res.status(404).json('No data found.');
  let paginateData = pagination(count, page);
  try {
    students = await Student.find({})
      .skip(paginateData.skippedIndex)
      .limit(paginateData.perPage);
  } catch (err) {
    ////console.log(err);
    return res.status(500).json('Something went wrong!');
  }
  return res.status(200).json({ students, paginateData });
};

const getStudentByCourseReg = async (req, res, next) => {
  let courseId = req.query.courseId;
  let regNo = req.query.regNo;
  if (!ObjectId.isValid(courseId) || !regNo)
    return res.status(404).json('Invalid Id or reg No.');
  let studentId;
  let courseIdObj = new mongoose.Types.ObjectId(courseId);
  try {
    studentId = await Student.findOne({ regNo: regNo });
  } catch (err) {
    ////console.log(err);
    return res.status(500).json('Something went wrong.');
  }
  studentId = studentId._id;
  if (!ObjectId.isValid(studentId))
    return res.status(404).json('Student Id Invalid.');
  let data1 = null;
  try {
    data1 = await CourseVsStudent.findOne({
      $and: [
        { courseId: courseIdObj },
        { studentId: studentId },
        { status: true },
      ],
    }).populate('studentId');
  } catch (err) {
    ////console.log(err);
    return res.status(500).json('Something went wrong.');
  }
  if (data1 == null)
    return res.status(404).json('Data not found or deactivated student.');
  let data = [];
  data.push(data1);
  //data = data.studentId;
  return res.status(200).json(data);
};

const getStudentRegSearch = async (req, res, next) => {
  let regNo = req.query.regNo;
  if (!regNo) return res.status(404).json('Please insert reg No.');
  let data1 = null;
  try {
    data1 = await Student.find({
      regNo: {
        $regex: new RegExp('.*' + regNo.toLowerCase() + '.*', 'i'),
      },
    });
  } catch (err) {
    ////console.log(err);
    return res.status(500).json('Something went wrong.');
  }
  if (data1 == null)
    return res.status(404).json('Data not found or deactivated student.');
  let data = [];
  data = data1;
  return res.status(200).json(data);
};

const getStudentMobileSearch = async (req, res, next) => {
  let mobileNo = req.query.mobileNo;
  if (!mobileNo) return res.status(404).json('Please insert reg No.');
  let data1 = null;
  try {
    data1 = await Student.find({
      mobileNo: {
        $regex: new RegExp('.*' + mobileNo.toLowerCase() + '.*', 'i'),
      },
    });
  } catch (err) {
    ////console.log(err);
    return res.status(500).json('Something went wrong.');
  }
  if (data1 == null)
    return res.status(404).json('Data not found or deactivated student.');
  let data = [];
  data = data1;
  return res.status(200).json(data);
};

const getStudentNameSearch = async (req, res, next) => {
  let name = req.query.name;
  if (!name) return res.status(404).json('Please insert name.');
  let data1 = null;
  try {
    data1 = await Student.find({
      name: {
        $regex: new RegExp('.*' + name.toLowerCase() + '.*', 'i'),
      },
    });
  } catch (err) {
    ////console.log(err);
    return res.status(500).json('Something went wrong.');
  }
  if (data1 == null)
    return res.status(404).json('Data not found or deactivated student.');
  let data = [];
  data = data1;
  return res.status(200).json(data);
};
//time check for exam
const examTimeCheck = async (req, res, next) => {
  let timerData = null;
  try {
    timerData = await StudentMarksRank.findOne({ examId: examId });
  } catch (err) {
    return res.status(500).json('Something went wrong.');
  }
  examEndTime = query.endTime;
  if (currentDate > timerData.examEndTime) return res.status(200).json('ended');
};
const examCheckMiddleware = async (req, res, next) => {
  const examId = req.query.eId;
  const studentId = req.user.studentId;
  //start:check student already complete the exam or not
  let examIdObj, studentIdObj;
  studentIdObj = new mongoose.Types.ObjectId(studentId);
  examIdObj = new mongoose.Types.ObjectId(examId);
  let status = null;
  let query = null;
  let examEndTime = null;
  let currentDate = moment(new Date());
  //(currentDate, "current Date");
  try {
    query = await Exam.findById(examId, 'endTime');
  } catch (err) {
    return res.status(500).json('Something went wrong.');
  }
  examEndTime = query.endTime;
  if (examEndTime < currentDate) return res.status(200).json('ended');

  try {
    status = await StudentMarksRank.findOne({
      $and: [{ studentId: studentIdObj }, { examId: examIdObj }],
    });
  } catch (err) {
    return res.status(500).json('Something went wrong.');
  }
  if (status == null) return res.status(200).json('assign');
  else {
    if (status.finishedStatus == true) return res.status(200).json('ended');
    else return res.status(200).json('running');
  }
};
//assign question
const assignQuestion1 = async (req, res, next) => {
  //data get from examcheck function req.body
  const eId = req.query.eId;
  const studentId = req.user.studentId;
  //start:check student already complete the exam or not
  let eId1, sId;
  sId = new mongoose.Types.ObjectId(studentId);
  eId1 = new mongoose.Types.ObjectId(eId);

  // let existData = [];
  // try {
  //   existData = await StudentExamVsQuestionsMcq.find({
  //     $and: [{ examId: eId1 }, { studentId: sId }],
  //   });
  // } catch (err) {
  //   return res.status(500).json("10.something went wrong.");
  // }
  // if (existData.length > 0) return res.status(200).json("running");

  let doc = [],
    size,
    min = 0,
    max = 0,
    rand;
  try {
    size = await McqQuestionVsExam.findOne({ eId: eId1 }).populate('mId');
    size = size.mId.length;
    //size = await McqQuestionVsExam.findOne({ eId: eId }).select("sizeMid");
  } catch (err) {
    return res.status(500).json('1.something went wrong.');
  }
  if (!size) return res.status(404).json('No question assigned in the exam.');
  let totalQuesData;
  try {
    totalQuesData = await Exam.findById(eId).select(
      'totalQuestionMcq duration endTime',
    );
  } catch (err) {
    return res.status(500).json('2.something went wrong');
  }
  let examFinishTime = totalQuesData.endTime;
  //start:generating random index of questions
  let totalQues = Number(totalQuesData.totalQuestionMcq);
  ////console.log(totalQues, "totalQues");
  max = size - 1;
  rand = parseInt(Date.now() % totalQues);
  for (let j = rand; j >= 0; j--) doc.push(j);
  for (let j = rand + 1; j < totalQues; j++) doc.push(j);

  // for (let i = 0; ; i++) {
  //   rand = Math.random();
  //   rand = rand * Number(max);
  //   rand = Math.floor(rand);
  //   rand = rand + Number(min);
  //   if (!doc.includes(rand)) {
  //     doc.push(rand);
  //   }
  //   if (doc.length == totalQues) break;
  // }
  ////console.log(doc, "doc");
  //end:generating random index of questions
  let doc1;
  try {
    doc1 = await McqQuestionVsExam.findOne({ eId: eId1 }).populate({
      path: 'mId',
      match: { status: true },
    });
  } catch (err) {
    return res.status(500).json('3.Something went wrong.');
  }
  let statQues = [];
  console.log(doc1, 'doc1');
  for (let i = 0; i < doc1.mId.length; i++) {
    let quesId = String(doc1.mId[i]._id);

    let stat;
    try {
      stat = await QuestionsMcq.findById(quesId).select('status');
      stat = stat.status;
    } catch (err) {
      return res.status(500).json('Something went wrong.');
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
  // //console.log(totalQues,'totalQues')
  ////console.log(resultQuestion, "resultQuestion");
  let questions = [];
  try {
    questions = await QuestionsMcq.find(
      { _id: { $in: resultQuestion } },
      'question type options',
    );
  } catch (err) {
    return res.status(500).json('Something went wrong.');
  }
  // //console.log(questions);
  if (sId == null)
    return res
      .status(404)
      .json('student not found or not permissible for the exam');
  let answered = [];
  for (let i = 0; i < totalQues; i++) {
    answered[i] = '-1';
  }
  let studentExamVsQuestionsMcq = new StudentExamVsQuestionsMcq({
    studentId: sId,
    examId: eId1,
    mcqQuestionId: resultQuestion,
    answeredOption: answered,
  });
  let saveStudentQuestion = null,
    saveStudentExam = null,
    examEndTimeActual = null;
  try {
    examEndTimeActual = await Exam.findById(eId1);
  } catch (err) {
    ////console.log(err);
    return res.status(500).json('4.Something went wrong.');
  }
  let duration = Number(totalQuesData.duration);
  let examStartTime = moment(new Date());
  let examEndTime = moment(examStartTime).add(duration, 'm');
  if (examEndTime > examEndTimeActual.endTime)
    examEndTime = examEndTimeActual.endTime;
  let studentMarksRank = new StudentMarksRank({
    studentId: sId,
    examId: eId1,
    examStartTime: moment(examStartTime).add(6, 'h'),
    runningStatus: true,
    examEndTime: moment(examEndTime).add(6, 'h'),
    duration: (examEndTime - examStartTime) / (1000 * 60),
  });
  try {
    saveStudentQuestion = await studentExamVsQuestionsMcq.save();
  } catch (err) {
    ////console.log(err);
    return res.status(500).json('4.Something went wrong.');
  }
  try {
    saveStudentExam = await studentMarksRank.save();
  } catch (err) {
    return res.status(500).json('5.Something went wrong.');
  }
  questions.push({ studStartTime: examStartTime });
  questions.push({ studEndTime: examEndTime });
  questions.push({ examEndTime: examFinishTime });
  questions.push({ answeredOption: answered });
  if (saveStudentQuestion == null || saveStudentExam == null) {
    return res.status(404).json('Problem occur to assign question.');
  }
  return res.status(201).json(questions);
};
//checked
//checked 2
const assignQuestion2 = async (req, res, next) => {
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
    rand,
    mcqData = [];
  try {
    mcqData = await McqQuestionVsExam.findOne({ eId: eId1 }).populate({
      path: 'mId',
      match: { status: true },
    });
    size = mcqData.mId.length;
  } catch (err) {
    return res.status(500).json('1.something went wrong.');
  }
  if (!size) return res.status(404).json('No question assigned in the exam.');
  let totalQuesData;
  try {
    totalQuesData = await Exam.findById(eId);
  } catch (err) {
    return res.status(500).json('2.something went wrong');
  }
  let examFinishTime = totalQuesData.endTime;
  //start:generating random index of questions
  let totalQues = Number(totalQuesData.totalQuestionMcq);
  //console.log(totalQues, "totalQues");
  max = size - 1;
  rand = parseInt(Date.now() % size);
  //console.log("rand", rand);
  let flag = 0;
  let resultQuestion = [];
  for (let j = rand; j >= 0; j--) {
    if (resultQuestion.length == totalQues) {
      flag = 1;
      break;
    }
    //console.log("j:", j);
    resultQuestion.push(new mongoose.Types.ObjectId(mcqData.mId[j]._id));
  }
  if (flag == 0) {
    for (let j = rand + 1; j < size; j++) {
      if (resultQuestion.length == totalQues) {
        flag = 1;
        break;
      }
      //console.log("j:", j);
      resultQuestion.push(new mongoose.Types.ObjectId(mcqData.mId[j]._id));
    }
  }
  let answered = [];
  for (let i = 0; i < totalQues; i++) {
    answered[i] = '-1';
  }
  let studentExamVsQuestionsMcq = new StudentExamVsQuestionsMcq({
    studentId: sId,
    examId: eId1,
    mcqQuestionId: resultQuestion,
    answeredOption: answered,
  });
  let saveStudentQuestion = null,
    saveStudentExam = null,
    examEndTimeActual = totalQuesData.endTime;
  let duration = Number(totalQuesData.duration);
  let examStartTime = moment(new Date());
  let examEndTime = moment(examStartTime).add(duration, 'm');
  if (examEndTime > examEndTimeActual.endTime)
    examEndTime = examEndTimeActual.endTime;
  let studentMarksRank = new StudentMarksRank({
    studentId: sId,
    examId: eId1,
    examStartTime: moment(examStartTime).add(6, 'h'),
    runningStatus: true,
    examEndTime: moment(examEndTime).add(6, 'h'),
    duration: (examEndTime - examStartTime) / (1000 * 60),
  });
  try {
    saveStudentQuestion = await studentExamVsQuestionsMcq.save();
    saveStudentExam = await studentMarksRank.save();
  } catch (err) {
    ////console.log(err);
    return res.status(500).json('4.Something went wrong.');
  }
  return res.status(201).json('Suceess!!');
};
const assignQuestion4 = async (req, res, next) => {
  //data get from examcheck function req.body
  const eId = req.query.eId;
  const studentId = req.user.studentId;
  //start:check student already complete the exam or not
  let eId1, sId;
  sId = new mongoose.Types.ObjectId(studentId);
  eId1 = new mongoose.Types.ObjectId(eId);
  let exist = null;
  try {
    exist = await StudentExamVsQuestionsMcq.findOne({
      $and: [{ examId: eId1 }, { studentId: sId }],
    });
  } catch (error) {
    console.log(error);
  }
  console.log('exist', exist);
  if (exist) {
    return res.status(200).json('runnning');
  }
  let doc = [],
    size,
    min = 0,
    max = 0,
    rand,
    mcqData = [];
  try {
    mcqData = await McqQuestionVsExam.findOne({ eId: eId1 }).populate({
      path: 'mId',
      match: { status: true },
    });
    size = mcqData.mId.length;
  } catch (err) {
    return res.status(500).json('1.something went wrong.');
  }
  if (!size) return res.status(404).json('No question assigned in the exam.');
  let totalQuesData;
  try {
    totalQuesData = await Exam.findById(eId);
  } catch (err) {
    return res.status(500).json('2.something went wrong');
  }
  let examFinishTime = totalQuesData.endTime;
  //start:generating random index of questions
  let totalQues = Number(totalQuesData.totalQuestionMcq);
  //console.log(totalQues, "totalQues");
  max = size - 1;
  rand = parseInt(Date.now() % size);
  //console.log("rand", rand);
  let flag = 0;
  let resultQuestion = [];
  for (let j = rand; j >= 0; j--) {
    if (resultQuestion.length == totalQues) {
      flag = 1;
      break;
    }
    //console.log("j:", j);
    resultQuestion.push(new mongoose.Types.ObjectId(mcqData.mId[j]._id));
  }
  if (flag == 0) {
    for (let j = rand + 1; j < size; j++) {
      if (resultQuestion.length == totalQues) {
        flag = 1;
        break;
      }
      //console.log("j:", j);
      resultQuestion.push(new mongoose.Types.ObjectId(mcqData.mId[j]._id));
    }
  }
  let answered = [];
  for (let i = 0; i < totalQues; i++) {
    answered[i] = '-1';
  }
  let studentExamVsQuestionsMcq = new StudentExamVsQuestionsMcq({
    studentId: sId,
    examId: eId1,
    mcqQuestionId: resultQuestion,
    answeredOption: answered,
  });
  let saveStudentQuestion = null,
    saveStudentExam = null,
    examEndTimeActual = totalQuesData.endTime;
  let duration = Number(totalQuesData.duration);
  let examStartTime = moment(new Date());
  let examEndTime = moment(examStartTime).add(duration, 'm');
  if (examEndTime > examEndTimeActual.endTime)
    examEndTime = examEndTimeActual.endTime;
  let studentMarksRank = new StudentMarksRank({
    studentId: sId,
    examId: eId1,
    examStartTime: moment(examStartTime).add(6, 'h'),
    runningStatus: true,
    examEndTime: moment(examEndTime).add(6, 'h'),
    duration: (examEndTime - examStartTime) / (1000 * 60),
  });
  try {
    saveStudentQuestion = await studentExamVsQuestionsMcq.save();
    saveStudentExam = await studentMarksRank.save();
  } catch (err) {
    ////console.log(err);
    return res.status(500).json('4.Something went wrong.');
  }
  return res.status(201).json('Suceess!!');
};
const assignQuestion = async (req, res, next) => {
  //data get from examcheck function req.body
  const eId = req.query.eId;
  const studentId = req.user.studentId;
  //start:check student already complete the exam or not
  let eId1, sId;
  sId = new mongoose.Types.ObjectId(studentId);
  eId1 = new mongoose.Types.ObjectId(eId);
  let exist = null;
  let exam = null;
  try {
    exist = await StudentExamVsQuestionsMcq.findOne({
      $and: [{ examId: eId1 }, { studentId: sId }],
    }).populate('examId');
    exam = await Exam.findById(eId);
  } catch (error) {
    console.log(error);
  }
  console.log('exist', exist);
  if (exist) {
    return res.status(200).json('runnning');
  }
  let rand,
    mcqData = [];
  rand = parseInt(Date.now() % Number(exam.numberOfSet));
  try {
    mcqData = await McqQuestionVsExam.findOne({
      $and: [{ eId: eId1 }, { setName: rand }],
    })
      .populate({
        path: 'mId',
        match: { status: true },
      })
      .populate('eId');
  } catch (err) {
    return res.status(500).json(err);
  }
  let answered = [];
  let resultQuestion = [];
  if (Number(exam.totalQuestionMcq) !== mcqData.mId.length)
    return res.status(404).json('data mismatch.');
  for (let i = 0; i < exam.totalQuestionMcq; i++) {
    answered[i] = '-1';
    resultQuestion.push(new mongoose.Types.ObjectId(mcqData.mId[i]));
  }
  let studentExamVsQuestionsMcq = new StudentExamVsQuestionsMcq({
    studentId: sId,
    examId: eId1,
    mcqQuestionId: resultQuestion,
    answeredOption: answered,
  });
  let saveStudentQuestion = null,
    saveStudentExam = null,
    examEndTimeActual = mcqData.eId.endTime;
  let duration = Number(mcqData.eId.duration);
  let examStartTime = moment(new Date());
  let examEndTime = moment(examStartTime).add(duration, 'm');
  if (examEndTime > examEndTimeActual.endTime)
    examEndTime = examEndTimeActual.endTime;
  let studentMarksRank = new StudentMarksRank({
    studentId: sId,
    examId: eId1,
    examStartTime: moment(examStartTime).add(6, 'h'),
    runningStatus: true,
    examEndTime: moment(examEndTime).add(6, 'h'),
    duration: (examEndTime - examStartTime) / (1000 * 60),
  });
  try {
    saveStudentQuestion = await studentExamVsQuestionsMcq.save();
    saveStudentExam = await studentMarksRank.save();
  } catch (err) {
    ////console.log(err);
    return res.status(500).json('4.Something went wrong.');
  }
  return res.status(201).json('Suceess!!');
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
  //exam status Check:start
  let studentCheck = null;
  try {
    studentCheck = await StudentMarksRank.findOne({
      $and: [{ examId: examId }, { studentId: studentId }],
    });
  } catch (err) {
    return res.status(500).json('Something went wrong.');
  }
  if (
    studentCheck.finishedStatus == true ||
    studentCheck.examEndTime <= moment(new Date())
  )
    return res.status(409).json('Exam End.');
  //exam status Check:end
  try {
    result = await StudentExamVsQuestionsMcq.find(
      {
        $and: [{ studentId: studentId }, { examId: examId }],
      },
      '_id answeredOption',
    );
  } catch (err) {
    return res.status(500).json('cant save to db');
  }
  ////console.log(result);
  docId = result[0]._id;
  docId1 = String(docId);
  answered = result[0].answeredOption;
  ////console.log(questionIndexNumber);
  ////console.log(optionIndexNumber);
  // if (answered[questionIndexNumber] != -1)
  //   return res
  //     .status(200)
  //     .json(
  //       "Already rewrite the answer from another device.Please reload the page."
  //     );

  answered[questionIndexNumber] = String(optionIndexNumber);
  try {
    updateAnswer = await StudentExamVsQuestionsMcq.findByIdAndUpdate(docId1, {
      answeredOption: answered,
    });
  } catch (err) {
    return res.status(500).json('DB error!');
  }
  ////console.log(updateAnswer);
  return res.status(201).json('Ok');
};
//get exam ruuning sheet
//getrunningdata api will call after assignquestion api called.
const getRunningData = async (req, res, next) => {
  const sId = req.user.studentId;
  const eId = req.query.eId;
  if (!ObjectId.isValid(sId) || !ObjectId.isValid(eId))
    return res.status(404).json('invalid student ID or exam ID.');
  let eId1, sId1;
  sId1 = new mongoose.Types.ObjectId(sId);
  eId1 = new mongoose.Types.ObjectId(eId);
  //exam status Check:start
  // let studentCheck = null;
  // try {
  //   studentCheck = await StudentMarksRank.findOne({
  //     $and: [{ examId: eId1 }, { studentId: sId1 }],
  //   });
  // } catch (err) {
  //   return res.status(500).json("Something went wrong.");
  // }
  // if (
  //   studentCheck.finishedStatus == true ||
  //   studentCheck.examEndTime <= moment(new Date())
  // )
  //   return res.status(409).json("Exam End.");
  //exam status Check:end
  let getQuestionMcq, getExamData;
  try {
    getQuestionMcq = await StudentExamVsQuestionsMcq.findOne({
      $and: [{ studentId: sId1 }, { examId: eId1 }],
    }).populate('mcqQuestionId');
    getExamData = await StudentMarksRank.findOne(
      { $and: [{ examId: eId1 }, { studentId: sId1 }] },
      'examStartTime examEndTime examId',
    )
      .populate({
        path: 'examId',
        populate: {
          path: 'subjectId',
          select: 'name',
          model: 'Subject',
        },
      })
      .populate({
        path: 'examId',
        populate: {
          path: 'courseId',
          select: 'name',
          model: 'Course',
        },
      });
  } catch (err) {
    return res.status(500).json("can't get question.Problem Occur.");
  }
  let runningResponseLast = [];
  let examData = new Object();
  let questionData = new Object();
  let timeData = new Object();
  for (let i = 0; i < getQuestionMcq.mcqQuestionId.length; i++) {
    let runningResponse = {};
    runningResponse['question'] = getQuestionMcq.mcqQuestionId[i].question;
    runningResponse['options'] = getQuestionMcq.mcqQuestionId[i].options;
    runningResponse['type'] = getQuestionMcq.mcqQuestionId[i].type;
    runningResponse['answeredOption'] = getQuestionMcq.answeredOption[i];
    runningResponse['optionCount'] =
      getQuestionMcq.mcqQuestionId[i].optionCount;
    runningResponseLast.push(runningResponse);
  }
  timeData['examDuration'] = getExamData.examId.duration;
  let examStartTime = getExamData.examStartTime;
  let examEndTime = getExamData.examEndTime;
  timeData['startTime'] = examStartTime;
  timeData['endTine'] = examEndTime;
  questionData = runningResponseLast;
  examData = getExamData.examId;
  return res.status(200).json({ timeData, questionData, examData });
};
//submit answer or end time
// const submitAnswer1 = async (req, res, next) => {
//   const eId = req.query.eId;
//   const sId = req.user.studentId;
//   if (!ObjectId.isValid(eId) || !ObjectId.isValid(sId))
//     return res.status(404).json("Invalid studnet Id or Exam Id");
//   const examEndTime = new Date();
//   let eId1, sId1;
//   sId1 = new mongoose.Types.ObjectId(sId);
//   eId1 = new mongoose.Types.ObjectId(eId);
//   let findId = null;
//   try {
//     findId = await StudentMarksRank.find({
//       $and: [{ examId: eId1 }, { studentId: sId1 }],
//     }).select("_id");
//   } catch (err) {
//     return res
//       .status(500)
//       .json("Proble when get student info from student marks table.");
//   }
//   if (findId == null) return res.status(404).json("data not found.");
//   findId = String(findId[0]._id);
//   let saveStudentExamEnd;
//   let update = {
//     finishedStatus: true,
//     runningStatus: false,
//   };
//   try {
//     saveStudentExamEnd = await StudentMarksRank.findByIdAndUpdate(
//       findId,
//       update
//     );
//   } catch (err) {
//     return res.status(500).json("Problem when updating student marks rank.");
//   }
//   let sIeIObj = await StudentMarksRank.find(
//     { $and: [{ studentId: sId1 }, { examId: eId1 }] },
//     "_id"
//   );
//   sIeIObj = sIeIObj[0]._id;
//   let examData = null;
//   try {
//     examData = await StudentExamVsQuestionsMcq.findOne({
//       $and: [{ examId: eId1 }, { studentId: sId1 }],
//     }).populate("mcqQuestionId examId");
//   } catch (err) {
//     return res.status(500).json("Problem when get exam data.");
//   }
//   let id = String(examData._id);
//   let correctMarks = examData.examId.marksPerMcq;
//   let negativeMarks = examData.examId.negativeMarks;
//   let negativeMarksValue = (correctMarks * negativeMarks) / 100;
//   let examDataMcq = examData.mcqQuestionId;
//   let answered = examData.answeredOption;
//   let notAnswered = 0;
//   let totalCorrectAnswer = 0;
//   let totalWrongAnswer = 0;
//   let totalObtainedMarks = 0;
//   let totalCorrectMarks = 0;
//   let totalWrongMarks = 0;
//   for (let i = 0; i < examDataMcq.length; i++) {
//     if (answered[i] == "-1") {
//       notAnswered = notAnswered + 1;
//     } else if (answered[i] == examDataMcq[i].correctOption) {
//       totalCorrectAnswer = totalCorrectAnswer + 1;
//     } else totalWrongAnswer = totalWrongAnswer + 1;
//   }
//   totalCorrectMarks = totalCorrectAnswer * correctMarks;
//   totalWrongMarks = totalWrongAnswer * negativeMarksValue;
//   totalObtainedMarks = totalCorrectMarks - totalWrongMarks;
//   const update1 = {
//     totalCorrectAnswer: totalCorrectAnswer,
//     totalWrongAnswer: totalWrongAnswer,
//     totalNotAnswered: notAnswered,
//     totalCorrectMarks: totalCorrectMarks,
//     totalWrongMarks: totalWrongMarks,
//     totalObtainedMarks: totalObtainedMarks,
//   };
//   let result = null,
//     getResult = null,
//     sendResult = {},
//     rank = null,
//     //dataRank = null,
//     upd = null,
//     upd1 = null,
//     upd2 = null,
//     //getRank = null;
//   try {
//     result = await StudentExamVsQuestionsMcq.findByIdAndUpdate(id, update1);
//     upd = await StudentMarksRank.updateOne(
//       {
//         $and: [{ examId: eId1 }, { studentId: sId1 }],
//       },
//       { totalObtainedMarks: totalObtainedMarks }
//     );
//   } catch (err) {
//     return res.status(500).json("Problem when update total obtained marks.");
//   }
//   try {
//     getResult = await StudentExamVsQuestionsMcq.findById(id).populate("examId");
//   } catch (err) {
//     return res.status(500).json("Problem when get Student Exam info.");
//   }
//   try {
//     dataRank = await StudentMarksRank.find(
//       { examId: eId1 },
//       "studentId totalObtainedMarks"
//     ).sort({ totalObtainedMarks: -1 });
//   } catch (err) {
//     return res.status(500).json("Problem when get all student of an exam Id.");
//   }
//   let dataRankId = dataRank.map((e) => e._id.toString());
//   rank = dataRankId.findIndex((e) => e == sIeIObj.toString()) + 1;
//   try {
//     upd1 = await StudentMarksRank.findByIdAndUpdate(String(sIeIObj), {
//       rank: rank,
//     });
//   } catch (err) {
//     return res.status(500).json("Problem when update rank.");
//   }
//   try {
//     upd2 = await StudentMarksRank.findById(String(sIeIObj), "rank");
//   } catch (err) {
//     return res.status(500).json("Problem get rank.");
//   }
//   getRank = upd2.rank;
//   sendResult["totalCrrectAnswer"] = getResult.totalCorrectAnswer;
//   sendResult["totalCorrectMarks"] = getResult.totalCorrectMarks;
//   sendResult["totalWrongAnswer"] = getResult.totalWrongAnswer;
//   sendResult["totalWrongMarks"] = getResult.totalWrongMarks;
//   sendResult["totalNotAnswered"] = getResult.totalNotAnswered;
//   sendResult["totalObtained"] = getResult.totalObtainedMarks;
//   sendResult["totalMarksMcq"] = getResult.examId.totalMarksMcq;
//   //sendResult["rank"] = getRank;
//   sendResult["rank"] = -1;
//   //console.log(sendResult);
//   return res.status(200).json(sendResult);
// };

const submitAnswer1 = async (req, res, next) => {
  const eId = req.query.eId;
  const sId = req.user.studentId;
  if (!ObjectId.isValid(eId) || !ObjectId.isValid(sId))
    return res.status(404).json('Invalid studnet Id or Exam Id');
  const examEndTime = moment(new Date());
  let eId1, sId1;
  sId1 = new mongoose.Types.ObjectId(sId);
  eId1 = new mongoose.Types.ObjectId(eId);
  //exam status Check:start
  let studentCheck = null;
  try {
    studentCheck = await StudentMarksRank.findOne(
      {
        $and: [{ examId: eId1 }, { studentId: sId1 }],
      },
      'finishedStatus -_id',
    );
  } catch (err) {
    return res.status(500).json('Something went wrong.');
  }
  if (studentCheck.finishedStatus == true)
    return res.status(409).json('Exam End.');
  //exam status Check:end
  let findId = null;
  let timeStudent = [];
  try {
    findId = await StudentMarksRank.find({
      $and: [{ examId: eId1 }, { studentId: sId1 }],
    }).select('_id examStartTime examEndTime');
  } catch (err) {
    return res
      .status(500)
      .json('Proble when get student info from student marks table.');
  }
  if (findId == null) return res.status(404).json('data not found.');
  findId = String(findId[0]._id);
  timeStudent[0] = findId[0].examStartTime;
  timeStudent[1] = findId[0].examEndTime;
  let saveStudentExamEnd;
  let submitTime = moment(new Date());
  let update = {
    finishedStatus: true,
    runningStatus: false,
    examEndTime: moment(submitTime).add(6, 'h'),
    duration: (moment(submitTime) - moment(timeStudent[0])) / 60000,
  };
  try {
    saveStudentExamEnd = await StudentMarksRank.findByIdAndUpdate(
      findId,
      update,
    );
  } catch (err) {
    return res.status(500).json('Problem when updating student marks rank.');
  }
  let sIeIObj = await StudentMarksRank.find(
    { $and: [{ studentId: sId1 }, { examId: eId1 }] },
    '_id',
  );
  let rankTable = sIeIObj;
  sIeIObj = sIeIObj[0]._id;
  let examData = null;
  try {
    examData = await StudentExamVsQuestionsMcq.findOne({
      $and: [{ examId: eId1 }, { studentId: sId1 }],
    }).populate('mcqQuestionId examId');
  } catch (err) {
    return res.status(500).json('Problem when get exam data.');
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
    if (answered[i] == '-1') {
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
    upd = null,
    //upd1 = null,
    getRank = null;
  try {
    result = await StudentExamVsQuestionsMcq.findByIdAndUpdate(id, update1);
    upd = await StudentMarksRank.updateOne(
      {
        $and: [{ examId: eId1 }, { studentId: sId1 }],
      },
      { totalObtainedMarks: totalObtainedMarks, rank: -1 },
    );
  } catch (err) {
    return res.status(500).json('Problem when update total obtained marks.');
  }
  try {
    getResult = await StudentExamVsQuestionsMcq.findById(id).populate('examId');
  } catch (err) {
    return res.status(500).json('Problem when get Student Exam info.');
  }
  // try {
  //   upd1 = await StudentMarksRank.findByIdAndUpdate(sIeIObj, {
  //     rank: -1,
  //   });
  // } catch (err) {
  //   return res.status(500).json("Problem when update rank.");
  // }

  // sendResult["totalCrrectAnswer"] = getResult.totalCorrectAnswer;
  // sendResult["totalCorrectMarks"] = getResult.totalCorrectMarks;
  // sendResult["totalWrongAnswer"] = getResult.totalWrongAnswer;
  // sendResult["totalWrongMarks"] = getResult.totalWrongMarks;
  // sendResult["totalNotAnswered"] = getResult.totalNotAnswered;
  // sendResult["totalObtained"] = getResult.totalObtainedMarks;
  // sendResult["totalMarksMcq"] = getResult.examId.totalMarksMcq;
  // sendResult["rank"] = -1;
  // //console.log(sendResult);
  let data1 = {};
  data1['examId'] = getResult.examId.name;
  data1['startTime'] = moment(getResult.examId.startTime).format('LLL');
  data1['endTime'] = moment(getResult.examId.endTime).format('LLL');
  data1['totalMarksMcq'] = getResult.examId.totalMarksMcq;
  data1['examVariation'] = examType[Number(getResult.examId.examType)];
  data1['examType'] = examVariation[Number(getResult.examId.examVariation)];
  data1['totalCorrectAnswer'] = getResult.totalCorrectAnswer;
  data1['totalWrongAnswer'] = getResult.totalWrongAnswer;
  data1['totalCorrectMarks'] = getResult.totalCorrectMarks;
  data1['totalWrongMarks'] = getResult.totalWrongMarks;
  data1['totalNotAnswered'] = getResult.totalNotAnswered;
  data1['totalObtainedMarks'] = getResult.totalObtainedMarks;
  data1['rank'] = -1;
  data1['studExamStartTime'] = moment(timeStudent[0]).format('LLL');
  data1['studExamEndTime'] = moment(timeStudent[1]).format('LLL');
  data1['studExamTime'] = rankTable[0].duration;
  //data1["subjectName"] = subjectName;

  return res.status(200).json(data1);
};

const submitAnswer2 = async (req, res, next) => {
  const eId = req.query.eId;
  const sId = req.user.studentId;
  let answeredOptions = req.body.answeredOptions;
  if (!ObjectId.isValid(eId) || !ObjectId.isValid(sId) || !answeredOptions)
    return res.status(404).json('Invalid studnet Id or Exam Id');
  const examEndTime = moment(new Date());
  let eId1, sId1;
  sId1 = new mongoose.Types.ObjectId(sId);
  eId1 = new mongoose.Types.ObjectId(eId);
  //exam status Check:start
  let studentCheck = null;
  let examData = null;
  let time = null;
  try {
    studentCheck = await StudentMarksRank.findOne({
      $and: [{ examId: eId1 }, { studentId: sId1 }],
    });
    examData = await StudentExamVsQuestionsMcq.findOne({
      $and: [{ examId: eId1 }, { studentId: sId1 }],
    }).populate('mcqQuestionId examId');
  } catch (err) {
    return res.status(500).json('1.Something went wrong.');
  }
  let curDate = moment(new Date());
  let flagSt = false;
  if (moment(studentCheck.endTime).isAfter(curDate)) {
    flagSt = true;
  }
  if (studentCheck.finishedStatus == true)
    return res.status(409).json('Exam End.');

  //exam status Check:end
  let timeStudent = [];
  let findId = studentCheck;
  if (findId == null) return res.status(404).json('data not found.');
  findId = String(findId._id);
  timeStudent[0] = findId.examStartTime;
  timeStudent[1] = findId.examEndTime;
  let submitTime = moment(new Date());
  let id = String(examData._id);
  let correctMarks = examData.examId.marksPerMcq;
  let negativeMarks = examData.examId.negativeMarks;
  let negativeMarksValue = (correctMarks * negativeMarks) / 100;
  let examDataMcq = examData.mcqQuestionId;
  let notAnswered = 0;
  let totalCorrectAnswer = 0;
  let totalWrongAnswer = 0;
  let totalObtainedMarks = 0;
  let totalCorrectMarks = 0;
  let totalWrongMarks = 0;
  for (let i = 0; i < examDataMcq.length; i++) {
    if (answeredOptions[i] == '-1') {
      notAnswered = notAnswered + 1;
    } else if (answeredOptions[i] == examDataMcq[i].correctOption) {
      totalCorrectAnswer = totalCorrectAnswer + 1;
    } else totalWrongAnswer = totalWrongAnswer + 1;
  }
  totalCorrectMarks = totalCorrectAnswer * correctMarks;
  totalWrongMarks = totalWrongAnswer * negativeMarksValue;
  totalObtainedMarks = totalCorrectMarks - totalWrongMarks;
  let update1;
  let result = null,
    saveStudentExamEnd = null;
  let update;
  if (flagSt == true) {
    update1 = {
      totalCorrectAnswer: totalCorrectAnswer,
      totalWrongAnswer: totalWrongAnswer,
      totalNotAnswered: notAnswered,
      totalCorrectMarks: totalCorrectMarks,
      totalWrongMarks: totalWrongMarks,
      totalObtainedMarks: totalObtainedMarks,
      answeredOption: answeredOptions,
    };
    update = {
      finishedStatus: true,
      runningStatus: false,
      examEndTime: moment(submitTime).add(6, 'h'),
      duration: (moment(submitTime) - moment(timeStudent[0])) / 60000,
      totalObtainedMarks: totalObtainedMarks,
      rank: -1,
    };
    // } else {
    //   for (let i = 0; i < answeredOptions.length; i++) {
    //     answeredOptions[i] = "-1";
    //   }
    //   update1 = {
    //     totalCorrectAnswer: 0,
    //     totalWrongAnswer: answeredOptions.length,
    //     totalNotAnswered: 0,
    //     totalCorrectMarks: 0,
    //     totalWrongMarks: (
    //       examData.examId.totalMarksMcq * negativeMarksValue
    //     ).toFixed(2),
    //     totalObtainedMarks: (
    //       examData.examId.totalMarksMcq *
    //       negativeMarksValue *
    //       -1
    //     ).toFixed(2),
    //     answeredOption: answeredOptions,
    //   };
    //   update = {
    //     finishedStatus: true,
    //     runningStatus: false,
    //     examEndTime: moment(curDate).add(6, "h"),
    //     duration: 0,
    //     totalObtainedMarks: (
    //       examData.examId.totalMarksMcq *
    //       negativeMarksValue *
    //       -1
    //     ).toFixed(2),
    //     rank: -1,
    //   };
    // }
    try {
      saveStudentExamEnd = await StudentMarksRank.findByIdAndUpdate(
        findId,
        update,
      );
      result = await StudentExamVsQuestionsMcq.findByIdAndUpdate(id, update1);
    } catch (err) {
      return res.status(500).json('3.Something went wrong.');
    }
    return res.status(200).json('Successfully Submitted!!');
  }
};

// const submitAnswer = async (req, res, next) => {
//   const eId = req.query.eId;
//   const sId = req.user.studentId;
//   let answeredOptions = req.body.answeredOptions;
//   if (!ObjectId.isValid(eId) || !ObjectId.isValid(sId) || !answeredOptions)
//     return res.status(404).json("Invalid studnet Id or Exam Id");
//   const examEndTime = moment(new Date());
//   let eId1, sId1;
//   sId1 = new mongoose.Types.ObjectId(sId);
//   eId1 = new mongoose.Types.ObjectId(eId);
//   //exam status Check:start
//   let studentCheck = null;
//   let examData = null;
//   let time = null;
//   try {
//     studentCheck = await StudentMarksRank.findOne({
//       $and: [{ examId: eId1 }, { studentId: sId1 }],
//     });
//     // console.log(studentCheck);
//     examData = await StudentExamVsQuestionsMcq.findOne({
//       $and: [{ examId: eId1 }, { studentId: sId1 }],
//     }).populate("mcqQuestionId examId");
//   } catch (err) {
//     return res.status(500).json("1.Something went wrong.");
//   }
//   let curDate = moment(new Date()).add(3, "m");
//   let flagSt = false;
//   let studEndTime = moment(studentCheck.examEndTime).subtract(6, "h");
//   console.log("StudentEndTime Curdate");
//   console.log(studEndTime, curDate);
//   if (studEndTime.valueOf() > curDate.valueOf()) {
//     flagSt = true;
//   }
//   if (studentCheck.finishedStatus == true)
//     return res.status(409).json("Exam End.");

//   //exam status Check:e
//   let timeStudent = [];
//   let findId = studentCheck;
//   if (findId == null) return res.status(404).json("data not found.");
//   findId = String(findId._id);
//   timeStudent[0] = findId.examStartTime;
//   timeStudent[1] = findId.examEndTime;
//   let submitTime = moment(new Date());
//   let id = String(examData._id);
//   let correctMarks = examData.examId.marksPerMcq;
//   let negativeMarks = examData.examId.negativeMarks;
//   let negativeMarksValue = (correctMarks * negativeMarks) / 100;
//   let examDataMcq = examData.mcqQuestionId;
//   let notAnswered = 0;
//   let totalCorrectAnswer = 0;
//   let totalWrongAnswer = 0;
//   let totalObtainedMarks = 0;
//   let totalCorrectMarks = 0;
//   let totalWrongMarks = 0;
//   for (let i = 0; i < examDataMcq.length; i++) {
//     if (answeredOptions[i] == "-1") {
//       notAnswered = notAnswered + 1;
//     } else if (answeredOptions[i] == examDataMcq[i].correctOption) {
//       totalCorrectAnswer = totalCorrectAnswer + 1;
//     } else totalWrongAnswer = totalWrongAnswer + 1;
//   }
//   totalCorrectMarks = totalCorrectAnswer * correctMarks;
//   totalWrongMarks = totalWrongAnswer * negativeMarksValue;
//   totalObtainedMarks = totalCorrectMarks - totalWrongMarks;
//   let update1;
//   let result = null,
//     saveStudentExamEnd = null;
//   let update;
//   if (flagSt == true) {
//     update1 = {
//       totalCorrectAnswer: totalCorrectAnswer,
//       totalWrongAnswer: totalWrongAnswer,
//       totalNotAnswered: notAnswered,
//       totalCorrectMarks: totalCorrectMarks,
//       totalWrongMarks: totalWrongMarks,
//       totalObtainedMarks: totalObtainedMarks,
//       answeredOption: answeredOptions,
//     };
//     let x = moment(submitTime);
//     // console.log("submit time", x);
//     update = {
//       finishedStatus: true,
//       runningStatus: false,
//       examEndTime: moment(submitTime).add(6, "h"),
//       duration: (moment(submitTime) - moment(timeStudent[0])) / 60000,
//       totalObtainedMarks: totalObtainedMarks,
//       rank: -1,
//     };
//   } else {
//     let answerArray = [];
//     for (let i = 0; i < examData.examId.totalQuestionMcq; i++) {
//       answerArray[i] = "-1";
//     }
//     update1 = {
//       totalCorrectAnswer: 0,
//       totalWrongAnswer: 0,
//       totalNotAnswered: 0,
//       totalCorrectMarks: 0,
//       totalWrongMarks: 5000,
//       totalObtainedMarks: -5000,
//       answeredOption: answerArray,
//     };
//     update = {
//       finishedStatus: true,
//       runningStatus: false,
//       examEndTime: moment(submitTime).add(6, "h"),
//       duration: 0,
//       totalObtainedMarks: -5000,
//       rank: -1,
//     };
//   }
//   try {
//     saveStudentExamEnd = await StudentMarksRank.findByIdAndUpdate(
//       findId,
//       update
//     );
//     result = await StudentExamVsQuestionsMcq.findByIdAndUpdate(id, update1);
//     // console.log(update, update1, flagSt);
//   } catch (err) {
//     return res.status(500).json("3.Something went wrong.");
//   }
//   if (flagSt == false) return res.status(201).json("late submission.");
//   return res.status(200).json("Successfully Submitted!!");
// };

const submitAnswer = async (req, res, next) => {
  const eId = req.query.eId;
  const sId = req.user.studentId;
  let answeredOptions = req.body.answeredOptions;
  if (!ObjectId.isValid(eId) || !ObjectId.isValid(sId) || !answeredOptions)
    return res.status(404).json('Invalid studnet Id or Exam Id');
  const examEndTime = moment(new Date());
  let eId1, sId1;
  sId1 = new mongoose.Types.ObjectId(sId);
  eId1 = new mongoose.Types.ObjectId(eId);
  //exam status Check:start
  let studentCheck = null;
  let examData = null;
  let time = null;
  try {
    studentCheck = await StudentMarksRank.findOne({
      $and: [{ examId: eId1 }, { studentId: sId1 }],
    });
    // console.log(studentCheck);
    examData = await StudentExamVsQuestionsMcq.findOne({
      $and: [{ examId: eId1 }, { studentId: sId1 }],
    }).populate('mcqQuestionId examId');
  } catch (err) {
    return res.status(500).json('1.Something went wrong.');
  }
  let curDate = moment(studentCheck.examEndTime).subtract(6, 'h');
  curDate = moment(curDate).add(180, 's');
  let flagSt = true;
  let curTime = moment(new Date());
  let studEndTime = moment(studentCheck.examEndTime).subtract(6, 'h');
  console.log('StudentEndTime Curdate');
  console.log(studEndTime, curDate);
  console.log(studEndTime.valueOf(), ':studEndTime.valueOf()');
  console.log(curDate.valueOf(), ':curDate.valueOf()');
  console.log(
    studEndTime.valueOf() > curDate.valueOf(),
    'studEndTime.valueOf() > curDate.valueOf()',
  );
  if (curTime.valueOf() > curDate.valueOf()) {
    flagSt = false;
    console.log('check timer');
  }
  console.log('flagSt', flagSt);
  if (studentCheck.finishedStatus == true)
    return res.status(409).json('Exam End.');

  //exam status Check:e
  let timeStudent = [];
  let findId = studentCheck;
  if (findId == null) return res.status(404).json('data not found.');
  findId = String(findId._id);
  timeStudent[0] = findId.examStartTime;
  timeStudent[1] = findId.examEndTime;
  let submitTime = moment(new Date());
  let id = String(examData._id);
  let correctMarks = examData.examId.marksPerMcq;
  let negativeMarks = examData.examId.negativeMarks;
  let negativeMarksValue = (correctMarks * negativeMarks) / 100;
  let examDataMcq = examData.mcqQuestionId;
  let notAnswered = 0;
  let totalCorrectAnswer = 0;
  let totalWrongAnswer = 0;
  let totalObtainedMarks = 0;
  let totalCorrectMarks = 0;
  let totalWrongMarks = 0;
  for (let i = 0; i < examDataMcq.length; i++) {
    if (answeredOptions[i] == '-1') {
      notAnswered = notAnswered + 1;
    } else if (answeredOptions[i] == examDataMcq[i].correctOption) {
      totalCorrectAnswer = totalCorrectAnswer + 1;
    } else totalWrongAnswer = totalWrongAnswer + 1;
  }
  totalCorrectMarks = totalCorrectAnswer * correctMarks;
  totalWrongMarks = totalWrongAnswer * negativeMarksValue;
  totalObtainedMarks = totalCorrectMarks - totalWrongMarks;
  let update1;
  let result = null,
    saveStudentExamEnd = null;
  let update;
  if (flagSt == true) {
    update1 = {
      totalCorrectAnswer: totalCorrectAnswer,
      totalWrongAnswer: totalWrongAnswer,
      totalNotAnswered: notAnswered,
      totalCorrectMarks: totalCorrectMarks,
      totalWrongMarks: totalWrongMarks,
      totalObtainedMarks: totalObtainedMarks,
      answeredOption: answeredOptions,
    };
    let x = moment(submitTime);
    // console.log("submit time", x);
    update = {
      finishedStatus: true,
      runningStatus: false,
      examEndTime: moment(submitTime).add(6, 'h'),
      duration: (moment(submitTime) - moment(timeStudent[0])) / 60000,
      totalObtainedMarks: totalObtainedMarks,
      rank: -1,
    };
  } else {
    let answerArray = [];
    for (let i = 0; i < examData.examId.totalQuestionMcq; i++) {
      answerArray[i] = '-1';
    }
    update1 = {
      totalCorrectAnswer: 0,
      totalWrongAnswer: 0,
      totalNotAnswered: 0,
      totalCorrectMarks: 0,
      totalWrongMarks: -5000,
      totalObtainedMarks: -5000,
      answeredOption: answerArray,
    };
    update = {
      finishedStatus: true,
      runningStatus: false,
      examEndTime: moment(submitTime).add(6, 'h'),
      duration: 0,
      totalObtainedMarks: -5000,
      rank: -1,
    };
  }
  try {
    saveStudentExamEnd = await StudentMarksRank.findByIdAndUpdate(
      findId,
      update,
    );
    result = await StudentExamVsQuestionsMcq.findByIdAndUpdate(id, update1);
    // console.log(update, update1, flagSt);
  } catch (err) {
    return res.status(500).json('3.Something went wrong.');
  }
  if (flagSt == false) return res.status(201).json('Late Submision.');
  return res.status(200).json('Successfully Submitted!!');
};

// const setAllRank = async (req, res, next) => {
//   let examId = req.query.examId;
//   if (!ObjectId.isValid(examId)) return res.status(404).json("Invalid Id.");
//   let
// };

//student can view the following info

const viewSollution = async (req, res, next) => {
  ////console.log(req.query);
  const studentId = req.user.studentId;
  const examId = req.query.examId;
  if (!ObjectId.isValid(studentId) || !ObjectId.isValid(examId))
    return res.status(404).json('student Id or examId is not valid.');
  let studentIdObj = new mongoose.Types.ObjectId(studentId);
  let examIdObj = new mongoose.Types.ObjectId(examId);
  ////console.log(studentIdObj, examIdObj);
  let data = null;
  try {
    data = await StudentExamVsQuestionsMcq.find({
      $and: [{ studentId: studentIdObj }, { examId: examIdObj }],
    }).populate('mcqQuestionId');
  } catch (err) {
    return res.status(500).json('1.Something went wrong.');
  }
  if (data == null)
    return res.status(404).json('No exam found under this student.');
  let resultData = [];
  for (let i = 0; i < data[0].mcqQuestionId.length; i++) {
    let data1 = {};
    data1['id'] = data[0].mcqQuestionId[i]._id;
    data1['question'] = data[0].mcqQuestionId[i].question;
    data1['options'] = data[0].mcqQuestionId[i].options;
    data1['correctOptions'] = String(data[0].mcqQuestionId[i].correctOption);
    data1['explanationILink'] = data[0].mcqQuestionId[i].explanationILink;
    data1['type'] = data[0].mcqQuestionId[i].type;
    data1['answeredOption'] = data[0].answeredOption[i];
    data1['optionCount'] = data[0].mcqQuestionId[i].optionCount;
    resultData.push(data1);
  }
  return res.status(200).json(resultData);
};

// const historyData1 = async (req, res, next) => {
//   const studentId = req.user.studentId;
//   if (!ObjectId.isValid(studentId))
//     return res.status(404).json("Student ID not valid.");
//   let page = req.query.page || 1;

//   let studentIdObj = new mongoose.Types.ObjectId(studentId);
//   let data;
//   let count = 0;
//   try {
//     count = await StudentExamVsQuestionsMcq.find({
//       studentId: studentIdObj,
//     }).count();
//   } catch (err) {
//     return res.status(500).json("Something went wrong.");
//   }
//   //return res.status(200).json(count);
//   //console.log(count);
//   if (count == 0) return res.status(404).json("1.No data found.");
//   let paginateData = pagination(count, page);
//   try {
//     data = await StudentExamVsQuestionsMcq.find({
//       studentId: studentIdObj,
//     })
//       .populate("examId")
//       .skip(paginateData.skippedIndex)
//       .limit(paginateData.perPage);
//   } catch (err) {
//     return res.status(500).json("1.SOmething went wrong.");
//   }
//   if (data == null)
//     return res.status(404).json("No exam data found for the student.");
//   let resultData = [];
//   let flag = false;
//   //console.log(data.length);
//   for (let i = 0; i < data.length; i++) {
//     let data1 = {};
//     let rank = null;
//     let examIdObj = new mongoose.Types.ObjectId(data[i].examId._id);
//     //console.log(examIdObj);
//     //console.log(studentIdObj);
//     try {
//       rank = await StudentMarksRank.findOne(
//         {
//           $and: [
//             { studentId: studentIdObj },
//             { examId: examIdObj },
//             { finishedStatus: true },
//           ],
//         },
//         "rank totalObtainedMarks examStartTime examEndtime"
//       );
//     } catch (err) {
//       return res.status(500).json("2.Something went wrong.");
//     }
//     if (rank == null) continue;

//     //return res.status(404).json("No exam data found for the student.");
//     let subjectIdObj = String(data[i].examId.subjectId);
//     let subjectName = null;
//     try {
//       subjectName = await Subject.findById(subjectIdObj).select("name");
//     } catch (err) {
//       return res.status(500).json("3.Something went wrong.");
//     }
//     subjectName = subjectName.name;
//     data1["examId"] = data[i].examId._id;
//     data1["title"] = data[i].examId.name;
//     data1["type"] = examType[Number(data[i].examId.examType)];
//     data1["variation"] = examVariation[Number(data[i].examId.examVariation)];
//     data1["totalMarksMcq"] = data[i].examId.totalMarksMcq;
//     data1["totalObtainedMarks"] = rank.totalObtainedMarks;
//     data1["meritPosition"] = rank.rank;
//     data1["examStartTime"] = moment(rank.examStartTime).format("LLL");
//     data1["examEndTime"] = moment(rank.examEndTime).format("LLL");
//     data1["subjectName"] = subjectName;
//     resultData.push(data1);
//   }
//   return res.status(200).json({ resultData, paginateData });
// };

const historyData = async (req, res, next) => {
  const studentId = req.user.studentId;
  if (!ObjectId.isValid(studentId))
    return res.status(404).json('Student ID not valid.');
  let page = req.query.page || 1;

  let studentIdObj = new mongoose.Types.ObjectId(studentId);
  let courseId = new mongoose.Types.ObjectId(req.query.courseId);
  let data;
  let count = 0;
  try {
    count = await StudentExamVsQuestionsMcq.find({
      studentId: studentIdObj,
    }).count();
  } catch (err) {
    return res.status(500).json('Something went wrong.');
  }
  //return res.status(200).json(count);
  ////console.log(count);
  if (count == 0) return res.status(200).json('1.No data found.');
  let paginateData = pagination(count, page);
  try {
    data = await StudentExamVsQuestionsMcq.find({
      studentId: studentIdObj,
    })
      .populate('examId')
      .skip(paginateData.skippedIndex)
      .limit(paginateData.perPage);
  } catch (err) {
    return res.status(500).json('1.SOmething went wrong.');
  }
  if (data.length === 0)
    return res.status(404).json('No exam data found for the student.');
  let resultData = [];
  let flag = false;
  ////console.log(data.length);
  for (let i = 0; i < data.length; i++) {
    let data1 = {};
    let rank = null;
    let totalStudent = 0;
    let examIdObj = new mongoose.Types.ObjectId(data[i].examId);
    ////console.log(examIdObj);
    ////console.log(studentIdObj);
    try {
      rank = await StudentMarksRank.findOne(
        {
          $and: [
            { studentId: studentIdObj },
            { examId: examIdObj },
            { finishedStatus: true },
          ],
        },
        'totalObtainedMarks examStartTime examEndTime',
      );
      totalStudent = await StudentMarksRank.findOne({
        $and: [{ examId: examIdObj }, { finishedStatus: true }],
      }).count();
    } catch (err) {
      return res.status(500).json('2.Something went wrong.');
    }

    //get rank
    if (rank == null) continue;
    let resultRank = null;
    try {
      resultRank = await McqRank.findOne({
        $and: [{ examId: examIdObj }, { studentId: studentIdObj }],
      }).select('rank -_id');
    } catch (err) {
      return res.status(500).json('Something went wrong.');
    }
    //resultRank = resultRank.rank;
    ////console.log(resultRank);
    if (resultRank == null) resultRank = '-1';
    else resultRank = resultRank.rank;

    //return res.status(404).json("No exam data found for the student.");
    let subjectIdObj = String(data[i].examId.subjectId);
    let subjectName = null;
    try {
      subjectName = await Subject.findById(subjectIdObj).select('name');
    } catch (err) {
      return res.status(500).json('3.Something went wrong.');
    }
    subjectName = subjectName.name;
    if (String(data[i].examId.courseId) === String(courseId)) {
      data1['examId'] = data[i].examId._id;
      data1['title'] = data[i].examId.name;
      data1['solutionSheet'] = data[i].examId.solutionSheet;
      data1['variation'] = examType[Number(data[i].examId.examType)];
      data1['type'] = examVariation[Number(data[i].examId.examVariation)];
      data1['totalMarksMcq'] = data[i].examId.totalMarksMcq;
      data1['totalObtainedMarks'] = rank.totalObtainedMarks.toFixed(2);
      data1['meritPosition'] = resultRank;
      data1['examStartTime'] = moment(rank.examStartTime)
        .subtract(6, 'h')
        .format('YYYY-MM-DD hh:mm:ss A');
      data1['examEndTime'] = moment(rank.examEndTime)
        .subtract(6, 'h')
        .format('YYYY-MM-DD hh:mm:ss A');
      data1['subjectName'] = subjectName;
      data1['totalStudent'] = totalStudent;
      data1['numberOfRetakes'] = data[i].examId.numberOfRetakes;
      resultData.push(data1);
    }
  }
  return res.status(200).json({ resultData, paginateData });
};

const historyData1 = async (req, res, next) => {
  const studentId = req.user.studentId;
  const courseId = req.query.studentId;
  if (!ObjectId.isValid(studentId) || !ObjectId.isValid(courseId))
    return res.status(404).json('Student ID or Course ID not valid.');
  let page = req.query.page || 1;

  let studentIdObj = new mongoose.Types.ObjectId(studentId);
  let data = [];
  try {
    data = await StudentExamVsQuestionsMcq.find({
      studentId: studentIdObj,
    }).populate('examId');
  } catch (err) {
    return res.status(500).json('1.SOmething went wrong.');
  }
  if (data.length == 0)
    return res.status(404).json('No exam data found for the studen.');
  let resultData = [];
  let flag = false;
  ////console.log(data.length);
  for (let i = 0; i < data.length; i++) {
    let data1 = {};
    let rank = null;
    let examIdObj = new mongoose.Types.ObjectId(data[i].examId._id);
    ////console.log(examIdObj);
    ////console.log(studentIdObj);
    if (String(courseId) != data[i].examId.courseId) continue;
    try {
      rank = await StudentMarksRank.findOne(
        {
          $and: [
            { studentId: studentIdObj },
            { examId: examIdObj },
            { finishedStatus: true },
          ],
        },
        'totalObtainedMarks examStartTime examEndtime',
      );
    } catch (err) {
      return res.status(500).json('2.Something went wrong.');
    }

    //get rank
    if (rank == null) continue;
    let resultRank = null;
    try {
      resultRank = await McqRank.findOne({
        $and: [{ examId: examIdObj }, { studentId: studentIdObj }],
      }).select('rank -_id');
    } catch (err) {
      return res.status(500).json('Something went wrong.');
    }
    //resultRank = resultRank.rank;
    ////console.log(resultRank);
    if (resultRank == null) resultRank = '-1';
    else resultRank = resultRank.rank;

    //return res.status(404).json("No exam data found for the student.");
    let subjectIdObj = String(data[i].examId.subjectId);
    let subjectName = null;
    try {
      subjectName = await Subject.findById(subjectIdObj).select('name');
    } catch (err) {
      return res.status(500).json('3.Something went wrong.');
    }
    subjectName = subjectName.name;
    data1['examId'] = data[i].examId._id;
    data1['title'] = data[i].examId.name;
    data1['variation'] = examType[Number(data[i].examId.examType)];
    data1['type'] = examVariation[Number(data[i].examId.examVariation)];
    data1['totalMarksMcq'] = data[i].examId.totalMarksMcq;
    data1['totalObtainedMarks'] = rank.totalObtainedMarks.toFixed(2);
    data1['meritPosition'] = resultRank;
    data1['examStartTime'] = moment(rank.examStartTime).format('LLL');
    data1['examEndTime'] = moment(rank.examEndTime).format('LLL');
    data1['subjectName'] = subjectName;
    resultData.push(data1);
  }
  let count = resultData.length;
  if (count == 0) return res.status(404).json('No data found in the course.');
  let paginateData = pagination(count, page);
  let start, end;
  start = (page - 1) * paginateData.perPage;
  end = page * paginateData.perPage;
  let data3 = [];
  if (count > 0) {
    for (let i = start; i < end; i++) {
      if (i == resultData.length) break;
      data3.push(resultData[i]);
    }
  }
  resultData = data3;
  return res.status(200).json({ resultData, paginateData });
};

const missedExam1 = async (req, res, next) => {
  const studentId = req.user.studentId;
  const courseId = req.user.courseId;
  const varaiation = Number(req.query.examVariation);
  if (
    !ObjectId.isValid(studentId) ||
    !ObjectId.isValid(courseId) ||
    !examVariation
  ) {
    return res.status(404).json('Student Id or Course Id is not valid.');
  }
  const courseIdObj = new mongoose.Types.ObjectId(courseId);
  let studentIdObj = new mongoose.Types.ObjectId(studentId);
  ////console.log(studentIdObj);
  let allExam = null;
  try {
    allExam = await Exam.find({
      $and: [
        { courseId: courseIdObj },
        { status: true },
        { examVariation: examVariation },
        { endTime: { $lt: new Date() } },
      ],
    }).select('_id');
  } catch (err) {
    return res.status(500).json('1.Sometihing went wrong.');
  }
  ////console.log("allexam");
  ////console.log(allExam);
  let doneExam = null;
  try {
    doneExam = await StudentMarksRank.find(
      {
        studentId: studentIdObj,
      },
      'examId',
    );
    ////console.log("doneExam");
    ////console.log(doneExam);
  } catch (err) {
    return res.status(500).json('2.Something went wrong.');
  }
  if (allExam == null) return res.status(404).json('No Exam data found.');
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
    return res.status(500).json('Something went wrong.');
  }
  if (count == 0) {
    return res.status(404).json('No data found.');
  }
  let paginateData = pagination(count, page);
  try {
    resultData = await Exam.find({
      $and: [{ _id: { $in: removedArray } }, { status: true }],
    })
      .populate('subjectId courseId')
      .skip(paginateData.skippedIndex)
      .limit(paginateData.perPage);
  } catch (err) {
    return res.status(500).json('3.Something went wrong.');
  }
  if (resultData == null) return res.status(404).json('No missed exam found.');
  let resultFinal = [];
  for (let i = 0; i < resultData.length; i++) {
    let result = {};
    result['id'] = resultData[i]._id;
    result['exanName'] = resultData[i].name;
    result['subject'] = resultData[i].subjectId.name;
    result['startTime'] = moment(resultData[i].startTime).format('LL');
    result['duration'] = Number(resultData[i].duration);
    result['examVariation'] = examType[Number(resultData[i].examType)];
    result['examType'] = examVariation[Number(resultData[i].examVariation)];
    result['negativeMarks'] = resultData[i].negativeMarks;
    resultFinal.push(result);
  }
  return res.status(200).json({ resultFinal, paginateData });
};

const missedExam = async (req, res, next) => {
  const studentId = req.user.studentId;
  const courseId = req.user.courseId;
  const examVariation = Number(req.query.examVariation);
  if (
    !ObjectId.isValid(studentId) ||
    !ObjectId.isValid(courseId) ||
    !examVariation
  ) {
    return res.status(404).json('Student Id or Course Id is not valid.');
  }
  const courseIdObj = new mongoose.Types.ObjectId(courseId);
  let studentIdObj = new mongoose.Types.ObjectId(studentId);
  ////console.log(studentIdObj);
  if (examVariation == 1) {
    let allExam = null;
    try {
      allExam = await Exam.find({
        $and: [
          { courseId: courseIdObj },
          { status: true },
          { examVariation: 1 },
          { endTime: { $lt: moment(new Date()).add(6, 'h') } },
        ],
      }).select('_id');
    } catch (err) {
      return res.status(500).json('1.Sometihing went wrong.');
    }
    ////console.log("allexam");
    ////console.log(allExam);
    let doneExam = null;
    try {
      doneExam = await StudentMarksRank.find(
        {
          studentId: studentIdObj,
        },
        'examId',
      );
      ////console.log("doneExam");
      ////console.log(doneExam);
    } catch (err) {
      return res.status(500).json('2.Something went wrong.');
    }
    if (allExam == null) return res.status(404).json('No Exam data found.');
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
      return res.status(500).json('Something went wrong.');
    }
    if (count == 0) {
      return res.status(404).json('No data found.');
    }
    let paginateData = pagination(count, page);
    try {
      resultData = await Exam.find({
        $and: [{ _id: { $in: removedArray } }, { status: true }],
      })
        .populate('subjectId courseId')
        .skip(paginateData.skippedIndex)
        .limit(paginateData.perPage);
    } catch (err) {
      return res.status(500).json('3.Something went wrong.');
    }
    if (resultData == null)
      return res.status(404).json('No missed exam found.');
    let resultFinal = [];
    for (let i = 0; i < resultData.length; i++) {
      let result = {};
      result['id'] = resultData[i]._id;
      result['exanName'] = resultData[i].name;
      result['subject'] = resultData[i].subjectId.name;
      result['startTime'] = moment(resultData[i].startTime)
        .subtract(6, 'h')
        .format('LLL');
      result['duration'] = Number(resultData[i].duration);
      result['examType'] = 'MCQ';
      result['negativeMarks'] = resultData[i].negativeMarks;
      result['solutionSheet'] = resultData[i].solutionSheet;
      resultFinal.push(result);
    }
    return res.status(200).json({ resultFinal, paginateData });
  } else if (examVariation == 2) {
    let allExam = null;
    try {
      allExam = await Exam.find({
        $and: [
          { courseId: courseIdObj },
          { status: true },
          { examVariation: 2 },
          { endTime: { $lt: moment(new Date()).add(6, 'h') } },
        ],
      }).select('_id');
    } catch (err) {
      return res.status(500).json('1.Sometihing went wrong.');
    }
    ////console.log("allexam");
    ////console.log(allExam);
    let doneExam = null;
    try {
      doneExam = await StudentMarksRank.find(
        {
          studentId: studentIdObj,
        },
        'examId',
      );
      ////console.log("doneExam");
      ////console.log(doneExam);
    } catch (err) {
      return res.status(500).json('2.Something went wrong.');
    }
    if (allExam == null) return res.status(404).json('No Exam data found.');
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
      return res.status(500).json('Something went wrong.');
    }
    if (count == 0) {
      return res.status(404).json('No data found.');
    }
    let paginateData = pagination(count, page);
    try {
      resultData = await Exam.find({
        $and: [{ _id: { $in: removedArray } }, { status: true }],
      })
        .populate('subjectId courseId')
        .skip(paginateData.skippedIndex)
        .limit(paginateData.perPage);
    } catch (err) {
      return res.status(500).json('3.Something went wrong.');
    }
    if (resultData == null)
      return res.status(404).json('No missed exam found.');
    let resultFinal = [];
    for (let i = 0; i < resultData.length; i++) {
      let result = {};
      result['id'] = resultData[i]._id;
      result['exanName'] = resultData[i].name;
      result['subject'] = resultData[i].subjectId.name;
      result['startTime'] = moment(resultData[i].startTime)
        .subtract(6, 'h')
        .format('LLL');
      result['duration'] = Number(resultData[i].duration);
      result['examType'] = 'Written';
      result['negativeMarks'] = resultData[i].negativeMarks;

      result['solutionSheet'] = resultData[i].solutionSheet;
      resultFinal.push(result);
    }
    return res.status(200).json({ resultFinal, paginateData });
  } else if (examVariation == 3) {
    let allExam = null;
    try {
      allExam = await BothExam.find({
        $and: [
          { courseId: courseIdObj },
          { status: true },
          { examVariation: examVariation },
          { endTime: { $lt: moment(new Date()).add(6, 'h') } },
        ],
      }).select('_id');
    } catch (err) {
      return res.status(500).json('1.Sometihing went wrong.');
    }
    ////console.log("allexam");
    ////console.log(allExam);
    let doneExam = null;
    try {
      doneExam = await BothRank.find(
        {
          studentId: studentIdObj,
        },
        'examId',
      );
      ////console.log("doneExam");
      ////console.log(doneExam);
    } catch (err) {
      return res.status(500).json('2.Something went wrong.');
    }
    if (allExam == null) return res.status(404).json('No Exam data found.');
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
    if (removedArray.length == 0)
      return res.status(404).json('No missed Exam found.');
    let page = Number(req.query.page) || 1;
    let count = 0;
    try {
      count = await BothExam.find({
        $and: [{ _id: { $in: removedArray } }, { status: true }],
      }).count();
    } catch (err) {
      return res.status(500).json('Something went wrong.');
    }
    if (count == 0) {
      return res.status(404).json('No data found.');
    }
    let paginateData = pagination(count, page);
    try {
      resultData = await BothExam.find({
        $and: [{ _id: { $in: removedArray } }, { status: true }],
      })
        .populate('subjectId courseId')
        .skip(paginateData.skippedIndex)
        .limit(paginateData.perPage);
    } catch (err) {
      return res.status(500).json('3.Something went wrong.');
    }
    if (resultData == null)
      return res.status(404).json('No missed exam found.');
    let resultFinal = [];
    for (let i = 0; i < resultData.length; i++) {
      let result = {};
      result['id'] = resultData[i]._id;
      result['exanName'] = resultData[i].name;
      result['subject'] = resultData[i].subjectId.name;
      result['startTime'] = moment(resultData[i].startTime)
        .subtract(6, 'h')
        .format('LLL');
      result['duration'] = Number(resultData[i].totalDuration);
      result['examType'] = 'Both';
      result['negativeMarks'] = resultData[i].negativeMarks;

      result['solutionSheet'] = resultData[i].solutionSheet;
      resultFinal.push(result);
    }
    return res.status(200).json({ resultFinal, paginateData });
  } else {
    let allExam = null;
    try {
      allExam = await SpecialExam.find({
        $and: [
          { courseId: courseIdObj },
          { status: true },
          { examVariation: 4 },
          { endTime: { $lt: moment(new Date()).add(6, 'h') } },
        ],
      }).select('_id');
    } catch (err) {
      return res.status(500).json('1.Sometihing went wrong.');
    }
    ////console.log("allexam");
    ////console.log(allExam);
    let doneExam = null;
    try {
      doneExam = await SpecialRank.find(
        {
          studentId: studentIdObj,
        },
        'examId',
      );
      ////console.log("doneExam");
      ////console.log(doneExam);
    } catch (err) {
      return res.status(500).json('2.Something went wrong.');
    }
    if (allExam == null) return res.status(404).json('No Exam data found.');
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
    if (removedArray.length == 0)
      return res.status(404).json('No missed Exam found.');
    //console.log("removedArray", removedArray.length);
    let page = Number(req.query.page) || 1;
    let count = 0;
    try {
      count = await SpecialExam.find({
        $and: [{ _id: { $in: removedArray } }, { status: true }],
      }).count();
    } catch (err) {
      return res.status(500).json('Something went wrong.');
    }
    if (count == 0) {
      return res.status(404).json('No data found.');
    }
    let paginateData = pagination(count, page);
    try {
      resultData = await SpecialExam.find({
        $and: [{ _id: { $in: removedArray } }, { status: true }],
      })
        .populate('courseId')
        .skip(paginateData.skippedIndex)
        .limit(paginateData.perPage);
    } catch (err) {
      //console.log(err);
      return res.status(500).json('3.Something went wrong.');
    }
    if (resultData == null)
      return res.status(404).json('No missed exam found.');
    let resultFinal = [];
    for (let i = 0; i < resultData.length; i++) {
      let result = {};
      result['id'] = resultData[i]._id;
      result['exanName'] = resultData[i].name;
      result['subject'] = 'Special Exam';
      result['startTime'] = moment(resultData[i].startTime)
        .subtract(6, 'h')
        .format('LLL');
      result['duration'] = Number(resultData[i].totalDuration);
      result['examType'] = 'Special';
      result['negativeMarks'] = resultData[i].negativeMarks;

      result['solutionSheet'] = resultData[i].solutionSheet;
      resultFinal.push(result);
    }
    return res.status(200).json({ resultFinal, paginateData });
  }
};

const retakeExam = async (req, res, next) => {
  const examId = req.query.examId;
  if (!ObjectId.isValid(examId))
    return res.status(404).json('examId is not valid.');
  const examIdObj = new mongoose.Types.ObjectId(examId);
  let examData = null,
    doc = [],
    min = 0,
    max = 0,
    questionData = [],
    rand,
    examQuestion = null;
  try {
    examData = await McqQuestionVsExam.findOne({ eId: examIdObj })
      .select('_id mId eId')
      .populate('eId mId');

    examQuestion = await Exam.findById(examIdObj);
  } catch (err) {
    ////console.log(examQuestion);
    return res.status(500).json('1.Something went wrong.');
  }
  if (examData == null)
    return res.status(404).json('No data found against this exam.');
  //console.log(examQuestion);
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
      return res.status(500).json('Something went wrong.');
    }
    if (status == true) questData.push(examData[i]._id);
  }
  let questDataFull = [];
  try {
    questDataFull = await QuestionsMcq.find({ _id: { $in: questData } });
  } catch (err) {
    return res.status(500).json('Something went wrong.');
  }
  //return res.status(200).json(examData);
  //start:generating random index of questions
  max = questData.length - 1;
  //max = max - min;
  rand = parseInt(Date.now() % questDataFull.length);
  if (rand == 0) rand = 1;
  if (rand == questDataFull.length - 1) rand = rand - 1;
  let flag = 0;
  for (let j = rand; j >= 0; j--) {
    if (doc.length == examQuestion.totalQuestionMcq) {
      flag = 1;
      break;
    }
    doc.push(j);
  }
  if (flag == 0) {
    for (let j = rand + 1; j < examQuestion.totalQuestionMcq; j++) {
      if (doc.length == examQuestion.totalQuestionMcq) {
        flag = 1;
        break;
      }
      doc.push(j);
    }
  }

  // for (let j = rand; j >= 0; j--) doc.push(j);
  // for (let j = rand + 1; j < examQuestion.totalQuestionMcq; j++) doc.push(j);
  // for (let i = 0; ; i++) {
  //   rand = Math.random();
  //   rand = rand * Number(max);
  //   rand = Math.floor(rand);
  //   rand = rand + Number(min);
  //   if (!doc.includes(rand)) doc.push(rand);
  //   if (doc.length == examDataNew.eId.totalQuestionMcq) break;
  // }
  examData = questDataFull;
  ////console.log(examData);
  for (let i = 0; i < doc.length; i++) {
    let questions = {};
    questions['id'] = examData[doc[i]]._id;
    questions['question'] = examData[doc[i]].question;
    questions['options'] = examData[doc[i]].options;
    questions['optionCount'] = examData[doc[i]].optionCount;
    questions['type'] = examData[doc[i]].type;
    questionData.push(questions);
  }
  let duration = examDataNew.eId.duration;
  //end:generating random index of questions
  return res.status(200).json({ question: questionData, two: doc, duration });
};

const retakeBothExam = async (req, res, next) => {
  const examId = req.query.examId;
  if (!ObjectId.isValid(examId))
    return res.status(404).json('examId is not valid.');
  const examIdObj = new mongoose.Types.ObjectId(examId);
  let examData = null,
    doc = [],
    min = 0,
    max = 0,
    questionData = [],
    rand,
    examQuestion = null;
  try {
    examData = await BothMcqQuestionVsExam.findOne({ eId: examIdObj })
      .select('_id mId eId')
      .populate('eId mId');

    examQuestion = await BothExam.findById(examIdObj);
  } catch (err) {
    ////console.log(examQuestion);
    return res.status(500).json('1.Something went wrong.');
  }
  if (examData == null)
    return res.status(404).json('No data found against this exam.');
  //console.log(examQuestion);
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
      return res.status(500).json('Something went wrong.');
    }
    if (status == true) questData.push(examData[i]._id);
  }
  let questDataFull = [];
  try {
    questDataFull = await QuestionsMcq.find({ _id: { $in: questData } });
  } catch (err) {
    return res.status(500).json('Something went wrong.');
  }
  //return res.status(200).json(examData);
  //start:generating random index of questions
  max = questData.length - 1;
  //max = max - min;
  rand = parseInt(Date.now() % questDataFull.length);
  if (rand == 0) rand = 1;
  if (rand == questDataFull.length - 1) rand = rand - 1;
  let flag = 0;
  for (let j = rand; j >= 0; j--) {
    if (doc.length == examQuestion.totalQuestionMcq) {
      flag = 1;
      break;
    }
    doc.push(j);
  }
  if (flag == 0) {
    for (let j = rand + 1; j < examQuestion.totalQuestionMcq; j++) {
      if (doc.length == examQuestion.totalQuestionMcq) {
        flag = 1;
        break;
      }
      doc.push(j);
    }
  }

  // for (let j = rand; j >= 0; j--) doc.push(j);
  // for (let j = rand + 1; j < examQuestion.totalQuestionMcq; j++) doc.push(j);
  // for (let i = 0; ; i++) {
  //   rand = Math.random();
  //   rand = rand * Number(max);
  //   rand = Math.floor(rand);
  //   rand = rand + Number(min);
  //   if (!doc.includes(rand)) doc.push(rand);
  //   if (doc.length == examDataNew.eId.totalQuestionMcq) break;
  // }
  examData = questDataFull;
  ////console.log(examData);
  for (let i = 0; i < doc.length; i++) {
    let questions = {};
    questions['id'] = examData[doc[i]]._id;
    questions['question'] = examData[doc[i]].question;
    questions['options'] = examData[doc[i]].options;
    questions['optionCount'] = examData[doc[i]].optionCount;
    questions['correctOption'] = examData[doc[i]].correctOption;
    questions['type'] = examData[doc[i]].type;
    questionData.push(questions);
  }
  let duration = examDataNew.eId.mcqDuration;
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
    return res.status(404).json('Data not fond.');
  }
  ////console.log(qId);
  ////console.log(answerArr);
  ////console.log(doc);
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
    examData = await McqQuestionVsExam.findOne({ eId: examIdObj }).populate(
      'mId eId',
    );
  } catch (err) {
    ////console.log(err);
    return res.status(500).json('1.Something went wrong.');
  }
  if (examData == null)
    return res.status(404).json('No exam data found for the student.');
  let examData1 = examData;
  let validQues = [];
  try {
    validQues = await QuestionsMcq.find({
      $and: [{ _id: { $in: examData.mId } }, { status: true }],
    });
  } catch (err) {
    return res.status(500).json('something went wrong.');
  }
  negativeMarks = Number(examData.eId.negativeMarks);
  correctMarks = Number(examData.eId.marksPerMcq); //totalMarksMcq / qIdObj.length;
  examData = examData.mId;

  for (let i = 0; i < qIdObj.length; i++) {
    ////console.log(examData[doc[i]]);
    let answer = answered[i];
    //("qidobj", qIdObj[i]);
    ////console.log("examdata", validQues[doc[i]]._id);
    ////console.log(answer);
    if (String(validQues[doc[i]]._id) == String(qIdObj[i])) {
      if (answer == '-1') notAnswered = notAnswered + 1;
      else if (answer == validQues[doc[i]].correctOption)
        totalCorrect = totalCorrect + 1;
      else totalWrong = totalWrong + 1;
    }
  }
  let negativeValue = (correctMarks * negativeMarks) / 100;
  marks = totalCorrect * correctMarks - negativeValue * totalWrong;
  // let answerScript = {};
  // answerScript["totalQuestion"] = qIdObj.length;
  // answerScript["negativePercentage"] = negativeMarks;
  // answerScript["correcMarks"] = correctMarks;
  // answerScript["negativeValue"] = negativeValue;
  // answerScript["totalCorrect"] = totalCorrect;
  // answerScript["totalWrong"] = totalWrong;
  // answerScript["notAnswered"] = notAnswered;
  // answerScript["totalMarks"] = marks;
  // answerScript["totalWrongMarks"] = negativeValue * totalWrong;
  // answerScript["totalCorrectMarks"] = totalCorrect * correctMarks;
  // answerScript["questionInfo"] = examData;

  //console.log(examData1);
  let dataObject = {};
  dataObject['examName'] = examData1.eId.name;
  dataObject['totalMarksMcq'] = examData1.eId.totalMarksMcq;
  dataObject['startTime'] = examData1.eId.startTime;
  dataObject['endTime'] = examData1.eId.endTime;
  dataObject['examVariation'] = examType[Number(examData1.eId.examType)];
  dataObject['examType'] = examVariation[Number(examData1.eId.examVariation)];
  dataObject['totalCorrectAnswer'] = totalCorrect;
  dataObject['rank'] = '-1';
  dataObject['totalObtainedMarks'] = marks;
  dataObject['totalWrongAnswer'] = totalWrong;
  dataObject['totalCorrectMarks'] = totalCorrect * correctMarks;
  dataObject['totalWrongMarks'] = negativeValue * totalWrong;
  dataObject['totalNotAnswered'] = notAnswered;
  dataObject['marksPerMcq'] = examData1.eId.marksPerMcq;
  dataObject['marksPerWrong'] = examData1.eId.negativeMarks / 100;
  return res.status(200).json(dataObject);

  //return res.status(200).json(answerScript);
};

const studentSubmittedExamDetail = async (req, res, next) => {
  const studentId = req.user.studentId;
  const examId = req.query.examId;
  if (!ObjectId.isValid(studentId) || !ObjectId.isValid(examId))
    return res.status(404).json('Student Id is not valid.');
  const studentIdObj = new mongoose.Types.ObjectId(studentId);
  const examIdObj = new mongoose.Types.ObjectId(examId);
  let data = null;
  try {
    data = await StudentExamVsQuestionsMcq.findOne({
      $and: [{ studentId: studentIdObj }, { examId: examIdObj }],
    }).populate('examId');
  } catch (err) {
    return res.status(500).json('1.Something went wrong.');
  }
  if (data == null) return res.status(404).json('No data found.');
  let dataRank = null;
  try {
    dataRank = await StudentMarksRank.findOne({
      $and: [{ studentId: studentIdObj }, { examId: examIdObj }],
    });
  } catch (err) {
    return res.status(500).json('2.Something went wrong.');
  }
  if (dataRank == null) return res.status(404).json('No data found.');
  //star rank
  let mcqRank = null;
  try {
    mcqRank = await McqRank.findOne({
      $and: [{ studentId: studentIdObj }, { examId: examIdObj }],
    });
  } catch (err) {
    return res.status(500).json('2.Something went wrong.');
  }
  if (mcqRank != null) mcqRank = mcqRank.rank;
  else mcqRank = '-1';
  //end rank

  let dataObject = {};
  dataObject['examName'] = data.examId.name;
  dataObject['totalMarksMcq'] = data.examId.totalMarksMcq;
  dataObject['startTime'] = data.examId.startTime;
  dataObject['endTime'] = data.examId.endTime;
  dataObject['examVariation'] = examType[Number(data.examId.examType)];
  dataObject['examType'] = examVariation[Number(data.examId.examVariation)];
  dataObject['totalCorrectAnswer'] = data.totalCorrectAnswer;
  dataObject['studExamStartTime'] = dataRank.examStartTime;
  dataObject['studExamEndTime'] = dataRank.examEndTime;
  dataObject['studDuration'] = dataRank.duration;
  dataObject['rank'] = mcqRank;
  dataObject['totalObtainedMarks'] = dataRank.totalObtainedMarks;
  dataObject['totalWrongAnswer'] = data.totalWrongAnswer;
  dataObject['totalCorrectMarks'] = data.totalCorrectMarks;
  dataObject['totalWrongMarks'] = data.totalWrongMarks;
  dataObject['totalNotAnswered'] = data.totalNotAnswered;
  dataObject['marksPerMcq'] = data.examId.marksPerMcq;
  dataObject['marksPerWrong'] =
    (data.examId.marksPerMcq * data.examId.negativeMarks) / 100;
  return res.status(200).json(dataObject);
};

const studentSubmittedExamDetailAdmin = async (req, res, next) => {
  const studentId = req.query.studentId;
  const examId = req.query.examId;
  if (!ObjectId.isValid(studentId) || !ObjectId.isValid(examId))
    return res.status(404).json('Student Id is not valid.');
  const studentIdObj = new mongoose.Types.ObjectId(studentId);
  const examIdObj = new mongoose.Types.ObjectId(examId);
  let data = null;
  try {
    data = await StudentExamVsQuestionsMcq.findOne({
      $and: [{ studentId: studentIdObj }, { examId: examIdObj }],
    }).populate('examId');
  } catch (err) {
    return res.status(500).json('1.Something went wrong.');
  }
  if (data == null) return res.status(404).json('No data found.');
  let dataRank = null;
  try {
    dataRank = await StudentMarksRank.findOne({
      $and: [{ studentId: studentIdObj }, { examId: examIdObj }],
    });
  } catch (err) {
    return res.status(500).json('2.Something went wrong.');
  }
  if (dataRank == null) return res.status(404).json('No data found.');

  let dataObject = {};
  dataObject['examName'] = data.examId.name;
  dataObject['totalMarksMcq'] = data.examId.totalMarksMcq;
  dataObject['startTime'] = data.examId.startTime;
  dataObject['endTime'] = data.examId.endTime;
  dataObject['examVariation'] = examType[Number(data.examId.examType)];
  dataObject['examType'] = examVariation[Number(data.examId.examVariation)];
  dataObject['studExamTime'] = dataObject['totalCorrectAnswer'] =
    data.totalCorrectAnswer;
  dataObject['studExamStartTime'] = dataRank.examStartTime;
  dataObject['studExamEndTime'] = dataRank.examEndTime;
  dataObject['studDuration'] = dataRank.duration;
  dataObject['rank'] = dataRank.rank;
  dataObject['totalObtainedMarks'] = dataRank.totalObtainedMarks;
  dataObject['totalWrongAnswer'] = data.totalWrongAnswer;
  dataObject['totalCorrectMarks'] = data.totalCorrectMarks;
  dataObject['totalWrongMarks'] = data.totalWrongMarks;
  dataObject['totalNotAnswered'] = data.totalNotAnswered;
  dataObject['marksPerMcq'] = data.examId.marksPerMcq;
  dataObject['marksPerWrong'] = data.examId.negativeMarks / 100;
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
      .populate('examId')
      .skip(skippedItem)
      .limit(Limit);
  } catch (err) {
    ////console.log(err);
  }
};

//use for admin

const viewSollutionAdmin1 = async (req, res, next) => {
  ////console.log(req.query);
  const studentId = req.query.studentId;
  const examId = req.query.examId;
  if (!ObjectId.isValid(studentId) || !ObjectId.isValid(examId))
    return res.status(404).json('student Id or examId is not valid.');
  let studentIdObj = new mongoose.Types.ObjectId(studentId);
  let examIdObj = new mongoose.Types.ObjectId(examId);
  let data = null;
  try {
    data = await StudentExamVsQuestionsMcq.find({
      $and: [{ studentId: studentIdObj }, { examId: examIdObj }],
    }).populate('mcqQuestionId');
  } catch (err) {
    return res.status(500).json('1.Something went wrong.');
  }
  if (data.length == 0)
    return res.status(404).json('No exam found under this student.');
  let resultData = [];
  for (let i = 0; i < data[0].mcqQuestionId.length; i++) {
    let data1 = {};
    data1['id'] = data[0].mcqQuestionId[i]._id;
    data1['question'] = data[0].mcqQuestionId[i].question;
    data1['options'] = data[0].mcqQuestionId[i].options;
    data1['correctOptions'] = Number(data[0].mcqQuestionId[i].correctOption);
    data1['explanationILink'] = data[0].mcqQuestionId[i].explanationILink;
    data1['type'] = data[0].mcqQuestionId[i].type;
    data1['answeredOption'] = data[0].answeredOption[i];
    resultData.push(data1);
  }
  return res.status(200).json(resultData);
};

const viewSollutionAdmin = async (req, res, next) => {
  const studentId = req.query.studentId;
  const examId = req.query.examId;
  if (!ObjectId.isValid(studentId) || !ObjectId.isValid(examId))
    return res.status(404).json('student Id or examId is not valid.');
  let studentIdObj = new mongoose.Types.ObjectId(studentId);
  let examIdObj = new mongoose.Types.ObjectId(examId);
  ////console.log(studentIdObj, examIdObj);
  let data = null;
  try {
    data = await StudentExamVsQuestionsMcq.find({
      $and: [{ studentId: studentIdObj }, { examId: examIdObj }],
    }).populate('mcqQuestionId');
  } catch (err) {
    return res.status(500).json('1.Something went wrong.');
  }
  if (data == null)
    return res.status(404).json('No exam found under this student.');
  let resultData = [];
  for (let i = 0; i < data[0].mcqQuestionId.length; i++) {
    let data1 = {};
    data1['id'] = data[0].mcqQuestionId[i]._id;
    data1['question'] = data[0].mcqQuestionId[i].question;
    data1['options'] = data[0].mcqQuestionId[i].options;
    data1['correctOptions'] = Number(data[0].mcqQuestionId[i].correctOption);
    data1['explanationILink'] = data[0].mcqQuestionId[i].explanationILink;
    data1['type'] = data[0].mcqQuestionId[i].type;
    data1['answeredOption'] = data[0].answeredOption[i];
    resultData.push(data1);
  }
  return res.status(200).json(resultData);
};

const missedExamAdmin = async (req, res, next) => {
  const studentId = req.query.studentId;
  const courseId = req.query.courseId;
  const examVariation = Number(req.query.examVariation);
  if (
    !ObjectId.isValid(studentId) ||
    !ObjectId.isValid(courseId) ||
    examVariation
  ) {
    return res.status(404).json('Student Id or Course Id is not valid.');
  }
  const courseIdObj = new mongoose.Types.ObjectId(courseId);
  let studentIdObj = new mongoose.Types.ObjectId(studentId);
  let allExam = null;
  try {
    allExam = await Exam.find({
      $and: [
        { courseId: courseIdObj },
        { status: true },
        { examVariation: examVariation },
        { endtime: { $lt: new Date() } },
      ],
    }).select('_id');
  } catch (err) {
    return res.status(500).json('1.Sometihing went wrong.');
  }
  let doneExam = null;
  try {
    doneExam = await StudentMarksRank.find(
      {
        studentId: studentIdObj,
      },
      'examId',
    );
  } catch (err) {
    return res.status(500).json('2.Something went wrong.');
  }
  if (allExam == null) return res.status(404).json('No Exam data found.');
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
    return res.status(500).json('Something went wrong.');
  }
  if (count == 0) {
    return res.status(404).json('No data found.');
  }
  let paginateData = pagination(count, page);
  try {
    resultData = await Exam.find({
      $and: [{ _id: { $in: removedArray } }, { status: true }],
    })
      .populate('subjectId courseId')
      .skip(paginateData.skippedIndex)
      .limit(paginateData.perPage);
  } catch (err) {
    return res.status(500).json('3.Something went wrong.');
  }
  if (resultData == null) return res.status(404).json('No missed exam found.');
  let resultFinal = [];
  for (let i = 0; i < resultData.length; i++) {
    let result = {};
    result['id'] = resultData[i]._id;
    result['exanName'] = resultData[i].name;
    result['subject'] = resultData[i].subjectId.name;
    result['startTime'] = moment(resultData[i].startTime).format('LL');
    result['duration'] = resultData[i].duration;
    result['examType'] = resultData[i].examType;
    result['examVariation'] = resultData[i].examVariation;
    result['negativeMarks'] = resultData[i].negativeMarks;
    resultFinal.push(result);
  }
  return res.status(200).json({ resultFinal, paginateData });
};

const historyDataAdmin = async (req, res, next) => {
  const studentId = req.query.studentId;
  if (!ObjectId.isValid(studentId))
    return res.status(404).json('Student ID not valid.');
  let page = req.query.page || 1;

  let studentIdObj = new mongoose.Types.ObjectId(studentId);
  let data;
  let count = 0;
  try {
    count = await StudentExamVsQuestionsMcq.find({
      studentId: studentIdObj,
    }).count();
  } catch (err) {
    return res.status(500).json('Something went wrong.');
  }
  if (count == 0) return res.status(400).json('No data found.');
  let paginateData = pagination(count, page);
  try {
    data = await StudentExamVsQuestionsMcq.find({
      studentId: studentIdObj,
    })
      .populate('examId')
      .skip(paginateData.skippedIndex)
      .limit(paginateData.perPage);
  } catch (err) {
    return res.status(500).json('1.SOmething went wrong.');
  }
  if (data == null)
    return res.status(404).json('No exam data found for the student.');
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
        'rank totalObtainedMarks examStartTime examEndtime',
      );
    } catch (err) {
      return res.status(500).json('2.Something went wrong.');
    }
    if (rank == null)
      return res.status(404).json('No exam data forunf for the student.');
    let subjectIdObj = String(data[i].examId.subjectId);
    let subjectName = null;
    try {
      subjectName = await Subject.findById(subjectIdObj).select('name');
    } catch (err) {
      return res.status(500).json('3.Something went wrong.');
    }
    subjectName = subjectName.name;
    if (rank == null || subjectName == null) {
      flag = true;
      break;
    }
    //rank data start
    let mcqRank = null;
    try {
      mcqRank = await McqRank.findOne({
        $and: [{ examId: examIdObj }, { studentId: studentIdObj }],
      });
    } catch (err) {
      return res.status(500).json('Something went wrong.');
    }
    if (mcqRank == null) mcqRank = '-1';
    else mcqRank = mcqRank.rank;
    //rank data end
    data1['examId'] = data[i].examId._id;
    data1['title'] = data[i].examId.name;
    data1['type'] = data[i].examId.examType;
    data1['variation'] = data[i].examId.examVariation;
    data1['totalMarksMcq'] = data[i].examId.totalMarksMcq;
    data1['totalObtainedMarks'] = rank.totalObtainedMarks;
    data1['meritPosition'] = mcqRank;
    data1['examStartTime'] = moment(rank.examStartTime).format('LLL');
    data1['examEndTime'] = moment(rank.examEndTime).format('LLL');
    data1['subjectName'] = subjectName;
    resultData.push(data1);
    i++;
  }
  if (flag == true) return res.status(404).json('data not found.');
  else return res.status(200).json({ resultData, paginateData });
};

const getHistoryByExamId = async (req, res, next) => {
  const examId = req.query.examId;
  if (!ObjectId.isValid(examId))
    return res.status(404).json('Student ID not valid.');
  let page = req.query.page || 1;

  let examIdObj = new mongoose.Types.ObjectId(examId);
  let count = 0;
  try {
    count = await StudentMarksRank.find({
      $and: [{ examId: examIdObj }, { finishedStatus: true }],
    }).count();
  } catch (err) {
    return res.status(500).json('Something went wrong.');
  }
  if (count == 0) {
    return res.status(404).json('No data found.');
  }
  let paginateData = pagination(count, page);
  let data = [],
    rank;
  try {
    rank = await StudentMarksRank.find({
      $and: [{ examId: examIdObj }, { finishedStatus: true }],
    })
      .populate('studentId')
      .skip(paginateData.skippedIndex)
      .limit(paginateData.perPage);
  } catch (err) {
    ////console.log(err);
    return res.status(500).json('Something went wrong.');
  }
  ////console.log(rank);
  for (let i = 0; i < rank.length; i++) {
    //rank data start
    ////console.log(rank[i]);
    let mcqRank = null;
    try {
      mcqRank = await McqRank.findOne({
        $and: [{ examId: examIdObj }, { studentId: rank[i].studentId._id }],
      });
    } catch (err) {
      return res.status(500).json('Something went wrong.');
    }
    if (mcqRank == null) mcqRank = '-1';
    else mcqRank = mcqRank.rank;
    //rank data end

    let data1 = {},
      examStud = null;
    data1['studentId'] = rank[i].studentId._id;
    try {
      examStud = await StudentExamVsQuestionsMcq.findOne({
        $and: [{ examId: examIdObj }, { studentId: data1['studentId'] }],
      }).populate('studentId');
    } catch (err) {
      return res.status(500).json('Something went wrong.');
    }
    data1['examStud'] = examStud;
    data1['totalObtainedMarks'] = rank[i].totalObtainedMarks;
    data1['meritPosition'] = mcqRank;
    data1['examStartTime'] = moment(rank[i].examStartTime)
      .subtract(6, 'h')
      .format('LLL');
    data1['examEndTime'] = moment(rank[i].examEndTime)
      .subtract(6, 'h')
      .format('LLL');
    data1['duration'] = rank[i].duration;
    data.push(data1);
  }
  examDetails = null;
  try {
    examDetails = await Exam.findById(String(examIdObj)).populate(
      'courseId subjectId',
    );
  } catch (err) {
    return res.status(500).json('Something went wrong.');
  }
  let examInfo = {
    id: String(examDetails._id),
    name: examDetails.name,
    courseName: examDetails.courseId.name,
    subjectName: examDetails.subjectId.name,
    startTime: moment(examDetails.startTime).subtract(6, 'h').format('LLL'),
    endTime: moment(examDetails.endTime).subtract(6, 'h').format('LLL'),
    totalQuestion: examDetails.totalQuestionMcq,
    variation: examType[Number(examDetails.examType)],
    type: examVariation[Number(examDetails.examVariation)],
    totalMarksMcq: examDetails.totalMarksMcq,
  };
  return res.status(200).json({ data, examInfo, paginateData });
};

const getHistoryByExamIdFilter = async (req, res, next) => {
  const examId = req.query.examId;
  const regNo = req.query.regNo;
  if (!ObjectId.isValid(examId) || !regNo)
    return res.status(404).json('Student ID or RegNo not valid.');
  let page = req.query.page || 1;
  let studentId = null;
  let examIdObj = new mongoose.Types.ObjectId(examId);
  try {
    studentId = await Student.find({
      regNo: {
        $regex: new RegExp('.*' + regNo.toLowerCase() + '.*', 'i'),
      },
    });
  } catch (err) {
    return res.status(500).json('Something went wrong.');
  }
  if (studentId.length == 0) return res.status(404).json('No data found.');
  let studIds = [];
  for (let i = 0; i < studentId.length; i++) {
    studIds[i] = studentId[i]._id;
  }
  let count = 0;
  try {
    count = await StudentMarksRank.find({
      $and: [
        { examId: examIdObj },
        { finishedStatus: true },
        { studentId: { $in: studIds } },
      ],
    }).count();
  } catch (err) {
    return res.status(500).json('Something went wrong.');
  }
  if (count == 0) {
    return res.status(404).json('No data found.');
  }
  let paginateData = pagination(count, page);
  let data = [],
    rank;
  try {
    rank = await StudentMarksRank.find({
      $and: [
        { examId: examIdObj },
        { finishedStatus: true },
        { studentId: { $in: studIds } },
      ],
    })
      .populate('studentId')
      .skip(paginateData.skippedIndex)
      .limit(paginateData.perPage);
  } catch (err) {
    ////console.log(err);
    return res.status(500).json('Something went wrong.');
  }
  ////console.log(rank);
  for (let i = 0; i < rank.length; i++) {
    //rank data start
    ////console.log(rank[i]);
    let mcqRank = null;
    try {
      mcqRank = await McqRank.findOne({
        $and: [{ examId: examIdObj }, { studentId: rank[i].studentId._id }],
      });
    } catch (err) {
      return res.status(500).json('Something went wrong.');
    }
    if (mcqRank == null) mcqRank = '-1';
    else mcqRank = mcqRank.rank;
    //rank data end

    let data1 = {},
      examStud = null;
    data1['studentId'] = rank[i].studentId._id;
    try {
      examStud = await StudentExamVsQuestionsMcq.findOne({
        $and: [{ examId: examIdObj }, { studentId: data1['studentId'] }],
      }).populate('studentId');
    } catch (err) {
      return res.status(500).json('Something went wrong.');
    }
    data1['examStud'] = examStud;
    data1['totalObtainedMarks'] = rank[i].totalObtainedMarks;
    data1['meritPosition'] = mcqRank;
    data1['examStartTime'] = moment(rank[i].examStartTime)
      .subtract(6, 'h')
      .format('LLL');
    data1['examEndTime'] = moment(rank[i].examEndTime)
      .subtract(6, 'h')
      .format('LLL');
    data1['duration'] = rank[i].duration;
    data.push(data1);
  }
  examDetails = null;
  try {
    examDetails = await Exam.findById(String(examIdObj)).populate(
      'courseId subjectId',
    );
  } catch (err) {
    return res.status(500).json('Something went wrong.');
  }
  let examInfo = {
    id: String(examDetails._id),
    name: examDetails.name,
    courseName: examDetails.courseId.name,
    subjectName: examDetails.subjectId.name,
    startTime: moment(examDetails.startTime).subtract(6, 'h').format('LLL'),
    endTime: moment(examDetails.endTime).subtract(6, 'h').format('LLL'),
    totalQuestion: examDetails.totalQuestionMcq,
    variation: examType[Number(examDetails.examType)],
    type: examVariation[Number(examDetails.examVariation)],
    totalMarksMcq: examDetails.totalMarksMcq,
  };
  return res.status(200).json({ data, examInfo, paginateData });
};

const getHistoryByWrittenId = async (req, res, next) => {
  const examId = req.query.examId;
  if (!ObjectId.isValid(examId))
    return res.status(404).json('Student ID not valid.');
  let page = req.query.page || 1;

  let examIdObj = new mongoose.Types.ObjectId(examId);
  let count = 0;
  try {
    count = await StudentMarksRank.find({
      $and: [{ examId: examIdObj }],
    }).count();
  } catch (err) {
    return res.status(500).json('Something went wrong.');
  }
  if (count == 0) {
    return res.status(404).json('No data found.');
  }
  let paginateData = pagination(count, page);
  let data = [],
    rank;
  try {
    rank = await StudentMarksRank.find({
      $and: [{ examId: examIdObj }],
    })
      .populate('studentId')
      .skip(paginateData.skippedIndex)
      .limit(paginateData.perPage);
  } catch (err) {
    ////console.log(err);
    return res.status(500).json('Something went wrong.');
  }
  let qWritten = null;
  try {
    qWritten = await QuestionsWritten.findOne({ examId: examIdObj });
  } catch (err) {
    return res.status(500).json('Something went wrong.');
  }
  for (let i = 0; i < rank.length; i++) {
    let mcqRank = null;
    try {
      mcqRank = await McqRank.findOne({
        $and: [{ examId: examIdObj }, { studentId: rank[i].studentId._id }],
      });
    } catch (err) {
      return res.status(500).json('Something went wrong.');
    }
    if (mcqRank == null) mcqRank = '-1';
    else mcqRank = mcqRank.rank;
    let data1 = {},
      examStud = null;
    data1['studentId'] = rank[i].studentId._id;
    try {
      examStud = await StudentExamVsQuestionsWritten.findOne({
        $and: [{ examId: examIdObj }, { studentId: data1['studentId'] }],
      }).populate('studentId');
    } catch (err) {
      return res.status(500).json('Something went wrong.');
    }
    data1['examStud'] = examStud;
    data1['totalObtainedMarks'] = examStud.totalObtainedMarks;
    data1['meritPosition'] = mcqRank;
    data1['examStartTime'] = moment(rank[i].examStartTime)
      .subtract(6, 'h')
      .format('LLL');
    data1['examEndTime'] = moment(rank[i].examEndTime)
      .subtract(6, 'h')
      .format('LLL');
    data1['duration'] = rank[i].duration;
    data1['totalMarks'] = qWritten.totalMarks;
    data.push(data1);
  }
  examDetails = null;
  try {
    examDetails = await Exam.findById(String(examIdObj)).populate(
      'courseId subjectId',
    );
  } catch (err) {
    return res.status(500).json('Something went wrong.');
  }
  let examInfo = {
    id: String(examDetails._id),
    name: examDetails.name,
    courseName: examDetails.courseId.name,
    subjectName: examDetails.subjectId.name,
    startTime: moment(examDetails.startTime).subtract(6, 'h').format('LLL'),
    endTime: moment(examDetails.endTime).subtract(6, 'h').format('LLL'),
    totalQuestion: qWritten.totalQuestions,
    variation: examType[Number(examDetails.examType)],
    type: examVariation[Number(examDetails.examVariation)],
    totalMarks: qWritten.totalMarks,
  };
  return res.status(200).json({ data, examInfo, paginateData });
};

const getHistoryByWrittenIdFilter = async (req, res, next) => {
  const examId = req.query.examId;
  const regNo = req.query.regNo;
  if (!ObjectId.isValid(examId) || !regNo)
    return res.status(404).json('Student ID or RegNo not valid.');
  let page = req.query.page || 1;
  let studentId = null;
  let examIdObj = new mongoose.Types.ObjectId(examId);
  try {
    studentId = await Student.find({
      regNo: {
        $regex: new RegExp('.*' + regNo.toLowerCase() + '.*', 'i'),
      },
    });
  } catch (err) {
    return res.status(500).json('Something went wrong.');
  }
  if (studentId.length == 0) return res.status(404).json('No data found.');
  let studIds = [];
  for (let i = 0; i < studentId.length; i++) {
    studIds[i] = studentId[i]._id;
  }

  let count = 0;
  try {
    count = await StudentMarksRank.find({
      $and: [{ examId: examIdObj }, { studentId: { $in: studIds } }],
    }).count();
  } catch (err) {
    return res.status(500).json('Something went wrong.');
  }
  if (count == 0) {
    return res.status(404).json('No data found.');
  }
  let paginateData = pagination(count, page);
  let data = [],
    rank;
  try {
    rank = await StudentMarksRank.find({
      $and: [{ examId: examIdObj }, { studentId: { $in: studIds } }],
    })
      .populate('studentId')
      .skip(paginateData.skippedIndex)
      .limit(paginateData.perPage);
  } catch (err) {
    ////console.log(err);
    return res.status(500).json('Something went wrong.');
  }
  let qWritten = null;
  try {
    qWritten = await QuestionsWritten.findOne({ examId: examIdObj });
  } catch (err) {
    return res.status(500).json('Something went wrong.');
  }
  for (let i = 0; i < rank.length; i++) {
    let mcqRank = null;
    try {
      mcqRank = await McqRank.findOne({
        $and: [{ examId: examIdObj }, { studentId: rank[i].studentId._id }],
      });
    } catch (err) {
      return res.status(500).json('Something went wrong.');
    }
    if (mcqRank == null) mcqRank = '-1';
    else mcqRank = mcqRank.rank;
    let data1 = {},
      examStud = null;
    data1['studentId'] = rank[i].studentId._id;
    try {
      examStud = await StudentExamVsQuestionsWritten.findOne({
        $and: [{ examId: examIdObj }, { studentId: data1['studentId'] }],
      }).populate('studentId');
    } catch (err) {
      return res.status(500).json('Something went wrong.');
    }
    data1['examStud'] = examStud;
    data1['totalObtainedMarks'] = examStud.totalObtainedMarks;
    data1['meritPosition'] = mcqRank;
    data1['examStartTime'] = moment(rank[i].examStartTime)
      .subtract(6, 'h')
      .format('LLL');
    data1['examEndTime'] = moment(rank[i].examEndTime)
      .subtract(6, 'h')
      .format('LLL');
    data1['duration'] = rank[i].duration;
    data1['totalMarks'] = qWritten.totalMarks;
    data.push(data1);
  }
  examDetails = null;
  try {
    examDetails = await Exam.findById(String(examIdObj)).populate(
      'courseId subjectId',
    );
  } catch (err) {
    return res.status(500).json('Something went wrong.');
  }
  let examInfo = {
    id: String(examDetails._id),
    name: examDetails.name,
    courseName: examDetails.courseId.name,
    subjectName: examDetails.subjectId.name,
    startTime: moment(examDetails.startTime).subtract(6, 'h').format('LLL'),
    endTime: moment(examDetails.endTime).subtract(6, 'h').format('LLL'),
    totalQuestion: qWritten.totalQuestions,
    variation: examType[Number(examDetails.examType)],
    type: examVariation[Number(examDetails.examVariation)],
    totalMarks: qWritten.totalMarks,
  };
  return res.status(200).json({ data, examInfo, paginateData });
};

const bothGetHistory = async (req, res, next) => {
  const examId = req.query.examId;
  if (!ObjectId.isValid(examId))
    return res.status(404).json('Student ID not valid.');
  let page = req.query.page || 1;

  let examIdObj = new mongoose.Types.ObjectId(examId);
  let count = 0;
  try {
    count = await BothStudentExamVsQuestions.find({
      $and: [{ examId: examIdObj }],
    }).count();
  } catch (err) {
    return res.status(500).json('Something went wrong.');
  }
  if (count == 0) {
    return res.status(404).json('No data found.');
  }
  let paginateData = pagination(count, page);
  let data = [],
    rank;
  try {
    rank = await BothStudentExamVsQuestions.find({
      $and: [{ examId: examIdObj }],
    })
      .populate('studentId')
      .skip(paginateData.skippedIndex)
      .limit(paginateData.perPage);
  } catch (err) {
    ////console.log(err);
    return res.status(500).json('Something went wrong.');
  }
  let qWritten = null;
  try {
    qWritten = await BothQuestionsWritten.findOne({ examId: examIdObj });
  } catch (err) {
    return res.status(500).json('Something went wrong.');
  }
  console.log('rank 0-', rank[0]);
  for (let i = 0; i < rank.length; i++) {
    let mcqRank = null;
    try {
      mcqRank = await BothRank.findOne({
        $and: [{ examId: examIdObj }, { studentId: rank[i].studentId._id }],
      });
    } catch (err) {
      return res.status(500).json('Something went wrong.');
    }
    console.log('mcqRank:', mcqRank);
    if (mcqRank == null) mcqRank = '-1';
    else mcqRank = mcqRank.rank;
    let data1 = {},
      examStud = null;
    data1['studentId'] = rank[i].studentId._id;
    try {
      examStud = await BothStudentExamVsQuestions.findOne({
        $and: [{ examId: examIdObj }, { studentId: data1['studentId'] }],
      }).populate('studentId');
    } catch (err) {
      S;
      return res.status(500).json('Something went wrong.');
    }
    data1['examStud'] = examStud;
    data1['totalObtainedMarks'] = examStud.totalObtainedMarks;
    data1['meritPosition'] = mcqRank;
    data1['examStartTime'] = moment(rank[i].examStartTimeMcq)
      .subtract(6, 'h')
      .format('LLL');
    data1['examEndTime'] = moment(rank[i].examEndTimeWritten)
      .subtract(6, 'h')
      .format('LLL');
    data1['duration'] = rank[i].totalDuration;
    data1['totalObtainedMarksMcq'] = examStud.totalObtainedMarksMcq;
    data1['totalObtainedMarksWritten'] = examStud.totalObtainedMarksWritten;
    data.push(data1);
  }
  examDetails = null;
  try {
    examDetails = await BothExam.findById(String(examIdObj)).populate(
      'courseId subjectId',
    );
  } catch (err) {
    return res.status(500).json('Something went wrong.');
  }
  //console.log(examDetails.totalMarksMcq);
  //console.log(examDetails.totalMarksWritten);

  let examInfo = {
    id: String(examDetails._id),
    name: examDetails.name,
    courseName: examDetails.courseId.name,
    subjectName: examDetails.subjectId.name,
    startTime: moment(examDetails.startTime).subtract(6, 'h').format('LLL'),
    endTime: moment(examDetails.endTime).subtract(6, 'h').format('LLL'),
    totalQuestion: qWritten.totalQuestions,
    variation: examType[Number(examDetails.examType)],
    type: examVariation[Number(examDetails.examVariation)],
    totalMarks: examDetails.totalMarksMcq + qWritten.totalMarks,
  };
  return res.status(200).json({ data, examInfo, paginateData });
};

const bothGetHistoryFilter = async (req, res, next) => {
  const examId = req.query.examId;
  const regNo = req.query.regNo;
  if (!ObjectId.isValid(examId) || !regNo)
    return res.status(404).json('Student ID not valid.');
  let page = req.query.page || 1;
  let studentId = null;
  let examIdObj = new mongoose.Types.ObjectId(examId);
  try {
    studentId = await Student.find({
      regNo: {
        $regex: new RegExp('.*' + regNo.toLowerCase() + '.*', 'i'),
      },
    });
  } catch (err) {
    return res.status(500).json('Something went wrong.');
  }
  if (studentId.length == 0) return res.status(404).json('No data found.');
  let studIds = [];
  for (let i = 0; i < studentId.length; i++) {
    studIds[i] = studentId[i]._id;
  }
  let count = 0;
  try {
    count = await BothStudentExamVsQuestions.find({
      $and: [{ examId: examIdObj }, { studentId: { $in: studIds } }],
    }).count();
  } catch (err) {
    return res.status(500).json('Something went wrong.');
  }
  if (count == 0) {
    return res.status(404).json('No data found.');
  }
  let paginateData = pagination(count, page);
  let data = [],
    rank;
  try {
    rank = await BothStudentExamVsQuestions.find({
      $and: [{ examId: examIdObj }, { studentId: { $in: studIds } }],
    })
      .populate('studentId')
      .skip(paginateData.skippedIndex)
      .limit(paginateData.perPage);
  } catch (err) {
    ////console.log(err);
    return res.status(500).json('Something went wrong.');
  }
  let qWritten = null;
  try {
    qWritten = await BothQuestionsWritten.findOne({ examId: examIdObj });
  } catch (err) {
    return res.status(500).json('Something went wrong.');
  }
  for (let i = 0; i < rank.length; i++) {
    let mcqRank = null;
    try {
      mcqRank = await BothRank.findOne({
        $and: [{ examId: examIdObj }, { studentId: rank[i].studentId._id }],
      });
    } catch (err) {
      return res.status(500).json('Something went wrong.');
    }
    if (mcqRank == null) mcqRank = '-1';
    else mcqRank = mcqRank.rank;
    let data1 = {},
      examStud = null;
    data1['studentId'] = rank[i].studentId._id;
    try {
      examStud = await BothStudentExamVsQuestions.findOne({
        $and: [{ examId: examIdObj }, { studentId: data1['studentId'] }],
      }).populate('studentId');
    } catch (err) {
      return res.status(500).json('Something went wrong.');
    }
    data1['examStud'] = examStud;
    data1['totalObtainedMarks'] = examStud.totalObtainedMarks;
    data1['meritPosition'] = mcqRank;
    data1['examStartTime'] = moment(rank[i].examStartTimeMcq)
      .subtract(6, 'h')
      .format('LLL');
    data1['examEndTime'] = moment(rank[i].examEndTimeWritten)
      .subtract(6, 'h')
      .format('LLL');
    data1['duration'] = rank[i].totalDuration;
    data1['totalObtainedMarksMcq'] = examStud.totalObtainedMarksMcq;
    data1['totalObtainedMarksWritten'] = examStud.totalObtainedMarksWritten;
    data.push(data1);
  }
  examDetails = null;
  try {
    examDetails = await BothExam.findById(String(examIdObj)).populate(
      'courseId subjectId',
    );
  } catch (err) {
    return res.status(500).json('Something went wrong.');
  }
  //console.log(examDetails.totalMarksMcq);
  //console.log(examDetails.totalMarksWritten);
  let examInfo = {
    id: String(examDetails._id),
    name: examDetails.name,
    courseName: examDetails.courseId.name,
    subjectName: examDetails.subjectId.name,
    startTime: moment(examDetails.startTime).subtract(6, 'h').format('LLL'),
    endTime: moment(examDetails.endTime).subtract(6, 'h').format('LLL'),
    totalQuestion: qWritten.totalQuestions,
    variation: examType[Number(examDetails.examType)],
    type: examVariation[Number(examDetails.examVariation)],
    totalMarks: examDetails.totalMarksMcq + examDetails.totalMarksWritten,
  };
  return res.status(200).json({ data, examInfo, paginateData });
};

//error handle and ranks update

const updateStudentExamInfo1 = async (req, res, next) => {
  const examId = req.query.examId;
  if (!ObjectId.isValid(examId))
    return res.status(404).json('Exam Id is not valid.');
  const examIdObj = new mongoose.Types.ObjectId(examId);
  ////console.log(examIdObj, "examIdObj");
  let examUncheckStudent = null;
  try {
    examUncheckStudent = await StudentMarksRank.find(
      {
        $and: [
          { examId: examIdObj },
          { finishedStatus: false },
          { runningStatus: true },
          { totalObtainedMarks: 0 },
        ],
      },
      '_id',
    );
  } catch (err) {
    return res.status(500).json('Something went wrong.');
  }
  ////console.log(examUncheckStudent, "examUncheckStudent");
  if (examUncheckStudent.length == 0)
    return res.status(200).json('All student submit the exam.');
  let updateStatus = null;
  try {
    updateStatus = await StudentMarksRank.updateMany(
      {
        _id: { $in: examUncheckStudent },
      },
      { $set: { runningStatus: false, finishedStatus: true } },
    );
  } catch (err) {
    return res.status(500).json('Something went wrong.');
  }
  ////console.log(updateStatus, "updateStatus");
  if (updateStatus.modifiedCount == 0)
    return res.status(404).json('Not updated.');
  return res.status(201).json('Updated successfully.');
};

const updateStudentExamInfo2 = async (req, res, next) => {
  const examId = req.query.examId;
  if (!ObjectId.isValid(examId))
    return res.status(404).json('Exam Id is not valid.');
  const examIdObj = new mongoose.Types.ObjectId(examId);
  let examData = null;
  try {
    examData = await Exam.findById(examId);
  } catch (err) {
    return res.status(500).json('Something went wrong.');
  }

  let examUncheckStudent = null;
  try {
    examUncheckStudent = await StudentMarksRank.find(
      {
        $and: [
          { examId: examIdObj },
          { finishedStatus: false },
          { runningStatus: true },
        ],
      },
      '_id',
    );
  } catch (err) {
    return res.status(500).json('Something went wrong.');
  }
  ////console.log(examUncheckStudent, "examUncheckStudent");
  if (examUncheckStudent.length == 0)
    return res.status(200).json('All student submit the exam.');
  for (let i = 0; i < examUncheckStudent.length; i++) {
    let totalNotAnswered = 0,
      TotalCorrectAnswer = 0,
      totalWrongAnswer = 0,
      totalCorrectMarks = 0,
      totalWrongMarks = 0,
      totalMarks = 0;
    let data = await StudentExamVsQuestionsMcq.findOne(
      {
        $and: [
          { examId: examIdObj },
          { studentId: examUncheckStudent[i].studentId },
        ],
      },
      'mcqQuestionId answeredOption -_id',
    ).populate('mcqQuestionId');
    if (data == null) continue;
    let mcqDetail = data.mcqQuestionId;
    for (let i = 0; i < answeredOption.length; i++) {
      if (answeredOption[i] == '-1') totalNotAnswered = totalNotAnswered + 1;
      else if (answeredOption[i] == mcqDetail[i].correctOption)
        totalCorrectAnswer = totalCorrectAnswer + 1;
      else totalWrongAnswer = totalWrongAnswer + 1;
    }
    totalCorrectMarks = Number(totalCorrectAnswer * examData.marksPerMcq);
    totalWrongMarks = Number(totalWrongAnswer * examData.negativeMarks);
    totalMarks = Number(totalCorrectMarks - totalWrongMarks);
    let upd;
    const update1 = {
      totalCorrectAnswer: totalCorrectAnswer,
      totalWrongAnswer: totalWrongAnswer,
      totalNotAnswered: totalNotAnswered,
      totalCorrectMarks: totalCorrectMarks,
      totalWrongMarks: totalWrongMarks,
      totalObtainedMarks: totalObtainedMarks,
    };
    try {
      upd = await StudentExamVsQuestionsMcq.updateOne(
        {
          $and: [
            { examId: examIdObj },
            { studentId: examUncheckStudent[i].studentId },
          ],
        },
        update1,
      );
    } catch (err) {
      return res.status(500).json('Something went wrong.');
    }
  }
  let updateStatus = null;
  try {
    updateStatus = await StudentMarksRank.updateMany(
      {
        _id: { $in: examUncheckStudent },
      },
      { $set: { runningStatus: false, finishedStatus: true } },
    );
  } catch (err) {
    return res.status(500).json('Something went wrong.');
  }
  ////console.log(updateStatus, "updateStatus");
  if (updateStatus.modifiedCount == 0)
    return res.status(404).json('Not updated.');
  return res.status(201).json('Updated successfully.');
};

const updateStudentExamInfo = async (req, res, next) => {
  const examId = req.query.examId;
  if (!ObjectId.isValid(examId))
    return res.status(404).json('Exam Id is not valid.');
  const examIdObj = new mongoose.Types.ObjectId(examId);
  let getEndTime = null;
  ////console.log(examIdObj, "examIdObj");
  try {
    getEndTime = await Exam.findById(examId).select('endTime -_id');
  } catch (err) {
    return res.status(500).json('Something went wrong.');
  }
  let nullArr = [];
  getEndTime = moment(getEndTime.endTime);
  let currentTime = moment(Date.now()).add(6, 'hours');
  ////console.log(currentTime);
  ////console.log(getEndTime);
  if (currentTime < getEndTime) {
    return res.status(200).json(nullArr);
  }
  let examUncheckStudent = null;
  try {
    examUncheckStudent = await StudentMarksRank.find(
      {
        $and: [
          { examId: examIdObj },
          { finishedStatus: false },
          { runningStatus: true },
        ],
      },
      '_id',
    );
  } catch (err) {
    return res.status(500).json('Something went wrong.');
  }
  //get student id dont submit:start
  let studentIds = [];
  try {
    studentIds = await StudentMarksRank.find(
      {
        $and: [
          { examId: examIdObj },
          { finishedStatus: false },
          { runningStatus: true },
        ],
      },
      'studentId -_id',
    );
  } catch (err) {
    return res.status(500).json('Something went wrong.');
  }
  //get student id dont submit:end
  ////console.log(examUncheckStudent, "examUncheckStudent");
  if (examUncheckStudent.length == 0)
    return res.status(200).json('All student submit the exam.');
  let updateStatus = null;
  try {
    updateStatus = await StudentMarksRank.updateMany(
      {
        _id: { $in: examUncheckStudent },
      },
      { $set: { runningStatus: false, finishedStatus: true } },
    );
  } catch (err) {
    return res.status(500).json('Something went wrong.');
  }
  ////console.log(updateStatus, "updateStatus");
  if (updateStatus.modifiedCount == 0)
    return res.status(404).json('Not updated.');

  //result calculation:start
  ////console.log("studentIds", studentIds);
  for (let i = 0; i < studentIds.length; i++) {
    let examData = null;
    try {
      examData = await StudentExamVsQuestionsMcq.findOne({
        $and: [{ examId: examIdObj }, { studentId: studentIds[i].studentId }],
      }).populate('mcqQuestionId examId');
    } catch (err) {
      return res.status(500).json('Problem when get exam data.');
    }
    ////console.log(examData);
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
      if (answered[i] == '-1') {
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
      upd = null;
    try {
      result = await StudentExamVsQuestionsMcq.findByIdAndUpdate(id, update1);
      ////console.log("result", result.modifiedCount);
      upd = await StudentMarksRank.updateOne(
        {
          $and: [{ examId: examIdObj }, { studentId: studentIds[i].studentId }],
        },
        { totalObtainedMarks: totalObtainedMarks },
      );
      ////console.log("upd", upd.modifiedCount);
    } catch (err) {
      return res.status(500).json('Problem when update total obtained marks.');
    }
  }
  //result calculation:end

  return res.status(201).json('Updated successfully.');
};

const updateStudentExamInfo3 = async (req, res, next) => {
  const examId = req.query.examId;
  if (!ObjectId.isValid(examId))
    return res.status(404).json('Exam Id is not valid.');
  const examIdObj = new mongoose.Types.ObjectId(examId);
  let getEndTime = null;
  ////console.log(examIdObj, "examIdObj");
  try {
    getEndTime = await Exam.findById(examId).select('endTime -_id');
  } catch (err) {
    return res.status(500).json('Something went wrong.');
  }
  let nullArr = [];
  getEndTime = moment(getEndTime.endTime);
  let currentTime = moment(Date.now()).add(6, 'hours');
  ////console.log(currentTime);
  ////console.log(getEndTime);
  if (currentTime < getEndTime) {
    return res.status(200).json(nullArr);
  }
  let examUncheckStudent = null;
  try {
    examUncheckStudent = await StudentMarksRank.find(
      {
        $and: [
          { examId: examIdObj },
          { finishedStatus: false },
          { runningStatus: true },
        ],
      },
      '_id',
    );
  } catch (err) {
    return res.status(500).json('Something went wrong.');
  }
  //get student id dont submit:start
  let studentIds = [];
  try {
    studentIds = await StudentMarksRank.find(
      {
        $and: [
          { examId: examIdObj },
          { finishedStatus: false },
          { runningStatus: true },
        ],
      },
      'studentId -_id',
    );
  } catch (err) {
    return res.status(500).json('Something went wrong.');
  }
  //get student id dont submit:end
  ////console.log(examUncheckStudent, "examUncheckStudent");
  if (examUncheckStudent.length == 0)
    return res.status(200).json('All student submit the exam.');
  let updateStatus = null;
  try {
    updateStatus = await StudentMarksRank.updateMany(
      {
        _id: { $in: examUncheckStudent },
      },
      { $set: { runningStatus: false, finishedStatus: true } },
    );
  } catch (err) {
    return res.status(500).json('Something went wrong.');
  }
  ////console.log(updateStatus, "updateStatus");
  if (updateStatus.modifiedCount == 0)
    return res.status(404).json('Not updated.');

  //result calculation:start
  ////console.log("studentIds", studentIds);
  for (let i = 0; i < studentIds.length; i++) {
    let examData = null;
    try {
      examData = await StudentExamVsQuestionsMcq.findOne({
        $and: [{ examId: examIdObj }, { studentId: studentIds[i].studentId }],
      }).populate('mcqQuestionId examId');
    } catch (err) {
      return res.status(500).json('Problem when get exam data.');
    }
    ////console.log(examData);
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
      if (answered[i] == '-1') {
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
      upd = null;
    try {
      result = await StudentExamVsQuestionsMcq.findByIdAndUpdate(id, update1);
      ////console.log("result", result.modifiedCount);
      upd = await StudentMarksRank.updateOne(
        {
          $and: [{ examId: examIdObj }, { studentId: studentIds[i].studentId }],
        },
        { totalObtainedMarks: totalObtainedMarks },
      );
      ////console.log("upd", upd.modifiedCount);
    } catch (err) {
      return res.status(500).json('Problem when update total obtained marks.');
    }
  }
  //result calculation:end

  return res.status(201).json('Updated successfully.');
};

const updateRank1 = async (req, res, next) => {
  let examId = req.query.examId;
  if (!ObjectId.isValid(examId))
    return res.status(404).json('Invalid exam Id.');
  let examIdObj = new mongoose.Types.ObjectId(examId);
  let deleteAll = null;
  try {
    deleteAll = await McqRank.deleteMany({ examId: examIdObj });
  } catch (err) {
    return res.status(500).json('Something went wrong.');
  }
  try {
    ranks = await StudentMarksRank.find({ examId: examIdObj })
      .select('examId totalObtainedMarks studentId -_id')
      .sort({
        totalObtainedMarks: -1,
      });
  } catch (err) {
    return res.status(500).json('Something went wrong.');
  }
  let dataLength = ranks.length;
  for (let i = 0; i < dataLength; i++) {
    ranks[i].rank = i + 1;
  }
  ////console.log(ranks);
  let sav = null;
  try {
    sav = await McqRank.insertMany(ranks, { ordered: false });
  } catch (err) {
    return res.status(500).json('Something went wrong.');
  }
  return res.status(201).json('Success!');
};

const getRank1 = async (req, res, next) => {
  let examId = req.query.examId;
  let studentId = req.query.studentId;
  if (!ObjectId.isValid(examId) || !ObjectId.isValid(studentId))
    return res.status(200).json('Invalid examId or studentId.');
  let examIdObj = new mongoose.Types.ObjectId(examId);
  let studentIdObj = new mongoose.Types.ObjectId(studentId);
  let resultRank = null;
  try {
    resultRank = await McqRank.findOne({
      $and: [{ examId: examIdObj }, { studentId: studentIdObj }],
    }).select('rank -_id');
  } catch (err) {
    return res.status(500).json('Something went wrong.');
  }
  if (!resultRank) return res.status(200).json(-1);
  ////console.log(resultRank.rank);
  resultRank = Number(resultRank.rank);
  return res.status(200).json(resultRank);
};

const getRankStudent = async (req, res, next) => {
  let examId = req.query.examId;
  let studentId = req.user.studentId;
  if (!ObjectId.isValid(examId) || !ObjectId.isValid(studentId))
    return res.status(200).json('Invalid examId or studentId.');
  let examIdObj = new mongoose.Types.ObjectId(examId);
  let studentIdObj = new mongoose.Types.ObjectId(studentId);
  let resultRank = null;
  try {
    resultRank = await McqRank.findOne({
      $and: [{ examId: examIdObj }, { studentId: studentIdObj }],
    }).select('rank -_id');
  } catch (err) {
    return res.status(500).json('Something went wrong.');
  }
  if (!resultRank) return res.status(200).json(-1);
  ////console.log(resultRank.rank);
  resultRank = Number(resultRank.rank);
  return res.status(200).json(resultRank);
};

const updateRank = async (req, res, next) => {
  let examId = req.query.examId;
  if (!ObjectId.isValid(examId))
    return res.status(404).json('Invalid exam Id.');
  let examIdObj = new mongoose.Types.ObjectId(examId);
  let delData = null;
  try {
    delData = await McqRank.deleteMany({ examId: examIdObj });
  } catch (err) {
    return res.status(500).json('Something went wrong.');
  }
  // try {
  //   checkGenerate = await FreeMcqRank.find({ examId: examIdObj });
  // } catch (err) {
  //   return res.status(500).json("Something went wrong.");
  // }
  // if (checkGenerate) return res.status(404).json("Already Generated.");
  let ranks = null;
  try {
    ranks = await StudentMarksRank.find({ examId: examIdObj })
      .select('examId totalObtainedMarks studentId -_id')
      .sort({
        totalObtainedMarks: -1,
      });
  } catch (err) {
    return res.status(500).json('Something went wrong.');
  }
  ////console.log("ranks:", ranks);
  let dataLength = ranks.length;
  let dataIns = [];
  for (let i = 0; i < dataLength; i++) {
    let dataFree = {};
    dataFree['examId'] = ranks[i].examId;
    dataFree['studentId'] = ranks[i].studentId;
    dataFree['totalObtainedMarks'] = ranks[i].totalObtainedMarks;
    dataFree['rank'] = i + 1;
    dataIns.push(dataFree);
  }
  ////console.log("dataIns:", dataIns);
  let sav = null;
  try {
    sav = await McqRank.insertMany(dataIns, { ordered: false });
  } catch (err) {
    return res.status(500).json('Something went wrong.');
  }
  return res.status(201).json('Success!');
};

const getRank = async (req, res, next) => {
  let examId = req.query.examId;
  let mobileNo = req.query.mobileNo;
  if (!ObjectId.isValid(examId) || !mobileNo)
    return res.status(200).json('Invalid examId or mobileNo.');
  let examIdObj = new mongoose.Types.ObjectId(examId);
  let studentIdObj = null,
    studentInfo = null;
  try {
    studentInfo = await Student.findOne({ mobileNo: mobileNo });
  } catch (err) {
    return res.status(500).json('Something went wrong.');
  }
  ////console.log("student Info", studentInfo);
  if (!studentInfo) return res.status(404).json('No data found.');
  studentIdObj = studentInfo._id;
  let resultRank = null;
  try {
    resultRank = await McqRank.findOne({
      $and: [{ examId: examIdObj }, { studentId: studentIdObj }],
    }).select('rank -_id');
  } catch (err) {
    return res.status(500).json('Something went wrong.');
  }
  if (!resultRank) return res.status(404).json('Exam not finshed yet.');
  ////console.log(resultRank.rank);
  resultRank = Number(resultRank.rank);
  let data1 = {},
    getResult = null;
  try {
    getResult = await StudentExamVsQuestionsMcq.findOne({
      $and: [{ examId: examId }, { studentId: studentIdObj }],
    }).populate('examId');
  } catch (err) {
    return res.status(500).json('Problem when get Student Exam info.');
  }
  let dataTime = null;
  try {
    dataTime = await StudentMarksRank.findOne({
      $and: [{ examId: examId }, { studentId: studentIdObj }],
    });
  } catch (err) {
    return res.status(500).json('Something went wrong.');
  }
  let totalStudent = null;
  try {
    totalStudent = await StudentMarksRank.find({ examId: examId }).count();
  } catch (err) {
    return res.status(500).json('Something went wrong.');
  }
  data1['name'] = studentInfo.name;
  data1['mobileNo'] = studentInfo.mobileNo;
  data1['institution'] = studentInfo.institution;
  data1['rank'] = resultRank;
  data1['totalStudent'] = totalStudent;
  data1['examName'] = getResult.examId.name;
  data1['startTime'] = moment(getResult.examId.startTime).format('LLL');
  data1['endTime'] = moment(getResult.examId.endTime).format('LLL');
  data1['totalMarksMcq'] = getResult.examId.totalMarksMcq;
  data1['examVariation'] = examType[Number(getResult.examId.examType)];
  data1['examType'] = examVariation[Number(getResult.examId.examVariation)];
  data1['totalCorrectAnswer'] = getResult.totalCorrectAnswer;
  data1['totalWrongAnswer'] = getResult.totalWrongAnswer;
  data1['totalCorrectMarks'] = getResult.totalCorrectMarks;
  data1['totalWrongMarks'] = getResult.totalWrongMarks;
  data1['totalNotAnswered'] = getResult.totalNotAnswered;
  data1['totalObtainedMarks'] = getResult.totalObtainedMarks;
  data1['studExamStartTime'] = moment(dataTime.examStartTime).format('LLL');
  data1['studExamEndTime'] = moment(dataTime.examEndTime).format('LLL');
  data1['studExamTime'] = dataTime.duration;
  data1['marksPerMcq'] = getResult.examId.marksPerMcq;
  data1['marksPerWrong'] =
    (getResult.examId.marksPerMcq * getResult.examId.negativeMarks) / 100;
  return res.status(200).json(data1);
};

const getAllRank = async (req, res, next) => {
  let examId = req.query.examId;
  if (!ObjectId.isValid(examId)) return res.status(200).json('Invalid examId.');
  let examIdObj = new mongoose.Types.ObjectId(examId);
  let resultRank = null;
  try {
    resultRank = await McqRank.find({ examId: examIdObj })
      .sort('rank')
      .populate('examId studentId');
  } catch (err) {
    return res.status(500).json('Something went wrong.');
  }
  if (!resultRank) return res.status(404).json('Exam not finshed yet.');
  ////console.log(resultRank);
  //eturn res.status(200).json(resultRank);
  let allData = [];
  let totalStudent = null;
  for (let i = 0; i < resultRank.length; i++) {
    let data1 = {};
    let conData = '*******';
    data1['examName'] = resultRank[i].examId.name;
    data1['studentName'] = resultRank[i].studentId.name;
    data1['studentId'] = resultRank[i].studentId._id;
    data1['displayPicture'] = resultRank[i].studentId.displayPicture;
    data1['mobileNoOrg'] = resultRank[i].studentId.mobileNo;
    data1['mobileNo'] = conData.concat(
      resultRank[i].studentId.mobileNo.slice(7),
    );
    data1['institution'] = resultRank[i].studentId.institution;
    data1['totalObtainedMarks'] = resultRank[i].totalObtainedMarks;
    data1['rank'] = resultRank[i].rank;
    data1['totalStudent'] = resultRank.length;
    data1['totalMarks'] = resultRank[i].examId.totalMarksMcq;
    allData.push(data1);
  }
  return res.status(200).json(allData);
};

//written part

const writtenExamCheckMiddleware = async (req, res, next) => {
  const examId = req.query.examId;
  const studentId = req.user.studentId;
  //start:check student already complete the exam or not
  let examIdObj, studentIdObj;
  studentIdObj = new mongoose.Types.ObjectId(studentId);
  examIdObj = new mongoose.Types.ObjectId(examId);
  let status = null;
  let query = null;
  let examEndTime = null;
  let currentDate = moment(new Date());
  ////console.log(currentDate, "current Date");
  try {
    query = await Exam.findById(examId, 'endTime');
  } catch (err) {
    return res.status(500).json('Something went wrong.');
  }
  examEndTime = query.endTime;
  if (moment(examEndTime) < currentDate) return res.status(200).json('ended');
  // if (
  //   Number(moment(studExamEndTime).add(6, "h") - moment(examData.endTime)) > 0
  // )
  //   studExamEndTime = examData.endTime;
  // else studExamEndTime = moment(studExamEndTime).add(6, "h");

  try {
    status = await StudentExamVsQuestionsWritten.findOne({
      $and: [{ studentId: studentIdObj }, { examId: examIdObj }],
    });
  } catch (err) {
    return res.status(500).json('Something went wrong.');
  }
  if (status == null) return res.status(200).json('assign');
  else {
    if (status.uploadStatus == true || query.endTime < currentDate)
      return res.status(200).json('ended');
    else return res.status(200).json('running');
  }
};

const assignWrittenQuestion = async (req, res, next) => {
  let examId = req.query.examId;
  let studentId = req.user.studentId;
  examId = new mongoose.Types.ObjectId(examId);
  studentId = new mongoose.Types.ObjectId(studentId);

  let existData = [];
  try {
    existData = await StudentExamVsQuestionsWritten.find({
      $and: [{ studentId: studentId }, { examId: examId }],
    });
  } catch (err) {
    return res.status(500).json('10.Something went wrong.');
  }
  if (existData.length > 0) return res.status(200).json('running');

  let examData = null;
  let sav = null;
  let dataArr = [];
  let questionsNo = null;
  try {
    questionsNo = await QuestionsWritten.findOne(
      { examId: examId },
      'totalQuestions -_id',
    );
  } catch (err) {
    return res.status(500).json('something went wrong.');
  }
  let dataSubArr = [];
  for (let i = 0; i < questionsNo.totalQuestions; i++) {
    dataArr[i] = null;
    dataSubArr[i] = [];
  }
  let data = new StudentExamVsQuestionsWritten({
    examId: examId,
    studentId: studentId,
    ansewerScriptILink: dataArr,
    submittedScriptILink: dataSubArr,
  });
  try {
    sav = data.save();
  } catch (err) {
    return res.status(500).json('something went wrong.');
  }
  if (sav == null) return res.status(404).json('Not Assigned.');
  let questionData = null;
  let data1 = {};
  try {
    questionData = await QuestionsWritten.find({
      $and: [{ examId: examId }, { status: true }],
    });
    examData = await Exam.findOne({
      $and: [{ _id: examId }, { examFreeOrNot: false }, { status: true }],
    });
  } catch (err) {
    return res.status(500).json('something went wrong.');
  }
  if (questionData == null || examData.endTime < moment(new Date()))
    return res.status(404).json('no question found or time expired.');

  data1['questionILink'] = questionData.questionILink;
  data1['status'] = questionData.status;
  data1['totalQuestions'] = questionData.totalQuestions;
  data1['marksPerQuestions'] = questionData.marksPerQuestions;
  data1['totalMarks'] = questionData.totalMarks;
  data1['studExamStartTime'] = moment(new Date());
  data1['studExamEndTime'] = moment(data1.studExamStartTime).add(
    examData.duration,
    'minutes',
  );
  data1['examStartTime'] = examData.startTime;
  data1['examEndTime'] = examData.endTime;
  if (data1.examEndTime < data1.studExamEndTime)
    data1['studExamEndTime'] = data1.examEndTime;
  data1['duration'] = examData.duration;
  data1['examId'] = examId;
  data1['examName'] = examData.name;
  data1['variation'] = examData.variation;
  let objSav = new StudentMarksRank({
    examId: examId,
    studentId: studentId,
    examStartTime: moment(data1.studExamStartTime).add(6, 'h'),
    examEndTime: moment(data1.studExamEndTime).add(6, 'h'),
    duration: data1.duration,
  });

  try {
    sav = objSav.save();
  } catch (err) {
    return res.status(500).json('Something went wrong.');
  }

  return res.status(200).json(data1);
};

const submitStudentScript1 = async (req, res, next) => {
  const files = req.files;
  //file upload handle:start
  const file = req.files;
  ////console.log(file);
  let questionILinkPath = [];
  if (!file.questionILink) return res.status(400).json('Files not uploaded.');
  for (let i = 0; i < file.questionILink.length; i++) {
    console.log(file.questionILink[i]);
    questionILinkPath[i] = 'uploads/'.concat(file.questionILink[i].filename);
    let fileNameUpd =
      'uploads/' + 'UPD_' + file.questionILink[i].filename + '.png';
    await sharp(questionILinkPath[i]).png({ quality: 5 }).toFile(fileNameUpd);
    questionILinkPath[i] = fileNameUpd;
    //console.log(questionILinkPath[i]);
    fs.unlinkSync('uploads/'.concat(file.questionILink[i].filename));
  }
  //file upload handle:end
  let examId = req.body.examId;
  let studentId = req.user.studentId;
  let questionNo = Number(req.body.questionNo);
  ////console.log(questionNo);
  ////console.log(examId);
  ////console.log(studentId);
  if (
    !ObjectId.isValid(studentId) ||
    !ObjectId.isValid(examId) ||
    !questionNo
  ) {
    return res
      .status(404)
      .json('Student Id or Exam Id or question Id is not valid.');
  }
  questionNo = questionNo - 1;
  let studentIdObj = new mongoose.Types.ObjectId(studentId);
  examId = new mongoose.Types.ObjectId(examId);
  let getQuestionScript = null;
  try {
    getQuestionScript = await StudentExamVsQuestionsWritten.findOne({
      $and: [{ studentId: studentIdObj }, { examId: examId }],
    });
  } catch (err) {
    return res.status(500).json('Something went wrong.');
  }
  let insertId = getQuestionScript._id;
  let uploadStatus = getQuestionScript.uploadStatus;
  let checkStatus = getQuestionScript.checkStatus;
  if (uploadStatus == true || checkStatus == true)
    return res.status(404).json('Can not upload file.');
  getQuestionScript = getQuestionScript.submittedScriptILink;
  if (getQuestionScript[questionNo]) {
    for (let i = 0; i < getQuestionScript[questionNo].length; i++) {
      fs.unlinkSync(getQuestionScript[questionNo][i]);
    }
  }

  getQuestionScript[questionNo] = questionILinkPath;
  ////console.log(getQuestionScript[questionNo]);
  let upd = {
    submittedScriptILink: getQuestionScript,
  };
  let doc;
  try {
    doc = await StudentExamVsQuestionsWritten.findByIdAndUpdate(insertId, upd);
  } catch (err) {
    ////console.log(err);
    return res.status(500).json('Something went wrong!');
  }
  return res.status(201).json('Submitted Successfully.');
};

const submitStudentScript2 = async (req, res, next) => {
  const files = req.files;
  //file upload handle:start
  const file = req.files;
  ////console.log(file);
  let questionILinkPath = [];
  if (!file.questionILink) return res.status(400).json('Files not uploaded.');
  for (let i = 0; i < file.questionILink.length; i++) {
    questionILinkPath[i] = 'uploads/'.concat(file.questionILink[i].filename);
  }
  //file upload handle:end
  let examId = req.body.examId;
  let studentId = req.user.studentId;
  let questionNo = Number(req.body.questionNo);
  ////console.log(questionNo);
  ////console.log(examId);
  ////console.log(studentId);
  if (
    !ObjectId.isValid(studentId) ||
    !ObjectId.isValid(examId) ||
    !questionNo
  ) {
    return res
      .status(404)
      .json('Student Id or Exam Id or question Id is not valid.');
  }
  questionNo = questionNo - 1;
  let studentIdObj = new mongoose.Types.ObjectId(studentId);
  examId = new mongoose.Types.ObjectId(examId);
  let getQuestionScript = null;
  try {
    getQuestionScript = await StudentExamVsQuestionsWritten.findOne({
      $and: [{ studentId: studentIdObj }, { examId: examId }],
    });
  } catch (err) {
    return res.status(500).json('Something went wrong.');
  }
  let insertId = getQuestionScript._id;
  let uploadStatus = getQuestionScript.uploadStatus;
  let checkStatus = getQuestionScript.checkStatus;
  if (uploadStatus == true || checkStatus == true)
    return res.status(404).json('Can not upload file.');
  getQuestionScript = getQuestionScript.submittedScriptILink;
  if (getQuestionScript[questionNo]) {
    for (let i = 0; i < getQuestionScript[questionNo].length; i++) {
      fs.unlinkSync(getQuestionScript[questionNo][i]);
    }
  }

  getQuestionScript[questionNo] = questionILinkPath;
  ////console.log(getQuestionScript[questionNo]);
  let upd = {
    submittedScriptILink: getQuestionScript,
  };
  let doc;
  try {
    doc = await StudentExamVsQuestionsWritten.findByIdAndUpdate(insertId, upd);
  } catch (err) {
    ////console.log(err);
    return res.status(500).json('Something went wrong!');
  }
  return res.status(201).json('Submitted Successfully.');
};

const submitStudentScript10 = async (req, res, next) => {
  //file upload handle:start
  const images = req.body.questionILink;
  ////console.log(file);
  let questionILinkPath = [];
  //file upload handle:end
  let examId = req.body.examId;
  let studentId = req.user.studentId;
  let questionNo = Number(req.body.questionNo);
  ////console.log(questionNo);
  ////console.log(examId);
  ////console.log(studentId);
  if (!ObjectId.isValid(studentId) || !ObjectId.isValid(examId) || !images) {
    return res
      .status(404)
      .json(
        'Student Id or Exam Id or question Id is not valid or no image uploaded.',
      );
  }
  const dir = path.resolve(
    path.join(__dirname, '../uploads/' + String(examId) + '/'),
  );
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }
  //new implement
  for (let i = 0; i < images.length; i++) {
    const matches = String(images[i]).replace(
      /^data:([A-Za-z-+/]+);base64,/,
      '',
    );
    let timeData = Date.now();
    let fileNameDis =
      String(examId) +
      '-' +
      String(studentId) +
      '_' +
      String(questionNo + 1) +
      '-' +
      String(i + 1) +
      timeData +
      '.jpeg';
    let fileName =
      dir +
      '/' +
      String(examId) +
      '-' +
      String(studentId) +
      '_' +
      String(questionNo + 1) +
      '-' +
      String(i + 1) +
      timeData +
      '.jpeg';
    try {
      fs.writeFileSync(fileName, matches, { encoding: 'base64' });
    } catch (err) {
      //console.log(e);
      return res.status(500).json(err);
    }
    questionILinkPath[i] = 'uploads/' + String(examId) + '/' + fileNameDis;
    console.log('questionILinkPath[i]:', questionILinkPath[i]);
  }
  //new implement
  questionNo = questionNo - 1;
  let studentIdObj = new mongoose.Types.ObjectId(studentId);
  examId = new mongoose.Types.ObjectId(examId);
  let getQuestionScript = null;
  try {
    getQuestionScript = await StudentExamVsQuestionsWritten.findOne({
      $and: [{ studentId: studentIdObj }, { examId: examId }],
    });
  } catch (err) {
    return res.status(500).json('Something went wrong.');
  }
  let insertId = getQuestionScript._id;
  let uploadStatus = getQuestionScript.uploadStatus;
  let checkStatus = getQuestionScript.checkStatus;
  if (uploadStatus == true || checkStatus == true)
    return res.status(404).json('Can not upload file.');
  getQuestionScript = getQuestionScript.submittedScriptILink;
  if (getQuestionScript[questionNo]) {
    for (let i = 0; i < getQuestionScript[questionNo].length; i++) {
      fs.unlinkSync(getQuestionScript[questionNo][i]);
    }
  }

  getQuestionScript[questionNo] = questionILinkPath;
  ////console.log(getQuestionScript[questionNo]);
  let upd = {
    submittedScriptILink: getQuestionScript,
  };
  let doc;
  try {
    doc = await StudentExamVsQuestionsWritten.findByIdAndUpdate(insertId, upd);
  } catch (err) {
    ////console.log(err);
    return res.status(500).json('Something went wrong!');
  }
  return res.status(201).json('Submitted Successfully.');
};

const submitStudentScript = async (req, res, next) => {
  //file upload handle:start
  const images = req.body.questionILink;
  ////console.log(file);
  let questionILinkPath = [];
  //file upload handle:end
  let examId = req.body.examId;
  let studentId = req.user.studentId;
  let questionNo = Number(req.body.questionNo);
  ////console.log(questionNo);
  ////console.log(examId);
  ////console.log(studentId);
  if (!ObjectId.isValid(studentId) || !ObjectId.isValid(examId) || !images) {
    return res
      .status(404)
      .json(
        'Student Id or Exam Id or question Id is not valid or no image uploaded.',
      );
  }
  const dir = path.resolve(
    path.join(__dirname, '../uploads/' + String(examId) + '/'),
  );

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }
  const dir1 = path.resolve(
    path.join(
      __dirname,
      '../uploads/' + String(examId) + '/' + String(studentId) + '/',
    ),
  );
  // dir1 = path.resolve(path.join(__dirname, dir + String(studentId) + '/'))
  if (!fs.existsSync(dir1)) {
    fs.mkdirSync(dir1);
  }

  //new implement
  for (let i = 0; i < images.length; i++) {
    const matches = String(images[i]).replace(
      /^data:([A-Za-z-+/]+);base64,/,
      '',
    );
    let timeData = Date.now();
    let fileNameDis =
      String(examId) +
      '-' +
      String(studentId) +
      '_' +
      String(questionNo + 1) +
      '-' +
      String(i + 1) +
      timeData +
      '.jpeg';
    let fileName =
      dir1 +
      '/' +
      String(examId) +
      '-' +
      String(studentId) +
      '_' +
      String(questionNo + 1) +
      '-' +
      String(i + 1) +
      timeData +
      '.jpeg';
    try {
      fs.writeFileSync(fileName, matches, { encoding: 'base64' });
    } catch (err) {
      //console.log(e);
      return res.status(500).json(err);
    }
    questionILinkPath[i] =
      'uploads/' + String(examId) + '/' + String(studentId) + '/' + fileNameDis;
    console.log('questionILinkPath[i]:', questionILinkPath[i]);
  }
  //new implement
  let returnedData = questionILinkPath;
  questionNo = questionNo - 1;
  let studentIdObj = new mongoose.Types.ObjectId(studentId);
  examId = new mongoose.Types.ObjectId(examId);
  let getQuestionScript = null;
  try {
    getQuestionScript = await StudentExamVsQuestionsWritten.findOne({
      $and: [{ studentId: studentIdObj }, { examId: examId }],
    });
  } catch (err) {
    return res.status(500).json('Something went wrong.');
  }
  let insertId = getQuestionScript._id;
  let uploadStatus = getQuestionScript.uploadStatus;
  let checkStatus = getQuestionScript.checkStatus;
  if (uploadStatus == true || checkStatus == true)
    return res.status(404).json('Can not upload file.');
  getQuestionScript = getQuestionScript.submittedScriptILink;
  if (getQuestionScript[questionNo]) {
    for (let i = 0; i < getQuestionScript[questionNo].length; i++) {
      fs.unlinkSync(getQuestionScript[questionNo][i]);
    }
  }

  getQuestionScript[questionNo] = questionILinkPath;
  ////console.log(getQuestionScript[questionNo]);
  let upd = {
    submittedScriptILink: getQuestionScript,
  };
  let doc;
  try {
    doc = await StudentExamVsQuestionsWritten.findByIdAndUpdate(insertId, upd);
  } catch (err) {
    ////console.log(err);
    return res.status(500).json('Something went wrong!');
  }
  return res.status(201).json(questionILinkPath);
};

const runningWritten = async (req, res, next) => {
  let questionData = null;
  let examData = null;
  let examId = req.query.examId;
  let studentId = req.user.studentId;
  examId = new mongoose.Types.ObjectId(examId);
  studentId = new mongoose.Types.ObjectId(studentId);
  let data1 = {};
  try {
    questionData = await QuestionsWritten.findOne({
      $and: [{ examId: examId }, { status: true }],
    });
    examData = await Exam.findOne({
      $and: [{ _id: examId }, { examFreeOrNot: false }, { status: true }],
    });
  } catch (err) {
    return res.status(500).json('1.something went wrong.');
  }

  let timeData = null;
  try {
    timeData = await StudentMarksRank.findOne({
      $and: [{ examId: examId }, { studentId: studentId }],
    });
  } catch (err) {
    return res.status(500).json('2.something went wrong.');
  }
  ////console.log(timeData);
  data1['questionILink'] = questionData.questionILink;
  data1['status'] = questionData.status;
  data1['totalQuestions'] = questionData.totalQuestions;
  data1['marksPerQuestions'] = questionData.marksPerQuestion;
  data1['totalMarks'] = questionData.totalMarks;
  data1['studExamStartTime'] = timeData.examStartTime;
  data1['studExamEndTime'] = timeData.examEndTime;
  data1['examStartTime'] = examData.startTime;
  data1['examEndTime'] = examData.endTime;
  data1['duration'] = examData.duration;
  data1['examId'] = examId;
  data1['examName'] = examData.name;
  data1['variation'] = examData.examVariation;
  data1['examType'] = examData.examType;

  return res.status(200).json(data1);
};

const submitWritten = async (req, res, next) => {
  let examId = req.query.examId;
  let studentId = req.user.studentId;
  if (!ObjectId.isValid(studentId) || !ObjectId.isValid(examId)) {
    return res
      .status(404)
      .json('Student Id or Exam Id or question Id is not valid.');
  }
  let studentIdObj = new mongoose.Types.ObjectId(studentId);
  examId = new mongoose.Types.ObjectId(examId);

  let status = null;
  try {
    status = await StudentExamVsQuestionsWritten.findOne({
      $and: [{ studentId: studentIdObj }, { examId: examId }],
    });
  } catch (err) {
    return res.status(500).json('10.Something went wrong.');
  }
  if (status.uploadStatus == true) return res.status(200).json('ended');

  let startTime = null;
  let endTime = moment(new Date());
  try {
    startTime = await StudentMarksRank.findOne({
      $and: [{ examId: examId }, { studentId: studentIdObj }],
    });
  } catch (err) {
    return res.status(500).json('Something went wrong.');
  }
  startTime = startTime.examStartTime;
  let upd = {
    examEndTime: moment(endTime).add(6, 'h'),
    duration: (moment(endTime).add(6, 'h') - moment(startTime)) / (1000 * 60),
  };
  let sav = null;
  try {
    sav = await StudentMarksRank.findOneAndUpdate(
      {
        $and: [{ examId: examId }, { studentId: studentIdObj }],
      },
      upd,
    );
  } catch (err) {
    return res.status(500).json('Something went wrong.');
  }
  let uploadStatus = null;
  try {
    uploadStatus = await StudentExamVsQuestionsWritten.updateOne(
      {
        $and: [{ studentId: studentIdObj }, { examId: examId }],
      },
      { uploadStatus: true },
    );
  } catch (err) {
    return res.status(500).json('Somethhing went wrong.');
  }
  return res.status(201).json('Submitted Sccessfully.');
};

const updateStudentWrittenExamInfo = async (req, res, next) => {
  let data = null;
  let examId = req.body.examId;
  //console.log(req.body);
  examId = new mongoose.Types.ObjectId(examId);
  try {
    data = await StudentExamVsQuestionsWritten.find({
      $and: [{ examId: examId }, { uploadStatus: false }],
    });
  } catch (err) {
    return res.status(500).json('Something went wrong.');
  }
  //console.log(data);
  if (!data) return res.status(201).json('Already Submitted.');
  for (let i = 0; i < data.length; i++) {
    let sav = null;
    try {
      sav = await StudentExamVsQuestionsWritten.findByIdAndUpdate(data[i]._id, {
        uploadStatus: true,
      });
    } catch (err) {
      return res.status(500).json('Something went wrong.');
    }
  }
  return res.status(201).json('Updated.');
};

const getWrittenStudentAllByExam = async (req, res, next) => {
  let examId = req.query.examId;
  let page = req.query.page || 1;
  let count = 0;
  if (!ObjectId.isValid(examId))
    return res.status(404).json('exam ID is not valid.');
  examId = new mongoose.Types.ObjectId(examId);
  let data = null,
    data1 = [];
  try {
    count = await StudentExamVsQuestionsWritten.find({
      $and: [{ examId: examId }, { checkStatus: false }],
    }).count();
  } catch (err) {
    return res.status(500).json('Something went wrong.');
  }
  let paginateData = pagination(count, page);
  ////console.log(paginateData);
  try {
    data = await StudentExamVsQuestionsWritten.find({
      $and: [{ examId: examId }, { checkStatus: false }],
    })
      .populate('studentId examId')
      .skip(paginateData.skippedIndex)
      .limit(paginateData.perPage);
  } catch (err) {
    return res.status(500).json('Something went wrong.');
  }
  ////console.log(data);
  let data2 = null;
  try {
    data2 = await QuestionsWritten.findOne({ examId: examId });
  } catch (err) {
    return res.status(500).json('Something went wrong.');
  }
  for (let i = 0; i < data.length; i++) {
    let dataObj = {};
    dataObj['examName'] = data[i].examId.name;
    dataObj['examVariation'] = examVariation[data[i].examId.examVariation];
    dataObj['examType'] = examType[data[i].examId.examType];
    dataObj['studentName'] = data[i].studentId.name;
    dataObj['studentId'] = data[i].studentId._id;
    dataObj['checkStatus'] = data[i].checkStatus;
    dataObj['totalQuestions'] = data2.totalQuestions;
    dataObj['totalMarks'] = data2.totalMarks;
    dataObj['marksPerQuestion'] = data2.marksPerQuestion;
    data1.push(dataObj);
  }
  return res.status(200).json({ data1, paginateData });
};

const getCheckWrittenStudentAllByExam = async (req, res, next) => {
  let examId = req.query.examId;
  let page = req.query.page || 1;
  let count = 0;
  if (!ObjectId.isValid(examId))
    return res.status(404).json('exam ID is not valid.');
  examId = new mongoose.Types.ObjectId(examId);
  let data = null,
    data1 = [];
  try {
    count = await StudentExamVsQuestionsWritten.find({
      $and: [{ examId: examId }, { checkStatus: true }],
    }).count();
  } catch (err) {
    return res.status(500).json('Something went wrong.');
  }
  let paginateData = pagination(count, page);
  ////console.log(paginateData);
  try {
    data = await StudentExamVsQuestionsWritten.find({
      $and: [{ examId: examId }, { checkStatus: true }],
    })
      .populate('studentId examId')
      .skip(paginateData.skippedIndex)
      .limit(paginateData.perPage);
  } catch (err) {
    return res.status(500).json('Something went wrong.');
  }
  ////console.log(data);
  let data2 = null;
  try {
    data2 = await QuestionsWritten.findOne({ $and: [{ examId: examId }] });
  } catch (err) {
    return res.status(500).json('Something went wrong.');
  }
  for (let i = 0; i < data.length; i++) {
    let dataObj = {};
    dataObj['examName'] = data[i].examId.name;
    dataObj['examVariation'] = examVariation[data[i].examId.examVariation];
    dataObj['examType'] = examType[data[i].examId.examType];
    dataObj['studentName'] = data[i].studentId.name;
    dataObj['studentId'] = data[i].studentId._id;
    dataObj['checkStatus'] = data[i].checkStatus;
    dataObj['totalQuestions'] = data2.totalQuestions;
    dataObj['totalMarks'] = data2.totalMarks;
    dataObj['marksPerQuestion'] = data2.marksPerQuestion;
    data1.push(dataObj);
  }
  return res.status(200).json({ data1, paginateData });
};

const getWrittenStudentSingleByExam = async (req, res, next) => {
  let examId = req.query.examId;
  let studentId = req.query.studentId;
  if (!ObjectId.isValid(examId) || !ObjectId.isValid(studentId))
    return res.status(404).json('exam ID or student ID is not valid.');
  examId = new mongoose.Types.ObjectId(examId);
  studentId = new mongoose.Types.ObjectId(studentId);
  let data = null,
    data1 = [];
  try {
    data = await StudentExamVsQuestionsWritten.findOne({
      $and: [
        { examId: examId },
        { studentId: studentId },
        { uploadStatus: true },
      ],
    }).populate('studentId examId');
  } catch (err) {
    return res.status(500).json('Something went wrong.');
  }
  let data2 = null;
  try {
    data2 = await QuestionsWritten.findOne({ $and: [{ examId: examId }] });
  } catch (err) {
    return res.status(500).json('Something went wrong.');
  }
  let examData = null;
  try {
    examData = await Exam.findOne({ _id: examId });
  } catch {
    return res.status(500).json('Problem fidning exam');
  }
  // console.log("dataTwo: ",examData);
  let dataObj = {};
  dataObj['examName'] = data.examId.name;
  dataObj['examVariation'] = examVariation[data.examId.examVariation];
  dataObj['examType'] = examType[data.examId.examType];
  dataObj['studentName'] = data.studentId.name;
  dataObj['studentId'] = data.studentId._id;
  dataObj['subjectId'] = examData.subjectId;
  dataObj['answerScript'] = [];
  for (let p = 0; p < data2.totalQuestions; p++) {
    if (data.submittedScriptILink[p])
      dataObj['answerScript'][p] = data.submittedScriptILink[p];
    else dataObj['answerScript'][p] = null;
  }
  dataObj['totalQuestions'] = data2.totalQuestions;
  dataObj['totalMarks'] = data2.totalMarks;
  dataObj['marksPerQuestion'] = data2.marksPerQuestion;
  //dataObj["checkStatus"] = data.checkStatus;
  ////console.log(data.checkStatus);
  return res.status(200).json(dataObj);
};

const getWrittenScript = async (req, res, next) => {
  let studentId = req.user.studentId;
  let examId = req.query.examId;
  if (!ObjectId.isValid(studentId) || !ObjectId.isValid(examId)) {
    return res
      .status(404)
      .json('Student Id or Exam Id or question Id is not valid.');
  }
  let studentIdObj = new mongoose.Types.ObjectId(studentId);
  let examIdObj = new mongoose.Types.ObjectId(examId);
  let getData = null;
  try {
    getData = await StudentExamVsQuestionsWritten.findOne({
      $and: [{ studentId: studentIdObj }, { examId: examIdObj }],
    });
  } catch (err) {
    return res.status(500).json('Something went wrong.');
  }
  if (getData.checkStatus != true)
    return res.status(404).json('Not checked yet.');
  let data = {};
  data['studentId'] = studentId;
  data['answerScript'] = getData.submittedScriptILink;
  data['checkScript'] = getData.ansewerScriptILink;
  data['obtainedMarks'] = getData.obtainedMarks;
  data['totalObtainedMarks'] = getData.totalObtainedMarks;
  data['examId'] = examId;
  let getQuestion = null;
  try {
    getQuestion = await QuestionsWritten.findOne({
      examId: examIdObj,
    });
  } catch (err) {
    return res.status(500).json('Something went wrong.');
  }
  data['question'] = getQuestion.questionILink;
  return res.status(200).json(data);
};

const historyDataWritten = async (req, res, next) => {
  const studentId = req.user.studentId;
  if (!ObjectId.isValid(studentId))
    return res.status(404).json('Student ID not valid.');
  let page = req.query.page || 1;

  let studentIdObj = new mongoose.Types.ObjectId(studentId);
  let courseId = new mongoose.Types.ObjectId(req.query.courseId);
  let data;
  let count = 0;
  try {
    count = await StudentExamVsQuestionsWritten.find({
      $and: [
        {
          studentId: studentIdObj,
        },
        { checkStatus: true },
      ],
    }).count();
  } catch (err) {
    return res.status(500).json('Something went wrong.');
  }
  //return res.status(200).json(count);
  console.log(count);
  if (count == 0) return res.status(404).json('1.No data found.');
  let paginateData = pagination(count, page);
  try {
    data = await StudentExamVsQuestionsWritten.find({
      studentId: studentIdObj,
      checkStatus: true,
    })
      .populate({
        path: 'examId',
        match: { status: true },
      })
      .skip(paginateData.skippedIndex)
      .limit(paginateData.perPage);
  } catch (err) {
    return res.status(500).json('1.SOmething went wrong.');
  }
  //console.log(data);
  if (data == null)
    return res.status(404).json('No exam data found for the student.');
  let resultData = [];
  let flag = false;
  //console.log(data);
  for (let i = 0; i < data.length; i++) {
    let data1 = {};
    let rank = null;
    let examIdObj;
    if (data[i].examId) {
      examIdObj = new mongoose.Types.ObjectId(data[i].examId._id);
    } else {
      continue;
    }
    //console.log(examIdObj);
    ////console.log(studentIdObj);
    let totalStudent = 0;
    try {
      rank = await StudentMarksRank.findOne(
        {
          $and: [{ studentId: studentIdObj }, { examId: examIdObj }],
        },
        'examStartTime examEndTime',
      );
      totalStudent = await StudentMarksRank.find({
        examId: examIdObj,
      }).count();
    } catch (err) {
      return res.status(500).json('2.Something went wrong.');
    }
    //console.log(rank);

    //get rank
    if (rank == null) continue;
    let resultRank = null;
    try {
      resultRank = await McqRank.findOne({
        $and: [{ examId: examIdObj }, { studentId: studentIdObj }],
      }).select('rank -_id');
    } catch (err) {
      return res.status(500).json('Something went wrong.');
    }
    //resultRank = resultRank.rank;
    ////console.log(resultRank);
    if (resultRank == null) resultRank = '-1';
    else resultRank = resultRank.rank;

    //return res.status(404).json("No exam data found for the student.");
    let subjectIdObj = String(data[i].examId.subjectId);
    let subjectName = null;
    try {
      subjectName = await Subject.findById(subjectIdObj).select('name');
    } catch (err) {
      return res.status(500).json('3.Something went wrong.');
    }
    let questionsWrittens = null;
    try {
      questionsWrittens = await QuestionsWritten.findOne({
        examId: examIdObj,
      });
    } catch (err) {
      return res.status(500).json('3.Something went wrong.');
    }
    subjectName = subjectName.name;
    if (String(data[i].examId.courseId === String(courseId))) {
      data1['examId'] = data[i].examId._id;
      data1['title'] = data[i].examId.name;
      data1['solutionSheet'] = data[i].examId.solutionSheet;
      data1['variation'] = examType[Number(data[i].examId.examType)];
      data1['type'] = examVariation[Number(data[i].examId.examVariation)];
      data1['totalObtainedMarks'] = data[i].totalObtainedMarks;
      data1['totalMarksMcq'] = questionsWrittens.totalMarks;
      data1['obtainPerQuestion'] = data[i].obtainedMarks;
      data1['meritPosition'] = resultRank;
      data1['examStartTime'] = moment(rank.examStartTime)
        .subtract(6, 'h')
        .format('LLL');
      data1['examEndTime'] = moment(rank.examEndTime)
        .subtract(6, 'h')
        .format('LLL');
      data1['subjectName'] = subjectName;
      data1['totalStudent'] = totalStudent;
      resultData.push(data1);
    }
  }
  return res.status(200).json({ resultData, paginateData });
};

const historyDataWritten1 = async (req, res, next) => {
  const studentId = req.user.studentId;
  const courseId = req.query.courseId;
  if (!ObjectId.isValid(studentId) || !ObjectId.isValid(courseId))
    return res.status(404).json('Student & course ID not valid.');
  let page = req.query.page || 1;

  let studentIdObj = new mongoose.Types.ObjectId(studentId);
  let data = [];
  try {
    data = await StudentExamVsQuestionsWritten.find({
      studentId: studentIdObj,
    }).populate('examId');
  } catch (err) {
    return res.status(500).json('1.SOmething went wrong.');
  }
  //console.log(data);
  if (data.length == 0)
    return res.status(404).json('No exam data found for the student.');
  let resultData = [];
  let flag = false;
  ////console.log(data.length);
  for (let i = 0; i < data.length; i++) {
    if (String(courseId) != String(data[i].examId.courseId)) continue;
    let data1 = {};
    let rank = null;
    let examIdObj = new mongoose.Types.ObjectId(data[i].examId._id);
    ////console.log(examIdObj);
    ////console.log(studentIdObj);
    try {
      rank = await StudentMarksRank.findOne(
        {
          $and: [{ studentId: studentIdObj }, { examId: examIdObj }],
        },
        'examStartTime examEndtime',
      );
    } catch (err) {
      return res.status(500).json('2.Something went wrong.');
    }

    //get rank
    if (rank == null) continue;
    let resultRank = null;
    try {
      resultRank = await McqRank.findOne({
        $and: [{ examId: examIdObj }, { studentId: studentIdObj }],
      }).select('rank -_id');
    } catch (err) {
      return res.status(500).json('Something went wrong.');
    }
    //resultRank = resultRank.rank;
    ////console.log(resultRank);
    if (resultRank == null) resultRank = '-1';
    else resultRank = resultRank.rank;

    //return res.status(404).json("No exam data found for the student.");
    let subjectIdObj = String(data[i].examId.subjectId);
    let subjectName = null;
    try {
      subjectName = await Subject.findById(subjectIdObj).select('name');
    } catch (err) {
      return res.status(500).json('3.Something went wrong.');
    }
    let questionsWrittens = null;
    try {
      questionsWrittens = await QuestionsWritten.findOne({
        examId: examIdObj,
      });
    } catch (err) {
      return res.status(500).json('3.Something went wrong.');
    }
    subjectName = subjectName.name;
    data1['examId'] = data[i].examId._id;
    data1['title'] = data[i].examId.name;
    data1['variation'] = examType[Number(data[i].examId.examType)];
    data1['type'] = examVariation[Number(data[i].examId.examVariation)];
    data1['totalObtainedMarks'] = data[i].totalObtainedMarks.toFixed(2);
    data1['totalMarksMcq'] = questionsWrittens.totalMarks;
    data1['obtainPerQuestion'] = data[i].obtainedMarks;
    data1['meritPosition'] = resultRank;
    data1['examStartTime'] = moment(rank.examStartTime).format('LLL');
    data1['examEndTime'] = moment(rank.examEndTime).format('LLL');
    data1['subjectName'] = subjectName;
    resultData.push(data1);
  }
  let count = resultData.length;
  if (count == 0) return res.status(404).json('no data found.');
  let paginateData = pagination(count, page);
  let start, end;
  start = (page - 1) * paginateData.perPage;
  end = page * paginateData.perPage;
  let data3 = [];
  if (count > 0) {
    for (let i = start; i < end; i++) {
      if (i == resultData.length) break;
      data3.push(resultData[i]);
    }
  }
  resultData = data3;
  return res.status(200).json({ resultData, paginateData });
};

const missedExamWritten = async (req, res, next) => {
  const studentId = req.user.studentId;
  const courseId = req.user.courseId;
  if (!ObjectId.isValid(studentId) || !ObjectId.isValid(courseId)) {
    return res.status(404).json('Student Id or Course Id is not valid.');
  }
  const courseIdObj = new mongoose.Types.ObjectId(courseId);
  let studentIdObj = new mongoose.Types.ObjectId(studentId);
  ////console.log(studentIdObj);
  let allExam = null;
  try {
    allExam = await Exam.find({
      $and: [
        { courseId: courseIdObj },
        { status: true },
        { examVariation: 2 },
        { endTime: { $lt: new Date() } },
      ],
    }).select('_id');
  } catch (err) {
    return res.status(500).json('1.Sometihing went wrong.');
  }
  ////console.log("allexam");
  ////console.log(allExam);
  let doneExam = null;
  try {
    doneExam = await StudentExamVsQuestionsWritten.find(
      {
        studentId: studentIdObj,
      },
      'examId',
    );
    ////console.log("doneExam");
    ////console.log(doneExam);
  } catch (err) {
    return res.status(500).json('2.Something went wrong.');
  }
  if (allExam == null) return res.status(404).json('No Exam data found.');
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
    return res.status(500).json('Something went wrong.');
  }
  if (count == 0) {
    return res.status(404).json('No data found.');
  }
  let paginateData = pagination(count, page);
  try {
    resultData = await Exam.find({
      $and: [{ _id: { $in: removedArray } }, { status: true }],
    })
      .populate('subjectId courseId')
      .skip(paginateData.skippedIndex)
      .limit(paginateData.perPage);
  } catch (err) {
    return res.status(500).json('3.Something went wrong.');
  }
  if (resultData == null) return res.status(404).json('No missed exam found.');
  let resultFinal = [];
  for (let i = 0; i < resultData.length; i++) {
    let result = {};
    result['id'] = resultData[i]._id;
    result['exanName'] = resultData[i].name;
    result['subject'] = resultData[i].subjectId.name;
    result['startTime'] = moment(resultData[i].startTime).format('LL');
    result['duration'] = Number(resultData[i].duration);
    result['examVariation'] = examType[Number(resultData[i].examType)];
    result['examType'] = examVariation[Number(resultData[i].examVariation)];
    resultFinal.push(result);
  }
  return res.status(200).json({ resultFinal, paginateData });
};

const getWrittenQuestion = async (req, res, next) => {
  const examId = req.query.examId;
  if (!ObjectId.isValid(examId)) {
    return res.status(404).json('Exam Id is not valid.');
  }
  let examIdObj = new mongoose.Types.ObjectId(examId);
  let questionData = null;
  try {
    questionData = await WrittenQuestionVsExam.findOne({
      examId: examIdObj,
    }).populate('writtenQuestionId examId');
  } catch (err) {
    return res.status(500).json('Something went wrong.');
  }
  let examData = null;
  try {
    examData = await Exam.findById(examId).populate('courseId subjectId');
  } catch (err) {
    return res.status(500).json('Something went wrong.');
  }
  if (questionData.writtenQuestionId.status == false)
    return res.status(404).json('Exam Is not valid');
  let data = {};
  data['examId'] = examId;
  data['examName'] = questionData.examId.name;
  data['examImage'] = questionData.writtenQuestionId.questionILink;
  data['subjectName'] = examData.subjectId.name;
  data['courseName'] = examData.courseId.name;
  return res.status(200).json(data);
};

const viewSollutionWritten = async (req, res, next) => {
  const studentId = req.user.studentId;
  const examId = req.query.examId;
  if (!ObjectId.isValid(studentId) || !ObjectId.isValid(examId))
    return res.status(404).json('student Id or examId is not valid.');
  let studentIdObj = new mongoose.Types.ObjectId(studentId);
  let examIdObj = new mongoose.Types.ObjectId(examId);
  ////console.log(studentIdObj, examIdObj);
  let data = null;
  try {
    data = await StudentExamVsQuestionsWritten.findOne({
      $and: [{ studentId: studentIdObj }, { examId: examIdObj }],
      //studentId: studentIdObj,
    });
  } catch (err) {
    return res.status(500).json('1.Something went wrong.');
  }
  //console.log(data);
  if (data == null)
    return res.status(404).json('No exam found under this student.');
  let dataWritten = null;
  try {
    dataWritten = await QuestionsWritten.findOne({
      examId: examIdObj,
    }).populate('examId');
  } catch (err) {
    return res.status(500).json('1.Something went wrong.');
  }

  //console.log(dataWritten);
  let data1 = {};
  data1['question'] = dataWritten.questionILink;
  data1['sollutionScript'] = data.ansewerScriptILink;
  data1['obtainedMarks'] = data.obtainedMarks;
  data1['totalObtainedMarks'] = data.totalObtainedMarks;
  data1['marksPerQuestion'] = dataWritten.marksPerQuestion;
  data1['totalQuestion'] = dataWritten.totalQuestions;
  data1['totalMarks'] = dataWritten.totalMarks;

  return res.status(200).json(data1);
};

const viewSollutionWrittenAdmin = async (req, res, next) => {
  const studentId = req.query.studentId;
  const examId = req.query.examId;
  if (!ObjectId.isValid(studentId) || !ObjectId.isValid(examId))
    return res.status(404).json('student Id or examId is not valid.');
  let studentIdObj = new mongoose.Types.ObjectId(studentId);
  let examIdObj = new mongoose.Types.ObjectId(examId);
  ////console.log(studentIdObj, examIdObj);
  let data = null;
  try {
    data = await StudentExamVsQuestionsWritten.findOne({
      $and: [{ studentId: studentIdObj }, { examId: examIdObj }],
      //studentId: studentIdObj,
    });
  } catch (err) {
    return res.status(500).json('1.Something went wrong.');
  }
  //console.log(data);
  if (data == null)
    return res.status(404).json('No exam found under this student.');
  let dataWritten = null;
  try {
    dataWritten = await QuestionsWritten.findOne({
      examId: examIdObj,
    }).populate('examId');
  } catch (err) {
    return res.status(500).json('1.Something went wrong.');
  }

  //console.log(dataWritten);
  let data1 = {};
  data1['question'] = dataWritten.questionILink;
  data1['sollutionScript'] = data.ansewerScriptILink;
  data1['obtainedMarks'] = data.obtainedMarks;
  data1['totalObtainedMarks'] = data.totalObtainedMarks;
  data1['marksPerQuestion'] = dataWritten.marksPerQuestion;
  data1['totalQuestion'] = dataWritten.totalQuestions;
  data1['totalMarks'] = dataWritten.totalMarks;

  return res.status(200).json(data1);
};

const examDetailWritten = async (req, res, next) => {
  const studentId = req.user.studentId;
  const examId = req.query.examId;
  if (!ObjectId.isValid(studentId) || !ObjectId.isValid(examId))
    return res.status(404).json('student Id or examId is not valid.');
  let studentIdObj = new mongoose.Types.ObjectId(studentId);
  let examIdObj = new mongoose.Types.ObjectId(examId);
  ////console.log(studentIdObj, examIdObj);
  let data = null;
  try {
    data = await StudentExamVsQuestionsWritten.findOne({
      $and: [{ studentId: studentIdObj }, { examId: examIdObj }],
    });
  } catch (err) {
    return res.status(500).json('1.Something went wrong.');
  }
  let examData = null;
  try {
    examData = await Exam.findById(examId).populate('courseId subjectId');
  } catch (err) {
    return res.status(500).json('1.Something went wrong.');
  }
  let writtenData = null;
  try {
    writtenData = await QuestionsWritten.findOne({
      examId: examIdObj,
    }).populate('examId');
  } catch (err) {
    return res.status(500).json('1.Something went wrong.');
  }
  //console.log(writtenData);
  let data1 = {};
  let nullIndexes = [];
  for (let i = 0; i < writtenData.totalQuestions; i++) {
    if (data.obtainedMarks[i] == null) nullIndexes.push(i);
  }
  let resultRank = null;
  try {
    resultRank = await McqRank.findOne({
      $and: [{ examId: examIdObj }, { studentId: studentIdObj }],
    }).select('rank -_id');
  } catch (err) {
    return res.status(500).json('Something went wrong.');
  }
  if (resultRank == null) resultRank = '-1';
  else resultRank = resultRank.rank;
  data1['examName'] = examData.name;
  data1['subjectName'] = examData.subjectId.name;
  data1['type'] = examType[examData.type];
  data1['totalObtainedMarks'] = data.totalObtainedMarks;
  data1['notSubmitted'] = nullIndexes.length;
  data1['notSubmittedIndex'] = nullIndexes;
  data1['obtainedMarks'] = data.obtainedMarks;
  data1['examTotalMarks'] = writtenData.totalMarks;
  data1['examTotalQuestions'] = writtenData.totalQuestions;
  data1['examMarksPerQuestion'] = writtenData.marksPerQuestion;
  data1['rank'] = resultRank;
  return res.status(200).json(data1);
};

//both exam
const bothUpdateStudentExamInfo = async (req, res, next) => {
  const examId = req.body.examId;
  if (!ObjectId.isValid(examId))
    return res.status(404).json('Exam Id is not valid.');
  const examIdObj = new mongoose.Types.ObjectId(examId);
  let getEndTime = null;
  try {
    getEndTime = await BothExam.findById(examId).select('endTime -_id');
  } catch (err) {
    return res.status(500).json('Something went wrong.');
  }
  let examUncheckStudent = null;
  try {
    examUncheckStudent = await BothStudentExamVsQuestions.find(
      {
        $and: [
          { examId: examIdObj },
          { finishedStatus: false },
          { runningStatus: true },
        ],
      },
      '_id',
    );
  } catch (err) {
    return res.status(500).json('Something went wrong.');
  }
  let studentIds = [];
  try {
    studentIds = await BothStudentExamVsQuestions.find(
      {
        $and: [
          { examId: examIdObj },
          { finishedStatus: false },
          { runningStatus: true },
        ],
      },
      'studentId -_id',
    );
  } catch (err) {
    return res.status(500).json('Something went wrong.');
  }
  if (examUncheckStudent.length > 0) {
    //return res.status(200).json("All student submit the exam.");
    let updateStatus = null;
    try {
      updateStatus = await BothStudentExamVsQuestions.updateMany(
        {
          _id: { $in: examUncheckStudent },
        },
        { $set: { runningStatus: false, finishedStatus: true } },
      );
    } catch (err) {
      return res.status(500).json('Something went wrong.');
    }
    for (let i = 0; i < studentIds.length; i++) {
      let examData = null;
      try {
        examData = await BothStudentExamVsQuestions.findOne({
          $and: [{ examId: examIdObj }, { studentId: studentIds[i].studentId }],
        }).populate('mcqQuestionId examId');
      } catch (err) {
        return res.status(500).json('Problem when get exam data.');
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
        if (answered[i] == '-1') {
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
          update1,
        );
      } catch (err) {
        //console.log(err);
        return res
          .status(500)
          .json('Problem when update total obtained marks.');
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
      { $set: { uploadStatus: true } },
    );
  } catch (err) {
    return res.status(500).json('55.Something went wrong.');
  }
  return res.status(201).json('Updated successfully.');
};

const bothExamCheckMiddleware = async (req, res, next) => {
  const examId = req.query.eId;
  const studentId = req.user.studentId;
  //start:check student already complete the exam or not
  let examIdObj, studentIdObj;
  studentIdObj = new mongoose.Types.ObjectId(studentId);
  examIdObj = new mongoose.Types.ObjectId(examId);
  let status = null;
  let query = null;
  let examEndTime = null;
  let currentDate = moment(new Date());
  //(currentDate, "current Date");
  try {
    query = await BothExam.findById(examId, 'endTime');
  } catch (err) {
    return res.status(500).json('1.Something went wrong.');
  }
  examEndTime = query.endTime;
  if (examEndTime < currentDate) return res.status(200).json('Both ended');

  try {
    status = await BothStudentExamVsQuestions.findOne({
      $and: [{ studentId: studentIdObj }, { examId: examIdObj }],
    });
  } catch (err) {
    return res.status(500).json('2.Something went wrong.');
  }
  //console.log(status);
  if (status == null) return res.status(200).json('Mcq assign');
  else {
    if (status.finishedStatus == true && status.uploadStatus == true)
      return res.status(200).json('Both ended');
    if (status.finishedStatus == true) return res.status(200).json('Mcq ended');
    //  if (status.runningStatus == true)
    return res.status(200).json('Mcq running');
  }
};

const bothHistoryData = async (req, res, next) => {
  const studentId = req.user.studentId;
  const courseId = req.query.courseId;
  if (!ObjectId.isValid(studentId) || !ObjectId.isValid(courseId))
    return res.status(404).json('Student or course ID not valid.');
  let page = req.query.page || 1;

  let studentIdObj = new mongoose.Types.ObjectId(studentId);
  let data = [];
  //return res.status(200).json(count);
  ////console.log(count);
  try {
    data = await BothStudentExamVsQuestions.find({
      $and: [{ studentId: studentIdObj }],
    }).populate('examId');
  } catch (err) {
    return res.status(500).json('1.Something went wrong.');
  }
  //console.log(data);
  if (data.length == 0)
    return res.status(404).json('No exam data found for the student.');
  let resultData = [];
  let flag = false;
  //console.log(data);
  let newData = [];
  for (let i = 0; i < data.length; i++) {
    if (data[i].examId !== null) {
      newData.push(data[i]);
    }
  }
  data = newData;
  for (let i = 0; i < data.length; i++) {
    console.log(data[i]);
    if (String(courseId) != String(data[i].examId.courseId)) continue;
    let data1 = {};
    let rank = null;
    let examIdObj = new mongoose.Types.ObjectId(data[i].examId._id);
    let resultRank = null;
    let totalStudent = 0;
    try {
      resultRank = await BothRank.findOne({
        $and: [{ examId: examIdObj }, { studentId: studentIdObj }],
      }).select('rank -_id');
      totalStudent = await BothRank.find({
        examId: examIdObj,
      }).count();
    } catch (err) {
      return res.status(500).json('Something went wrong.');
    }
    if (resultRank == null) resultRank = '-1';
    else resultRank = resultRank.rank;
    let subjectIdObj = String(data[i].examId.subjectId);
    let subjectName = null;
    try {
      subjectName = await Subject.findById(subjectIdObj).select('name');
    } catch (err) {
      return res.status(500).json('3.Something went wrong.');
    }
    if (data[i].examId.status == false) continue;
    let writtenData = null;
    try {
      writtenData = await BothQuestionsWritten.findOne({
        examId: new mongoose.Types.ObjectId(data[i].examId._id),
      });
    } catch (err) {
      return res.status(500).json('1.Something went wrong.');
    }
    subjectName = subjectName.name;
    data1['examId'] = data[i].examId._id;
    data1['title'] = data[i].examId.name;
    data1['variation'] = examType[Number(data[i].examId.examType)];
    //data1["type"] = examVariation[Number(data[i].examId.examVariation)];
    data1['totalMarksMcq'] =
      data[i].examId.totalMarksMcq + writtenData.totalMarks;
    data1['solutionSheet'] = data[i].examId.solutionSheet;
    data1['totalMarksWritten'] = data[i].totalObtainedMarksWritten.toFixed(2);
    data1['totalObtainedMarks'] = (
      data[i].totalObtainedMarksMcq + data[i].totalObtainedMarksWritten
    ).toFixed(2);
    data1['meritPosition'] = resultRank;
    data1['examStartTimeMcq'] = moment(data[i].examStartTimeMcq).format('LLL');
    data1['examEndTimeMcq'] = moment(data[i].examEndTimeMcq).format('LLL');
    data1['examStartTimeWritten'] = moment(data[i].examStartTimeWritten).format(
      'LLL',
    );
    data1['examEndTimeWritten'] = moment(data[i].examEndTimeWritten).format(
      'LLL',
    );
    data1['mcqDuration'] = data[i].mcqDuration.toFixed(2);
    data1['writtenDuration'] = data[i].writtenDuration.toFixed(2);
    data1['totalDuration'] = (
      data[i].mcqDuration + data[i].writtenDuration
    ).toFixed(2);
    data1['subjectName'] = subjectName;
    data1['examStartTime'] = moment(data[i].examId.startTime)
      .subtract(6, 'h')
      .format('LLL');
    data1['totalStudent'] = totalStudent;
    data1['numberOfRetakes'] = data[i].examId.numberOfRetakes;
    resultData.push(data1);
  }
  let count = resultData.length;
  if (count == 0) return res.status(404).json('no data found.');
  let paginateData = pagination(count, page);
  let start, end;
  start = (page - 1) * paginateData.perPage;
  end = page * paginateData.perPage;
  let data3 = [];
  if (count > 0) {
    for (let i = start; i < end; i++) {
      if (i == resultData.length) break;
      data3.push(resultData[i]);
    }
  }
  resultData = data3;
  return res.status(200).json({ resultData, paginateData });
};

const bothExamDetail = async (req, res, next) => {
  const studentId = req.user.studentId;
  const examId = req.query.examId;
  if (!ObjectId.isValid(studentId) || !ObjectId.isValid(examId))
    return res.status(404).json('student Id or examId is not valid.');
  let studentIdObj = new mongoose.Types.ObjectId(studentId);
  let examIdObj = new mongoose.Types.ObjectId(examId);
  let resultRank = null;
  try {
    resultRank = await BothRank.findOne({
      $and: [{ examId: examIdObj }, { studentId: studentIdObj }],
    }).select('rank -_id');
  } catch (err) {
    return res.status(500).json('Something went wrong.');
  }
  if (resultRank == null) resultRank = '-1';
  else resultRank = resultRank.rank;
  ////console.log(studentIdObj, examIdObj);
  let data = null;
  try {
    data = await BothStudentExamVsQuestions.findOne({
      $and: [{ studentId: studentIdObj }, { examId: examIdObj }],
    });
  } catch (err) {
    return res.status(500).json('1.Something went wrong.');
  }
  let examData = null;
  try {
    examData = await BothExam.findById(examId).populate('courseId subjectId');
  } catch (err) {
    return res.status(500).json('1.Something went wrong.');
  }
  console.log(examData);
  let writtenData = null;
  try {
    writtenData = await BothQuestionsWritten.findOne({
      examId: examIdObj,
    }).populate('examId');
  } catch (err) {
    return res.status(500).json('1.Something went wrong.');
  }
  //console.log(writtenData);
  let data1 = {};
  let nullIndexes = [];
  for (let i = 0; i < writtenData.totalQuestions; i++) {
    if (data.obtainedMarks[i] == null) nullIndexes.push(i);
  }
  //exam
  data1['examName'] = examData.name;
  data1['totalMarksMcq'] = examData.totalMarksMcq;
  data1['totalQuestionMcq'] = examData.totalQuestionMcq;
  data1['totalMarksWritten'] = writtenData.totalMarks;
  data1['totalQuestionWritten'] = writtenData.totalQuestions;
  data1['totalMarks'] = examData.totalMarksMcq + writtenData.totalMarks;
  data1['mcqDuration'] = examData.mcqDuration;
  data1['writtenDuration'] = examData.writtenDuration;
  data1['totalDuration'] = examData.totalDuration;
  data1['subjectName'] = examData.subjectId.name;
  data1['type'] = examType[examData.type];
  //exam
  //MCQ
  data1['totalCorrectMarks'] = data.totalCorrectMarks;
  data1['totalCorrectAnswer'] = data.totalCorrectAnswer;
  data1['totalWrongMarks'] = data.totalWrongMarks;
  data1['totalWrongAnswer'] = data.totalWrongAnswer;
  data1['totalNotAnswered'] = data.totalNotAnswered;
  data1['totalObtainMarksMcq'] = data.totalObtainedMarksMcq;
  //MCQ
  //written
  data1['notSubmitted'] = nullIndexes.length;
  data1['notSubmittedIndex'] = nullIndexes;
  data1['obtainedMarks'] = data.obtainedMarks;
  data1['obtainedMarksWritten'] = data.totalObtainedMarksWritten;
  //written
  data1['totalObtainedMarks'] = Number(
    (
      Number(data.totalObtainedMarksMcq.toFixed(2)) +
      Number(data.totalObtainedMarksWritten.toFixed(2))
    ).toFixed(2),
  );
  data1['rank'] = resultRank;
  return res.status(200).json(data1);
};

const bothGetWrittenStudentSingleByExam = async (req, res, next) => {
  let examId = req.query.examId;
  let studentId = req.query.studentId;
  if (!ObjectId.isValid(examId) || !ObjectId.isValid(studentId))
    return res.status(404).json('exam ID or student ID is not valid.');
  examId = new mongoose.Types.ObjectId(examId);
  studentId = new mongoose.Types.ObjectId(studentId);
  let data = null,
    data1 = [];
  try {
    data = await BothStudentExamVsQuestions.findOne({
      $and: [
        { examId: examId },
        { studentId: studentId },
        { uploadStatus: true },
      ],
    }).populate('studentId examId');
  } catch (err) {
    return res.status(500).json('Something went wrong.');
  }
  //console.log("data", data);
  let data2 = null;
  try {
    data2 = await BothQuestionsWritten.findOne({ $and: [{ examId: examId }] });
  } catch (err) {
    return res.status(500).json('Something went wrong.');
  }
  // console.log("dataaa=>",data.examId);
  let dataObj = {};
  dataObj['examName'] = data.examId.name;
  dataObj['subjectId'] = data.examId.subjectId;
  dataObj['examVariation'] = examVariation[data.examId.examVariation];
  dataObj['examType'] = examType[data.examId.examType];
  dataObj['studentName'] = data.studentId.name;
  dataObj['studentId'] = data.studentId._id;
  dataObj['answerScript'] = [];
  for (let i = 0; i < data2.totalQuestions; i++) {
    dataObj['answerScript'][i] = null;
    if (data.submittedScriptILink[i])
      dataObj['answerScript'][i] = data.submittedScriptILink[i];
  }
  dataObj['totalQuestions'] = data2.marksPerQuestion.length;
  dataObj['totalMarks'] = data2.totalMarks;
  dataObj['marksPerQuestion'] = data2.marksPerQuestion;
  //dataObj["checkStatus"] = data.checkStatus;
  ////console.log(data.checkStatus);
  return res.status(200).json(dataObj);
};

const bothGetWrittenScript = async (req, res, next) => {
  let studentId = req.user.studentId;
  let examId = req.query.examId;
  if (!ObjectId.isValid(studentId) || !ObjectId.isValid(examId)) {
    return res
      .status(404)
      .json('Student Id or Exam Id or question Id is not valid.');
  }
  let studentIdObj = new mongoose.Types.ObjectId(studentId);
  let examIdObj = new mongoose.Types.ObjectId(examId);
  let getData = null;
  try {
    getData = await BothStudentExamVsQuestions.findOne({
      $and: [{ studentId: studentIdObj }, { examId: examIdObj }],
    });
  } catch (err) {
    return res.status(500).json('Something went wrong.');
  }
  if (getData.checkStatus != true)
    return res.status(404).json('Not checked yet.');
  let data = {};
  data['studentId'] = studentId;
  data['answerScript'] = getData.submittedScriptILink;
  data['checkScript'] = getData.ansewerScriptILink;
  data['obtainedMarks'] = getData.obtainedMarks;
  data['totalObtainedMarks'] = getData.totalObtainedMarks;
  data['examId'] = examId;
  let getQuestion = null;
  try {
    getQuestion = await BothQuestionsWritten.findOne({
      examId: examIdObj,
    });
  } catch (err) {
    return res.status(500).json('Something went wrong.');
  }
  data['question'] = getQuestion.questionILink;
  return res.status(200).json(data);
};

const bothGetWrittenStudentAllByExam = async (req, res, next) => {
  let examId = req.query.examId;
  let page = req.query.page || 1;
  let count = 0;
  if (!ObjectId.isValid(examId))
    return res.status(404).json('exam ID is not valid.');
  examId = new mongoose.Types.ObjectId(examId);
  let data = null,
    data1 = [];
  try {
    count = await BothStudentExamVsQuestions.find({
      $and: [{ examId: examId }, { checkStatus: false }],
    }).count();
  } catch (err) {
    return res.status(500).json('Something went wrong.');
  }
  let paginateData = pagination(count, page);
  ////console.log(paginateData);
  try {
    data = await BothStudentExamVsQuestions.find({
      $and: [{ examId: examId }, { checkStatus: false }],
    })
      .populate('studentId examId')
      .skip(paginateData.skippedIndex)
      .limit(paginateData.perPage);
  } catch (err) {
    return res.status(500).json('Something went wrong.');
  }
  ////console.log(data);
  let data2 = null;
  try {
    data2 = await BothQuestionsWritten.findOne({ examId: examId });
  } catch (err) {
    return res.status(500).json('Something went wrong.');
  }
  for (let i = 0; i < data.length; i++) {
    let dataObj = {};
    dataObj['examName'] = data[i].examId.name;
    dataObj['examVariation'] = examVariation[data[i].examId.examVariation];
    dataObj['examType'] = examType[data[i].examId.examType];
    dataObj['studentName'] = data[i].studentId.name;
    dataObj['studentId'] = data[i].studentId._id;
    dataObj['checkStatus'] = data[i].checkStatus;
    dataObj['totalQuestions'] = data2.totalQuestions;
    dataObj['totalMarks'] = data2.totalMarks;
    dataObj['marksPerQuestion'] = data2.marksPerQuestion;
    data1.push(dataObj);
  }
  return res.status(200).json({ data1, paginateData });
};

const bothGetCheckWrittenStudentAllByExam = async (req, res, next) => {
  let examId = req.query.examId;
  let page = req.query.page || 1;
  let count = 0;
  if (!ObjectId.isValid(examId))
    return res.status(404).json('exam ID is not valid.');
  examId = new mongoose.Types.ObjectId(examId);
  let data = null,
    data1 = [];
  try {
    count = await BothStudentExamVsQuestions.find({
      $and: [{ examId: examId }, { checkStatus: true }],
    }).count();
  } catch (err) {
    return res.status(500).json('Something went wrong.');
  }
  let paginateData = pagination(count, page);
  ////console.log(paginateData);
  try {
    data = await BothStudentExamVsQuestions.find({
      $and: [{ examId: examId }, { checkStatus: true }],
    })
      .populate('studentId examId')
      .skip(paginateData.skippedIndex)
      .limit(paginateData.perPage);
  } catch (err) {
    return res.status(500).json('Something went wrong.');
  }
  ////console.log(data);
  let data2 = null;
  try {
    data2 = await BothQuestionsWritten.findOne({ $and: [{ examId: examId }] });
  } catch (err) {
    return res.status(500).json('Something went wrong.');
  }
  for (let i = 0; i < data.length; i++) {
    let dataObj = {};
    dataObj['examName'] = data[i].examId.name;
    dataObj['examVariation'] = examVariation[data[i].examId.examVariation];
    dataObj['examType'] = examType[data[i].examId.examType];
    dataObj['studentName'] = data[i].studentId.name;
    dataObj['studentId'] = data[i].studentId._id;
    dataObj['checkStatus'] = data[i].checkStatus;
    dataObj['totalQuestions'] = data2.totalQuestions;
    dataObj['totalMarks'] = data2.totalMarks;
    dataObj['marksPerQuestion'] = data2.marksPerQuestion;
    data1.push(dataObj);
  }
  return res.status(200).json({ data1, paginateData });
};

const bothUpdateRank = async (req, res, next) => {
  console.log('sdfjkdfhdkj');
  let examId = req.query.examId;
  if (!ObjectId.isValid(examId))
    return res.status(404).json('Invalid exam Id.');
  let examIdObj = new mongoose.Types.ObjectId(examId);
  let delData = null;
  try {
    delData = await BothRank.deleteMany({ examId: examIdObj });
  } catch (err) {
    return res.status(500).json('Something went wrong.');
  }
  // try {
  //   checkGenerate = await FreeMcqRank.find({ examId: examIdObj });
  // } catch (err) {
  //   return res.status(500).json("Something went wrong.");
  // }
  // if (checkGenerate) return res.status(404).json("Already Generated.");
  let ranks = null;
  try {
    ranks = await BothStudentExamVsQuestions.find({ examId: examIdObj });
    //.select('examId totalObtainedMarks studentId -_id')
    // .sort({
    //   totalObtainedMarks: -1,
    // })
  } catch (err) {
    return res.status(500).json('Something went wrong.');
  }
  //console.log("ranks:", ranks);
  //console.log("dfdf");
  // ranks = await BothStudentExamVsQuestions.aggregate([
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
  let dataLength = ranks.length;
  let dataIns = [];
  for (let i = 0; i < dataLength; i++) {
    let dataFree = {};
    dataFree['examId'] = ranks[i].examId;
    dataFree['studentId'] = ranks[i].studentId;
    dataFree['totalObtainedMarks'] = ranks[i].totalObtainedMarks;
    dataFree['rank'] = i + 1;
    dataIns.push(dataFree);
  }
  ////console.log("dataIns:", dataIns);
  let sav = null;
  try {
    sav = await BothRank.insertMany(dataIns, { ordered: false });
  } catch (err) {
    return res.status(500).json('Something went wrong.');
  }
  return res.status(201).json('Success!');
};

const bothGetAllRank = async (req, res, next) => {
  let examId = req.query.examId;
  if (!ObjectId.isValid(examId)) return res.status(200).json('Invalid examId.');
  let examIdObj = new mongoose.Types.ObjectId(examId);
  let resultRank = null;
  let marksData = null;
  try {
    resultRank = await BothRank.find({ examId: examIdObj })
      .sort('rank')
      .populate('examId studentId');
    marksData = await BothStudentExamVsQuestions.find({ examId: examIdObj });
  } catch (err) {
    return res.status(500).json('Something went wrong.');
  }
  if (!resultRank) return res.status(404).json('Exam not finshed yet.');
  //console.log("marksData:", marksData);
  ////console.log(resultRank);
  //eturn res.status(200).json(resultRank);
  let allData = [];
  let totalStudent = null;
  for (let i = 0; i < resultRank.length; i++) {
    let data1 = {};
    for (let j = 0; j < marksData.length; j++) {
      if (
        String(resultRank[i].studentId._id) == String(marksData[j].studentId)
      ) {
        console.log('marksData:', marksData[j]);
        data1['totalObtainedMarksMcq'] = marksData[j].totalObtainedMarksMcq;
        data1['totalObtainedMarksWritten'] =
          marksData[j].totalObtainedMarksWritten;
        break;
      }
    }
    let conData = '*******';
    data1['examName'] = resultRank[i].examId.name;
    data1['studentName'] = resultRank[i].studentId.name;
    data1['mobileNoOrg'] = resultRank[i].studentId.mobileNo;
    data1['studentId'] = resultRank[i].studentId._id;
    data1['mobileNo'] = conData.concat(
      resultRank[i].studentId.mobileNo.slice(7),
    );
    data1['institution'] = resultRank[i].studentId.institution;
    data1['totalObtainedMarks'] = resultRank[i].totalObtainedMarks;
    data1['rank'] = resultRank[i].rank;
    data1['displayPicture'] = resultRank[i].displayPicture;
    data1['totalStudent'] = resultRank.length;
    data1['totalMarks'] = resultRank[i].examId.totalMarks;
    allData.push(data1);
  }
  return res.status(200).json(allData);
};

//mcq
const bothAssignQuestionMcq1 = async (req, res, next) => {
  //data get from examcheck function req.body
  const eId = req.query.eId; //bothexam id
  const studentId = req.user.studentId;
  //start:check student already complete the exam or not
  let eId1, sId;
  sId = new mongoose.Types.ObjectId(studentId);
  eId1 = new mongoose.Types.ObjectId(eId);

  let existData = [];
  try {
    existData = await BothStudentExamVsQuestions.find({
      $and: [{ examId: eId1 }, { studentId: sId }],
    });
  } catch (err) {
    return res.status(500).json('10.something went wrong.');
  }
  if (existData.length > 0) return res.status(200).json('Mcq running');

  let doc = [],
    size,
    min = 0,
    max = 0,
    rand;
  try {
    size = await BothMcqQuestionVsExam.findOne({ eId: eId1 }).populate('mId');
    size = size.mId.length;
  } catch (err) {
    return res.status(500).json('1.something went wrong.');
  }
  if (!size) return res.status(404).json('No question assigned in the exam.');
  let totalQuesData;
  try {
    totalQuesData = await BothExam.findById(eId).select(
      'totalQuestionMcq mcqDuration endTime',
    );
  } catch (err) {
    return res.status(500).json('2.something went wrong');
  }
  let examFinishTime = totalQuesData.endTime;
  //start:generating random index of questions
  let totalQues = Number(totalQuesData.totalQuestionMcq);
  ////console.log(totalQues, "totalQues");
  max = size - 1;
  rand = parseInt(Date.now() % totalQues);
  if (rand == 0) rand = 0;
  if (rand == totalQues - 1) rand = rand - 1;
  for (let j = rand; j >= 0; j--) doc.push(j);
  for (let j = rand + 1; j < totalQues; j++) doc.push(j);
  let doc1;
  try {
    doc1 = await BothMcqQuestionVsExam.findOne({ eId: eId1 }).select('mId');
  } catch (err) {
    return res.status(500).json('3.Something went wrong.');
  }
  let statQues = [];
  // //console.log(doc1.mId,'doc1.mId');
  for (let i = 0; i < doc1.mId.length; i++) {
    let quesId = String(doc1.mId[i]);
    let stat;
    try {
      stat = await QuestionsMcq.findById(quesId).select('status');
      stat = stat.status;
    } catch (err) {
      return res.status(500).json('4.Something went wrong.');
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
    //console.log(doc[i]);
    //console.log(doc2[doc[i]]);
    //console.log(data);
    resultQuestion.push(data);
  }
  //console.log(doc2);
  //console.log(totalQues, "totalQues");
  //console.log(resultQuestion, "resultQuestion");
  let questions = [];
  try {
    questions = await QuestionsMcq.find(
      { _id: { $in: resultQuestion } },
      'question type options',
    );
  } catch (err) {
    return res.status(500).json(err);
  }
  // //console.log(questions);
  if (sId == null)
    return res
      .status(404)
      .json('student not found or not permissible for the exam');
  let answered = [];
  for (let i = 0; i < totalQues; i++) {
    answered[i] = '-1';
  }
  let saveStudentQuestion = null,
    examEndTimeActual = null;
  try {
    examEndTimeActual = await BothExam.findById(eId1);
  } catch (err) {
    ////console.log(err);
    return res.status(500).json('6.Something went wrong.');
  }
  let duration = Number(totalQuesData.mcqDuration);
  console.log('duration:', duration);
  let examStartTime = moment(new Date());
  let examEndTime = moment(examStartTime).add(duration, 'm');

  if (
    Number(
      moment(examEndTime).add(6, 'h') - moment(examEndTimeActual.endTime),
    ) > 0
  )
    examEndTime = examEndTimeActual.endTime;
  else examEndTime = moment(examEndTime).add(6, 'h');
  console.log('examStartTIme:', examStartTime);
  console.log('examEndTIme:', examEndTime);
  // if (examEndTime > examEndTimeActual.endTime)
  //   examEndTime = examEndTimeActual.endTime;
  let writtenQuestion = null;
  try {
    writtenQuestion = await BothQuestionsWritten.findOne(
      { examId: eId1 },
      '_id',
    );
  } catch (err) {
    ////console.log(err);
    return res.status(500).json('7.Something went wrong.');
  }
  let studentExamVsQuestionsMcq = new BothStudentExamVsQuestions({
    studentId: sId,
    examId: eId1,
    mcqQuestionId: resultQuestion,
    answeredOption: answered,
    runningStatus: true,
    finishedStatus: false,
    checkStatus: false,
    uploadStatus: false,
    examStartTimeMcq: moment(examStartTime).add(6, 'h'),
    examEndTimeMcq: moment(examEndTime),
    mcqDuration: duration,
    writtenQuestionId: writtenQuestion,
  });
  try {
    saveStudentQuestion = await studentExamVsQuestionsMcq.save();
  } catch (err) {
    //console.log(err);
    return res.status(500).json('8.Something went wrong.');
  }
  console.log(examStartTime);
  console.log(examEndTime);
  questions.push({ studStartTime: moment(examStartTime).add(6, 'h') });
  questions.push({ studEndTime: moment(examEndTime) });
  questions.push({ examEndTime: examFinishTime });
  questions.push({ answeredOption: answered });
  if (saveStudentQuestion == null) {
    return res.status(404).json('Problem occur to assign question.');
  }
  return res.status(201).json(questions);
};

const bothAssignQuestionMcq = async (req, res, next) => {
  //data get from examcheck function req.body
  const eId = req.query.eId; //bothexam id
  const studentId = req.user.studentId;
  //start:check student already complete the exam or not
  let eId1, sId;
  sId = new mongoose.Types.ObjectId(studentId);
  eId1 = new mongoose.Types.ObjectId(eId);

  let existData = null;
  let bothExam = null;
  try {
    existData = await BothStudentExamVsQuestions.findOne({
      $and: [{ examId: eId1 }, { studentId: sId }],
    });
    bothExam = await BothExam.findById(eId);
  } catch (err) {
    return res.status(500).json('1.something went wrong.');
  }
  if (existData) return res.status(200).json('Mcq running');

  let doc = [],
    doc1 = null,
    rand;
  rand = parseInt(Date.now() % bothExam.numberOfSet);
  try {
    doc1 = await BothMcqQuestionVsExam.findOne({
      $and: [{ eId: eId1 }, { setName: Number(rand) }],
    }).populate({
      path: 'mId',
      match: { status: true },
    });
  } catch (err) {
    return res.status(500).json('2.Something went wrong.');
  }
  if (Number(doc1.mId.length) !== Number(bothExam.totalQuestionMcq))
    return res.status(404).json('Data Mismatch.');
  let resultQuestion = [],
    questions = [],
    answered = [];
  for (let i = 0; i < doc1.mId.length; i++) {
    let data = new mongoose.Types.ObjectId(doc1.mId[i]);
    resultQuestion.push(data);
    answered[i] = '-1';
  }
  try {
    questions = await QuestionsMcq.find(
      { _id: { $in: resultQuestion } },
      'question type options',
    );
  } catch (err) {
    return res.status(500).json(err);
  }
  let saveStudentQuestion = null;
  //13-03-2024
  let numberOfWrittenQuestions = null;
  let subArr = [];
  try {
    numberOfWrittenQuestions = await BothQuestionsWritten.findOne({
      examId: eId1,
    });
  } catch (err) {
    return res.status(500).json('something went wrong.');
  }
  if (!numberOfWrittenQuestions)
    return res.status(404).json('question not added.');
  numberOfWrittenQuestions = Number(numberOfWrittenQuestions.totalQuestions);
  for (let i = 0; i < numberOfWrittenQuestions; i++) {
    subArr[i] = [];
  }
  //13-03-2024
  let duration = Number(bothExam.mcqDuration);
  let examStartTime = moment(new Date());
  let examEndTime = moment(examStartTime).add(duration, 'm');
  if (Number(moment(examEndTime).add(6, 'h') - moment(bothExam.endTime)) > 0)
    examEndTime = bothExam.endTime;
  else examEndTime = moment(examEndTime).add(6, 'h');
  let writtenQuestion = null;
  try {
    writtenQuestion = await BothQuestionsWritten.findOne(
      { examId: eId1 },
      '_id',
    );
  } catch (err) {
    ////console.log(err);
    return res.status(500).json('3.Something went wrong.');
  }
  console.log(writtenQuestion);
  let studentExamVsQuestionsMcq = new BothStudentExamVsQuestions({
    studentId: sId,
    examId: eId1,
    mcqQuestionId: resultQuestion,
    answeredOption: answered,
    runningStatus: true,
    finishedStatus: false,
    checkStatus: false,
    uploadStatus: false,
    examStartTimeMcq: moment(examStartTime).add(6, 'h'),
    examEndTimeMcq: moment(examEndTime),
    mcqDuration: duration,
    writtenQuestionId: writtenQuestion,
    //13-03-2024
    submittedScriptILink: subArr,
  });
  try {
    saveStudentQuestion = await studentExamVsQuestionsMcq.save();
  } catch (err) {
    console.log(err);
    return res.status(500).json('4.Something went wrong.');
  }
  console.log(examStartTime);
  console.log(examEndTime);
  questions.push({ studStartTime: moment(examStartTime).add(6, 'h') });
  questions.push({ studEndTime: moment(examEndTime) });
  questions.push({ examEndTime: bothExam.endTime });
  questions.push({ answeredOption: answered });
  if (saveStudentQuestion == null) {
    return res.status(404).json('Problem occur to assign question.');
  }
  return res.status(201).json(questions);
};

const bothGetRunningDataMcq = async (req, res, next) => {
  const sId = req.user.studentId;
  const eId = req.query.eId;
  if (!ObjectId.isValid(sId) || !ObjectId.isValid(eId))
    return res.status(404).json('invalid student ID or exam ID.');
  let eId1, sId1;
  sId1 = new mongoose.Types.ObjectId(sId);
  eId1 = new mongoose.Types.ObjectId(eId);
  //exam status Check:start
  let studentCheck = null;
  try {
    studentCheck = await BothStudentExamVsQuestions.findOne({
      $and: [{ examId: eId1 }, { studentId: sId1 }],
    });
  } catch (err) {
    return res.status(500).json('Something went wrong.');
  }
  // if (studentCheck.finishedStatus == true)
  //   return res.status(409).json("Exam End.");
  //exam status Check:end
  let getQuestionMcq, getExamData;
  try {
    getQuestionMcq = await BothStudentExamVsQuestions.findOne({
      $and: [{ studentId: sId1 }, { examId: eId1 }],
    }).populate('mcqQuestionId');
  } catch (err) {
    return res.status(500).json("can't get question.Problem Occur.");
  }
  try {
    getExamData = await BothStudentExamVsQuestions.findOne(
      { $and: [{ examId: eId1 }, { studentId: sId1 }] },
      'examStartTimeMcq examEndTimeMcq examId',
    )
      .populate({
        path: 'examId',
        populate: {
          path: 'subjectId',
          select: 'name',
          model: 'Subject',
        },
      })
      .populate({
        path: 'examId',
        populate: {
          path: 'courseId',
          select: 'name',
          model: 'Course',
        },
      });
  } catch (err) {
    return res.status(500).json("Can't get exam info.");
  }
  console.log(getExamData);
  let runningResponseLast = [];
  let examData = new Object();
  let questionData = new Object();
  let timeData = new Object();
  for (let i = 0; i < getQuestionMcq.mcqQuestionId.length; i++) {
    let runningResponse = {};
    runningResponse['question'] = getQuestionMcq.mcqQuestionId[i].question;
    runningResponse['options'] = getQuestionMcq.mcqQuestionId[i].options;
    runningResponse['type'] = getQuestionMcq.mcqQuestionId[i].type;
    runningResponse['answeredOption'] = getQuestionMcq.answeredOption[i];
    runningResponse['optionCount'] = getExamData.examId.numberOfOptions;
    runningResponseLast.push(runningResponse);
  }
  timeData['examDuration'] =
    (moment(getExamData.examEndTimeMcq).subtract(6, 'h') - moment(new Date())) /
    60000;
  let examStartTime = getExamData.examStartTimeMcq;
  let examEndTime = getExamData.examEndTimeMcq;
  timeData['startTime'] = examStartTime;
  timeData['endTime'] = examEndTime;
  questionData = runningResponseLast;
  examData = getExamData.examId;
  return res.status(200).json({ timeData, questionData, examData });
};

const bothUpdateAssignQuestionMcq = async (req, res, next) => {
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
  //exam status Check:start
  let studentCheck = null;
  try {
    studentCheck = await BothStudentExamVsQuestions.findOne({
      $and: [{ examId: examId }, { studentId: studentId }],
    });
  } catch (err) {
    return res.status(500).json('Something went wrong.');
  }
  if (
    studentCheck.finishedStatus == true ||
    studentCheck.examEndTimeMcq <= moment(new Date())
  )
    return res
      .status(409)
      .json(
        'Already Submitted from another device.You will be redirected to written exam within 5 seconds.',
      );
  //exam status Check:end
  try {
    result = await BothStudentExamVsQuestions.find(
      {
        $and: [{ studentId: studentId }, { examId: examId }],
      },
      '_id answeredOption',
    );
  } catch (err) {
    return res.status(500).json('cant save to db');
  }
  ////console.log(result);
  docId = result[0]._id;
  docId1 = String(docId);
  answered = result[0].answeredOption;

  // if (answered[questionIndexNumber] != -1)
  //   return res
  //     .status(200)
  //     .json(
  //       "Already rewrite the answer from another device.Please reload the page."
  //     );
  ////console.log(questionIndexNumber);
  ////console.log(optionIndexNumber);
  answered[questionIndexNumber] = String(optionIndexNumber);
  try {
    updateAnswer = await BothStudentExamVsQuestions.findByIdAndUpdate(docId1, {
      answeredOption: answered,
    });
  } catch (err) {
    return res.status(500).json('DB error!');
  }
  ////console.log(updateAnswer);
  return res.status(201).json('Ok');
};

const BothSubmitAnswerMcq = async (req, res, next) => {
  const eId = req.query.eId;
  const sId = req.user.studentId;
  if (!ObjectId.isValid(eId) || !ObjectId.isValid(sId))
    return res.status(404).json('Invalid studnet Id or Exam Id');
  const examEndTime = moment(new Date());
  let eId1, sId1;
  sId1 = new mongoose.Types.ObjectId(sId);
  eId1 = new mongoose.Types.ObjectId(eId);

  let status = null;
  try {
    status = await BothStudentExamVsQuestions.findOne({
      $and: [{ studentId: sId1 }, { examId: eId1 }],
    });
  } catch (err) {
    return res.status(500).json('10.Something went wrong.');
  }
  if (status.finishedStatus == true) return res.status(200).json('ended');

  //exam status Check:start
  let studentCheck = null;
  try {
    studentCheck = await BothStudentExamVsQuestions.findOne(
      {
        $and: [{ examId: eId1 }, { studentId: sId1 }],
      },
      'finishedStatus -_id',
    );
  } catch (err) {
    return res.status(500).json('Something went wrong.');
  }
  if (studentCheck.finishedStatus == true)
    return res.status(409).json('Exam End.');
  //exam status Check:end
  let findId = null;
  let timeStudent = [];
  try {
    findId = await BothStudentExamVsQuestions.find({
      $and: [{ examId: eId1 }, { studentId: sId1 }],
    }).select('_id examStartTimeMcq examEndTimeMcq');
  } catch (err) {
    return res
      .status(500)
      .json('Proble when get student info from student marks table.');
  }
  if (findId == null) return res.status(404).json('data not found.');
  //console.log("findID", findId);
  findId = String(findId[0]._id);
  timeStudent[0] = findId[0].examStartTimeMcq;
  timeStudent[1] = findId[0].examEndTimeMcq;
  let saveStudentExamEnd;
  let submitTime = moment(new Date());
  //console.log("duration:", Number(timeStudent[0] - submitTime) / (1000 * 60));
  //console.log(submitTime);
  ////console.log(timeStudent[0]);
  //console.log(moment(findId[0].examStartTimeMcq));
  let update = {
    finishedStatus: true,
    runningStatus: false,
    examEndTimeMcq: moment(submitTime).add(6, 'h'),
    mcqDuration: Number(moment(timeStudent[0]) - submitTime) / (1000 * 60),
  };
  try {
    saveStudentExamEnd = await BothStudentExamVsQuestions.findByIdAndUpdate(
      findId,
      update,
    );
  } catch (err) {
    //console.log(err);
    return res.status(500).json('Problem when updating student marks rank.');
  }
  let sIeIObj = await BothStudentExamVsQuestions.find(
    { $and: [{ studentId: sId1 }, { examId: eId1 }] },
    '_id',
  );
  let rankTable = sIeIObj;
  sIeIObj = sIeIObj[0]._id;
  let examData = null;
  try {
    examData = await BothStudentExamVsQuestions.findOne({
      $and: [{ examId: eId1 }, { studentId: sId1 }],
    }).populate('mcqQuestionId examId');
  } catch (err) {
    return res.status(500).json('Problem when get exam data.');
  }
  let id = String(examData._id);
  let correctMarks = examData.examId.marksPerMcq;
  let negativeMarks = examData.examId.negativeMarksMcq;
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
    if (answered[i] == '-1') {
      notAnswered = notAnswered + 1;
    } else if (answered[i] == examDataMcq[i].correctOption) {
      totalCorrectAnswer = totalCorrectAnswer + 1;
    } else totalWrongAnswer = totalWrongAnswer + 1;
  }
  totalCorrectMarks = totalCorrectAnswer * correctMarks;
  totalWrongMarks = totalWrongAnswer * negativeMarksValue;
  totalObtainedMarks = totalCorrectMarks - totalWrongMarks;
  //console.log(negativeMarksValue);
  //console.log(totalCorrectAnswer);
  //console.log(totalWrongAnswer);
  //console.log(correctMarks);
  //console.log(negativeMarks);
  //console.log(totalCorrectMarks);
  //console.log(totalWrongMarks);

  const update1 = {
    totalCorrectAnswer: totalCorrectAnswer,
    totalWrongAnswer: totalWrongAnswer,
    totalNotAnswered: notAnswered,
    totalCorrectMarks: totalCorrectMarks,
    totalWrongMarks: Number(totalWrongMarks),
    totalObtainedMarksMcq: totalObtainedMarks,
    rank: -1,
  };
  let result = null,
    getResult = null,
    sendResult = {},
    rank = null,
    upd = null,
    getRank = null;
  try {
    result = await BothStudentExamVsQuestions.findByIdAndUpdate(id, update1);
  } catch (err) {
    //console.log(err);
    return res.status(500).json('Problem when update total obtained marks.');
  }
  try {
    getResult = await BothStudentExamVsQuestions.findById(id).populate(
      'examId',
    );
  } catch (err) {
    return res.status(500).json('Problem when get Student Exam info.');
  }
  let data1 = {};
  data1['examId'] = getResult.examId.name;
  data1['startTime'] = moment(getResult.examId.startTime).format('LLL');
  data1['endTime'] = moment(getResult.examId.endTime).format('LLL');
  data1['totalMarksMcq'] = getResult.examId.totalMarksMcq;
  data1['examVariation'] = examType[Number(getResult.examId.examType)];
  data1['totalCorrectAnswer'] = getResult.totalCorrectAnswer;
  data1['totalWrongAnswer'] = getResult.totalWrongAnswer;
  data1['totalCorrectMarks'] = getResult.totalCorrectMarks;
  data1['totalWrongMarks'] = getResult.totalWrongMarks;
  data1['totalNotAnswered'] = getResult.totalNotAnswered;
  data1['totalObtainedMarks'] = getResult.totalObtainedMarksMcq;
  data1['rank'] = -1;
  data1['studExamStartTime'] = moment(timeStudent[0]).format('LLL');
  data1['studExamEndTime'] = moment(timeStudent[1]).format('LLL');
  data1['studExamTime'] = getResult.mcqDuration;
  //data1["subjectName"] = subjectName;

  return res.status(200).json(data1);
};

const bothViewSollutionMcq = async (req, res, next) => {
  ////console.log(req.query);
  const studentId = req.user.studentId;
  const examId = req.query.examId;
  if (!ObjectId.isValid(studentId) || !ObjectId.isValid(examId))
    return res.status(404).json('student Id or examId is not valid.');
  let studentIdObj = new mongoose.Types.ObjectId(studentId);
  let examIdObj = new mongoose.Types.ObjectId(examId);
  ////console.log(studentIdObj, examIdObj);
  let data = null;
  try {
    data = await BothStudentExamVsQuestions.find({
      $and: [{ studentId: studentIdObj }, { examId: examIdObj }],
    }).populate('mcqQuestionId');
  } catch (err) {
    return res.status(500).json('1.Something went wrong.');
  }
  if (data == null)
    return res.status(404).json('No exam found under this student.');
  let resultData = [];
  for (let i = 0; i < data[0].mcqQuestionId.length; i++) {
    let data1 = {};
    data1['id'] = data[0].mcqQuestionId[i]._id;
    data1['question'] = data[0].mcqQuestionId[i].question;
    data1['options'] = data[0].mcqQuestionId[i].options;
    data1['correctOptions'] = Number(data[0].mcqQuestionId[i].correctOption);
    data1['explanationILink'] = data[0].mcqQuestionId[i].explanationILink;
    data1['type'] = data[0].mcqQuestionId[i].type;
    data1['answeredOption'] = data[0].answeredOption[i];
    data1['optionCount'] = data[0].mcqQuestionId[i].optionCount;
    resultData.push(data1);
  }
  return res.status(200).json(resultData);
};

const bothViewSollutionMcqAdmin = async (req, res, next) => {
  ////console.log(req.query);
  const studentId = req.query.studentId;
  const examId = req.query.examId;
  if (!ObjectId.isValid(studentId) || !ObjectId.isValid(examId))
    return res.status(404).json('student Id or examId is not valid.');
  let studentIdObj = new mongoose.Types.ObjectId(studentId);
  let examIdObj = new mongoose.Types.ObjectId(examId);
  ////console.log(studentIdObj, examIdObj);
  let data = null;
  try {
    data = await BothStudentExamVsQuestions.find({
      $and: [{ studentId: studentIdObj }, { examId: examIdObj }],
    }).populate('mcqQuestionId');
  } catch (err) {
    return res.status(500).json('1.Something went wrong.');
  }
  if (data == null)
    return res.status(404).json('No exam found under this student.');
  let resultData = [];
  for (let i = 0; i < data[0].mcqQuestionId.length; i++) {
    let data1 = {};
    data1['id'] = data[0].mcqQuestionId[i]._id;
    data1['question'] = data[0].mcqQuestionId[i].question;
    data1['options'] = data[0].mcqQuestionId[i].options;
    data1['correctOptions'] = Number(data[0].mcqQuestionId[i].correctOption);
    data1['explanationILink'] = data[0].mcqQuestionId[i].explanationILink;
    data1['type'] = data[0].mcqQuestionId[i].type;
    data1['answeredOption'] = data[0].answeredOption[i];
    data1['optionCount'] = data[0].mcqQuestionId[i].optionCount;
    resultData.push(data1);
  }
  return res.status(200).json(resultData);
};

//written
const bothAssignQuestionWritten = async (req, res, next) => {
  let examId = req.query.examId;
  let studentId = req.user.studentId;
  examId = new mongoose.Types.ObjectId(examId);
  studentId = new mongoose.Types.ObjectId(studentId);
  let updId = null;
  try {
    updId = await BothStudentExamVsQuestions.findOne({
      $and: [{ examId: examId }, { studentId: studentId }],
    });
  } catch (err) {
    return res.status(500).json('something went wrong.');
  }
  //console.log("updID", updId);
  //console.log(updId);
  if (updId.examStartTimeWritten != null) return res.status(200).json(false);
  let questionData = null;
  let data1 = {};
  try {
    questionData = await BothQuestionsWritten.findOne({
      $and: [{ examId: examId }, { status: true }],
    });
    examData = await BothExam.findOne({
      $and: [{ _id: examId }, { status: true }],
    });
    //console.log("examData:", examData);
  } catch (err) {
    return res.status(500).json('something went wrong.');
  }
  if (questionData == null || examData.endTime < moment(new Date()))
    return res.status(404).json('Exam End.');

  data1['questionILink'] = questionData.questionILink;
  data1['status'] = questionData.status;
  data1['totalQuestions'] = questionData.totalQuestions;
  data1['marksPerQuestions'] = questionData.marksPerQuestion;
  data1['totalMarks'] = questionData.totalMarks;
  data1['studExamStartTime'] = moment(new Date());
  data1['studExamEndTime'] = moment(data1.studExamStartTime).add(
    examData.writtenDuration,
    'minutes',
  );
  data1['examStartTime'] = examData.startTime;
  data1['examEndTime'] = examData.endTime;
  if (data1.examEndTime < data1.studExamEndTime)
    data1['studExamEndTime'] = data1.examEndTime;
  data1['duration'] = examData.writtenDuration;
  data1['examId'] = examId;
  data1['examName'] = examData.name;
  data1['examType'] = examData.examType;
  let timeStart = data1.studExamStartTime;
  let timeEnd = data1.studExamEndTime;
  let durationTest = data1.duration;
  //console.log(timeStart);
  //console.log(timeEnd);
  //console.log(durationTest);
  let objSav = {
    examStartTimeWritten: moment(timeStart).add(6, 'h'),
    examEndTimeWritten: moment(timeEnd).add(6, 'h'),
    writtenDuration: durationTest,
  };

  try {
    sav = await BothStudentExamVsQuestions.findByIdAndUpdate(updId, objSav);
  } catch (err) {
    return res.status(500).json('Something went wrong.');
  }
  //console.log(sav);
  return res.status(200).json(data1);
};

const bothRunningWritten = async (req, res, next) => {
  let questionData = null;
  let examData = null;
  let examId = req.query.examId;
  let studentId = req.user.studentId;
  examId = new mongoose.Types.ObjectId(examId);
  studentId = new mongoose.Types.ObjectId(studentId);
  let data1 = {};
  try {
    questionData = await BothQuestionsWritten.findOne({
      $and: [{ examId: examId }, { status: true }],
    });
    examData = await BothExam.findOne({
      $and: [{ _id: examId }, { status: true }],
    });
  } catch (err) {
    return res.status(500).json('1.something went wrong.');
  }

  let timeData = null;
  try {
    timeData = await BothStudentExamVsQuestions.findOne({
      $and: [{ examId: examId }, { studentId: studentId }],
    });
  } catch (err) {
    return res.status(500).json('2.something went wrong.');
  }
  // //console.log(timeData);
  data1['questionILink'] = questionData.questionILink;
  data1['status'] = questionData.status;
  data1['totalQuestions'] = questionData.totalQuestions;
  data1['marksPerQuestions'] = questionData.marksPerQuestion;
  data1['totalMarks'] = questionData.totalMarks;
  data1['studExamStartTime'] = timeData.examStartTimeWritten;
  data1['studExamEndTime'] = timeData.examEndTimeWritten;
  data1['examStartTime'] = examData.startTime;
  data1['examEndTime'] = examData.endTime;
  data1['duration'] = timeData.writtenDuration;
  data1['examId'] = examId;
  data1['examName'] = examData.name;
  data1['examType'] = examData.examType;

  return res.status(200).json(data1);
};

const bothSubmitStudentScript10 = async (req, res, next) => {
  const files = req.files;
  //file upload handle:start
  const file = req.files;
  ////console.log(file);
  let questionILinkPath = [];
  if (!file.questionILink) return res.status(400).json('Files not uploaded.');
  for (let i = 0; i < file.questionILink.length; i++) {
    questionILinkPath[i] = 'uploads/'.concat(file.questionILink[i].filename);
  }
  //file upload handle:end
  let examId = req.body.examId;
  let studentId = req.user.studentId;
  let questionNo = Number(req.body.questionNo);
  if (
    !ObjectId.isValid(studentId) ||
    !ObjectId.isValid(examId) ||
    !questionNo
  ) {
    return res
      .status(404)
      .json('Student Id or Exam Id or question Id is not valid.');
  }
  questionNo = questionNo - 1;
  let studentIdObj = new mongoose.Types.ObjectId(studentId);
  examId = new mongoose.Types.ObjectId(examId);
  let getQuestionScript = null;
  try {
    getQuestionScript = await BothStudentExamVsQuestions.findOne({
      $and: [{ studentId: studentIdObj }, { examId: examId }],
    });
  } catch (err) {
    return res.status(500).json('Something went wrong.');
  }
  let insertId = getQuestionScript._id;
  let uploadStatus = getQuestionScript.uploadStatus;
  let checkStatus = getQuestionScript.checkStatus;
  if (uploadStatus == true || checkStatus == true)
    return res.status(404).json('Can not upload file.');
  getQuestionScript = getQuestionScript.submittedScriptILink;
  if (getQuestionScript[questionNo]) {
    for (let i = 0; i < getQuestionScript[questionNo].length; i++) {
      fs.unlinkSync(getQuestionScript[questionNo][i]);
    }
  }

  getQuestionScript[questionNo] = questionILinkPath;
  ////console.log(getQuestionScript[questionNo]);
  let upd = {
    submittedScriptILink: getQuestionScript,
  };
  let doc;
  try {
    doc = await BothStudentExamVsQuestions.findByIdAndUpdate(insertId, upd);
  } catch (err) {
    ////console.log(err);
    return res.status(500).json('Something went wrong!');
  }
  return res.status(201).json('Submitted Successfully.');
};

const bothSubmitStudentScript = async (req, res, next) => {
  const images = req.body.questionILink;
  //file upload handle:start
  ////console.log(file);
  let questionILinkPath = [];

  //file upload handle:end
  let examId = req.body.examId;
  let studentId = req.user.studentId;
  let questionNo = Number(req.body.questionNo);
  if (!ObjectId.isValid(studentId) || !ObjectId.isValid(examId) || !images) {
    return res
      .status(404)
      .json('Student Id or Exam Id or question Id is not valid.');
  }
  questionNo = Number(questionNo) - 1;
  let studentIdObj = new mongoose.Types.ObjectId(studentId);
  examId = new mongoose.Types.ObjectId(examId);
  //new implement
  const dir = path.resolve(
    path.join(__dirname, '../uploads/' + String(examId) + '/'),
  );
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }
  const dir1 = path.resolve(
    path.join(
      __dirname,
      '../uploads/' + String(examId) + '/' + String(studentId) + '/',
    ),
  );
  if (!fs.existsSync(dir1)) {
    fs.mkdirSync(dir1);
  }
  for (let i = 0; i < images.length; i++) {
    const matches = String(images[i]).replace(
      /^data:([A-Za-z-+/]+);base64,/,
      '',
    );
    let timeData = Date.now();
    let fileNameDis =
      String(examId) +
      '-' +
      String(studentId) +
      '_' +
      String(questionNo + 1) +
      '-' +
      String(i + 1) +
      timeData +
      '.jpeg';
    let fileName =
      dir1 +
      '/' +
      String(examId) +
      '-' +
      String(studentId) +
      '_' +
      String(questionNo + 1) +
      '-' +
      String(i + 1) +
      timeData +
      '.jpeg';
    try {
      fs.writeFileSync(fileName, matches, { encoding: 'base64' });
    } catch (err) {
      //console.log(e);
      return res.status(500).json(err);
    }
    questionILinkPath[i] =
      'uploads/' + String(examId) + '/' + String(studentId) + '/' + fileNameDis;
    console.log('questionILinkPath[i]:', questionILinkPath[i]);
  }
  //new implement
  let returnedData = questionILinkPath;
  let getQuestionScript = null;
  try {
    getQuestionScript = await BothStudentExamVsQuestions.findOne({
      $and: [{ studentId: studentIdObj }, { examId: examId }],
    });
  } catch (err) {
    return res.status(500).json('Something went wrong.');
  }
  let insertId = getQuestionScript._id;
  let uploadStatus = getQuestionScript.uploadStatus;
  let checkStatus = getQuestionScript.checkStatus;
  if (uploadStatus == true || checkStatus == true)
    return res.status(404).json('Can not upload file.');
  getQuestionScript = getQuestionScript.submittedScriptILink;
  if (getQuestionScript[questionNo]) {
    for (let i = 0; i < getQuestionScript[questionNo].length; i++) {
      fs.unlinkSync(getQuestionScript[questionNo][i]);
    }
  }

  getQuestionScript[questionNo] = questionILinkPath;
  ////console.log(getQuestionScript[questionNo]);
  let upd = {
    submittedScriptILink: getQuestionScript,
  };
  let doc;
  try {
    doc = await BothStudentExamVsQuestions.findByIdAndUpdate(insertId, upd);
  } catch (err) {
    ////console.log(err);
    return res.status(500).json('Something went wrong!');
  }
  return res.status(201).json(returnedData);
};

const bothSubmitWritten = async (req, res, next) => {
  let examId = req.query.examId;
  let studentId = req.user.studentId;
  if (!ObjectId.isValid(studentId) || !ObjectId.isValid(examId)) {
    return res
      .status(404)
      .json('Student Id or Exam Id or question Id is not valid.');
  }
  let studentIdObj = new mongoose.Types.ObjectId(studentId);
  examId = new mongoose.Types.ObjectId(examId);
  let status = null;
  try {
    status = await BothStudentExamVsQuestions.findOne({
      $and: [{ studentId: studentIdObj }, { examId: examId }],
    });
  } catch (err) {
    return res.status(500).json('2.Something went wrong.');
  }
  if (status.uploadStatus == true) return res.status(200).json('ended');

  let startTime = null;
  let endTime = moment(new Date());
  try {
    startTime = await BothStudentExamVsQuestions.findOne({
      $and: [{ examId: examId }, { studentId: studentIdObj }],
    });
  } catch (err) {
    return res.status(500).json('1.Something went wrong.');
  }
  startTime = startTime.examStartTimeWritten;
  //console.log(startTime);
  //console.log(endTime);
  let upd = {
    examEndTimeWritten: moment(endTime).add(6, 'h'),
    writtenDuration: Number(endTime - moment(startTime)) / (1000 * 60),
    uploadStatus: true,
  };
  //console.log(upd.writtenDuration);
  let sav = null;
  try {
    sav = await BothStudentExamVsQuestions.findOneAndUpdate(
      {
        $and: [{ examId: examId }, { studentId: studentIdObj }],
      },
      upd,
    );
  } catch (err) {
    //console.log(err);
    return res.status(500).json('2.Something went wrong.');
  }
  return res.status(201).json('Submitted Sccessfully.');
};

const bothViewSollutionWritten = async (req, res, next) => {
  const studentId = req.user.studentId;
  const examId = req.query.examId;
  if (!ObjectId.isValid(studentId) || !ObjectId.isValid(examId))
    return res.status(404).json('student Id or examId is not valid.');
  let studentIdObj = new mongoose.Types.ObjectId(studentId);
  let examIdObj = new mongoose.Types.ObjectId(examId);
  ////console.log(studentIdObj, examIdObj);
  let data = null;
  try {
    data = await BothStudentExamVsQuestions.findOne({
      $and: [{ studentId: studentIdObj }, { examId: examIdObj }],
      //studentId: studentIdObj,
    });
  } catch (err) {
    return res.status(500).json('1.Something went wrong.');
  }
  //console.log(data);
  if (data == null)
    return res.status(404).json('No exam found under this student.');
  let dataWritten = null;
  try {
    dataWritten = await BothQuestionsWritten.findOne({
      examId: examIdObj,
    }).populate('examId');
  } catch (err) {
    return res.status(500).json('1.Something went wrong.');
  }
  const subId = new mongoose.Types.ObjectId(dataWritten.examId.subjectId);

  // console.log(data.ansewerScriptILink);
  let data1 = {};
  data1['question'] = dataWritten.questionILink;
  data1['sollutionScript'] = [];
  for (let k = 0; k < data.ansewerScriptILink.length; k++) {
    let scriptObject = {};
    scriptObject.answerScript = data.ansewerScriptILink[k];
    try {
      scriptObject.remark = await Remark.findOne({
        $and: [
          { studentId: studentIdObj },
          { examId: examIdObj },
          { subjectId: subId },
          { questionNo: k },
        ],
      });
    } catch (err) {
      return res.status(500).json('Some Problems found');
    }
    data1['sollutionScript'][k] = scriptObject;
    // subjects[i].answer[k] = scriptObject ;
  }
  // data1["sollutionScript"] = data.ansewerScriptILink;
  data1['obtainedMarks'] = data.obtainedMarks;
  data1['totalObtainedMarks'] = data.totalObtainedMarks;
  data1['marksPerQuestion'] = dataWritten.marksPerQuestion;
  data1['totalQuestion'] = dataWritten.totalQuestions;
  data1['totalMarks'] = dataWritten.totalMarks;
  console.log(data1['sollutionScript']);
  return res.status(200).json(data1);
};

const bothViewSollutionWrittenAdmin = async (req, res, next) => {
  const studentId = req.query.studentId;
  const examId = req.query.examId;
  if (!ObjectId.isValid(studentId) || !ObjectId.isValid(examId))
    return res.status(404).json('student Id or examId is not valid.');
  let studentIdObj = new mongoose.Types.ObjectId(studentId);
  let examIdObj = new mongoose.Types.ObjectId(examId);
  ////console.log(studentIdObj, examIdObj);
  let data = null;
  try {
    data = await BothStudentExamVsQuestions.findOne({
      $and: [{ studentId: studentIdObj }, { examId: examIdObj }],
      //studentId: studentIdObj,
    });
  } catch (err) {
    return res.status(500).json('1.Something went wrong.');
  }
  //console.log(data);
  if (data == null)
    return res.status(404).json('No exam found under this student.');
  let dataWritten = null;
  try {
    dataWritten = await BothQuestionsWritten.findOne({
      examId: examIdObj,
    }).populate('examId');
  } catch (err) {
    return res.status(500).json('1.Something went wrong.');
  }

  //console.log(dataWritten);
  let data1 = {};
  data1['question'] = dataWritten.questionILink;
  data1['sollutionScript'] = data.ansewerScriptILink;
  data1['obtainedMarks'] = data.obtainedMarks;
  data1['totalObtainedMarks'] = data.totalObtainedMarks;
  data1['marksPerQuestion'] = dataWritten.marksPerQuestion;
  data1['totalQuestion'] = dataWritten.totalQuestions;
  data1['totalMarks'] = dataWritten.totalMarks;

  return res.status(200).json(data1);
};

const bothGetExamDataForTest = async (req, res, next) => {
  let examId = new mongoose.Types.ObjectId('659d1522d02face3f17e08ed');
  let data = [];
  let result = [];
  try {
    data = await BothStudentExamVsQuestions.find({ examId: examId });
  } catch (err) {
    return res.status(500).json('Something went wrong.');
  }
  for (i = 0; i < data.length; i++) {
    let reOb = {};
    let data1 = null;
    try {
      data1 = await Student.findById(
        data[i].studentId.toString(),
        'regNo -_id',
      );
      reOb['regNo'] = data1.regNo;
    } catch (err) {
      return res.status(500).json('Something went wrong.');
    }
    reOb['examId'] = String(examId);
    if (!data[i].submittedScriptILink.length) reOb['answeredQuestion'] = 0;
    else reOb['answeredQuestion'] = data[i].submittedScriptILink.length;
    result.push(reOb);
  }
  return res.status(200).json(result);
};

exports.retakeBothExam = retakeBothExam;
exports.bothGetExamDataForTest = bothGetExamDataForTest;
exports.newLoginStudent = newLoginStudent;
exports.checkPassword = checkPassword;
exports.changePassword = changePassword;
exports.bothGetHistoryFilter = bothGetHistoryFilter;
exports.getHistoryByWrittenIdFilter = getHistoryByWrittenIdFilter;
exports.getHistoryByExamIdFilter = getHistoryByExamIdFilter;
exports.bothGetHistory = bothGetHistory;
exports.bothGetCheckWrittenStudentAllByExam =
  bothGetCheckWrittenStudentAllByExam;
exports.bothGetWrittenStudentAllByExam = bothGetWrittenStudentAllByExam;
exports.bothGetWrittenStudentSingleByExam = bothGetWrittenStudentSingleByExam;
exports.bothGetWrittenScript = bothGetWrittenScript;
exports.bothExamDetail = bothExamDetail;
exports.bothHistoryData = bothHistoryData;
exports.bothViewSollutionMcq = bothViewSollutionMcq;
exports.bothViewSollutionWritten = bothViewSollutionWritten;

exports.bothViewSollutionMcqAdmin = bothViewSollutionMcqAdmin;
exports.bothViewSollutionWrittenAdmin = bothViewSollutionWrittenAdmin;
exports.bothUpdateStudentExamInfo = bothUpdateStudentExamInfo;
exports.bothSubmitStudentScript = bothSubmitStudentScript;
exports.bothSubmitWritten = bothSubmitWritten;
exports.bothAssignQuestionWritten = bothAssignQuestionWritten;
exports.bothRunningWritten = bothRunningWritten;
exports.BothSubmitAnswerMcq = BothSubmitAnswerMcq;
exports.bothUpdateAssignQuestionMcq = bothUpdateAssignQuestionMcq;
exports.bothGetRunningDataMcq = bothGetRunningDataMcq;
exports.bothAssignQuestionMcq = bothAssignQuestionMcq;
exports.bothExamCheckMiddleware = bothExamCheckMiddleware;
exports.historyDataWritten = historyDataWritten;
exports.missedExamWritten = missedExamWritten;
exports.getWrittenQuestion = getWrittenQuestion;
exports.viewSollutionWritten = viewSollutionWritten;
exports.viewSollutionWrittenAdmin = viewSollutionWrittenAdmin;
exports.examDetailWritten = examDetailWritten;
exports.getWrittenStudentSingleByExam = getWrittenStudentSingleByExam;
exports.getWrittenStudentAllByExam = getWrittenStudentAllByExam;
exports.updateStudentWrittenExamInfo = updateStudentWrittenExamInfo;
exports.writtenExamCheckMiddleware = writtenExamCheckMiddleware;
exports.assignWrittenQuestion = assignWrittenQuestion;
exports.submitStudentScript = submitStudentScript;
exports.submitWritten = submitWritten;
exports.getAllRank = getAllRank;
exports.updateRank = updateRank;
exports.bothGetAllRank = bothGetAllRank;
exports.bothUpdateRank = bothUpdateRank;
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
exports.getStudenInfoById = getStudenInfoById;
exports.getStudentByCourseReg = getStudentByCourseReg;
exports.updateStudentExamInfo = updateStudentExamInfo;
exports.getRank = getRank;
exports.getStudentRegSearch = getStudentRegSearch;
exports.getStudentNameSearch = getStudentNameSearch;
exports.getStudentMobileSearch = getStudentMobileSearch;
exports.getRankStudent = getRankStudent;
exports.examTimeCheck = examTimeCheck;
exports.runningWritten = runningWritten;
exports.getWrittenScript = getWrittenScript;
exports.getHistoryByWrittenId = getHistoryByWrittenId;
exports.getCheckWrittenStudentAllByExam = getCheckWrittenStudentAllByExam;
exports.editStudent = editStudent;
