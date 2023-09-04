const express = require("express");
const { upload } = require("../utilities/multer");
const passport = require("passport");
const authorize = require("../utilities/authorizationMiddleware");
const router = express.Router();
const {
  getStudentData,
  checkScriptSingle,
  checkStatusUpdate,
  getCheckStatus,
  getWrittenScriptSingle,
  marksCalculation,
  updateRank,
  getRank,
  getAllRank,
} = require("../controller/teacher-controller");

router.get(
  "/getstudentdata",
  [
    passport.authenticate("jwt", { session: false }),
    authorize(["superadmin", "moderator", "teacher"]),
  ],
  getStudentData
);
router.post(
  "/checkscriptsingle",
  [
    passport.authenticate("jwt", { session: false }),
    authorize(["superadmin", "moderator", "teacher"]),
    //upload.fields([{ name: "questionILink", maxCount: 5 }]),
  ],
  checkScriptSingle
);
router.post(
  "/checkstatusupdate",
  [
    passport.authenticate("jwt", { session: false }),
    authorize(["superadmin", "moderator", "teacher"]),
  ],
  checkStatusUpdate
);
router.get(
  "/getcheckstatus",
  [
    passport.authenticate("jwt", { session: false }),
    authorize(["superadmin", "moderator", "teacher"]),
  ],
  getCheckStatus
);
router.get(
  "/getwrittenscriptsingle",
  // [
  //   passport.authenticate("jwt", { session: false }),
  //   authorize(["superadmin", "moderator", "teacher"]),
  // ],
  getWrittenScriptSingle
);
router.post(
  "/markscalculation",
  [
    passport.authenticate("jwt", { session: false }),
    authorize(["superadmin", "moderator", "teacher"]),
  ],
  marksCalculation
);
router.post(
  "/updaterank",
  [
    passport.authenticate("jwt", { session: false }),
    authorize(["superadmin", "moderator", "teacher"]),
  ],
  updateRank
);
router.get(
  "/getrank",
  [
    passport.authenticate("jwt", { session: false }),
    authorize(["superadmin", "moderator", "teacher"]),
  ],
  getRank
);

router.get(
  "/getallrank",
  [
    passport.authenticate("jwt", { session: false }),
    authorize(["superadmin", "moderator", "teacher"]),
  ],
  getAllRank
);
module.exports = router;
