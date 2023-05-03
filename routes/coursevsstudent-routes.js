const express = require("express");
const router = express.Router();
const {
  addStudentToCourse, getStudentByCourse, getCourseByStudent,
} = require("../controller/coursevsstudent-controller");

router.post("/addstudenttocourse", addStudentToCourse);
router.get("/getstudentbycourse", getStudentByCourse);
router.get("/getcoursebystudent",getCourseByStudent);

module.exports = router;
