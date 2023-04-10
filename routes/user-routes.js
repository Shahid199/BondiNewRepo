const express = require("express");
const { createOfficeUser, createStudentUser, getUserByRole } = require("../controller/user-controller");
const router = express.Router();

router.post("/createofficeuser", createOfficeUser);
router.post("/createstudentuser", createStudentUser);
router.get("/getuserbyrole", getUserByRole);

module.exports = router;
