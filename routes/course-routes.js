const express = require("express");

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
  [passport.authenticate("jwt", { session: false })],
  createCourse
);
router.get(
  "/getcourse",
  [passport.authenticate("jwt", { session: false })],
  getCourse
);
router.get(
  "/getallcourse",
  [passport.authenticate("jwt", { session: false })],
  getAllCourse
);
router.get(
  "/getallcourseadmin",
  [passport.authenticate("jwt", { session: false })],
  getAllCourseAdmin
);
router.put(
  "/deactivatecourse",
  [passport.authenticate("jwt", { session: false })],
  deactivateCourse
);
router.put(
  "/updatesingle",
  [passport.authenticate("jwt", { session: false })],
  updateSingle
);
router.post(
  "/updateStatusCourse",
  [passport.authenticate("jwt", { session: false })],
  updateStatusCourse
);

module.exports = router;
