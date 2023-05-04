require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const courseRouter = require("./routes/course-routes");
const userRouter = require("./routes/user-routes");
const studentRouter = require("./routes/student-routes");
const courseVsStudentRouter = require("./routes/coursevsstudent-routes");
const subjectRouter = require("./routes/subject-routes");
const examRouter = require("./routes/exam-routes");
const app = express();
app.use(express.json());

// const rolePermissions = {
//   1:['*'],
//   2:['user/getuserrole','course/getcourse'],
//   3:['student/getprofile']
// }

// app.use("/api/*",function(req,res,next){
//   if(role == 1) next();
//   if(role ==2){

//   }
//   if(role == 3){

//   }
//   return res.status(403).json('Not allowed');

// });
app.use("/api/course", courseRouter);
app.use("/api/user", userRouter);
app.use("/api/student", studentRouter);
app.use("/api/coursevsstudent", courseVsStudentRouter);
app.use("/api/subject", subjectRouter);
app.use("/api/exam", examRouter);
mongoose
  .connect(
    "mongodb+srv://admin:01823787730Shahid@cluster0.wpepadn.mongodb.net/Bondi?retryWrites=true&w=majority"
  )
  .then(() => {
    app.listen(5010);
    console.log("connected to port 5010");
  })
  .catch((err) => console.log(err));
