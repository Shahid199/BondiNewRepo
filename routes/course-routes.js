const express = require("express");
const { createCourse, getCourse, getAllCourse } = require("../controller/course-controller");
const router = express.Router();

router.post("/createcourse", createCourse);
router.get("/getcourse", getCourse);
router.get("/getallcourse", getAllCourse);

module.exports = router;
