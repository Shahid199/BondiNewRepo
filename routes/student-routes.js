const express = require("express");
const {
  addStudent,
  updateStudent,
  getStudentId,
} = require("../controller/student-controller");
const router = express.Router();

router.post("/addstudent", addStudent);
router.put("/updatestudent", updateStudent);
router.get("/getstudentid", getStudentId);

module.exports = router;
