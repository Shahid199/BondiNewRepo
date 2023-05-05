const Course = require("../model/Course");
const Exam = require("../model/Exam");
const Student = require("../model/Student");
const Subject = require("../model/Subject");

const getHomePage = async (req, res, next) => {
  let homeData = new Object(),
    courseName,
    running,
    coming,
    subjectDataDaily,
    subjectDataMonthly,
    subjectDataweekly;
  let { courseId, studentId } = req.body;
  let subjectId;
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
  let exam;
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
  subjectDataMonthly = subjectDataDaily;
  subjectDataweekly = subjectDataDaily;
  homeData["daily"] = subjectDataDaily;
  homeData["weekly"] = subjectDataMonthly;
  homeData["monthly"] = subjectDataweekly;
  homeData["runningExam"] = running;
  homeData["comingExam"] = coming;
  return res.status(201).send(Object.entries(homeData));
};
exports.getHomePage = getHomePage;
