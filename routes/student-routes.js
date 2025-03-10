const express = require("express");
const { upload } = require("../utilities/multer");
const { uploadDp } = require("../utilities/multer_dp");
const passport = require("passport");
const mongoose = require("mongoose");
const authorize = require("../utilities/authorizationMiddleware");
const moment = require("moment");
const {
  loginStudent,
  validateToken,
  addStudent,
  updateStudent,
  getStudentId,
  getAllStudent,
  assignQuestion,
  updateAssignQuestion,
  submitAnswer,
  getRunningData,
  viewSollution,
  historyData,
  missedExam,
  retakeExam,
  retakeSubmit,
  examCheckMiddleware,
  viewSollutionAdmin,
  missedExamAdmin,
  historyDataAdmin,
  studentSubmittedExamDetail,
  studentSubmittedExamDetailAdmin,
  getHistoryByExamId,
  getStudenInfoById,
  getStudentByCourseReg,
  updateRank,
  updateStudentExamInfo,
  getRank,
  getStudentRegSearch,
  getStudentNameSearch,
  getStudentMobileSearch,
  getRankStudent,
  getAllRank,
  examTimeCheck,
  assignWrittenQuestion,
  submitStudentScript,
  submitWritten,
  writtenExamCheckMiddleware,
  updateStudentWrittenExamInfo,
  runningWritten,
  getWrittenStudentSingleByExam,
  getWrittenStudentAllByExam,
  getWrittenScript,
  getHistoryByWrittenId,
  getCheckWrittenStudentAllByExam,
  historyDataWritten,
  missedExamWritten,
  getWrittenQuestion,
  viewSollutionWritten,
  examDetailWritten,
  bothExamCheckMiddleware,
  bothAssignQuestion,
  bothAssignQuestionMcq,
  bothGetRunningDataMcq,
  bothUpdateAssignQuestionMcq,
  BothSubmitAnswerMcq,
  bothAssignWrittenQuestionWritten,
  bothRunningWritten,
  bothSubmitStudentScript,
  bothSubmitWritten,
  bothUpdateStudentExamInfo,
  bothAssignQuestionWritten,
  bothViewSollutionWritten,
  bothViewSollutionMcq,
  bothHistoryData,
  bothExamDetail,
  bothUpdateRank,
  bothGetWrittenStudentSingleByExam,
  bothGetWrittenScript,
  bothGetWrittenStudentAllByExam,
  bothGetCheckWrittenStudentAllByExam,
  bothGetHistory,
  bothViewSollutionWrittenAdmin,
  bothViewSollutionMcqAdmin,
  viewSollutionWrittenAdmin,
  getHistoryByExamIdFilter,
  getHistoryByWrittenIdFilter,
  bothGetHistoryFilter,
  bothGetAllRank,
  bothGetExamDataForTest,
  checkPassword,
  changePassword,
  editStudent,
  newLoginStudent,
  retakeBothExam
} = require("../controller/student-controller");
const StudentMarksRank = require("../model/StudentMarksRank");
const StudentExamVsQuestionsMcq = require("../model/StudentExamVsQuestionsMcq");
const router = express.Router();
//student frontend routes
router.post("/login", loginStudent);
router.post("/newlogin", newLoginStudent);
// router.get(
//   "/validate-login",
//   [passport.authenticate("jwt", { session: false })],
//   { successRedirect: validateToken }
// );

router.get(
  "/validate-login",
  [passport.authenticate("jwt", { session: false })],
  validateToken
);
//need query parameter eid(examid).

router.get(
  "/getstudentinfobyid",
  [
    passport.authenticate("jwt", { session: false }),
    authorize(["superadmin", "moderator","student"]),
  ],
  getStudenInfoById
);
router.get(
  "/checkpassword",
  [
    passport.authenticate("jwt", { session: false }),
    authorize(["superadmin", "moderator","student"]),
  ],
  checkPassword
);
router.post(
  "/changepassword",
  [
    passport.authenticate("jwt", { session: false }),
    authorize(["superadmin", "moderator","student"]),
  ],
  changePassword
);
// router.get(
//   "/updaterank",
//   [
//     passport.authenticate("jwt", { session: false }),
//     authorize(["superadmin", "moderator"]),
//   ],
//   updateRank
// );
router.post(
  "/updaterank",
  [
    passport.authenticate("jwt", { session: false }),
    authorize(["superadmin", "moderator"]),
  ],
  updateRank
);
router.post(
  "/bothupdaterank",
  [
    passport.authenticate("jwt", { session: false }),
    authorize(["superadmin", "moderator"]),
  ],
  bothUpdateRank
);
router.get(
  "/getrank",
  [
    passport.authenticate("jwt", { session: false }),
    authorize(["superadmin", "moderator", "student"]),
  ],
  getRank
);

router.get(
  "/getstudentbycoursereg",
  [
    passport.authenticate("jwt", { session: false }),
    authorize(["superadmin", "moderator"]),
  ],
  getStudentByCourseReg
);

router.get(
  "/examcheckmiddleware",
  [
    passport.authenticate("jwt", { session: false }),
    authorize(["student", "superadmin", "moderator"]),
  ],
  examCheckMiddleware
);
router.get(
  "/startexam",
  [
    passport.authenticate("jwt", { session: false }),
    authorize(["student", "superadmin", "moderator"]),
  ],
  assignQuestion
);

//need query parameter eid,question sl,answeredoption.
router.post(
  "/updateanswer",
  [
    passport.authenticate("jwt", { session: false }),
    authorize(["student", "superadmin", "moderator"]),
  ],
  updateAssignQuestion
);
router.post(
  "/submitanswer",
  [
    passport.authenticate("jwt", { session: false }),
    authorize(["student", "superadmin", "moderator"]),
  ],
  submitAnswer
);
router.get(
  "/gethistorybyexamid",
  [
    passport.authenticate("jwt", { session: false }),
    authorize(["superadmin", "moderator", "teacher"]),
  ],
  getHistoryByExamId
);
router.get(
  "/gethistorybyexamidfilter",
  [
    passport.authenticate("jwt", { session: false }),
    authorize(["superadmin", "moderator", "teacher"]),
  ],
  getHistoryByExamIdFilter
);
router.get(
  "/gethistorybywrittenid",
  [
    passport.authenticate("jwt", { session: false }),
    authorize(["superadmin", "moderator", "teacher"]),
  ],
  getHistoryByWrittenId
);
router.get(
  "/gethistorybywrittenidfilter",
  [
    passport.authenticate("jwt", { session: false }),
    authorize(["superadmin", "moderator", "teacher"]),
  ],
  getHistoryByWrittenIdFilter
);
router.get(
  "/getrunningdata",
  [
    passport.authenticate("jwt", { session: false }),
    authorize(["student", "superadmin", "moderator"]),
  ],
  getRunningData
);

//student admin panel routes
router.post(
  "/addstudent",
  [
    passport.authenticate("jwt", { session: false }),
    authorize(["moderator", "superadmin"]),
    upload.single("excelFile"),
  ],
  addStudent
);

router.post(
  "/editstudent",
  [
    passport.authenticate("jwt", { session: false }),
    authorize(["moderator", "student"]),
    uploadDp.single("dp"),
  ],
  editStudent
);
router.put(
  "/updatestudent",
  [
    passport.authenticate("jwt", { session: false }),
    authorize(["student", "superadmin", "moderator"]),
  ],
  updateStudent
);
router.get(
  "/getstudentid",
  [passport.authenticate("jwt", { session: false }), authorize()],
  getStudentId
);
router.get(
  "/getallstudent",
  [passport.authenticate("jwt", { session: false }), authorize()],
  getAllStudent
);

router.get(
  "/viewSollution",
  [
    passport.authenticate("jwt", { session: false }),
    authorize(["student", "superadmin", "moderator"]),
  ],
  viewSollution
);
router.get(
  "/history",
  [
    passport.authenticate("jwt", { session: false }),
    authorize(["student", "superadmin", "moderator"]),
  ],
  historyData
);
router.get(
  "/missedexam",
  [
    passport.authenticate("jwt", { session: false }),
    authorize(["student", "superadmin", "moderator"]),
  ],
  missedExam
);
router.get(
  "/retake",
  [
    passport.authenticate("jwt", { session: false }),
    authorize(["student", "superadmin", "moderator"]),
  ],
  retakeExam
);
router.get(
  "/retakeboth",
  [
    passport.authenticate("jwt", { session: false }),
    authorize(["student", "superadmin", "moderator"]),
  ],
  retakeBothExam
);
router.post(
  "/retakesubmit",
  [
    passport.authenticate("jwt", { session: false }),
    authorize(["student", "superadmin", "moderator"]),
  ],
  retakeSubmit
);

router.get(
  "/viewsollutionadmin",
  [
    passport.authenticate("jwt", { session: false }),
    authorize(["superadmin", "moderator"]),
  ],
  viewSollutionAdmin
);
router.get(
  "/missedexamadmin",
  [
    passport.authenticate("jwt", { session: false }),
    authorize(["superadmin", "moderator"]),
  ],
  missedExamAdmin
);
router.get(
  "/historydataadmin",
  [
    passport.authenticate("jwt", { session: false }),
    authorize(["superadmin", "moderator"]),
  ],
  historyDataAdmin
);
router.get(
  "/studentSubmittedExamDetail",
  [
    passport.authenticate("jwt", { session: false }),
    authorize(["superadmin", "moderator", "student"]),
  ],
  studentSubmittedExamDetail
);

router.get(
  "/studentSubmittedExamDetailadmin",
  [
    passport.authenticate("jwt", { session: false }),
    authorize(["superadmin", "moderator", "student"]),
  ],
  studentSubmittedExamDetailAdmin
);
router.put(
  "/updatestudentexaminfo",
  [
    passport.authenticate("jwt", { session: false }),
    authorize(["superadmin", "moderator"]),
  ],
  updateStudentExamInfo
);

router.get(
  "/getstudentregsearch",
  [passport.authenticate("jwt", { session: false }), authorize()],
  getStudentRegSearch
);

router.get(
  "/getstudentnamesearch",
  [passport.authenticate("jwt", { session: false }), authorize()],
  getStudentNameSearch
);

router.get(
  "/getstudentmobilesearch",
  //[passport.authenticate("jwt", { session: false }), authorize()],
  getStudentMobileSearch
);

router.get(
  "/getrankstudent",
  [
    passport.authenticate("jwt", { session: false }),
    authorize(["superadmin", "moderator", "student"]),
  ],
  getRankStudent
);
router.get(
  "/getallrank",
  [
    passport.authenticate("jwt", { session: false }),
    authorize(["superadmin", "moderator","student"]),
  ],
  getAllRank
);
router.get(
  "/bothgetallrank",
  [
    passport.authenticate("jwt", { session: false }),
    authorize(["superadmin", "moderator","student"]),
  ],
  bothGetAllRank
);
router.get(
  "/examtimecheck",
  [
    passport.authenticate("jwt", { session: false }),
    authorize(["superadmin", "moderator", "student"]),
  ],
  examTimeCheck
);

//written
router.get(
  "/writtenexamcheckmiddleware",
  [
    passport.authenticate("jwt", { session: false }),
    authorize(["superadmin", "moderator", "student"]),
  ],
  writtenExamCheckMiddleware
);
router.get(
  "/assignquestionwritten",
  [
    passport.authenticate("jwt", { session: false }),
    authorize(["superadmin", "moderator", "student"]),
  ],
  assignWrittenQuestion
);
router.get(
  "/runningwritten",
  [
    passport.authenticate("jwt", { session: false }),
    authorize(["superadmin", "moderator", "student"]),
  ],
  runningWritten
);

router.post(
  "/submitstudentscript",
  [
    passport.authenticate("jwt", { session: false }),
    authorize(["superadmin", "moderator", "student"]),
    upload.fields([{ name: "questionILink", maxCount: 8 }]),
  ],
  submitStudentScript
);
router.post(
  "/submitwritten",
  [
    passport.authenticate("jwt", { session: false }),
    authorize(["superadmin", "moderator", "student"]),
  ],
  submitWritten
);
router.post(
  "/updatedstudentwritteninfo",
  [
    passport.authenticate("jwt", { session: false }),
    authorize(["superadmin", "moderator"]),
  ],
  updateStudentWrittenExamInfo
);
router.get(
  "/getwrittenstudentallbyexam",
  [
    passport.authenticate("jwt", { session: false }),
    authorize(["superadmin", "moderator", "teacher"]),
  ],
  getWrittenStudentAllByExam
);
router.get(
  "/getcheckwrittenstudentallbyexam",
  [
    passport.authenticate("jwt", { session: false }),
    authorize(["superadmin", "moderator"]),
  ],
  getCheckWrittenStudentAllByExam
);

router.get(
  "/getwrittenstudentsinglebyexam",
  [
    passport.authenticate("jwt", { session: false }),
    authorize(["superadmin", "moderator", "teacher"]),
  ],
  getWrittenStudentSingleByExam
);

router.get(
  "/getwrittenscript",
  [
    passport.authenticate("jwt", { session: false }),
    authorize(["superadmin", "moderator", "student"]),
  ],
  getWrittenScript
);
//momin written script
router.get(
  "/historydatawritten",
  [
    passport.authenticate("jwt", { session: false }),
    authorize(["superadmin", "moderator", "student"]),
  ],
  historyDataWritten
);

router.get(
  "/missedexamwritten",
  [
    passport.authenticate("jwt", { session: false }),
    authorize(["student", "superadmin", "moderator"]),
  ],
  missedExamWritten
);
router.get(
  "/getwrittenquestion",
  [
    passport.authenticate("jwt", { session: false }),
    authorize(["student", "superadmin", "moderator"]),
  ],
  getWrittenQuestion
);
router.get(
  "/viewSollutionwritten",
  [
    passport.authenticate("jwt", { session: false }),
    authorize(["student", "superadmin", "moderator"]),
  ],
  viewSollutionWritten
);
router.get(
  "/viewSollutionwrittenadmin",
  [
    passport.authenticate("jwt", { session: false }),
    authorize(["superadmin", "moderator"]),
  ],
  viewSollutionWrittenAdmin
);
router.get(
  "/examdetailwritten",
  [
    passport.authenticate("jwt", { session: false }),
    authorize(["student", "superadmin", "moderator"]),
  ],
  examDetailWritten
);

//both
router.get(
  "/bothexamcheckmiddleware",
  [
    passport.authenticate("jwt", { session: false }),
    authorize(["student", "superadmin", "moderator"]),
  ],
  bothExamCheckMiddleware
);
router.get(
  "/bothstartexam",
  [
    passport.authenticate("jwt", { session: false }),
    authorize(["student", "superadmin", "moderator"]),
  ],
  bothAssignQuestionMcq
);
router.get(
  "/bothgetrunningdatamcq",
  [
    passport.authenticate("jwt", { session: false }),
    authorize(["student", "superadmin", "moderator"]),
  ],
  bothGetRunningDataMcq
);
router.post(
  "/bothupdateanswermcq",
  [
    passport.authenticate("jwt", { session: false }),
    authorize(["student", "superadmin", "moderator"]),
  ],
  bothUpdateAssignQuestionMcq
);

router.post(
  "/bothsubmitanswermcq",
  [
    passport.authenticate("jwt", { session: false }),
    authorize(["student", "superadmin", "moderator"]),
  ],
  BothSubmitAnswerMcq
);

router.get(
  "/bothassignquestionwritten",
  [
    passport.authenticate("jwt", { session: false }),
    authorize(["superadmin", "moderator", "student"]),
  ],
  bothAssignQuestionWritten
);
router.get(
  "/bothrunningwritten",
  [
    passport.authenticate("jwt", { session: false }),
    authorize(["superadmin", "moderator", "student"]),
  ],
  bothRunningWritten
);

router.post(
  "/bothsubmitstudentscript",
  [
    passport.authenticate("jwt", { session: false }),
    authorize(["superadmin", "moderator", "student"]),
    upload.fields([{ name: "questionILink", maxCount: 15 }]),
  ],
  bothSubmitStudentScript
);
router.post(
  "/bothsubmitwritten",
  [
    passport.authenticate("jwt", { session: false }),
    authorize(["superadmin", "moderator", "student"]),
  ],
  bothSubmitWritten
);
router.post(
  "/bothupdatestudentexaminfo",
  [
    passport.authenticate("jwt", { session: false }),
    authorize(["superadmin", "moderator"]),
  ],
  bothUpdateStudentExamInfo
);
router.get(
  "/bothviewsollutionwritten",
  [
    passport.authenticate("jwt", { session: false }),
    authorize(["student", "superadmin", "moderator"]),
  ],
  bothViewSollutionWritten
);
router.get(
  "/bothviewsollutionmcq",
  [
    passport.authenticate("jwt", { session: false }),
    authorize(["student", "superadmin", "moderator"]),
  ],
  bothViewSollutionMcq
);
router.get(
  "/bothviewsollutionwrittenadmin",
  [
    passport.authenticate("jwt", { session: false }),
    authorize(["superadmin", "moderator"]),
  ],
  bothViewSollutionWrittenAdmin
);
router.get(
  "/bothviewsollutionmcqadmin",
  [
    passport.authenticate("jwt", { session: false }),
    authorize(["superadmin", "moderator"]),
  ],
  bothViewSollutionMcqAdmin
);

router.get(
  "/bothhistorydata",
  [
    passport.authenticate("jwt", { session: false }),
    authorize(["student", "superadmin", "moderator"]),
  ],
  bothHistoryData
);

router.get(
  "/bothexamdetail",
  [
    passport.authenticate("jwt", { session: false }),
    authorize(["student", "superadmin", "moderator"]),
  ],
  bothExamDetail
);

router.get(
  "/bothgetwrittenstudentsinglebyexam",
  [
    passport.authenticate("jwt", { session: false }),
    authorize(["superadmin", "moderator", "teacher"]),
  ],
  bothGetWrittenStudentSingleByExam
);
router.get(
  "/bothgetwrittenscript",
  [
    passport.authenticate("jwt", { session: false }),
    authorize(["superadmin", "moderator", "student"]),
  ],
  bothGetWrittenScript
);

router.get(
  "/bothgetwrittenstudentallbyexam",
  [
    passport.authenticate("jwt", { session: false }),
    authorize(["superadmin", "moderator", "teacher"]),
  ],
  bothGetWrittenStudentAllByExam
);
router.get(
  "/bothgetcheckwrittenstudentallbyexam",
  [
    passport.authenticate("jwt", { session: false }),
    authorize(["superadmin", "moderator"]),
  ],
  bothGetCheckWrittenStudentAllByExam
);
router.get(
  "/bothgethistory",
  [
    passport.authenticate("jwt", { session: false }),
    authorize(["superadmin", "moderator", "teacher"]),
  ],
  bothGetHistory
);
router.get(
  "/bothgethistoryfilter",
  [
    passport.authenticate("jwt", { session: false }),
    authorize(["superadmin", "moderator", "teacher"]),
  ],
  bothGetHistoryFilter
);
router.get("/bothgetexamdatafortest", bothGetExamDataForTest);
router.post(
  "/testsubmit",
  [
    passport.authenticate("jwt", { session: false }),
    authorize(["superadmin", "moderator", "teacher", "student"]),
  ],
  async (req, res, next) => {
    const eId = req.query.eId;
    const sId = req.user.studentId;
    const examEndTime = moment(new Date());
    let eId1, sId1;
    sId1 = new mongoose.Types.ObjectId(sId);
    eId1 = new mongoose.Types.ObjectId(eId);
    //exam status Check:start
    let studentCheck = null;
    let examData = null;
    let time = null;
    try {
      studentCheck = await StudentMarksRank.findOne({
        $and: [{ examId: eId1 }, { studentId: sId1 }],
      });
      examData = await StudentExamVsQuestionsMcq.findOne({
        $and: [{ examId: eId1 }, { studentId: sId1 }],
      }).populate("mcqQuestionId examId");
    } catch (err) {
      console.log(err);
      return res.status(500).json("1.Something went wrong.");
    }
    let curDate = moment(new Date());
    let flagSt = false;
    if (moment(studentCheck.endTime).isAfter(curDate)) {
      flagSt = true;
    }
    console.log(studentCheck.endTime);
    console.log(curDate);
    return res.status(200).json(flagSt);
  }
);

//multiple student reset option with examId
// router.get("/updatemarksmcq", [
//   passport.authenticate("jwt", { session: false }),
//   authorize(["superadmin"]),
//   async (req, res, next) => {
//     let examId = new mongoose.Types.ObjectId("65aa365bfe7ce9df83a910a7");
//     let data = [];
//     try {
//       data = await StudentExamVsQuestionsMcq.find({
//         $and: [
//           { examId: examId },
//           { totalObtainedMarks: -6.25 },
//           { totalWrongAnswer: 0 },
//         ],
//       }).populate("studentId");
//     } catch (err) {
//       return res.status(500).json(err);
//     }
//     console.log("data:", data);
//     console.log("count:", data.length);
//     let data1 = [];
//     let count = 0;
//     for (let i = 0; i < data.length; i++) {
//       let obData = {};
//       obData["name"] = data[i].studentId.name;
//       obData["mobileNo"] = data[i].studentId.mobileNo;
//       obData["regNo"] = data[i].studentId.regNo;
//       obData["totalWrongMarks"] = data[i].totalWrongMarks;
//       obData["studentId"] = data[i].studentId._id;
//       let sId = new mongoose.Types.ObjectId(data[i].studentId._id);
//       let type = "0";
//       if (type == "0") {
//         try {
//           delObj = await StudentExamVsQuestionsMcq.deleteOne({
//             $and: [{ studentId: sId }, { examId: examId }],
//           });
//           delObj1 = await StudentMarksRank.deleteOne({
//             $and: [{ studentId: sId }, { examId: examId }],
//           });
//           count++;
//         } catch (err) {
//           return res.status(500).json("Problem MCQ delete.");
//         }
//       }
//       data1.push(obData);
//     }
//     data1.push(data.length);
//     return res.status(200).json({ data1, count });
//   },
// ]);

// router.get("/updatemarksmcq191", [
//   passport.authenticate("jwt", { session: false }),
//   authorize(["superadmin"]),
//   async (req, res, next) => {
//     let examId = new mongoose.Types.ObjectId("65a64ad1f6822bdeb4585e20");
//     let examData = null;
//     let data = [];
//     try {
//       data = await StudentExamVsQuestionsMcq.find({
//         $and: [
//           { examId: examId },
//           { totalObtainedMarks: -6.25 },
//           { totalWrongAnswer: 0 },
//         ],
//       }).populate("studentId");
//     } catch (err) {
//       return res.status(500).json(err);
//     }
//     // console.log("data:", data);
//     // console.log("count:", data.length);
//     let data1 = [];
//     let studentCheck = null;
//     for (let i = 0; i < data.length; i++) {
//       try {
//         studentCheck = await StudentMarksRank.findOne({
//           $and: [{ examId: examId }, { studentId: data[i].studentId._id }],
//         });
//         examData = await StudentExamVsQuestionsMcq.findOne({
//           $and: [{ examId: examId }, { studentId: data[i].studentId._id }],
//         }).populate("mcqQuestionId examId studentId");
//       } catch (err) {
//         console.log(err);
//         return res.statu(500).json("DB error");
//       }
//       let findId = String(studentCheck._id);
//       let id = String(examData._id);
//       let correctMarks = examData.examId.marksPerMcq;
//       let negativeMarks = examData.examId.negativeMarks;
//       let negativeMarksValue = (correctMarks * negativeMarks) / 100;
//       let examDataMcq = examData.mcqQuestionId;
//       let notAnswered = 0;
//       let totalCorrectAnswer = 0;
//       let totalWrongAnswer = 0;
//       let totalObtainedMarks = 0;
//       let totalCorrectMarks = 0;
//       let totalWrongMarks = 0;
//       let answeredOptions = examData.answeredOption;

//       for (let i = 0; i < examDataMcq.length; i++) {
//         if (answeredOptions[i] == "-1") {
//           notAnswered = notAnswered + 1;
//         } else if (answeredOptions[i] == examDataMcq[i].correctOption) {
//           totalCorrectAnswer = totalCorrectAnswer + 1;
//         } else totalWrongAnswer = totalWrongAnswer + 1;
//       }
//       totalCorrectMarks = totalCorrectAnswer * correctMarks;
//       totalWrongMarks = totalWrongAnswer * negativeMarksValue;
//       totalObtainedMarks = totalCorrectMarks - totalWrongMarks;

//       let update1;
//       let result = null,
//         saveStudentExamEnd = null;
//       let update;
//       update1 = {
//         totalCorrectAnswer: totalCorrectAnswer,
//         totalWrongAnswer: totalWrongAnswer,
//         totalNotAnswered: notAnswered,
//         totalCorrectMarks: totalCorrectMarks,
//         totalWrongMarks: totalWrongMarks,
//         totalObtainedMarks: totalObtainedMarks,
//       };
//       update = {
//         totalObtainedMarks: totalObtainedMarks,
//         rank: -1,
//       };
//       try {
//         saveStudentExamEnd = await StudentMarksRank.findByIdAndUpdate(
//           findId,
//           update
//         );
//         result = await StudentExamVsQuestionsMcq.findByIdAndUpdate(id, update1);
//       } catch (err) {
//         return res.status(500).json("3.Something went wrong.");
//       }
//       console.log(examData.studentId.name);
//       console.log(totalCorrectMarks);
//       console.log(totalWrongMarks);
//       console.log(totalObtainedMarks);
//     }
//     return res.status(200).json("ss");
//   },
// ]);

module.exports = router;

//new node
