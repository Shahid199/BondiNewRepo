async function examCalculation(message) {
  const eId = message.eId;
  const sId = message.sId;
  eIdObj = new mongoose.Types.ObjectId(eId);
  sIdObj = new mongoose.Types.ObjectId(sId);
  let examData = null;
  try {
    examData = await StudentExamVsQuestionsMcq.find({
      $and: [{ examId: eIdObj }, { studemtId: sIdObj }],
    }).populate("mcqQuestionId");
  } catch (err) {
    return res.status(500).json({ errorMessage: "DB error!" }, { error: err });
  }
}
process.on("message", async (message) => {
  await examCalculation(message);
  process.kill(process.pid);
});
