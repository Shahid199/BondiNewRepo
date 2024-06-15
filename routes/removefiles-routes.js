const express = require("express");
const { upload } = require("../utilities/multer");
const passport = require("passport");
const authorize = require("../utilities/authorizationMiddleware");
const {
  removeAnswerScript,
  removeOneTime,
  downloadImage,
  getExam,
} = require("../controller/removefile-controller");
const router = express.Router();

 router.post("/removebyexam",
 [
   passport.authenticate("jwt", { session: false }),
   authorize(["superadmin"]),
 ], removeAnswerScript);
 //router.get("/removeonetime", removeOneTime);
// router.get("/download", downloadImage);
 router.get("/getexam",
 [
   passport.authenticate("jwt", { session: false }),
   authorize(["superadmin"]),
 ], getExam);

module.exports = router;
