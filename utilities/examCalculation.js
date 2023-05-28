const mongoose = require("mongoose");
const StudentExamVsQuestionsMcq = require("../model/StudentExamVsQuestionsMcq");
const StudentMarksRank = require("../model/StudentMarksRank");

async function examCalculation(message) {
  const eId = message.eId;
  const sId = message.sId;
  eIdObj = new mongoose.Types.ObjectId(eId);
  sIdObj = new mongoose.Types.ObjectId(sId);
  let sIeIObj = await StudentMarksRank.find(
    { $and: [{ studentId: sIdObj }, { examId: eIdObj }] },
    "_id"
  );
  sIeIObj = sIeIObj[0]._id;
  let examData = null;
  try {
    examData = await StudentExamVsQuestionsMcq.findOne({
      $and: [{ examId: eIdObj }, { studemtId: sIdObj }],
    }).populate("mcqQuestionId examId");
  } catch (err) {
    return "data not found.";
  }
  let id = String(examData._id);
  let correctMarks = examData.examId.marksPerMcq;
  let negativeMarks = examData.examId.negativeMarks;
  let negativeMarksValue = (correctMarks * negativeMarks) / 100;
  let examDataMcq = examData.mcqQuestionId;
  let answered = examData.answeredOption;
  let notAnswered = 0;
  let totalCorrectAnswer = 0;
  let totalWrongAnswer = 0;
  let totalObtainedMarks = 0;
  let totalCorrectMarks = 0;
  let totalWrongMarks = 0;
  for (let i = 0; i < examDataMcq.length; i++) {
    if (answered[i] == "-1") {
      notAnswered = notAnswered + 1;
    } else if (answered[i] == examDataMcq[i].correctOption) {
      totalCorrectAnswer = total + totalCorrectAnswer + 1;
    } else totalWrongAnswer = totalWrongAnswer + 1;
  }
  totalCorrectMarks = totalCorrectAnswer * correctMarks;
  totalWrongMarks = totalWrongAnswer * negativeMarksValue;
  totalObtainedMarks = totalCorrectMarks - totalWrongMarks;
  const update = {
    totalCorrectAnswer: totalCorrectAnswer,
    totalWrongAnswer: totalWrongAnswer,
    totalNotAnswered: notAnswered,
    totalCorrectMarks: totalCorrectMarks,
    totalWrongMarks: totalWrongMarks,
    totalObtainedMarks: totalObtainedMarks,
  };
  let result = null,
    getResult = null,
    sendResult = {},
    rank = null,
    dataRank = null,
    upd = null,
    upd1 = null,
    upd2 = null,
    getRank = null;
  try {
    result = await StudentExamVsQuestionsMcq.findByIdAndUpdate(id, update);
    upd = await StudentMarksRank.update(
      {
        $and: [{ examId: eIdObj }, { studentId: sIdObj }],
      },
      { totalObtainedMarks: totalObtainedMarks }
    );
  } catch (err) {
    return "problem to save";
  }
  try {
    getResult = await StudentExamVsQuestionsMcq.findById(id).populate("examId");
  } catch (err) {
    return "problem to save";
  }
  try {
    dataRank = await StudentMarksRank.find(
      { examId: eIdObj },
      "sId totalObtainedMarks"
    ).sort({ totalObtainedMarks: -1 });
  } catch (err) {
    return "problem to save";
  }
  let studentRankObject = {
    _id: sIeIObj,
    sId: sIdObj,
    totalObtainedMarks: totalObtainedMarks,
  };
  rank = Number(dataRank.indexOf(studentRankObject)) + 1;
  try {
    upd1 = await StudentMarksRank.findByIdAndUpdate(String(sIeIObj), {
      rank: rank,
    });
  } catch (err) {
    return err;
  }
  try {
    upd2 = await StudentMarksRank.findById(String(sIeIObj), "rank");
  } catch (err) {
    return err;
  }
  getrank = upd2.rank;
  sendResult["totalCrrectAnswer"] = getResult.totalCorrectAnswer;
  sendResult["totalCorrectMarks"] = getResult.totalCorrectMarks;
  sendResult["totalWrongAnswer"] = getResult.totalWrongAnswer;
  sendResult["totalWrongMarks"] = getResult.totalWrongMarks;
  sendResult["totalNotAnswered"] = getResult.totalNotAnswered;
  sendResult["totalObtained"] = getResult.totalObtainedMarks;
  sendResult["totalMarksMcq"] = getResult.examId.totalMarksMcq;
  sendResult["rank"] = getRank;

  return result;
}
process.on("message", async (message) => {
  let resultData = await examCalculation(message);
  process.send("message", async (message) => {
    return resultData;
  });
});
