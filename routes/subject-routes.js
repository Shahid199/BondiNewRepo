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
  getSubjectByCourseAdmin,
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
  [
    passport.authenticate("jwt", { session: false }),
    authorize(["superadmin", "moderator", "student"]),
  ],
  getSubjectByCourse
);

router.get(
  "/getsubjectbycourseadmin",
  [
    passport.authenticate("jwt", { session: false }),
    authorize(["superadmin", "moderator"]),
  ],
  getSubjectByCourseAdmin
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
