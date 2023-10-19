const express = require("express");
const passport = require("passport");
const authorize = require("../utilities/authorizationMiddleware");
const {
  tempCreate,
  tempShow,
  tempShowById,
  tempUpdate,
  tempStatusChange,
  smsSendSingle,
  smsSendMultiple,
} = require("../controller/sms-controller");
const router = express.Router();

router.get(
  "/templateshow",
  [
    passport.authenticate("jwt", { session: false }),
    authorize(["superadmin", "moderator"]),
  ],
  tempShow
);
router.get(
  "/templateshowbyid",
  [
    passport.authenticate("jwt", { session: false }),
    authorize(["superadmin", "moderator"]),
  ],
  tempShowById
);
router.post(
  "/templatecreate",
  [
    passport.authenticate("jwt", { session: false }),
    authorize(["superadmin", "moderator"]),
  ],
  tempCreate
);
router.put(
  "/templateupdate",
  [
    passport.authenticate("jwt", { session: false }),
    authorize(["superadmin", "moderator"]),
  ],
  tempUpdate
);
router.put(
  "/templatestatuschange",
  [
    passport.authenticate("jwt", { session: false }),
    authorize(["superadmin", "moderator"]),
  ],
  tempStatusChange
);
router.post(
  "/smssendsingle",
  [
    passport.authenticate("jwt", { session: false }),
    authorize(["superadmin", "moderator"]),
  ],
  smsSendSingle
);
router.post(
  "/smssendmultiple",
  [
    passport.authenticate("jwt", { session: false }),
    authorize(["superadmin", "moderator"]),
  ],
  smsSendMultiple
);

module.exports = router;
