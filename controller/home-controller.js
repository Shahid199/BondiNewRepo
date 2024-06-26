const BothExam = require("../model/BothExam");
const Course = require("../model/Course");
const Exam = require("../model/Exam");
const McqSpecialExam = require("../model/McqSpecialExam");
//const SpecialExam = require("../model/SpecialExam");
const SpecialExam = require("../model/SpecialExamNew");
const Student = require("../model/Student");
const Subject = require("../model/Subject");
const moment = require("moment");
const { default: mongoose } = require("mongoose");

const getHomePage = async (req, res, next) => {
  let section = req.query.section;
  let homeDataTop = new Object(),
    homeDataBottom = new Object(),
    running1 = [],
    running2 = [],
    running3 = [],
    running4 = [],
    runningAll = [],
    coming = [],
    coming1 = [],
    coming2 = [],
    coming3 = [],
    coming4 = [],
    comingAll = [],
    subjectDataDaily,
    subjectDataMonthly,
    subjectDataweekly;
  let courseId = new mongoose.Types.ObjectId(req.user.courseId);
  let studentId = new mongoose.Types.ObjectId(req.user.studentId);
  //Top
  if (section == "top") {
    let currentTime = moment(new Date()).add(6, "h");
    ////console.log(currentTime);
    ////console.log(courseId);
    try {
      coming1 = await Exam.find(
        {
          $and: [
            { status: true },
            { courseId: courseId },
            { startTime: { $gt: currentTime } },
          ],
        },
        "_id name startTime endTime iLink"
      )
        .sort("startTime")
        .limit(2);
    } catch (err) {
      return res.status(500).json("Something went wrong!");
    }
    ////console.log(coming1);
    try {
      coming2 = await BothExam.find(
        {
          $and: [
            { status: true },
            { courseId: courseId },
            { startTime: { $gt: currentTime } },
          ],
        },
        "_id name startTime endTime iLink"
      )
        .sort("startTime")
        .limit(2);
    } catch (err) {
      return res.status(500).json("Something went wrong!");
    }
    coming3 = await SpecialExam.find(
      {
        $and: [
          { status: true },
          { courseId: courseId },
          { startTime: { $gt: currentTime } },
        ],
      },
      "_id name startTime endTime iLink"
    )
      .sort("startTime")
      .limit(2);
    coming4 = await McqSpecialExam.find(
      {
        $and: [
          { status: true },
          { courseId: courseId },
          { startTime: { $gt: currentTime } },
        ],
      },
      "_id name startTime endTime iLink"
    )
      .sort("startTime")
      .limit(2);
    // //console.log(coming1);
    // //console.log(coming2);
    // //console.log(coming3);
    comingAll = coming1.concat(coming2);
    comingAll = comingAll.concat(coming3);
    comingAll = comingAll.concat(coming4);
    ////console.log(comingAll);
    try {
      running1 = await Exam.find(
        {
          $and: [
            { status: true },
            { courseId: courseId },
            { startTime: { $lte: currentTime } },
            { endTime: { $gt: currentTime } },
          ],
        },
        "_id name startTime endTime iLink examVariation examType"
      )
        .sort("startTime")
        .limit(2);
    } catch (err) {
      return res.status(500).json("Something went wrong!");
    }

    try {
      running2 = await BothExam.find(
        {
          $and: [
            { status: true },
            { courseId: courseId },
            { startTime: { $lte: currentTime } },
            { endTime: { $gt: currentTime } },
          ],
        },
        "_id name startTime endTime iLink examVariation examType"
      )
        .sort("startTime")
        .limit(2);
    } catch (err) {
      return res.status(500).json("Something went wrong!");
    }
    //   ////console.log(running);

    try {
      running3 = await SpecialExam.find(
        {
          $and: [
            { status: true },
            { courseId: courseId },
            { startTime: { $lte: currentTime } },
            { endTime: { $gt: currentTime } },
          ],
        },
        "_id name startTime endTime iLink examVariation"
      )
        .sort("startTime")
        .limit(2);
    } catch (err) {
      return res.status(500).json("Something went wrong!");
    }
    try {
      running4 = await McqSpecialExam.find(
        {
          $and: [
            { status: true },
            { courseId: courseId },
            { startTime: { $lte: currentTime } },
            { endTime: { $gt: currentTime } },
          ],
        },
        "_id name startTime endTime iLink examVariation isOptionalAvailable"
      )
        .sort("startTime")
        .limit(2);
    } catch (err) {
      return res.status(500).json("Something went wrong!");
    }
    runningAll = running1.concat(running2);
    runningAll = runningAll.concat(running3);
    runningAll = runningAll.concat(running4);

    runningAll = runningAll.sort((a, b) => a.startTime - b.startTime);
    comingAll = comingAll.sort((a, b) => a.startTime - b.startTime);
    // //console.log("running");
    // //console.log(running1);
    // //console.log(running2);
    // //console.log(running3);
    // //console.log(runningAll);
    // //console.log(comingAll.length);
    // //console.log(comingAll);
    let running = [];
    for (let i = 0; i < runningAll.length; i++) {
      running[i] = runningAll[i];
      if (i == 1) break;
    }
    for (let i = 0; i < comingAll.length; i++) {
      coming[i] = comingAll[i];
      if (i == 1) break;
    }
    homeDataTop["runningExam"] = running;
    homeDataTop["comingExam"] = coming;
    return res.status(200).json(homeDataTop);
  }
  //bottom
  else {
    try {
      courseId = await Course.findById(courseId).select("_id");
      studentId = await Student.findById(studentId).select("_id");
    } catch (err) {
      ////console.log(err);
      return res.status(500).json("Something went wrong!");
    }
    ////console.log(courseId);
    if (courseId == null || studentId == null)
      return res.status(404).json({ message: "course or student not found." });
    try {
      subjectDataDaily = await Subject.find(
        {$and:[{courseId:courseId},{status:true}]},
        "_id name iLink descr"
      );
    } catch (err) {
      ////console.log(err);
      return res.status(500).json("Something went wrong!");
    }
    ////console.log(subjectDataDaily);
    subjectDataMonthly = subjectDataDaily;
    subjectDataweekly = subjectDataDaily;
    homeDataBottom["daily"] = subjectDataDaily;
    homeDataBottom["weekly"] = subjectDataMonthly;
    homeDataBottom["monthly"] = subjectDataweekly;
    return res.status(200).json(homeDataBottom);
  }
};
exports.getHomePage = getHomePage;
