const Course = require('../model/Course');
const Student = require('../model/Student');
const CourseVsStudent = require('../model/CourseVsStudent');
const fs = require('fs');
const { default: mongoose } = require('mongoose');
const pagination = require('../utilities/pagination');
const fsp = fs.promises;
const ObjectId = mongoose.Types.ObjectId;
//add Student To Course
const addStudentToCourse1 = async (req, res, next) => {
  //start file work
  const file = req.file;
  if (!file)
    return res.status(404).json('CSV file is not uploaded or wrong file name.');
  let courseId = req.query.courseId;
  if (!ObjectId.isValid(courseId))
    return res.status(404).json('courseId is invalid.');
  let excelFilePath = null;
  excelFilePath = 'uploads/'.concat(file.filename);
  const data1 = await fsp.readFile(excelFilePath, 'utf8');
  const linesExceptFirst = data1.split('\n');
  const linesArr = linesExceptFirst;
  //end file work
  let students = [];
  let problemStudent = [];
  let existStudent = [];
  let courseId1;
  let studentIds = [];
  courseId1 = new mongoose.Types.ObjectId(courseId);
  try {
    studentIds = await CourseVsStudent.find({ courseId: courseId1 }).select(
      '_id'
    );
  } catch (err) {
    return res.statu(500).json('Something went wrong.');
  }
  let studentIdsMap = studentIds.map((e) => String(e));

  for (let i = 1; i < linesArr.length; i++) {
    const regNo = String(linesArr[i].replace(/["'\r]/g, ''));
    if (regNo == 'undefined') {
      continue;
    }
    const users = {};
    let studentId = null;
    try {
      studentId = await Student.findOne({ regNo: regNo }).select('_id');
    } catch (err) {
      return res.status(500).json(err);
    }
    if (studentId == null) {
      problemStudent.push(regNo);
      continue;
    }
    let existData = null;
    try {
      existData = await CourseVsStudent.findOne({
        $and: [{ studentId: studentId }, { courseId: courseId1 }],
      }).select('_id');
    } catch (err) {
      return res.status(500).json('err');
    }
    ////console.log(existData);
    if (existData != null) {
      existStudent.push(regNo);
      continue;
    }
    users['courseId'] = courseId1;
    users['studentId'] = studentId;
    users['status'] = true;
    students.push(users);
  }

  if (problemStudent.length > 0)
    return res
      .status(202)
      .json({ message: 'Student not tadded.', problemStudent });
  let doc;
  try {
    doc = await CourseVsStudent.insertMany(students, { ordered: false });
  } catch (err) {
    return res.status(500).json(err);
  }
  return res
    .status(201)
    .json({ message: 'Successfully inserted all student.', existStudent });
};
const addStudentToCourse = async (req, res, next) => {
  //start file work
  const file = req.file;
  if (!file)
    return res.status(404).json('CSV file is not uploaded or wrong file name.');
  let courseId = req.query.courseId;
  if (!ObjectId.isValid(courseId))
    return res.status(404).json('courseId is invalid.');
  let excelFilePath = null;
  excelFilePath = 'uploads/'.concat(file.filename);
  const data1 = await fsp.readFile(excelFilePath, 'utf8');
  // //console.log(data1);
  const linesExceptFirst = data1.split(',');
  const linesArr = linesExceptFirst;
  ////console.log(linesArr);
  // return res.status(200).json("ok");
  //end file work
  let students = [];
  let problemStudent = [];
  let existStudent = [];
  let courseId1;
  let studentIds = [];
  courseId1 = new mongoose.Types.ObjectId(courseId);
  try {
    studentIds = await CourseVsStudent.find({ courseId: courseId1 }).select(
      'studentId'
    );
  } catch (err) {
    return res.statu(500).json('Something went wrong.');
  }
  ////console.log(studentIds);
  let sIds = [];
  //studentIds = [... studentIdsa["studentId"]];
  for (let i = 0; i < studentIds.length; i++) {
    sIds.push(String(studentIds[i].studentId));
  }
  ////console.log(sIds);

  //let studentIdsMap = studentIds.map((e) => String(e));

  ////console.log(studentIds);
  ////console.log(studentIdsMap);
  // for(let i =0;i<linesArr;i++){

  // }
  console.log(linesArr);
  for (let i = 0; i < linesArr.length; i++) {
    let regNo;
    ////console.log(i);
    regNo = String(linesArr[i].replace(/[\r"]/g, ''));
    ////console.log(regNo);
    regNo = regNo.trim();
    if (i == 0) regNo = regNo.substring(1);
    if (i == linesArr.length - 1) regNo = regNo.substring(0, regNo.length - 1);
    ////console.log(regNo);
    if (regNo == 'undefined') {
      continue;
    }
    if (sIds.includes(regNo)) {
      ////console.log("k");
      continue;
    }
    console.log(regNo);
    const users = {};
    users['courseId'] = courseId1;
    users['studentId'] = new mongoose.Types.ObjectId(regNo);
    users['status'] = true;
    students.push(users);
  }
  try {
    doc = await CourseVsStudent.insertMany(students, { ordered: false });
  } catch (err) {
    return res.status(500).json(err);
  }

  return res
    .status(201)
    .json({ message: 'Successfully inserted all student.', existStudent });
};
//get students by course
const getStudentByCourse = async (req, res, next) => {
  let courseId = req.query.courseId;
  let page = Number(req.query.page) || 1;
  let count = 0;
  try {
    count = await CourseVsStudent.find({
      $and: [{ courseId: courseId }, { status: true }],
    }).count();
  } catch (err) {
    return res.status(500).json('Something went wrong.pagination.');
  }
  if (count == 0) return res.status(404).json('No data found.');

  const paginateData = pagination(count, page);
  if (!ObjectId.isValid(courseId))
    return res.status(404).json('courseId is invalid.');
  let data = [];
  try {
    data = await CourseVsStudent.find({
      $and: [{ courseId: courseId }, { status: true }],
    })
      .populate('studentId')
      .skip(paginateData.skippedIndex)
      .limit(paginateData.perPage);
  } catch (err) {
    ////console.log(err);
    return res.status(500).json('Something went wrong!');
  }
  if (data != null) return res.status(200).json({ data, paginateData });
  else return res.status(404).json('student not found in course.');
};
//get courses by student
const getCourseByStudent = async (req, res, next) => {
  let studentId = req.query.studentid;
  if (!ObjectId.isValid(studentId))
    return res.status(404).json('studentId is invalid.');
  let courses = [];
  try {
    courses = await CourseVsStudent.find({ studentId: studentId }).populate(
      'courseId'
    );
  } catch (err) {
    ////console.log(err);
    return res.status(500).json('Something went wrong!');
  }

  return res.status(200).json(courses);
};
//get course by regNo
const getCourseByReg1 = async (req, res, next) => {
  const regNo = req.query.regNo;
  let studentId;
  let courses;
  try {
    studentId = await Student.findOne({ regNo: regNo }).select('_id');
  } catch (err) {
    ////console.log(err);
    return res.status(500).json('Something went wrong!');
  }
  if (studentId) {
    courses = await CourseVsStudent.find({ studentId: studentId }).populate(
      'courseId'
    );
    let dataNew = [];
    for (let i = 0; i < courses.length; i++) {
      if (courses[i].courseId && courses[i].courseId.status == true)
        dataNew.push(courses[i].courseId);
    }
    let studentId1 = studentId._id;
    return res.status(200).json({ courses: dataNew, studentId: studentId1 });
  } else return res.status(404).json('Course Not found.');
};
const getCourseByReg = async (req, res, next) => {
  const regNo = req.query.regNo;
  let studentId;
  let courses;
  try {
    studentId = await Student.findOne({ regNo: regNo }).select('_id');
  } catch (err) {
    ////console.log(err);
    return res.status(500).json('Something went wrong!');
  }
  if (studentId) {
    courses = await CourseVsStudent.find({ studentId: studentId }).populate(
      'courseId'
    );
    let dataNew = [];
    for (let i = 0; i < courses.length; i++) {
      if (
        courses[i].courseId &&
        courses[i].courseId.status == true &&
        courses[i].status == true
      )
        dataNew.push(courses[i].courseId);
    }
    let studentId1 = studentId._id;
    return res.status(200).json({ courses: dataNew, studentId: studentId1 });
  } else return res.status(404).json('Course Not found.');
};
const changeStatus = async (req, res, next) => {
  let courseId = req.body.courseId;
  if (!ObjectId.isValid(courseId))
    return res.status(404).json('courseId is not valid.');
  courseId = new mongoose.Types.ObjectId(courseId);
  let curStatus = null;
  try {
    curStatus = await CourseVsStudent.findOne({ courseId: courseId });
  } catch (err) {
    return res.status(500).json('Something went wrong.');
  }
  if (!curStatus) return res.status(404).json('No student found.');
  curStatus = curStatus.status;
  let upd = null;
  try {
    upd = await CourseVsStudent.updateMany(
      { courseId: courseId },
      { $set: { status: !curStatus } }
    );
  } catch (err) {
    return res.status(500).json('Something went wrong.');
  }
  return res.status(201).json('Successfully updated.');
};

exports.changeStatus = changeStatus;
exports.addStudentToCourse = addStudentToCourse;
exports.getStudentByCourse = getStudentByCourse;
exports.getCourseByStudent = getCourseByStudent;
exports.getCourseByReg = getCourseByReg;
