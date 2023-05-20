const mongoose = require("mongoose");
const Exam = require("../model/Exam");
const McqQuestionVsExam = require("../model/McqQuestionVsExam");
const QuestionsMcq = require("../model/QuestionsMcq");
const StudentExamVsQuestionsMcq = require("../model/StudentExamVsQuestionsMcq");
const StudentMarksRank = require("../model/StudentMarksRank");

async function examCalculation(message) {
  const eId = message.eId;
  const sId = message.sId;
  eIdObj = new mongoose.Types.ObjectId(eId);
  sIdObj = new mongoose.Types.ObjectId(sId);
  let examData = null;
  try {
    examData = await StudentExamVsQuestionsMcq.findOne({
      $and: [{ examId: eIdObj }, { studemtId: sIdObj }],
    }).populate("mcqQuestionId examId");
  } catch (err) {
    return res.status(500).json({ errorMessage: "DB error!" }, { error: err });
  }
  let id = String(examData._id);
  let correctMarks =
    examData.examId.totalMarksMcq / examData.examId.totalQuestionMcq;
  let negativeMarks = examData.examId.negativeMarks;
  let negativeMarksValue = (correctMarks * negativeMarks) / 100;
  let examDataMcq = examData.mcqQuestionId;
  let answered = examData.answeredOption;
  let notAnswered = 0;
  let totalCorrectAnswer = 0;
  let totalWrongAnswer = 0;
  let totalMarks = 0;
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
  totalMarks = totalCorrectMarks - totalWrongMarks;
  const update = {
    totalCorrectAnswer: totalCorrectAnswer,
    totalWrongAnswer: totalWrongAnswer,
    totalNotAnswered: notAnswered,
    totalCorrectMarks: totalCorrectMarks,
    totalWrongMarks: totalWrongMarks,
    totalObtainedMarks: totalMarks,
  };
  let result = null;
  try {
    result = await StudentExamVsQuestionsMcq.findByIdAndUpdate(
      { id: id },
      update
    );
  } catch (err) {
    return res.status(500).json(err);
  }
}

process.on("message", async (message) => {
  await examCalculation(message);
  process.kill(process.pid);
});
