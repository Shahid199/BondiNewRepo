require('dotenv').config()
const express = require("express");
const mongoose = require("mongoose");

const app = express();

const passport = require('passport');
const cors = require('./utilities/cors');

require('./utilities/passport');
app.use(passport.initialize());

cors(app);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));


const courseRouter = require("./routes/course-routes");
const userRouter = require("./routes/user-routes");
const studentRouter = require("./routes/student-routes");
const courseVsStudentRouter=require("./routes/coursevsstudent-routes");

app.use("/api/course", courseRouter);
app.use("/api/user", userRouter);
app.use("/api/student",studentRouter);
app.use("/api/coursevsstudent",courseVsStudentRouter);
mongoose
  .connect(
    "mongodb+srv://admin:01823787730Shahid@cluster0.wpepadn.mongodb.net/Bondi?retryWrites=true&w=majority"
  )
  .then(() => {
    app.listen(5010);
    console.log("connected to port 5010");
  })
  .catch((err) => console.log(err));
