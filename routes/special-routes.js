const express = require("express");
const { upload } = require("../utilities/multer");
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
} = require("../controller/special-controller");
const router = express.Router();

router.post(
  "/createspecialexam",
  [
    passport.authenticate("jwt", { session: false }),
    authorize(),
    upload.single("iLink"),
  ],
  createSpecialExam
);
router.post(
  "/updatespecialexam",
  [passport.authenticate("jwt", { session: false }), authorize()],
  updateSpecialExam
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
  "/showspecialexamall",
  [passport.authenticate("jwt", { session: false }), authorize()],
  showSpecialExamAll
);

router.get(
  "/showspecialexambycourse",
  [passport.authenticate("jwt", { session: false }), authorize()],
  showSpecialExamByCourse
);

router.get(
  "/showspecialexambyid",
  [passport.authenticate("jwt", { session: false }), authorize()],
  showSpecialExamById
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

module.exports = router;
