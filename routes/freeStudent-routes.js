const express = require("express");
const { upload } = require("../utilities/multer");
const passport = require("passport");
const {
  addFreeStudent,
  getAllFreeStudent,
  freeLoginStudent,
  examCheckMiddleware,
  getRunningData,
  updateAssignQuestion,
  assignQuestion,
} = require("../controller/freeStudent-controller");

const router = express.Router();

router.post("/addfreestudent", addFreeStudent);
router.get("/getallfreestudent", getAllFreeStudent);

router.post("/login", freeLoginStudent);


//start:free student exam route
router.get(
  "/examcheckmiddleware",
  [passport.authenticate("jwt", { session: false })],
  examCheckMiddleware
);
router.get(
  "/startexam",
  [passport.authenticate("jwt", { session: false })],
  assignQuestion
);
router.put(
  "/updatequestion",
  [passport.authenticate("jwt", { session: false })],
  updateAssignQuestion
);
router.get(
  "/getrunningdata",
  [passport.authenticate("jwt", { session: false })],
  getRunningData
);
//end:free student exam route

module.exports = router;
