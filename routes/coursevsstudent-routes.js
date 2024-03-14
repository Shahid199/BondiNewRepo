const express = require("express");
const { upload } = require("../utilities/multer");
const passport = require("passport");
const authorize = require("../utilities/authorizationMiddleware");
const router = express.Router();
const {
  addStudentToCourse,
  getStudentByCourse,
  getCourseByStudent,
  getCourseByReg,
  changeStatus,
} = require("../controller/coursevsstudent-controller");

router.post(
  "/addstudenttocourse",
  [
    passport.authenticate("jwt", { session: false }),
    authorize(),
    upload.single("excelFile"),
  ],
  addStudentToCourse
);
router.get(
  "/getstudentbycourse",
  [passport.authenticate("jwt", { session: false }), authorize()],
  getStudentByCourse
);
//student
router.get(
  "/getcoursebystudent",
  [passport.authenticate("jwt", { session: false }), authorize()],
  getCourseByStudent
);
router.get("/getcoursebyreg", getCourseByReg);

router.post(
  "/changestatus",
  [passport.authenticate("jwt", { session: false }), authorize()],
  changeStatus
);
module.exports = router;
