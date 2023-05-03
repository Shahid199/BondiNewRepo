const express = require("express");
const {
  createOfficeUser,
  createStudentUser,
  getUserByRole,
  getUserRole,
  loginSuperAdmin
  // createSuperAdmin
} = require("../controller/user-controller");
const router = express.Router();

router.post("/createofficeuser", createOfficeUser);
router.post("/createstudentuser", createStudentUser);
router.get("/getuserbyrole/:role", getUserByRole);
router.get("/getuserrole", getUserRole);
router.post("/login",loginSuperAdmin);

// router.get('/create_super_admin',createSuperAdmin);

module.exports = router;
