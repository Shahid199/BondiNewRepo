const express = require("express");
const authorize = require("../utilities/authorizationMiddleware");
const passport = require("passport");
const { upload } = require("../utilities/multer");
const {
  createBothExam,
  updateBothExam,
  deactivateBothExam,
  getBothExamBySubject,
  getBothExamById,
  bothExamRuleSet,
  bothExamRuleGet,
  bothExamRuleGetAll,
  bothAddQuestionMcqBulk,
  bothAddQuestionMcq,
  bothGetMcqQuestionByExamId,
} = require("../controller/both-controller");
const router = express.Router();
router.post(
  "/createbothexam",
  [
    passport.authenticate("jwt", { session: false }),
    authorize(),
    upload.single("iLink"),
  ],
  createBothExam
);
router.put(
  "/updatebothexam",
  [
    passport.authenticate("jwt", { session: false }),
    authorize(),
    upload.single("iLink"),
  ],
  updateBothExam
);
router.put(
  "/deactivatebothexam",
  [passport.authenticate("jwt", { session: false }), authorize()],
  deactivateBothExam
);

router.get(
  "/getbothexambysubject",
  [
    passport.authenticate("jwt", { session: false }),
    authorize(["student", "superadmin", "moderator"]),
  ],
  //authorize(["student"]),
  getBothExamBySubject
);
router.get(
  "/getbothexambyid",
  [
    passport.authenticate("jwt", { session: false }),
    authorize(["superadmin", "moderator", "student"]),
  ],
  getBothExamById
);
//exam rule
router.post(
  "/bothexamruleset",
  [
    passport.authenticate("jwt", { session: false }),
    authorize(),
    upload.single("ruleILink"),
  ],
  bothExamRuleSet
);
router.get(
  "/bothexamruleget",
  [passport.authenticate("jwt", { session: false })],
  authorize(["superadmin", "moderator", "student", "freeStudent"]),
  bothExamRuleGet
);
router.get(
  "/bothexamrulegetall",
  [
    passport.authenticate("jwt", { session: false }),
    authorize(["superadmin", "moderator"]),
  ],
  bothExamRuleGetAll
);
router.put(
  "/bothaddquestionmcqbulk",
  [passport.authenticate("jwt", { session: false }), authorize()],
  bothAddQuestionMcqBulk
);
router.post(
  "/bothaddquestionmcq",
  [
    passport.authenticate("jwt", { session: false }),
    authorize(),
    upload.fields([
      { name: "iLink", maxCount: 1 },
      { name: "explanationILink", maxCount: 1 },
    ]),
  ],
  bothAddQuestionMcq
);
router.get(
  "/bothgetmcqquestionbyexamid",
  [
    passport.authenticate("jwt", { session: false }),
    authorize(["superadmin", "moderator"]),
  ],
  bothGetMcqQuestionByExamId
);
module.exports = router;
