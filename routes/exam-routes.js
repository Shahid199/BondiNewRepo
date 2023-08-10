const express = require("express");
const { upload } = require("../utilities/multer");
const passport = require("passport");
const authorize = require("../utilities/authorizationMiddleware");
const {
  createExam,
  getAllExam,
  addQuestionMcq,
  addQuestionWritten,
  getExamBySubject,
  getExamBySub,
  examRuleSet,
  examRuleGet,
  examRuleGetAll,
  examByCourseSubject,
  getExamById,
  questionByExamId,
  updateQuestionStatus,
  updateExam,
  addQuestionMcqBulk,
  deactivateExam,
  freeExamStatus,
  getExamType,
  assignTeacher,
  assignStudentToTeacher,
  removeQuestionWritten,
  freeCourseSub,
  getWrittenQuestionByexam,
} = require("../controller/exam-controller");
const router = express.Router();

router.post(
  "/createexam",
  [
    passport.authenticate("jwt", { session: false }),
    authorize(),
    upload.single("iLink"),
  ],
  createExam
);
router.get(
  "/getallexam",
  [
    passport.authenticate("jwt", { session: false }),
    authorize(["superadmin", "mdoerator", "student"]),
  ],
  getAllExam
);
router.post(
  "/addquestionmcq",
  [
    passport.authenticate("jwt", { session: false }),
    authorize(),
    upload.fields([
      { name: "iLink", maxCount: 1 },
      { name: "explanationILink", maxCount: 1 },
    ]),
  ],
  addQuestionMcq
);
router.get(
  "/getexambysubject",
  [
    passport.authenticate("jwt", { session: false }),
    authorize(["student", "superadmin", "moderator"]),
  ],
  //authorize(["student"]),
  getExamBySubject
);

router.get(
  "/getexambysub",
  [
    passport.authenticate("jwt", { session: false }),
    authorize(["superadmin", "moderator", "student"]),
  ],
  getExamBySub
);

router.post(
  "/examruleset",
  [
    passport.authenticate("jwt", { session: false }),
    authorize(),
    upload.single("ruleILink"),
  ],
  examRuleSet
);
router.get(
  "/examruleget",
  [passport.authenticate("jwt", { session: false })],
  authorize(["superadmin", "moderator", "student", "freeStudent"]),
  examRuleGet
);
router.get(
  "/examrulegetall",
  [
    passport.authenticate("jwt", { session: false }),
    authorize(["superadmin", "moderator", "student"]),
  ],
  examRuleGetAll
);
router.get(
  "/exambycoursesubject",
  [
    passport.authenticate("jwt", { session: false }),
    authorize(["superadmin", "moderator", "student"]),
  ],
  examByCourseSubject
);
router.get(
  "/getexambyid",
  [
    passport.authenticate("jwt", { session: false }),
    authorize(["superadmin", "moderator", "student"]),
  ],
  getExamById
);
router.get(
  "/questionbyexamid",
  [passport.authenticate("jwt", { session: false }), authorize()],
  questionByExamId
);
router.put(
  "/updatequestionstatus",
  [passport.authenticate("jwt", { session: false }), authorize()],
  updateQuestionStatus
);
router.put(
  "/updateexam",
  [passport.authenticate("jwt", { session: false }), authorize()],
  updateExam
);
router.put(
  "/addquestionmcqbulk",
  [passport.authenticate("jwt", { session: false }), authorize()],
  addQuestionMcqBulk
);
router.put(
  "/deactivateexam",
  [passport.authenticate("jwt", { session: false }), authorize()],
  deactivateExam
);

router.get(
  "/freeexamstatus",
  [
    passport.authenticate("jwt", { session: false }),
    authorize(["superadmin", "moderator", "freeStudent"]),
  ],
  freeExamStatus
);
router.get(
  "/getexamtype",
  [
    passport.authenticate("jwt", { session: false }),
    authorize(["superadmin", "moderator"]),
  ],
  getExamType
);
router.get(
  "/freecoursesub",
  [
    passport.authenticate("jwt", { session: false }),
    authorize(["superadmin", "moderator"]),
  ],
  freeCourseSub
);

//written routes
router.post(
  "/addquestionwritten",
  [
    passport.authenticate("jwt", { session: false }),
    authorize(),
    upload.fields([{ name: "questionILink", maxCount: 1 }]),
  ],
  addQuestionWritten
);

router.post(
  "/removequestionwritten",
  [
    passport.authenticate("jwt", { session: false }),
    authorize(["superadmin", "moderator"]),
  ],
  removeQuestionWritten
);
router.get(
  "/getwrittenquestionbyexam",
  [
    passport.authenticate("jwt", { session: false }),
    authorize(["superadmin", "moderator", "student"]),
  ],
  getWrittenQuestionByexam
);

router.post(
  "/assignteacher",
  [
    passport.authenticate("jwt", { session: false }),
    authorize(["superadmin", "moderator"]),
  ],
  assignTeacher
);
router.post(
  "/assignstudenttoteacher",
  [
    passport.authenticate("jwt", { session: false }),
    authorize(["superadmin", "moderator"]),
  ],
  assignStudentToTeacher
);

module.exports = router;
