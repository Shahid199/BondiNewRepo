const express = require("express");
const { upload } = require("../utilities/multer");
const router = express.Router();
const {
  addStudentToCourse,
  getStudentByCourse,
  getCourseByStudent,
  getCourseByReg,
} = require("../controller/coursevsstudent-controller");

router.post(
  "/addstudenttocourse",
  upload.single("excelFile"),
  addStudentToCourse
);
router.get("/getstudentbycourse", getStudentByCourse);
//student
router.get("/getcoursebystudent", getCourseByStudent);
router.get("/getcoursebyreg", getCourseByReg);

module.exports = router;
