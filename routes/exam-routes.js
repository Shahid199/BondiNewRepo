const express = require("express");
const {
  createExam,
  getAllExam,
  addQuestionMcq,
} = require("../controller/exam-controller");
const router = express.Router();

router.post("/createexam", createExam);
router.get("/getallexam", getAllExam);
router.post("/addquestionmcq", addQuestionMcq);

module.exports = router;
