const express = require("express");
const { upload } = require("../utilities/multer");
const passport = require("passport");
const authorize = require("../utilities/authorizationMiddleware");
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
  viewSollutionAdmin,
  missedExamAdmin,
  historyDataAdmin,
  studentSubmittedExamDetail,
  studentSubmittedExamDetailAdmin,
  getHistoryByExamId,
  getStudenInfoById,
  getStudentByCourseReg,
} = require("../controller/student-controller");
const router = express.Router();
//student frontend routes
router.post("/login", loginStudent);
router.get(
  "/validate-login",
  [passport.authenticate("jwt", { session: false })],
  validateToken
);
//need query parameter eid(examid).


router.get(
  "/getstudentinfobyid",
  [
    passport.authenticate("jwt", { session: false }),
    authorize(["superadmin", "moderator"]),
  ],
  getStudenInfoById
);

router.get(
  "/getstudentbycoursereg",
  [
    passport.authenticate("jwt", { session: false }),
    authorize(["superadmin", "moderator"]),
  ],
  getStudentByCourseReg
);

router.get(
  "/examcheckmiddleware",
  [
    passport.authenticate("jwt", { session: false }),
    authorize(["student", "superadmin", "moderator"]),
  ],
  examCheckMiddleware
);
router.get(
  "/startexam",
  [
    passport.authenticate("jwt", { session: false }),
    authorize(["student", "superadmin", "moderator"]),
  ],
  assignQuestion
);

//need query parameter eid,question sl,answeredoption.
router.post(
  "/updateanswer",
  [
    passport.authenticate("jwt", { session: false }),
    authorize(["student", "superadmin", "moderator"]),
  ],
  updateAssignQuestion
);
router.post(
  "/submitanswer",
  [
    passport.authenticate("jwt", { session: false }),
    authorize(["student", "superadmin", "moderator"]),
  ],
  submitAnswer
);
router.get('/gethistorybyexamid',getHistoryByExamId);
router.get(
  "/getrunningdata",
  [
    passport.authenticate("jwt", { session: false }),
    authorize(["student", "superadmin", "moderator"]),
  ],
  getRunningData
);

//student admin panel routes
router.post(
  "/addstudent",
  [
    passport.authenticate("jwt", { session: false }),
    authorize(["moderator", "superadmin"]),
    upload.single("excelFile"),
  ],
  addStudent
);
router.put(
  "/updatestudent",
  [
    passport.authenticate("jwt", { session: false }),
    authorize(["student", "superadmin", "moderator"]),
  ],
  updateStudent
);
router.get(
  "/getstudentid",
  [passport.authenticate("jwt", { session: false }), authorize()],
  getStudentId
);
router.get(
  "/getallstudent",
  [passport.authenticate("jwt", { session: false }), authorize()],
  getAllStudent
);

router.get(
  "/viewSollution",
  [
    passport.authenticate("jwt", { session: false }),
    authorize(["student", "superadmin", "moderator"]),
  ],
  viewSollution
);
router.get(
  "/history",
  [
    passport.authenticate("jwt", { session: false }),
    authorize(["student", "superadmin", "moderator"]),
  ],
  historyData
);
router.get(
  "/missedexam",
  [
    passport.authenticate("jwt", { session: false }),
    authorize(["student", "superadmin", "moderator"]),
  ],
  missedExam
);
router.get(
  "/retake",
  [
    passport.authenticate("jwt", { session: false }),
    authorize(["student", "superadmin", "moderator"]),
  ],
  retakeExam
);
router.post(
  "/retakesubmit",
  [
    passport.authenticate("jwt", { session: false }),
    authorize(["student", "superadmin", "moderator"]),
  ],
  retakeSubmit
);

router.get(
  "/viewsollutionadmin",
  [
    passport.authenticate("jwt", { session: false }),
    authorize(["superadmin", "moderator"]),
  ],
  viewSollutionAdmin
);
router.get(
  "/missedexamadmin",
  [
    passport.authenticate("jwt", { session: false }),
    authorize(["superadmin", "moderator"]),
  ],
  missedExamAdmin
);
router.get(
  "/historydataadmin",
  [
    passport.authenticate("jwt", { session: false }),
    authorize(["superadmin", "moderator"]),
  ],
  historyDataAdmin
);
router.get(
  "/studentSubmittedExamDetail",
  [
    passport.authenticate("jwt", { session: false }),
    authorize(["superadmin", "moderator", "student"]),
  ],
  studentSubmittedExamDetail
);

router.get(
  "/studentSubmittedExamDetailadmin",
  [
    passport.authenticate("jwt", { session: false }),
    authorize(["superadmin", "moderator", "student"]),
  ],
  studentSubmittedExamDetailAdmin
);

module.exports = router;
//new node
