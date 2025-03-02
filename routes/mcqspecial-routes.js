const express = require("express");
const { upload } = require("../utilities/multer");
const passport = require("passport");
const authorize = require("../utilities/authorizationMiddleware");
const {
  createSpecialMcqExam,
  updateSpecialExam,
  showSpecialExamById,
  updateExamPhoto,
  showMcqSpecialExamByCourse,
  deactivateSpecialExam,
  showSpecialExamByIdStudent,
  showSpecialExamByIdStudentAdmin,
  examRuleSet,
  examRuleGet,
  examRuleGetAll,
  addQuestionMcq,
  addQuestionMcqBulk,
  questionByExamSub,
  viewSollutionMcq,
  specialGetHistoryFilter,
  viewSollutionMcqAdmin,
  assignQuestionMcqWithoutOptional,
  historyData,
  getOptionalSubects,
  getCombination,
  updateStudentExamInfo,
  getRank,
  slotAvailable,
  refillQuestion,
  questionByExamIdSubjectAndSet,
  getAllRank,
  examCheckMiddleware,
  assignQuestionMcq,
  getRunningDataMcq,
  updateAssignQuestion,
  submitAnswer,
  publishExam,
  updateRank,
  studentSubmittedExamDetail,
  getExamSubjects,
  specialGetHistory,
  addTextQuestion,
  updateQuestionStatus
} = require("../controller/mcqSpecial-controller");
const { upload1 } = require("../utilities/multer_questions");
const router = express.Router();

router.put('/updatequestionstatus',updateQuestionStatus)
router.post(
  "/addTextQuestion",
  [
    passport.authenticate("jwt", { session: false }),
    authorize(["superadmin", "moderator"]),
  ],
  addTextQuestion
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
  "/getexamsubjects",
  [
    passport.authenticate("jwt", { session: false }),
    authorize(["superadmin", "moderator", "student"]),
  ],
  getExamSubjects
);
router.post(
  "/submit",
  [
    passport.authenticate("jwt", { session: false }),
    authorize(["superadmin", "moderator", "student"]),
  ],
  submitAnswer
);
router.post(
  "/publishexam",
  [
    passport.authenticate("jwt", { session: false }),
    authorize(["superadmin", "moderator", "teacher"]),
  ],
  publishExam
);
router.post(
  "/updaterank",
  [
    passport.authenticate("jwt", { session: false }),
    authorize(["superadmin", "moderator", "teacher"]),
  ],
  updateRank
);
router.post(
  "/updateanswer",
  [
    passport.authenticate("jwt", { session: false }),
    authorize(["student", "superadmin", "moderator"]),
  ],
  updateAssignQuestion
);
router.get(
  "/getrunningdatamcq",
  [
    passport.authenticate("jwt", { session: false }),
    authorize(["student", "superadmin", "moderator"]),
  ],
  getRunningDataMcq
);
router.get(
  "/startexam",
  [
    passport.authenticate("jwt", { session: false }),
    authorize(["student", "superadmin", "moderator"]),
  ],
  assignQuestionMcq
);
router.get(
  "/startexamwos",
  [
    passport.authenticate("jwt", { session: false }),
    authorize(["student", "superadmin", "moderator"]),
  ],
  assignQuestionMcqWithoutOptional
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
  "/slotAvailable",
  [
    passport.authenticate("jwt", { session: false }),
    authorize(["student", "superadmin", "moderator", "teacher"]),
  ],
  //authorize(["student"]),
  slotAvailable
);
router.get(
  "/questionByExamIdSubjectAndSet",
  [
    passport.authenticate("jwt", { session: false }),
    authorize(["superadmin", "moderator", "student"]),
  ],
  questionByExamIdSubjectAndSet
);
router.post(
  "/refillquestion",
  [
    passport.authenticate("jwt", { session: false }),
    authorize(["superadmin", "moderator"]),
  ],
  refillQuestion
);
router.post(
  "/createspecialmcqexam",
  [
    passport.authenticate("jwt", { session: false }),
    authorize(),
    upload.single("iLink"),
  ],
  createSpecialMcqExam
);

router.post(
  "/updatemcqspecialexamphoto",
  [
    passport.authenticate("jwt", { session: false }),
    authorize(),
    upload.single("iLink"),
  ],
  updateExamPhoto
);

router.put(
  "/updatespecialexam",
  [
    passport.authenticate("jwt", { session: false }),
    authorize(),
    upload.single("iLink"),
  ],
  updateSpecialExam
);

router.get(
  "/showspecialexambyid",
  [
    passport.authenticate("jwt", { session: false }),
    authorize(["superadmin", "moderator", "student"]),
  ],
  showSpecialExamById
);

router.get(
  "/showmcqspecialexambycourse",
  [
    passport.authenticate("jwt", { session: false }),
    authorize(["superadmin", "moderator", "teacher"]),
  ],
  showMcqSpecialExamByCourse
);

router.put(
  "/deactivatespecialexam",
  [passport.authenticate("jwt", { session: false }), authorize()],
  deactivateSpecialExam
);

router.get(
  "/showspecialexambyidstudent",
  [
    passport.authenticate("jwt", { session: false }),
    authorize(["superadmin", "moderator", "student"]),
  ],
  showSpecialExamByIdStudent
);
router.get(
  "/showspecialexambyidstudentadmin",
  [
    passport.authenticate("jwt", { session: false }),
    authorize(["superadmin", "moderator"]),
  ],
  showSpecialExamByIdStudentAdmin
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

router.post(
  "/addquestionmcq",
  [
    passport.authenticate("jwt", { session: false }),
    authorize(),
    upload1.fields([
      { name: "iLink", maxCount: 8 },
      { name: "explanationILink", maxCount: 8 },
    ]),
  ],
  addQuestionMcq
);

router.put(
  "/addquestionmcqbulk",
  [passport.authenticate("jwt", { session: false }), authorize()],
  addQuestionMcqBulk
);
router.get(
  "/questionbyexamsub",
  [passport.authenticate("jwt", { session: false }), authorize()],
  questionByExamSub
);
router.get(
  "/viewsollutionmcq",
  [
    passport.authenticate("jwt", { session: false }),
    authorize(["student", "superadmin", "moderator"]),
  ],
  viewSollutionMcq
);
router.get(
  "/specialgethistoryfilter",
  [
    passport.authenticate("jwt", { session: false }),
    authorize(["superadmin", "moderator"]),
  ],
  specialGetHistoryFilter
);
router.get(
  "/specialgethistory",
  [
    passport.authenticate("jwt", { session: false }),
    authorize(["superadmin", "moderator", "teacher"]),
  ],
  specialGetHistory
);
router.get(
  "/viewsollutionmcqadmin",
  [
    passport.authenticate("jwt", { session: false }),
    authorize(["superadmin", "moderator"]),
  ],
  viewSollutionMcqAdmin
);

router.get(
  "/historydata",
  [
    passport.authenticate("jwt", { session: false }),
    authorize(["student", "superadmin", "moderator"]),
  ],
  historyData
);
router.get(
  "/getoptionalsubject",
  [
    passport.authenticate("jwt", { session: false }),
    authorize(["superadmin", "moderator", "student"]),
  ],
  getOptionalSubects
);
router.get(
  "/getcombination",
  [
    passport.authenticate("jwt", { session: false }),
    authorize(["superadmin", "moderator", "student"]),
  ],
  getCombination
);
router.post(
  "/updatestudentexaminfo",
  [
    passport.authenticate("jwt", { session: false }),
    authorize(["superadmin", "moderator"]),
  ],
  updateStudentExamInfo
);

router.get(
  "/getrank",
  [
    passport.authenticate("jwt", { session: false }),
    authorize(["superadmin", "moderator", "teacher"]),
  ],
  getRank
);

router.get(
  "/getallrank",
  [
    passport.authenticate("jwt", { session: false }),
    authorize(["superadmin", "moderator", "teacher","student"]),
  ],
  getAllRank
);

module.exports = router;
