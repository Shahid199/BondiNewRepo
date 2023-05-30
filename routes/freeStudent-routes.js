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
    authorize(["freeStudent", "superadmin", "moderator"]),
  ],
  examCheckMiddleware
);
router.get(
  "/startexam",
  [
    passport.authenticate("jwt", { session: false }),
    authorize(["freeStudent", "superadmin", "moderator"]),
  ],
  assignQuestion
);
router.put(
  "/updatequestion",
  [
    passport.authenticate("jwt", { session: false }),
    authorize(["freeStudent", "superadmin", "moderator"]),
  ],
  updateAssignQuestion
);
router.get(
  "/getrunningdata",
  [
    passport.authenticate("jwt", { session: false }),
    authorize(["freeStudent", "superadmin", "moderator"]),
  ],
  getRunningData
);
router.post(
  "/submitanswer",
  [
    passport.authenticate("jwt", { session: false }),
    authorize(["student", "superadmin", "moderator"]),
  ],
  submitAnswer
);

//end:free student exam route

module.exports = router;
