const express = require("express");
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
router.get("/getcourse/:id", getCourse);
router.get("/getallcourse", getAllCourse);
router.get("/getallcourseadmin", getAllCourseAdmin);
router.put("/deactivatecourse", deactivateCourse);
router.put("/updatesingle", updateSingle);
router.post("/updateStatusCourse", updateStatusCourse);

module.exports = router;
