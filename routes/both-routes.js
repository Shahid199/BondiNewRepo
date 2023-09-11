const express = require("express");
const authorize = require("../utilities/authorizationMiddleware");
const passport = require("passport");
const {
  createBothExam,
  updateBothExam,
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
router.post(
  "/updatebothexam",
  [
    passport.authenticate("jwt", { session: false }),
    authorize(),
    upload.single("iLink"),
  ],
  updateBothExam
);

module.exports = router;
