const express = require("express");
const { upload } = require("../utilities/multer");
const passport = require("passport");
const authorize = require("../utilities/authorizationMiddleware");
const {
  addFreeStudent,
  getAllFreeStudent,
  freeLoginStudent,
  examCheckMiddleware,
  getRunningData,
  updateAssignQuestion,
  assignQuestion,
  submitAnswer,
  freeStudentViewSollutionAdmin,
  freeStudentHistoryDataAdmin,
  freeStudentMissedExamAdmin,
} = require("../controller/freeStudent-controller");

const router = express.Router();

router.post(
  "/addfreestudent",
  [passport.authenticate("jwt", { session: false }), authorize()],
  addFreeStudent
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
  examCheckMiddleware
);
router.get(
  "/startexam",
  [
    passport.authenticate("jwt", { session: false }),
    authorize(["superadmin", "moderator", "freeStudent"]),
  ],
  assignQuestion
);
router.put(
  "/updatequestion",
  [
    passport.authenticate("jwt", { session: false }),
    authorize(["superadmin", "moderator", "freeStudent"]),
  ],
  updateAssignQuestion
);
router.get(
  "/getrunningdata",
  [
    passport.authenticate("jwt", { session: false }),
    authorize(["superadmin", "moderator", "freeStudent"]),
  ],
  getRunningData
);
router.post(
  "/submitanswer",
  [
    passport.authenticate("jwt", { session: false }),
    authorize(["superadmin", "moderator", "freeStudent"]),
  ],
  submitAnswer
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
