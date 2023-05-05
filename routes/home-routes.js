const express = require("express");
const { getHomePage } = require("../controller/home-controller");
const router = express.Router();

router.get("/gethomepage", getHomePage);

module.exports = router;


