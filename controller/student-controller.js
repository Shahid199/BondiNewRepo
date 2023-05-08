const Student = require("../model/Student");
const Course = require("../model/Course");
const CourseVsStudent = require("../model/CourseVsStudent");
const jwt = require("jsonwebtoken");
const readExcel = require("read-excel-file/node");
const { execSync } = require("child_process");

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
  const file = req.file;
  let excelFilePath = null;
  //console.log(file);
  if (!file) {
    return res.status(404).json({ message: "Exce File not uploaded." });
  }
  excelFilePath = "uploads/".concat(file.filename);

  //read excel file
  let regNo,
    name,
    mobileNo,
    message = [],
    catchMessage = [],
    existMessage = [];
  readExcel(excelFilePath).then((data) => {
    data.forEach(async (element, index) => {
      if (index == 0) return;
      regNo = element[0];
      name = element[1];
      mobileNo = element[2];
      let existingStudent;
      try {
        existingStudent = await Student.findOne({ regNo: regNo });
      } catch (err) {
        console.log(err);
        catchMessage[index] = regNo + "1.Something went wrong!";
        i++;
      }
      if (existingStudent) {
        existMessage[index] = regNo + "student already exist";
      }
      const stud = new Student({
        regNo: regNo,
        name: name,
        mobileNo: mobileNo,
      });
      try {
        const doc = await stud.save();
      } catch (err) {
        console.log(err);
        catchMessage[index] = regNo + "2.Something went wrong!";
      }
      message[index] = regNo + "Student Created Succesfully.";
      regNo = null;
      name = null;
      mobileNo = null;
    });
  });
  if (catchMessage.length > 0) {
    catchMessage.forEach((element, index) => {
      
    });
  }
};

//update student
const updateStudent = async (req, res, next) => {
  const regNo = req.query.regno;
  let existingStudent;
  try {
    existingStudent = await Student.findOne({ regNo: regNo });
  } catch (err) {
    console.log(err);
    return res.status(500).json("Something went wrong!");
  }
  if (!existingStudent) {
    return res.status(400).json({ message: "student not exists." });
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
    return res.status(401).json({ message: "Student Not Found." });
  else {
    return res.status(201).json({ studentId });
  }
};
const getAllStudent = async (req, res, next) => {
  let students;
  try {
    students = await Student.find({});
  } catch (err) {
    console.log(err);
    return res.status(500).json("Something went wrong!");
  }
  return res.status(201).json(students);
};

exports.loginStudent = loginStudent;
exports.addStudent = addStudent;
exports.updateStudent = updateStudent;
exports.getStudentId = getStudentId;
exports.getAllStudent = getAllStudent;
