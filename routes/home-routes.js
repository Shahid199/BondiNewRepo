const express = require("express");
const passport = require('passport');
const { getHomePage } = require("../controller/home-controller");
const router = express.Router();

router.get("/gethomepage", [passport.authenticate('jwt', { session: false })] , getHomePage);

module.exports = router;


