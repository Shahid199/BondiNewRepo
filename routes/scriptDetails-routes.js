const express = require("express");
const passport = require("passport");
const authorize = require("../utilities/authorizationMiddleware");
const router = express.Router();
const {
    addCount,
    getData,
    getAllData,
    changeStatus
   
  } = require("../controller/scriptDetails-controller");
  router.post(
    "/changeStatus",
    [
      passport.authenticate("jwt", { session: false }),
      authorize(["superadmin"]),
    ],
    changeStatus
);

router.post(
    "/add",
    [
      passport.authenticate("jwt", { session: false }),
      authorize(["superadmin", "moderator", "teacher"]),
    ],
    addCount
);

router.get(
    "/get",
    [
      passport.authenticate("jwt", { session: false }),
      authorize(["superadmin", "teacher"]),
    ],
    getData
);
router.get(
    "/getAll",
    [
      passport.authenticate("jwt", { session: false }),
      authorize(["superadmin"]),
    ],
    getAllData
);
module.exports = router;
