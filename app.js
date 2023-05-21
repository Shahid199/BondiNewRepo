require("dotenv").config();
const express = require("express");
const cookies = require("cookie-parser");
const mongoose = require("mongoose");

const app = express();

const passport = require('passport');
const cors = require('./utilities/cors');

require('./utilities/passport');
require('./utilities/passport_student');
// config cookie-parser
app.use(cookies());
//global middleware which will look for tokens in browser cookie
app.use((req, res, next) => {
  let authHeader = req.cookies.token;
  if (authHeader) {
    req.headers.authorization = `Bearer ${authHeader}`;
  }
  next();
});
app.use(passport.initialize());

cors(app);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// add routes from below
const courseRouter = require("./routes/course-routes");
const userRouter = require("./routes/user-routes");
const studentRouter = require("./routes/student-routes");
const courseVsStudentRouter = require("./routes/coursevsstudent-routes");
const subjectRouter = require("./routes/subject-routes");
const examRouter = require("./routes/exam-routes");
const homeRouter = require("./routes/home-routes");

//serve files from uploads folder
app.use('/uploads',express.static('uploads'));

app.use("/api/course", courseRouter);
app.use("/api/user", userRouter);
app.use("/api/student", studentRouter);
app.use("/api/coursevsstudent", courseVsStudentRouter);
app.use("/api/subject", subjectRouter);
app.use("/api/exam", examRouter);
app.use("/api/home", homeRouter);

mongoose
  .connect(
    "mongodb+srv://admin:01823787730Shahid@cluster0.wpepadn.mongodb.net/Bondi?retryWrites=true&w=majority"
  )
  .then(() => {
    app.listen(5011);
    console.log("connected to port 5011");
  })
  .catch((err) => console.log(err));
