const { default: mongoose } = require("mongoose");
const FreeStudent = require("../model/FreeStudent");
const Limit = 10;

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
const examCheckMiddleware = async (req, res, next) => {
    const eId = req.body.eId;
    const studentId = req.user.studentId;
    //start:check student already complete the exam or not
    let eId1, sId;
    sId = new mongoose.Types.ObjectId(studentId);
    eId1 = new mongoose.Types.ObjectId(eId);
    let status;
    try {
      status = await StudentMarksRank.findOne({
        $and: [{ studentId: sId }, { examId: eId1 }],
      }).populate("examId");
    } catch (err) {
      return res.status(500).json("DB error");
    }
    if (status.finishedStatus == false && status.runningStatus == false)
      return res.status(200).json("assign");
    else if (status.finishedStatus == true) return res.status(200).json("ended");
    else return res.status(200).json("running");
  };
exports.addFreeStudent = addFreeStudent;
exports.getAllFreeStudent = getAllFreeStudent;
