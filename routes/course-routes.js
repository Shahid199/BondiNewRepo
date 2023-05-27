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

router.post("/createcourse", createCourse);
router.get("/getcourse", getCourse);
router.get("/getallcourse", [passport.authenticate("jwt", { session: false }),],getAllCourse);
router.get("/getallcourseadmin", getAllCourseAdmin);
router.put("/deactivatecourse", deactivateCourse);
router.put("/updatesingle", updateSingle);
router.post("/updateStatusCourse", updateStatusCourse);

module.exports = router;
