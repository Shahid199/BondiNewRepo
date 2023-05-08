const express = require("express");
const { upload } = require("../utilities/multer");
const {
  loginStudent,
  addStudent,
  updateStudent,
  getStudentId,
  getAllStudent,
} = require("../controller/student-controller");
const router = express.Router();
//student frontend routes
router.post("/login", loginStudent);
//student admin panel routes
router.post("/addstudent", upload.single("excelFile"), addStudent);
router.put("/updatestudent", updateStudent);
router.get("/getstudentid", getStudentId);
router.get("/getallstudent", getAllStudent);

module.exports = router;
