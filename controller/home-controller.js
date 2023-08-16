const Course = require("../model/Course");
const Exam = require("../model/Exam");
const Student = require("../model/Student");
const Subject = require("../model/Subject");
const moment = require("moment");
const { default: mongoose } = require("mongoose");

const getHomePage = async (req, res, next) => {
  let section = req.query.section;
  let homeDataTop = new Object(),
    homeDataBottom = new Object(),
    running,
    coming,
    subjectDataDaily,
    subjectDataMonthly,
    subjectDataweekly;
  let courseId = new mongoose.Types.ObjectId(req.user.courseId);
  let studentId = new mongoose.Types.ObjectId(req.user.studentId);
  let currentTime = moment(Date.now()).add(6, "hours");
  //Top
  if (section == "top") {
    //let currentTime = new Date();
    //console.log(currentTime);
    //console.log(courseId);
    try {
      coming = await Exam.find(
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
    //console.log(coming);
    try {
      running = await Exam.find(
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
    //console.log(running);
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
