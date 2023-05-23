const express = require("express");
const { upload } = require("../utilities/multer");
const passport = require("passport");
const {
  addFreeStudent,
  getAllFreeStudent,
} = require("../controller/freeStudent-controller");

const router = express.Router();

router.post("/addfreestudent", addFreeStudent);
router.get("/getallfreestudent", getAllFreeStudent);

module.exports = router;
