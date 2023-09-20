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
  bothMarksCalculation,
  bothUpdateRank,
  bothCheckScriptSingle,
  bothGetCheckStatus,
  bothGetAllRank,
  bothGetWrittenScriptSingle,
  getRecheckStudentData,
  bothGetStudentData,
  bothGetRecheckStudentData,
} = require("../controller/teacher-controller");

router.get(
  "/getstudentdata",
  [
    passport.authenticate("jwt", { session: false }),
    authorize(["superadmin", "moderator", "teacher"]),
  ],
  getStudentData
);
router.get(
  "/getrecheckstudentdata",
  [
    passport.authenticate("jwt", { session: false }),
    authorize(["superadmin", "moderator", "teacher"]),
  ],
  getRecheckStudentData
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
  [
    passport.authenticate("jwt", { session: false }),
    authorize(["superadmin", "moderator", "teacher"]),
  ],
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

router.post(
  "/bothmarkscalculation",
  [
    passport.authenticate("jwt", { session: false }),
    authorize(["superadmin", "moderator", "teacher"]),
  ],
  bothMarksCalculation
);
router.post(
  "/bothupdaterank",
  [
    passport.authenticate("jwt", { session: false }),
    authorize(["superadmin", "moderator"]),
  ],
  bothUpdateRank
);
router.post(
  "/bothcheckscriptsingle",
  [
    passport.authenticate("jwt", { session: false }),
    authorize(["superadmin", "moderator", "teacher"]),
    //upload.fields([{ name: "questionILink", maxCount: 5 }]),
  ],
  bothCheckScriptSingle
);
router.get(
  "/bothgetallrank",
  [
    passport.authenticate("jwt", { session: false }),
    authorize(["superadmin", "moderator", "teacher"]),
  ],
  bothGetAllRank
);
router.get(
  "/bothgetcheckstatus",
  [
    passport.authenticate("jwt", { session: false }),
    authorize(["superadmin", "moderator", "teacher"]),
  ],
  bothGetCheckStatus
);
router.get(
  "/bothgetwrittenscriptsingle",
  [
    passport.authenticate("jwt", { session: false }),
    authorize(["superadmin", "moderator", "teacher"]),
  ],
  bothGetWrittenScriptSingle
);
router.get(
  "/bothgetstudentdata",
  [
    passport.authenticate("jwt", { session: false }),
    authorize(["superadmin", "moderator", "teacher"]),
  ],
  bothGetStudentData
);
router.get(
  "/bothgetrecheckstudentdata",
  [
    passport.authenticate("jwt", { session: false }),
    authorize(["superadmin", "moderator", "teacher"]),
  ],
  bothGetRecheckStudentData
);
module.exports = router;
