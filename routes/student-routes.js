const express = require("express");
const { upload } = require("../utilities/multer");
const passport = require("passport");
const {
  loginStudent,
  validateToken,
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
  examCheckMiddleware,
} = require("../controller/student-controller");
const router = express.Router();
//student frontend routes
router.post(
  "/login",
  [passport.authenticate("jwt", { session: false })],
  loginStudent
);
router.get(
  "/validate-login",
  [passport.authenticate("jwt", { session: false })],
  validateToken
);
//need query parameter eid(examid).
router.get(
  "/examcheckmiddleware",
  [passport.authenticate("jwt", { session: false })],
  examCheckMiddleware
);
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
router.post(
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
router.put(
  "/updatestudent",
  [passport.authenticate("jwt", { session: false })],
  updateStudent
);
router.get(
  "/getstudentid",
  [passport.authenticate("jwt", { session: false })],
  getStudentId
);
router.get(
  "/getallstudent",
  [passport.authenticate("jwt", { session: false })],
  getAllStudent
);

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
router.get(
  "/retakesubmit",
  [passport.authenticate("jwt", { session: false })],
  retakeSubmit
);
module.exports = router;
//new node
