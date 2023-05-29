const express = require("express");
const { upload } = require("../utilities/multer");
const passport = require("passport");
const router = express.Router();
const {
  addStudentToCourse,
  getStudentByCourse,
  getCourseByStudent,
  getCourseByReg,
} = require("../controller/coursevsstudent-controller");

router.post(
  "/addstudenttocourse",
  [
    passport.authenticate("jwt", { session: false }),
    upload.single("excelFile"),
  ],
  addStudentToCourse
);
router.get(
  "/getstudentbycourse",
  [passport.authenticate("jwt", { session: false })],
  getStudentByCourse
);
//student
router.get(
  "/getcoursebystudent",
  [passport.authenticate("jwt", { session: false })],
  getCourseByStudent
);
router.get(
  "/getcoursebyreg",
  [passport.authenticate("jwt", { session: false })],
  getCourseByReg
);

module.exports = router;
