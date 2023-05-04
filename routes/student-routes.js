const express = require("express");
const {
  addStudent,
  updateStudent,
  getStudentId,
  getAllStudent,
} = require("../controller/student-controller");
const router = express.Router();

router.post("/addstudent", addStudent);
router.put("/updatestudent", updateStudent);
router.get("/getstudentid", getStudentId);
router.get("/getallstudent", getAllStudent);

module.exports = router;
