const express = require("express");
const passport = require('passport');
const {
  createOfficeUser,
  createStudentUser,
  getUserByRole,
  getUserRole,
  loginSuperAdmin
  // createSuperAdmin
} = require("../controller/user-controller");
const authorize = require('../utilities/authorizationMiddleware');
const router = express.Router();

//router.post("/createofficeuser", [passport.authenticate('jwt', { session: false }), authorize(['admin','superadmin'])], createOfficeUser);
router.post("/createofficeuser", createOfficeUser);
router.post("/createstudentuser", [passport.authenticate('jwt', { session: false }), authorize(['superadmin', 'admin'])], createStudentUser);
router.get("/getuserbyrole/:role", [passport.authenticate('jwt', { session: false }), authorize(['superadmin', 'admin'])], getUserByRole);
router.get("/getuserrole", [passport.authenticate('jwt', { session: false }), authorize(['admin'])], getUserRole);
router.post("/login", loginSuperAdmin);

// router.get('/create_super_admin',createSuperAdmin);

module.exports = router;
