const express = require("express");
const { upload } = require("../utilities/multer");
const passport = require("passport");
const {
  loginStudent,
  addStudent,
  updateStudent,
  getStudentId,
  getAllStudent,
  assignQuestion,
  updateAssignQuestion,
  submitAnswer,
  getRunningData,
  viewSollution,
  historyData,
  missedExam,
  retakeExam,
  retakeSubmit,
  getRank,
} = require("../controller/student-controller");
const router = express.Router();
//student frontend routes
router.post("/login", loginStudent);
//need query parameter eid(examid).
router.get(
  "/startexam",
  [passport.authenticate("jwt", { session: false })],
  assignQuestion
);
//need query parameter eid,question sl,answeredoption.
router.post(
  "/updateanswer",
  [passport.authenticate("jwt", { session: false })],
  updateAssignQuestion
);
router.put(
  "/submitanswer",
  [passport.authenticate("jwt", { session: false })],
  submitAnswer
);
router.get(
  "/getrunningdata",
  [passport.authenticate("jwt", { session: false })],
  getRunningData
);

//student admin panel routes
router.post("/addstudent", upload.single("excelFile"), addStudent);
router.put("/updatestudent", updateStudent);
router.get("/getstudentid", getStudentId);
router.get("/getallstudent", getAllStudent);

router.get(
  "/viewSollution",
  [passport.authenticate("jwt", { session: false })],
  viewSollution
);
router.get(
  "/history",
  [passport.authenticate("jwt", { session: false })],
  historyData
);
router.get(
  "/missedexam",
  [passport.authenticate("jwt", { session: false })],
  missedExam
);
router.get(
  "/retake",
  [passport.authenticate("jwt", { session: false })],
  retakeExam
);
router.post(
  "/setrank",
  [passport.authenticate("jwt", { session: false })],
  getRank
);


module.exports = router;
//new node
