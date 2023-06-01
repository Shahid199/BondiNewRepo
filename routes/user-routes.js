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
  getUserById,
  createSuperAdmin,
} = require("../controller/user-controller");
const authorize = require("../utilities/authorizationMiddleware");
const router = express.Router();

router.get(
  "/validatetoken",
  [passport.authenticate("jwt", { session: false })],
  validateToken
);
//router.post("/createofficeuser", [passport.authenticate('jwt', { session: false }), authorize(['admin','superadmin'])], createOfficeUser);
router.post(
  "/createofficeuser",
  [passport.authenticate("jwt", { session: false }), authorize()],
  createOfficeUser
);
router.get(
  "/getuserbyrole",
  [passport.authenticate("jwt", { session: false }), authorize()],
  getUserByRole
);
router.get(
  "/getuserbyid",
  [passport.authenticate("jwt", { session: false }), authorize()],
  getUserById
);
router.get(
  "/getuserrole",
  [passport.authenticate("jwt", { session: false }), authorize()],
  getUserRole
);
router.put(
  "/updateofficeuser",
  [
    passport.authenticate("jwt", { session: false }),
    authorize(["superadmin", "moderator", "teacher"]),
  ],
  updateOfficeUser
);
router.put(
  "/deactivateuser",
  [passport.authenticate("jwt", { session: false }), authorize()],
  deactivateUser
);
router.put(
  "/updatepassword",
  [
    passport.authenticate("jwt", { session: false }),
    authorize(["superadmin", "teacher", "moderator"]),
  ],
  updatePassword
);
router.post("/login", loginSuperAdmin);

router.get("/create_super_admin", createSuperAdmin);

module.exports = router;
