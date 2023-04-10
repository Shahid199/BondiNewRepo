const express = require("express");
const { createcourse, getcourse, getallcourse } = require("../controller/course-controller");
const router = express.Router();

router.post("/createcourse", createcourse);
router.get("/getcourse", getcourse);
router.get("/getallcourse", getallcourse);

module.exports = router;
