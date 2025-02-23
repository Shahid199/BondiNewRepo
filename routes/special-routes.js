const express = require("express");
const { upload } = require("../utilities/multer");
const { upload1 } = require("../utilities/multer_questions");
const passport = require("passport");
const authorize = require("../utilities/authorizationMiddleware");
const {
  createSpecialExam,
  updateSpecialExam,
  showSpecialExamAll,
  showSpecialExamById,
  deactivateSpecialExam,
  showSpecialExamByCourse,
  addQuestionMcq,
  examRuleGet,
  examRuleSet,
  examRuleGetAll,
  addQuestionMcqBulk,
  questionByExamSub,
  addQuestionWritten,
  getWrittenQuestionByExamSub,
  getOptionalSubects,
  getCombination,
  assignQuestionMcq,
  assignQuestionWritten,
  getRunningDataMcq,
  updateAssignQuestion,
  ruunningWritten,
  submitStudentScript,
  submitWritten,
  examCheckMiddleware,
  submitAnswerMcq,
  viewSollutionMcq,
  viewSollutionWritten,
  historyData,
  showSpecialExamByIdStudent,
  assignStudentToTeacher,
  updateStudentExamInfo,
  getStudentData,
  getRecheckStudentData,
  getWrittenScriptSingle,
  checkScriptSingle,
  marksCalculation,
  publishExam,
  updateRank,
  getRank,
  getAllRank,
  getWrittenStudentSingleByExam,
  getStudentDataAdmin,
  getWrittenStudentSingleByExamAdmin,
  statusUpdate,
  getRecheckStudentDataAdmin,
  checkScriptSingleAdmin,
  marksCalculationAdmin,
  studentSubmittedExamDetail,
  specialGetHistory,
  viewSollutionMcqAdmin,
  viewSollutionWrittenAdmin,
  specialGetHistoryAdmin,
  specialGetHistoryAdminFilter,
  showSpecialExamByIdStudentAdmin,
  updateWrittenMinus,
  specialGetHistoryFilter,
  updateSpecialExamPhoto,
  slotAvailable,
  questionByExamIdSubjectAndSet,
  refillQuestion,
  getSpecialExamById,
  addTextQuestion,
  getExamSubjects,
  writtenMarksUpdate,
  getExamSubjectsRetake,
  updateQuestionStatus,
  topRank
} = require("../controller/special-controller");
const router = express.Router();
// router.get(
//   "/writtenMarksUpdate",
//   writtenMarksUpdate
// );

router.put('/updatequestionstatus',updateQuestionStatus)
router.get(
  "/getexamsubjectsretake",
  [
    passport.authenticate("jwt", { session: false }),
    authorize(["superadmin", "moderator", "student"]),
  ],
  getExamSubjectsRetake
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
  "/createspecialexam",
  [
    passport.authenticate("jwt", { session: false }),
    authorize(),
    upload.single("iLink"),
  ],
  createSpecialExam
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
router.post(
  "/updateSpecialExamPhoto",
  [
    passport.authenticate("jwt", { session: false }),
    authorize(),
    upload.single("iLink"),
  ],
  updateSpecialExamPhoto
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
  "/addTextQuestion",
  [
    passport.authenticate("jwt", { session: false }),
    authorize(["superadmin", "moderator"]),
  ],
  addTextQuestion
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

router.get(
  "/showspecialexamall",
  [passport.authenticate("jwt", { session: false }), authorize()],
  showSpecialExamAll
);

router.get(
  "/showspecialexambycourse",
  [
    passport.authenticate("jwt", { session: false }),
    authorize(["superadmin", "moderator", "teacher"]),
  ],
  showSpecialExamByCourse
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
  "/getSpecialExamById",
  [
    passport.authenticate("jwt", { session: false }),
    authorize(["superadmin", "moderator", "student"]),
  ],
  getSpecialExamById
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

router.put(
  "/deactivatespecialexam",
  [passport.authenticate("jwt", { session: false }), authorize()],
  deactivateSpecialExam
);
//rule
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

router.post(
  "/addquestionwritten",
  [
    passport.authenticate("jwt", { session: false }),
    authorize(),
    upload1.fields([{ name: "iLink", maxCount: 8 }]),
  ],
  addQuestionWritten
);
router.get(
  "/getwrittenquestionbyexamsub",
  [
    passport.authenticate("jwt", { session: false }),
    authorize(["superadmin", "moderator", "student", "teacher"]),
  ],
  getWrittenQuestionByExamSub
);

//subject Choice
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

//exam check middlwear
router.get(
  "/examcheckmiddleware",
  [
    passport.authenticate("jwt", { session: false }),
    authorize(["student", "superadmin", "moderator"]),
  ],
  examCheckMiddleware
);
//MCQ
router.get(
  "/startexam",
  [
    passport.authenticate("jwt", { session: false }),
    authorize(["student", "superadmin", "moderator"]),
  ],
  assignQuestionMcq
);

router.get(
  "/getrunningdatamcq",
  [
    passport.authenticate("jwt", { session: false }),
    authorize(["student", "superadmin", "moderator"]),
  ],
  getRunningDataMcq
);

router.post(
  "/updateanswer",
  [
    passport.authenticate("jwt", { session: false }),
    authorize(["student", "superadmin", "moderator"]),
  ],
  updateAssignQuestion
);
router.post(
  "/submitanswermcq",
  [
    passport.authenticate("jwt", { session: false }),
    authorize(["student", "superadmin", "moderator"]),
  ],
  submitAnswerMcq
);
//written
router.get(
  "/assignquestionwritten",
  [
    passport.authenticate("jwt", { session: false }),
    authorize(["superadmin", "moderator", "student"]),
  ],
  assignQuestionWritten
);
router.get(
  "/runningwritten",
  [
    passport.authenticate("jwt", { session: false }),
    authorize(["superadmin", "moderator", "student"]),
  ],
  ruunningWritten
);
router.post(
  "/submitstudentscript",
  [
    passport.authenticate("jwt", { session: false }),
    authorize(["superadmin", "moderator", "student"]),
    upload.fields([{ name: "questionILink", maxCount: 15 }]),
  ],
  submitStudentScript
);

router.post(
  "/submitwritten",
  [
    passport.authenticate("jwt", { session: false }),
    authorize(["superadmin", "moderator", "student"]),
  ],
  submitWritten
);

//other
router.get(
  "/viewsollutionwritten",
  [
    passport.authenticate("jwt", { session: false }),
    authorize(["student", "superadmin", "moderator"]),
  ],
  viewSollutionWritten
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
  "/viewsollutionwrittenadmin",
  [
    passport.authenticate("jwt", { session: false }),
    authorize(["superadmin", "moderator"]),
  ],
  viewSollutionWrittenAdmin
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

router.post(
  "/assignstudenttoteacher",
  [
    passport.authenticate("jwt", { session: false }),
    authorize(["superadmin", "moderator"]),
  ],
  assignStudentToTeacher
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
  "/getstudentdata",
  [
    passport.authenticate("jwt", { session: false }),
    authorize(["superadmin", "moderator", "teacher"]),
  ],
  getStudentData
);
router.get(
  "/getstudentdataadmin",
  [
    passport.authenticate("jwt", { session: false }),
    authorize(["superadmin", "moderator", "teacher"]),
  ],
  getStudentDataAdmin
);
router.post(
  "/statusupdate",
  [
    passport.authenticate("jwt", { session: false }),
    authorize(["superadmin", "moderator", "teacher"]),
  ],
  statusUpdate
);
router.get(
  "/getrecheckstudentdata",
  [
    passport.authenticate("jwt", { session: false }),
    authorize(["superadmin", "moderator", "teacher"]),
  ],
  getRecheckStudentData
);
router.get(
  "/getrecheckstudentdataadmin",
  [
    passport.authenticate("jwt", { session: false }),
    authorize(["superadmin", "moderator", "teacher"]),
  ],
  getRecheckStudentDataAdmin
);

router.get(
  "/getwrittenscriptsingle",
  [
    passport.authenticate("jwt", { session: false }),
    authorize(["superadmin", "moderator", "teacher"]),
  ],
  getWrittenScriptSingle
);

router.post(
  "/checkscriptsingle",
  [
    passport.authenticate("jwt", { session: false }),
    authorize(["superadmin", "moderator", "teacher"]),
    //upload.fields([{ name: "questionILink", maxCount: 5 }]),
  ],
  checkScriptSingle
);

router.post(
  "/checkscriptsingleadmin",
  [
    passport.authenticate("jwt", { session: false }),
    authorize(["superadmin", "moderator", "teacher"]),
    //upload.fields([{ name: "questionILink", maxCount: 5 }]),
  ],
  checkScriptSingleAdmin
);
router.post(
  "/markscalculation",
  [
    passport.authenticate("jwt", { session: false }),
    authorize(["superadmin", "moderator", "teacher"]),
  ],
  marksCalculation
);
router.post(
  "/markscalculationadmin",
  [
    passport.authenticate("jwt", { session: false }),
    authorize(["superadmin", "moderator", "teacher"]),
  ],
  marksCalculationAdmin
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
router.get(
  "/getrank",
  [
    passport.authenticate("jwt", { session: false }),
    authorize(["superadmin", "moderator", "teacher"]),
  ],
  getRank
);
router.get(
  "/toprank",
  [
    passport.authenticate("jwt", { session: false }),
    authorize(["superadmin", "moderator", "teacher","student"]),
  ],
  topRank
);

router.get(
  "/getallrank",
  [
    passport.authenticate("jwt", { session: false }),
    authorize(["superadmin", "moderator", "teacher","student"]),
  ],
  getAllRank
);
router.get(
  "/getwrittenstudentsinglebyexam",
  [
    passport.authenticate("jwt", { session: false }),
    authorize(["superadmin", "moderator", "teacher"]),
  ],
  getWrittenStudentSingleByExam
);
router.get(
  "/getwrittenstudentsinglebyexamadmin",
  [
    passport.authenticate("jwt", { session: false }),
    authorize(["superadmin", "moderator", "teacher"]),
  ],
  getWrittenStudentSingleByExamAdmin
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
  "/specialgethistory",
  [
    passport.authenticate("jwt", { session: false }),
    authorize(["superadmin", "moderator", "teacher"]),
  ],
  specialGetHistory
);
router.get(
  "/specialgethistoryadmin",
  [
    passport.authenticate("jwt", { session: false }),
    authorize(["superadmin", "moderator", "teacher"]),
  ],
  specialGetHistoryAdmin
);
router.get(
  "/specialgethistoryadminfilter",
  [
    passport.authenticate("jwt", { session: false }),
    authorize(["superadmin", "moderator", "teacher"]),
  ],
  specialGetHistoryAdminFilter
);

router.post(
  "/updatewrittenminus",
  [passport.authenticate("jwt", { session: false }), authorize(["superadmin"])],
  updateWrittenMinus
);

router.get(
  "/specialgethistoryfilter",
  [
    passport.authenticate("jwt", { session: false }),
    authorize(["superadmin", "moderator"]),
  ],
  specialGetHistoryFilter
);
module.exports = router;
