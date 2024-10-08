require("dotenv").config();
const express = require("express");
const cookies = require("cookie-parser");
const mongoose = require("mongoose");
const moment = require("moment");
const path = require("path");
var bodyParser = require("body-parser");
const app = express();
const session = require("express-session");

const passport = require("passport");
const cors = require("./utilities/cors");

require("./utilities/passport");
require("./utilities/passport_student");
require("./utilities/passport_student_free");
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
//app.use(passport.session());
//app.use(session({}));

cors(app);

app.use(bodyParser.json({ limit: "500mb" }));

app.use(
  bodyParser.urlencoded({
    extended: true,
    parameterLimit: 100000,
    limit: "500mb",
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(express.static(path.join(__dirname, "/public")));

// add routes from below
const courseRouter = require("./routes/course-routes");
const userRouter = require("./routes/user-routes");
const studentRouter = require("./routes/student-routes");
const courseVsStudentRouter = require("./routes/coursevsstudent-routes");
const subjectRouter = require("./routes/subject-routes");
const examRouter = require("./routes/exam-routes");
const homeRouter = require("./routes/home-routes");
const freeStudentRouter = require("./routes/freeStudent-routes");
const specialRouter = require("./routes/special-routes");
const teacherRouter = require("./routes/teacher-routes");
const bothRouter = require("./routes/both-routes");
const smsRouter = require("./routes/sms-routes");
const curriculumRouter = require("./routes/curriculum-routes");
const removeRouter = require("./routes/removefiles-routes");
const remarkRouter = require("./routes/remark-routes");
const mcqSpecialRouter = require("./routes/mcqspecial-routes");
const RetakeExamTrackerRouter = require("./routes/RetakeExamTracker-routes");
const scriptDetailsRouter = require("./routes/scriptDetails-routes");
const { assignQuestion } = require("./controller/student-controller");

//serve files from uploads folder
app.use("/uploads", express.static("uploads"));
app.use("/questions", express.static("questions"));
app.use("/profile-pictures", express.static("profile-pictures"));

app.use("/api/course", courseRouter);
app.use("/api/remark", remarkRouter);
app.use("/api/user", userRouter);
app.use("/api/curriculum", curriculumRouter);
app.use("/api/student", studentRouter);
app.use("/api/coursevsstudent", courseVsStudentRouter);
app.use("/api/subject", subjectRouter);
app.use("/api/exam", examRouter);
app.use("/api/mcqspecialexam", mcqSpecialRouter);
app.use("/api/retake", RetakeExamTrackerRouter);
app.use("/api/home", homeRouter);
app.use("/api/freestudent", freeStudentRouter);
app.use("/api/special", specialRouter);
app.use("/api/teacher", teacherRouter);
app.use("/api/scripts", scriptDetailsRouter);
app.use("/api/both", bothRouter);
app.use("/api/sms", smsRouter);
app.use("/api/remove", removeRouter);
mongoose
  .connect(
    //"mongodb+srv://admin:01823787730Shahid@cluster0.wpepadn.mongodb.net/Bondi?retryWrites=true&w=majority"
    //"mongodb+srv://admin:XSRFrPAsVzBWImXx@cluster0.mlygv5j.mongodb.net/Bondi?retryWrites=true&w=majority"
    //"mongodb+srv://admin:XSRFrPAsVzBWImXx@cluster1.vvfaman.mongodb.net/BondiPathshala?retryWrites=true&w=majority"
    process.env.MONGO_CONNECTION_STRING
  )
  .then(() => {
    app.listen(5011);
    // let studentIds = [
    //   { id: 1, name: "ww" },
    //   { id: 1, name: "wws" },
    //   { id: 2, name: "ww" },
    // ];
    // let curDate = moment(new Date()).add(3, "m");
    // console.log(curDate.valueOf());
    //console.log(moment(Date.now()).subtract(6, "h").format("YYYY-MM-DD hh:mm:ss A"));
    // 👇️ [{id: 1, name: 'Tom'}, {id: 2, name: 'Nick'}]
    console.log("connected");
  })
  .catch((err) => console.log(err));
