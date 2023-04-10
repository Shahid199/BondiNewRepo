const express = require("express");
const { createCourse, getCourse, getAllCourse } = require("../controller/course-controller");
const courseRouter = express.Router();

courseRouter.post("/createcourse", createCourse);
courseRouter.get("/getcourse", getCourse);
courseRouter.get("/getallcourse", getAllCourse);

module.exports = courseRouter;
