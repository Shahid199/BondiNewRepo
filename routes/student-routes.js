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
  examCheck,
  submitAnswer,
  getRunningData,
  viewSollution,
  historyData,
  missedExam,
  retakeExam,
  retakeSubmit,
} = require("../controller/student-controller");
const router = express.Router();
//student frontend routes
router.post("/login", loginStudent);
//need query parameter eid(examid).
router.get("/startexam", examCheck, assignQuestion);
//need query parameter eid,question sl,answeredoption.
router.post("/updateanswer", updateAssignQuestion);
//need query parameter eid(examid).
router.put("/submitanswer", submitAnswer);
//if start exam api response status is 300 then call getrunnigdata API.
//if start exam api response status is 301 then exam ended.
router.get("/getrunningdata", examCheck, getRunningData);

//student admin panel routes
router.post("/addstudent", upload.single("excelFile"), addStudent);
router.put("/updatestudent", updateStudent);
router.get("/getstudentid", getStudentId);
router.get("/getallstudent", getAllStudent);

router.get("/viewsollution", viewSollution);
router.get(
  "/history",
  [passport.authenticate("jwt", { session: false })],
  historyData
);
router.get("/missedexam", missedExam);
router.get("/retake", retakeExam);
router.get("/retakesubmit", retakeSubmit);

module.exports = router;
//new node
