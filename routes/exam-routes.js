const express = require("express");
const { upload } = require("../utilities/multer");
const passport = require("passport");
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
} = require("../controller/exam-controller");
const router = express.Router();

router.post(
  "/createexam",
  [
    passport.authenticate("jwt", { session: false }),
    authorize([]),
    upload.single("iLink"),
  ],
  createExam
);
router.get(
  "/getallexam",
  [passport.authenticate("jwt", { session: false }), authorize([])],
  getAllExam
);
router.post(
  "/addquestionmcq",
  [
    passport.authenticate("jwt", { session: false }),
    authorize([]),
    upload.fields([
      { name: "iLink", maxCount: 1 },
      { name: "explanationILink", maxCount: 1 },
    ]),
  ],
  addQuestionMcq
);

router.post(
  "/addquestionwritten",
  [
    passport.authenticate("jwt", { session: false }),
    authorize([]),
    upload.fields([{ name: "questionILink", maxCount: 1 }]),
  ],
  addQuestionWritten
);
router.get(
  "/getexambysubject",
  authorize(["student", "freeStudent", "admin", "moderator", "superadmin"]),
  [passport.authenticate("jwt", { session: false })],
  getExamBySubject
);

router.get(
  "/getexambysub",
  [passport.authenticate("jwt", { session: false }), authorize([])],
  getExamBySub
);

router.post(
  "/examruleset",
  [
    passport.authenticate("jwt", { session: false }),
    authorize([]),
    upload.single("ruleILink"),
  ],
  examRuleSet
);
router.get(
  "/examruleget",
  [
    passport.authenticate("jwt", { session: false }),
    authorize(["superadmin", "moderator", "student", "freeStudent"]),
  ],
  examRuleGet
);
router.get(
  "/examrulegetall",
  [passport.authenticate("jwt", { session: false }), authorize([])],
  examRuleGetAll
);
router.get(
  "/exambycoursesubject",
  [passport.authenticate("jwt", { session: false }), authorize([])],
  examByCourseSubject
);
router.get(
  "/getexambyid",
  [
    passport.authenticate("jwt", { session: false }),
    authorize(["superadmin", "moderator", "student", "freeStudent"]),
  ],
  getExamById
);
router.get(
  "/questionbyexamid",
  [
    passport.authenticate("jwt", { session: false }),
    authorize(["superadmin", "moderator", "student", "freeStudent"]),
  ],
  questionByExamId
);
router.put(
  "/updatequestionstatus",
  [passport.authenticate("jwt", { session: false }), passport.authorize([])],
  updateQuestionStatus
);
router.put(
  "/updateexam",
  [passport.authenticate("jwt", { session: false }), passport.authorize([])],
  updateExam
);
router.put(
  "/addquestionmcqbulk",
  [passport.authenticate("jwt", { session: false }), passport.authorize([])],
  addQuestionMcqBulk
);
router.put(
  "/deactivateexam",
  [passport.authenticate("jwt", { session: false }), passport.authorize([])],
  deactivateExam
);
module.exports = router;
