const express = require("express");
const { createExam } = require("../controller/exam-controller");
const router = express.Router();

router.post("/createexam", createExam);

module.exports = router;