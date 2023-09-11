const express = require("express");
const authorize = require("../utilities/authorizationMiddleware");
const passport = require("passport");
const { upload } = require("../utilities/multer");
const {
  createBothExam,
  updateBothExam,
  deactivateBothExam,
  getBothExamBySubject,
  getBothExamById,
} = require("../controller/both-controller");
const router = express.Router();
router.post(
  "/createbothexam",
  [
    passport.authenticate("jwt", { session: false }),
    authorize(),
    upload.single("iLink"),
  ],
  createBothExam
);
router.post(
  "/updatebothexam",
  [
    passport.authenticate("jwt", { session: false }),
    authorize(),
    upload.single("iLink"),
  ],
  updateBothExam
);
router.put(
  "/deactivatebothexam",
  [passport.authenticate("jwt", { session: false }), authorize()],
  deactivateBothExam
);

router.get(
    "/getbothexambysubject",
    [
      passport.authenticate("jwt", { session: false }),
      authorize(["student", "superadmin", "moderator"]),
    ],
    //authorize(["student"]),
    getBothExamBySubject
  );
  router.get(
    "/getbothexambyid",
    [
      passport.authenticate("jwt", { session: false }),
      authorize(["superadmin", "moderator", "student"]),
    ],
    getBothExamById
  );

module.exports = router;
