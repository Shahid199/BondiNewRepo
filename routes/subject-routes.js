const router = require("express").Router();
const passport = require("passport");
const authorize = require("../utilities/authorizationMiddleware");
const {
  createSubject,
  getSubjectByCourse,
  updateSubject,
  getSubjectById,
  getAllSubject,
  subjectDeactivate,
} = require("../controller/subject-controller");
const { upload } = require("../utilities/multer");
const { getHistoryByExamId } = require("../controller/student-controller");

router.post(
  "/createsubject",
  [
    passport.authenticate("jwt", { session: false }),
    authorize(),
    upload.single("iLink"),
  ],
  createSubject
);
router.put(
  "/updatesubject",
  [passport.authenticate("jwt", { session: false }), authorize()],
  updateSubject
);
router.get(
  "/getsubjectbyid",
  [passport.authenticate("jwt", { session: false }), authorize()],
  getSubjectById
);
router.get(
  "/getsubjectbycourse",
  [passport.authenticate("jwt", { session: false }), authorize()],
  getSubjectByCourse
);

router.get(
  "/getallsubject",
  [passport.authenticate("jwt", { session: false }), authorize()],
  getAllSubject
);
router.put(
  "/deactivatesubject",
  [passport.authenticate("jwt", { session: false }), authorize()],
  subjectDeactivate
);

module.exports = router;
