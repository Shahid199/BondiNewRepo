const express = require("express");
const {
  createCourse,
  getCourse,
  getAllCourse,
  getAllCourseAdmin,
  updateStatusCourse,
} = require("../controller/course-controller");
const router = express.Router();

router.post("/createcourse", createCourse);
router.get("/getcourse", getCourse);
router.get("/getallcourse", getAllCourse);
router.get("/getallcourseadmin", getAllCourseAdmin);
router.post("/updatestatuscourse", updateStatusCourse);

module.exports = router;
