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
  deactivateStudent,
  getAllCourseSearch,
} = require("../controller/course-controller");
const router = express.Router();

router.post(
  "/createcourse",
  [passport.authenticate("jwt", { session: false }), authorize()],
  createCourse
);
router.get(
  "/getcourse",
  [passport.authenticate("jwt", { session: false }), authorize()],
  getCourse
);
router.get(
  "/getallcourse",
  [passport.authenticate("jwt", { session: false }), authorize()],
  getAllCourse
);
router.get(
  "/getallcourseadmin",
  [
    passport.authenticate("jwt", { session: false }),
    authorize(["superadmin", "moderator", "teacher"]),
  ],
  getAllCourseAdmin
);
router.put(
  "/deactivatecourse",
  [passport.authenticate("jwt", { session: false }), authorize()],
  deactivateCourse
);
router.put(
  "/deactivatestudent",
  [passport.authenticate("jwt", { session: false }), authorize()],
  deactivateStudent
);

router.put(
  "/updatesingle",
  [passport.authenticate("jwt", { session: false }), authorize()],
  updateSingle
);
router.post(
  "/updateStatusCourse",
  [passport.authenticate("jwt", { session: false }), authorize()],
  updateStatusCourse
);
router.get(
  "/getallcoursesearch",
  [passport.authenticate("jwt", { session: false }), authorize()],
  getAllCourseSearch
);

module.exports = router;
