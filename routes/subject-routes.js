const router = require("express").Router();
const passport = require("passport");
const {
  createSubject,
  getSubjectByCourse,
  updateSubject,
  getSubjectById,
  getAllSubject,
  subjectDeactivate,
} = require("../controller/subject-controller");
const { upload } = require("../utilities/multer");

router.post(
  "/createsubject",
  [passport.authenticate("jwt", { session: false }), upload.single("iLink")],
  createSubject
);
router.put(
  "/updatesubject",
  [passport.authenticate("jwt", { session: false })],
  updateSubject
);
router.get(
  "/getsubjectbyid",
  [passport.authenticate("jwt", { session: false })],
  getSubjectById
);
router.get(
  "/getsubjectbycourse",
  [passport.authenticate("jwt", { session: false })],
  getSubjectByCourse
);
router.get(
  "/getallsubject",
  [passport.authenticate("jwt", { session: false })],
  getAllSubject
);
router.put(
  "/deactivatesubject",
  [passport.authenticate("jwt", { session: false })],
  subjectDeactivate
);

module.exports = router;
