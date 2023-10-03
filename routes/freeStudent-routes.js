const express = require("express");
const { upload } = require("../utilities/multer");
const passport = require("passport");
const authorize = require("../utilities/authorizationMiddleware");
const {
  addFreeStudent,
  getAllFreeStudent,
  freeLoginStudent,
  freeStudentViewSollutionAdmin,
  freeStudentHistoryDataAdmin,
  freeStudentMissedExamAdmin,
  getFreeExamId,
  getFreeStudenInfoById,
  getFreeStudenInfoByMobile,
  examCheckMiddlewareFree,
  assignQuestionFree,
  updateAssignQuestionFree,
  getRunningDataFree,
  submitAnswerFree,
  updateStudentExamInfoFree,
  updateRankFree,
  getRankFree,
  getExamById,
  getFreeExamAll,
  freeGetHistoryByExamId,
  getAllRankFree,
  updateNullData,
  getFreeExamNew,
  freeGetHistoryByExamIdFilterM,
  freeGetHistoryByExamIdFilterN,
} = require("../controller/freeStudent-controller");
const { freeExamStatus } = require("../controller/exam-controller");

const router = express.Router();

router.get(
  "/getexambyid",
  [
    passport.authenticate("jwt", { session: false }),
    authorize(["superadmin", "moderator", "freeStudent"]),
  ],
  getExamById
);

router.get("/getfreeexamid", getFreeExamId);

router.post("/addfreestudent", addFreeStudent);

router.get(
  "/getfreestudentbyid",
  [passport.authenticate("jwt", { session: false }), passport.authorize()],
  getFreeStudenInfoById
);

router.get(
  "/getfreestudentmobile",
  [passport.authenticate("jwt", { session: false }), passport.authorize()],
  getFreeStudenInfoByMobile
);

router.get(
  "/getallfreestudent",
  [passport.authenticate("jwt", { session: false }), passport.authorize()],
  getAllFreeStudent
);

router.post("/login", freeLoginStudent);

//start:free student exam route
router.get(
  "/examcheckmiddleware",
  [
    passport.authenticate("jwt", { session: false }),
    authorize(["superadmin", "moderator", "freeStudent"]),
  ],
  examCheckMiddlewareFree
);
router.get(
  "/startexam",
  [
    passport.authenticate("jwt", { session: false }),
    authorize(["superadmin", "moderator", "freeStudent"]),
  ],
  assignQuestionFree
);
router.put(
  "/updatequestion",
  [
    passport.authenticate("jwt", { session: false }),
    authorize(["superadmin", "moderator", "freeStudent"]),
  ],
  updateAssignQuestionFree
);
router.get(
  "/getrunningdata",
  [
    passport.authenticate("jwt", { session: false }),
    authorize(["superadmin", "moderator", "freeStudent"]),
  ],
  getRunningDataFree
);
router.post(
  "/submitanswer",
  [
    passport.authenticate("jwt", { session: false }),
    authorize(["superadmin", "moderator", "freeStudent"]),
  ],
  submitAnswerFree
);
router.put(
  "/updatestudentexaminfofree",
  [
    passport.authenticate("jwt", { session: false }),
    authorize(["superadmin", "moderator", "freeStudent"]),
  ],
  updateStudentExamInfoFree
);
router.post(
  "/updaterankfree",
  [
    passport.authenticate("jwt", { session: false }),
    authorize(["superadmin", "moderator", "freeStudent"]),
  ],
  updateRankFree
);
router.get("/getrankfree", getRankFree);
//Free student data view api Route.
router.get(
  "/freestudentviewsollutionadmin",
  [
    passport.authenticate("jwt", { session: false }),
    authorize(["superadmin", "moderator", "freeStudent"]),
  ],
  freeStudentViewSollutionAdmin
);

router.get(
  "/freestudenthistorydataadmin",
  [
    passport.authenticate("jwt", { session: false }),
    authorize(["superadmin", "moderator", "freeStudent"]),
  ],
  freeStudentHistoryDataAdmin
);

router.get(
  "/freestudentmissedexamadmin",
  [
    passport.authenticate("jwt", { session: false }),
    authorize(["superadmin", "moderator", "freeStudent"]),
  ],
  freeStudentMissedExamAdmin
);

router.get("/getfreeexamall", getFreeExamAll);
router.get(
  "/freeexamstatus",
  [
    passport.authenticate("jwt", { session: false }),
    authorize(["superadmin", "moderator", "freeStudent"]),
  ],
  freeExamStatus
);

router.get(
  "/freeGetHistoryByExamId",
  [
    passport.authenticate("jwt", { session: false }),
    authorize(["superadmin", "moderator"]),
  ],
  freeGetHistoryByExamId
);
router.get(
  "/freeGetHistoryByExamIdfilterm",
  [
    passport.authenticate("jwt", { session: false }),
    authorize(["superadmin", "moderator"]),
  ],
  freeGetHistoryByExamIdFilterM
);
router.get(
  "/freeGetHistoryByExamIdfiltern",
  [
    passport.authenticate("jwt", { session: false }),
    authorize(["superadmin", "moderator"]),
  ],
  freeGetHistoryByExamIdFilterN
);
router.get(
  "/getallrankfree",
  [
    passport.authenticate("jwt", { session: false }),
    authorize(["superadmin", "moderator"]),
  ],
  getAllRankFree
);

router.get("/getfreeexamnew", getFreeExamNew);

// router.get(
//   "/updatenulldata",
//   [
//     passport.authenticate("jwt", { session: false }),
//     authorize(["superadmin", "moderator"]),
//   ],
//   updateNullData
// );

//end:free student exam route

module.exports = router;
