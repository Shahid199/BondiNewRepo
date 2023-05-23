const express = require("express");
const {
  createCourse,
  getCourse,
  getAllCourse,
  getAllCourseAdmin,
  updateStatusCourse,
  updateSingle,
} = require("../controller/course-controller");
const router = express.Router();

router.post("/createcourse", createCourse);
router.get("/getcourse", getCourse);
router.get("/getallcourse", getAllCourse);
router.get("/getallcourseadmin", getAllCourseAdmin);
router.put("/deactivatecourse", updateStatusCourse);
router.put("/updatesingle", updateSingle);

module.exports = router;
