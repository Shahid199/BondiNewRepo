const express = require("express");
const {
  createSubject,
  getSubjectByCourse,
} = require("../controller/subject-controller");
const router = express.Router();

router.post("/createsubject", createSubject);
router.get("/getsubjectbycourse", getSubjectByCourse);

module.exports = router;
