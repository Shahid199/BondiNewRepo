const express = require("express");
const authorize = require("../utilities/authorizationMiddleware");
const passport = require("passport");
const {
  createCourse,
  getCourse,
  getAllCourse,
  getAllCourseAdmin,
  updateStatusCourse,
  updateSingle,
  deactivateCourse,
} = require("../controller/course-controller");
const router = express.Router();

router.post(
  "/createcourse",
  [passport.authenticate("jwt", { session: false }), authorize([])],
  createCourse
);
router.get(
  "/getcourse",
  [passport.authenticate("jwt", { session: false }), authorize([])],
  getCourse
);
router.get(
  "/getallcourse",
  [passport.authenticate("jwt", { session: false }), authorize(["superadmin"])],
  getAllCourse
);
router.get(
  "/getallcourseadmin",
  [passport.authenticate("jwt", { session: false }), authorize([])],
  getAllCourseAdmin
);
router.put(
  "/deactivatecourse",
  [passport.authenticate("jwt", { session: false }), authorize([])],
  deactivateCourse
);
router.put(
  "/updatesingle",
  [passport.authenticate("jwt", { session: false }), authorize([])],
  updateSingle
);
router.post(
  "/updateStatusCourse",
  [passport.authenticate("jwt", { session: false }), authorize([])],
  updateStatusCourse
);

module.exports = router;
