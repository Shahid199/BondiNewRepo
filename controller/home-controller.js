const BothExam = require("../model/BothExam");
const Course = require("../model/Course");
const Exam = require("../model/Exam");
const SpecialExam = require("../model/SpecialExam");
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
    runningAll = [],
    coming,
    coming1 = [],
    coming2 = [],
    coming3 = [],
    comingAll = [],
    subjectDataDaily,
    subjectDataMonthly,
    subjectDataweekly;
  let courseId = new mongoose.Types.ObjectId(req.user.courseId);
  let studentId = new mongoose.Types.ObjectId(req.user.studentId);
  let currentTime = moment(Date.now()).add(6, "hours");
  //Top
  if (section == "top") {
    let currentTime = moment(new Date());
    console.log(currentTime);
    console.log(courseId);
    try {
      coming1 = await Exam.find({
        $and: [{ status: true, courseId: courseId }],
      });
      //   {
      //     $and: [
      //       { status: true },
      //       { courseId: courseId },
      //       // { startTime: { $gt: currentTime } },
      //     ],
      //   },
      //   "_id name startTime endTime iLink"
      // )
      //   .sort("startTime")
      //   .limit(2);
    } catch (err) {
      return res.status(500).json("Something went wrong!");
    }
    console.log(coming1);
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

    console.log(coming2);
    console.log(coming3);
    comingAll = coming1.concat(coming2);
    comingAll = comingAll.concat(coming3);
    //console.log(coming);
    try {
      running1 = await Exam.find(
        {
          $and: [
            { status: true },
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
    //   //console.log(running);

    try {
      running3 = await SpecialExam.find(
        {
          $and: [
            { status: true },
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
    runningAll = running1.concat(running2);
    runningAll = runningAll.concat(running3);
    runningAll = runningAll.sort((a, b) => a.startTime >= b.startTime);
    comingAll = comingAll.sort((a, b) => a.startTime >= b.startTime);
    // console.log(running1);
    // console.log(running2);
    // console.log(running3);

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
      //console.log(err);
      return res.status(500).json("Something went wrong!");
    }
    //console.log(courseId);
    if (courseId == null || studentId == null)
      return res.status(404).json({ message: "course or student not found." });
    try {
      subjectDataDaily = await Subject.find(
        { courseId: courseId },
        "_id name iLink descr"
      );
    } catch (err) {
      //console.log(err);
      return res.status(500).json("Something went wrong!");
    }
    //console.log(subjectDataDaily);
    subjectDataMonthly = subjectDataDaily;
    subjectDataweekly = subjectDataDaily;
    homeDataBottom["daily"] = subjectDataDaily;
    homeDataBottom["weekly"] = subjectDataMonthly;
    homeDataBottom["monthly"] = subjectDataweekly;
    return res.status(200).json(homeDataBottom);
  }
};
exports.getHomePage = getHomePage;
