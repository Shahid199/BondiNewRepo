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
  [passport.authenticate("jwt", { session: false }), authorize()],
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

router.post(
  "/addquestionwritten",
  [
    passport.authenticate("jwt", { session: false }),
    authorize(),
    upload.fields([{ name: "questionILink", maxCount: 1 }]),
  ],
  addQuestionWritten
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
  [passport.authenticate("jwt", { session: false }), authorize()],
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
  authorize(),
  examRuleGet
);
router.get(
  "/examrulegetall",
  [passport.authenticate("jwt", { session: false }), authorize()],
  examRuleGetAll
);
router.get(
  "/exambycoursesubject",
  [passport.authenticate("jwt", { session: false }), authorize()],
  examByCourseSubject
);
router.get(
  "/getexambyid",
  [passport.authenticate("jwt", { session: false }), authorize()],
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
module.exports = router;
