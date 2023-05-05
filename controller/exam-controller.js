const Course = require("../model/Course");
const Exam = require("../model/Exam");
//const McqQuestionVsExam = require("../model/McqQuestionVsExam");
const QuestionsMcq = require("../model/QuestionsMcq");
const Subject = require("../model/Subject");
//create Exam
const createExam = async (req, res, next) => {
  const {
    courseName,
    subjectName,
    name,
    examType,
    examVariation,
    examFreeOrnot,
    startTime,
    endTime,
    totalQuestionMcq,
    totalMarksMcq,
    totalQuestionWritten,
    totalMarksWritten,
    status,
    sscStatus,
    hscStatus,
    negativeMarks,
    iLink,
  } = req.body;
  let startTime1, endTime1, tqw, tmw, tqm, tmm;
  tqw = totalQuestionWritten;
  tmw = totalMarksWritten;
  tqm = totalQuestionMcq;
  tmm = totalMarksMcq;
  if (totalQuestionWritten == null || totalMarksWritten == null) {
    tqw = Number(0);
    tmw = Number(0);
  }
  if (totalQuestionMcq == null || totalMarksMcq == null) {
    tqm = Number(0);
    tmm = Number(0);
  }
  startTime1 = new Date(startTime);
  endTime1 = new Date(endTime);
  duration = (endTime1 - startTime1) / (60 * 1000);
  let courseId, subjectId, subjects, examNameCheck, saveExam;
  try {
    courseId = await Course.findOne({ name: courseName }).exec();
  } catch (err) {
    console.log(err);
    return res.status(500).json("Something went wrong!");
  }
  if (courseId == null)
    return res.status(404).json({ message: "No course Found." });
  try {
    subjects = await Subject.find({ courseId: courseId }).select("name");
  } catch (err) {
    console.log(err);
    return res.status(500).json("Something went wrong!");
  }
  subjects = Object.entries(subjects);
  subjects.forEach((element) => {
    if (element[1].name == subjectName) {
      subjectId = element[1]._id;
    }
  });
  if (subjectId == null)
    return res.status(404).json({ message: "Subject not found." });
  try {
    examNameCheck = await Exam.findOne({ name: name }).select("_id");
  } catch (err) {
    console.log(err);
    return res.status(500).json("Something went wrong!");
  }
  if (examNameCheck)
    return res.status(403).json({ message: "Exam name already exisit." });
  saveExam = new Exam({
    courseId: courseId,
    subjectId: subjectId,
    name: name,
    examType: examType,
    examVariation: examVariation,
    examFreeOrNot: examFreeOrnot,
    startTime: startTime1,
    endTime: endTime1,
    duration: duration,
    totalQuestionMcq: tqm,
    totalMarksMcq: tmm,
    totalQuestionWritten: tqw,
    totalMarksWritten: tmw,
    negativeMarks: Number(negativeMarks),
    status: Boolean(status),
    sscStatus: Boolean(sscStatus),
    hscStatus: Boolean(hscStatus),
    iLink: iLink,
  });
  let doc;
  try {
    doc = await saveExam.save();
  } catch (err) {
    console.log(err);
    return res.status(500).json("Something went wrong!");
  }
  return res.status(201).json(doc);
};

const getAllExam = async (req, res, next) => {
  let exams;
  try {
    exams = await Exam.find({}, "name startTime endTime");
  } catch (err) {
    console.log(err);
    return res.status(500).json("Something went wrong!");
  }
  return res.status(201).send(exams);
};
const addQuestionMcq = async (req, res, next) => {
  let data = new Object();
  const type = req.body;
  if (type == true) {
    const {
      question,
      optionCount,
      options,
      correctOption,
      explanationILink,
      status,
    } = req.body;
    let examId = req.body;
    try {
      examId = await Exam.findById(examId).select("_id");
    } catch (err) {
      console.log(err);
      return res.status(500).json("Something went wrong!");
    }
    let questions = new QuestionsMcq({
      question: question,
      optionCount: optionCount,
      options: options,
      correctOption: correctOption,
      explanationILink: explanationILink,
      status: Boolean(status),
      type: Boolean(type),
    });
    let doc;
    try {
      doc = await questions.save();
    } catch (err) {
      console.log(err);
      return res.status(500).json("Something went wrong!");
    }
    // let doc1;
    // let questionId = doc._id;
    // let questionExam = new McqQuestionVsExam({
    //   questionId: questionId,
    //   examId: examId,
    // });
    // try {
    //   doc1 = await questionExam.save();
    // } catch (err) {
    //   console.log(err);
    //   return res.status(500).json("Something went wrong!");
    // }
    // if (doc != null && doc1 != null) return res.status(201).send(doc);
    //else
    return res.status(404).send("Not save correctly.");
  } else return res.status(202).send("image question");
};
exports.createExam = createExam;
exports.getAllExam = getAllExam;
exports.addQuestionMcq = addQuestionMcq;
