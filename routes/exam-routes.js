const express = require("express");
const { upload } = require("../utilities/multer");
const passport = require("passport");
const {
  createExam,
  getAllExam,
  addQuestionMcq,
  addQuestionWritten,
  getExamBySubject,
  getPhoto,
} = require("../controller/exam-controller");
const router = express.Router();

router.post("/createexam", createExam);
router.get("/getallexam", getAllExam);
router.post(
  "/addquestionmcq",
  [
    //passport.authenticate("jwt", { session: false }),
    upload.fields([
      { name: "iLink", maxCount: 1 },
      { name: "explanationILink", maxCount: 1 },
    ]),
  ],
  addQuestionMcq
);

router.post(
  "/addquestionwritten",
  [
    //passport.authenticate("jwt", { session: false }),
    upload.fields([{ name: "questionILink", maxCount: 1 }]),
  ],
  addQuestionWritten
);
router.get("/getexambysubject", getExamBySubject);
router.get("/getPhoto", getPhoto);

module.exports = router;
