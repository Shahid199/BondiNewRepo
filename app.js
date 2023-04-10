const express = require("express");
const mongoose = require("mongoose");
const courseRouter = require("./routes/course-routes");

const app = express();
app.use(express.json());
app.use("/api", courseRouter);
mongoose
  .connect(
    "mongodb+srv://admin:01823787730Shahid@cluster0.wpepadn.mongodb.net/Bondi?retryWrites=true&w=majority"
  )
  .then(() => {
    app.listen(5010);
    console.log("connected to port 5010");
  })
  .catch((err) => console.log(err));
