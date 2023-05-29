const express = require("express");
const passport = require("passport");
const { getHomePage } = require("../controller/home-controller");
const authorize = require("../utilities/authorizationMiddleware");
const router = express.Router();

router.get(
  "/gethomepage",
  [passport.authenticate("jwt", { session: false })],
  authorize(["superadmin", "moderator", "student"]),
  getHomePage
);

module.exports = router;
