const router = require("express").Router();
const passport = require("passport");
const {
  createSubject,
  getSubjectByCourse,
  getSubjectByCourseAdmin,
} = require("../controller/subject-controller");
const { upload } = require("../utilities/multer");

router.post(
  "/createsubject",
  [passport.authenticate("jwt", { session: false }), upload.single("iLink")],
  createSubject
);
router.get("/getsubjectbycourse", getSubjectByCourse);
router.get("/getsubjectbycourseadmin", getSubjectByCourseAdmin);

module.exports = router;
