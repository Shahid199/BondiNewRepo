const express = require("express");
const passport = require("passport");
const authorize = require("../utilities/authorizationMiddleware");
const {
  addCount,
 
} = require("../controller/RetakeExamTracker-controller");
const router = express.Router();
router.post(
    "/add",
    [
      passport.authenticate("jwt", { session: false }),
      authorize(["superadmin", "moderator", "student"]),
    ],
    addCount
);
  
module.exports = router;
