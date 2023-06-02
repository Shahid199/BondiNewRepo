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
} = require("../controller/freeStudent-controller");

const router = express.Router();

router.get("/getfreeexamid", getFreeExamId);

router.post(
  "/addfreestudent",
  [passport.authenticate("jwt", { session: false }), authorize()],
  addFreeStudent
);

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

//end:free student exam route

module.exports = router;
