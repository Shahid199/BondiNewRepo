const express = require("express");
const {
  createcourse
} = require("../controller/course-controller");
const router = express.Router();

router.post("/createcourse", createcourse);

module.exports = router;
