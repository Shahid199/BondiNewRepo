const express = require("express");
const { upload } = require("../utilities/multer");
const passport = require("passport");
const authorize = require("../utilities/authorizationMiddleware");
const {
  createSpecialExam,
  updateSpecialExam,
  showSpecialExamById,
  showSpecialExamByCourse,
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
  historyData,
  getOptionalSubects,
  getCombination,
  updateStudentExamInfo,
  getRank,
} = require("../controller/mcqSpecial-controller");
const { getAllRank } = require("../controller/special-controller");
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
  "/showspecialexambycourse",
  [
    passport.authenticate("jwt", { session: false }),
    authorize(["superadmin", "moderator", "teacher"]),
  ],
  showSpecialExamByCourse
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
    upload.fields([
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
    authorize(["superadmin", "moderator", "teacher"]),
  ],
  getAllRank
);

module.exports = router;
