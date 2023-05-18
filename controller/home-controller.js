const Course = require("../model/Course");
const Exam = require("../model/Exam");
const Student = require("../model/Student");
const Subject = require("../model/Subject");

const getHomePage = async (req, res, next) => {
  let section = req.query.section;
  let homeDataTop = new Object(),
    homeDataBottom = new Object(),
    running,
    coming,
    subjectDataDaily,
    subjectDataMonthly,
    subjectDataweekly;
  let courseId = req.user.courseId;
  let studentId = req.user.studentId;
  //Top
  if (section == "top") {
    try {
      let currentTime = Date.now();
      coming = await Exam.find(
        {
          $and: [
            { status: true },
            { courseId: courseId },
            { startTime: { $gte: currentTime } },
          ],
        },
        "_id name startTime endTime iLink"
      )
        .sort("startTime")
        .limit(2);
    } catch (err) {
      console.log(err);
      return res.status(500).json("Something went wrong!");
    }
    try {
      let currentTime = Date.now();
      running = await Exam.find(
        {
          $and: [
            { status: true },
            { startTime: { $lte: currentTime } },
            { endTime: { $gte: currentTime } },
          ],
        },
        "_id name startTime endTime iLink"
      )
        .sort("startTime")
        .limit(2);
    } catch (err) {
      console.log(err);
      return res.status(500).json("Something went wrong!");
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
      console.log(err);
      return res.status(500).json("Something went wrong!");
    }
    if (courseId == null || studentId == null)
      return res.status(404).json({ message: "course or student not found." });
    try {
      subjectDataDaily = await Subject.find(
        { courseId: courseId },
        "_id name iLink descr"
      );
    } catch (err) {
      console.log(err);
      return res.status(500).json("Something went wrong!");
    }
    subjectDataMonthly = subjectDataDaily;
    subjectDataweekly = subjectDataDaily;
    homeDataBottom["daily"] = subjectDataDaily;
    homeDataBottom["weekly"] = subjectDataMonthly;
    homeDataBottom["monthly"] = subjectDataweekly;
    return res.status(200).json(homeDataBottom);
  }
};
exports.getHomePage = getHomePage;
