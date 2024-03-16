const express = require("express");
const { upload } = require("../utilities/multer");
const passport = require("passport");
const authorize = require("../utilities/authorizationMiddleware");
const {
  removeAnswerScript,
  removeOneTime,
  downloadImage,
} = require("../controller/removefile-controller");
const router = express.Router();

router.get("/removebyexam", removeAnswerScript);
router.get("/removeonetime", removeOneTime);
router.get("/download", downloadImage);

module.exports = router;
