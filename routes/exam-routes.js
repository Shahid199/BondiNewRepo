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
  [passport.authenticate("jwt", { session: false }), upload.single("iLink")],
  createExam
);
router.get(
  "/getallexam",
  [passport.authenticate("jwt", { session: false })],
  getAllExam
);
router.post(
  "/addquestionmcq",
  [
    passport.authenticate("jwt", { session: false }),
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
    upload.fields([{ name: "questionILink", maxCount: 1 }]),
  ],
  addQuestionWritten
);
router.get(
  "/getexambysubject",
  [passport.authenticate("jwt", { session: false })],
  getExamBySubject
);

router.get(
  "/getexambysub",
  [passport.authenticate("jwt", { session: false })],
  getExamBySub
);

router.post("/examruleset", [upload.single("ruleILink")], examRuleSet);
router.get(
  "/examruleget",
  [passport.authenticate("jwt", { session: false })],
  examRuleGet
);
router.get(
  "/examrulegetall",
  [passport.authenticate("jwt", { session: false })],
  examRuleGetAll
);
router.get(
  "/exambycoursesubject",
  [passport.authenticate("jwt", { session: false })],
  examByCourseSubject
);
router.get(
  "/getexambyid",
  [passport.authenticate("jwt", { session: false })],
  getExamById
);
router.get(
  "/questionbyexamid",
  [passport.authenticate("jwt", { session: false })],
  questionByExamId
);
router.put(
  "/updatequestionstatus",
  [passport.authenticate("jwt", { session: false })],
  updateQuestionStatus
);
router.put(
  "/updateexam",
  [passport.authenticate("jwt", { session: false })],
  updateExam
);
router.put(
  "/addquestionmcqbulk",
  [passport.authenticate("jwt", { session: false })],
  addQuestionMcqBulk
);
router.put(
  "/deactivateexam",
  [passport.authenticate("jwt", { session: false })],
  deactivateExam
);
module.exports = router;
