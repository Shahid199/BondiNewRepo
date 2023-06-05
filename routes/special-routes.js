const express = require("express");
const { upload } = require("../utilities/multer");
const passport = require("passport");
const authorize = require("../utilities/authorizationMiddleware");
const {
  createSpecialExam,
  updateSpecialExam,
  showSpecialExamAll,
  showSpecialExamById,
} = require("../controller/special-controller");
const router = express.Router();

router.post(
  "/createspecialexam",
  [passport.authenticate("jwt", { session: false }), authorize()],
  createSpecialExam
);

router.put(
  "/updatespecialexam",
  [passport.authenticate("jwt", { session: false }), authorize()],
  updateSpecialExam
);

router.get(
  "/showspecialexamall",
  [passport.authenticate("jwt", { session: false }), authorize()],
  showSpecialExamAll
);

router.get(
  "/showspecialexambyid",
  [passport.authenticate("jwt", { session: false }), authorize()],
  showSpecialExamById
);

module.exports = router;
