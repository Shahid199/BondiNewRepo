const express = require("express");
const passport = require("passport");
const {
  createOfficeUser,
  getUserByRole,
  getUserRole,
  loginSuperAdmin,
  validateToken,
  updateOfficeUser,
  deactivateUser,
  updatePassword,
  // createSuperAdmin
} = require("../controller/user-controller");
const authorize = require("../utilities/authorizationMiddleware");
const router = express.Router();

router.get(
  "/validatetoken",
  [passport.authenticate("jwt", { session: false })],
  validateToken
);
//router.post("/createofficeuser", [passport.authenticate('jwt', { session: false }), authorize(['admin','superadmin'])], createOfficeUser);
router.post("/createofficeuser", createOfficeUser);
router.get(
  "/getuserbyrole",
  [
    // passport.authenticate("jwt", { session: false }),
    // authorize(["superadmin", "admin"]),
  ],
  getUserByRole
);
router.get(
  "/getuserrole",
  [passport.authenticate("jwt", { session: false }), authorize(["admin"])],
  getUserRole
);
router.put(
  "/updateofficeuser",
  //[passport.authenticate("jwt", { session: false })],
  updateOfficeUser
);
router.put(
  "/deactivateuser",
 // [passport.authenticate("jwt", { session: false })],
  deactivateUser
);
router.put(
  "/updatepassword",
  //[passport.authenticate("jwt", { session: false })],
  updatePassword
);
router.post("/login", loginSuperAdmin);

// router.get('/create_super_admin',createSuperAdmin);

module.exports = router;
