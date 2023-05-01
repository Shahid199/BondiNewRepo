const express = require("express");
const {
  createOfficeUser,
  createStudentUser,
  getUserByRole,
  getUserRole,
} = require("../controller/user-controller");
const router = express.Router();

router.post("/createofficeuser", createOfficeUser);
router.post("/createstudentuser", createStudentUser);
router.get("/getuserbyrole/:role", getUserByRole);
router.get("/getuserrole", getUserRole);

module.exports = router;
