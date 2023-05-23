const { default: mongoose } = require("mongoose");
const FreeStudent = require("../model/FreeStudent");
const jwt = require("jsonwebtoken");
const FreestudentMarksRank = require("../model/FreestudentMarksRank");
const Limit = 10;

/**
 * login a student to a course
 * @param {Object} req courseId,regNo
 * @returns token
 */
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
      return res.status(500).json(err);
    }
    return res.status(201).json("Updated.");
  } else {
    try {
      sav = await student.save();
    } catch (err) {
      return res.status(500).json(err);
    }
    return res.status(200).json("Succesfully inserted!");
  }
};
const getAllFreeStudent = async (req, res, next) => {
  let page = req.body.page;
  let skippedItem;
  if (page == null) {
    page = Number(1);
    skippedItem = (page - 1) * Limit;
  } else {
    page = Number(page);
    skippedItem = (page - 1) * Limit;
  }
  let data;
  try {
    data = await FreeStudent.find({}).skip(skippedItem).limit(Limit);
  } catch (err) {
    return res.status(500).json(err);
  }
  return res.status(200).json(data);
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

const examCheckMiddleware = async (req, res, next) => {
  const studentId = req.user.studentId;
  const examId = req.body.examId;
  //return res.status(500).json(studentId);
  //start:check student already complete the exam or not
  let studentIdObj = new mongoose.Types.ObjectId(studentId);
  let examIdObj = new mongoose.Types.ObjectId(examId);
  let status = null;
  try {
    status = await FreestudentMarksRank.findOne({
      $and: [{ studentId: studentIdObj }, { examId: examIdObj }],
    });
  } catch (err) {
    return res.status(500).json(err);
  }
  if (status == null) return res.status(200).json("assign");
  else {
    if (status.finishedStatus == true) return res.status(200).json("ended");
    else return res.status(200).json("running");
  }
};
exports.addFreeStudent = addFreeStudent;
exports.getAllFreeStudent = getAllFreeStudent;
exports.freeLoginStudent = freeLoginStudent;
exports.examCheckMiddleware = examCheckMiddleware;
exports.validateToken = validateToken;
