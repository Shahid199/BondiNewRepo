const express = require("express");
const { upload } = require("../utilities/multer");
const passport = require("passport");
const {
  addFreeStudent,
  getAllFreeStudent,
  freeLoginStudent,
  examCheckMiddleware,
} = require("../controller/freeStudent-controller");

const router = express.Router();

router.post("/addfreestudent", addFreeStudent);
router.get("/getallfreestudent", getAllFreeStudent);

router.post("/login", freeLoginStudent);

router.get(
  "/examcheckmiddleware",
  [passport.authenticate("jwt", { session: false })],
  examCheckMiddleware
);

module.exports = router;
