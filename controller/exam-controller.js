const Course = require("../model/Course");
const Exam = require("../model/Exam");
const McqQuestionVsExam = require("../model/McqQuestionVsExam");
const QuestionsMcq = require("../model/QuestionsMcq");
const QuestionsWritten = require("../model/QuestionsWritten");
const Subject = require("../model/Subject");
const WrittenQuestionVsExam = require("../model/WrittenQuestionVsExam");
const CourseVsStudent = require("../model/CourseVsStudent");

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
//get all exam
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
//get exam by subject(double parameter send from front-end needed)
const getExamBySubject = async (req, res, next) => {
  let subjectId;
  subjectId = req.query.subjectid;
  const variation = req.query.variation;
  let studentId = req.payload.studnetId;
  let courseId = null;
  try {
    courseId = await Subject.findById(subjectId).select("courseId");
    courseId = courseId.courseId;
  } catch (err) {
    console.log(err);
    return res.status(500).json("Something went wrong!");
  }
  let doc = null;
  try {
    doc = await CourseVsStudent.findOne(
      {
        $and: [
          { status: true },
          { courseId: courseId },
          { studentId: studentId },
        ],
      },
      "_id"
    );
  } catch (err) {
    console.log(err);
    return res.status(500).json("Something went wrong!");
  }
  if (doc != null) {
    let exams = null;
    exams = await Exam.find(
      {
        $and: [
          { status: true },
          { subjectId: subjectId },
          { examType: variation },
        ],
      },
      "name examVariation startTime endTime"
    );
    let courseName, subjectName;
    try {
      courseName = await Course.findById(String(courseId), "name");
      subjectName = await Subject.findById(String(subjectId), "name");
    } catch (err) {
      console.log(err);
      return res.status(500).json("Something went wrong!");
    }
    let examPage = new Object();
    examPage["exam"] = exams;
    examPage["course"] = courseName;
    examPage["subject"] = subjectName;
    if (exams != null && courseName != null && subjectName != null)
      return res.status(201).json(examPage);
    else return res.status(404).json({ message: "No exam Found." });
  } else
    return res
      .status(403)
      .jsonn({ message: "Student not allowed to the subject." });
};
//add questions
const addQuestionMcq = async (req, res, next) => {
  const file = req.files;
  let iLinkPath = null;
  let explanationILinkPath = null;
  if (!file.iLink) {
    return res.status(404).json({ message: "Question File not uploaded." });
  }
  if (!file.explanationILink) {
    return res.status(404).json({ message: "Expalnation File not uploaded." });
  }
  iLinkPath = "uploads/".concat(file.iLink[0].filename);
  explanationILinkPath = "uploads/".concat(file.explanationILink[0].filename);
  let data = new Object();
  const type = req.body.type;
  if (type == true) {
    const { question, optionCount, options, correctOption, status } = req.body;
    let examId = req.body.examId;
    try {
      examId = await Exam.findById(examId).select("_id");
    } catch (err) {
      console.log(err);
      return res.status(500).json("Something went wrong1!");
    }
    if (Number(optionCount) != Array(options).length) {
      return res
        .status(401)
        .json({ message: "option count not same of options length" });
    }
    let questions = new QuestionsMcq({
      question: question,
      optionCount: Number(optionCount),
      options: Array(options),
      correctOption: correctOption,
      explanationILink: explanationILinkPath,
      status: Boolean(status),
      type: Boolean(type),
    });
    let doc;
    try {
      doc = await questions.save();
    } catch (err) {
      console.log(err);
      return res.status(500).json("Something went wrong2!");
    }
    let doc1;
    let questionId = doc._id;
    let questionExam = new McqQuestionVsExam({
      McqQuestionId: questionId,
      examId: examId,
    });
    try {
      doc1 = await questionExam.save();
    } catch (err) {
      console.log(err);
      return res.status(500).json("Something went wrong3!");
    }
    if (doc1 == null) {
      let delDoc = await QuestionsMcq.findByIdAndDelete(doc._id);
      return res.status(401).json("DB Error occur for insertion.");
    }
    if (doc != null && doc1 != null)
      return res.status(201).json({ message: "Question Succesfully added." });
    else return res.status(404).json("Not save correctly.");
  } else {
    const { optionCount, options, correctOption, status } = req.body;
    let examId = req.body.examId;
    try {
      examId = await Exam.findById(examId).select("_id");
    } catch (err) {
      console.log(err);
      return res.status(500).json("Something went wrong4!");
    }
    if (Number(optionCount) != Array(options).length) {
      return res
        .status(401)
        .json({ message: "option count not same of options length" });
    }
    let questions = new QuestionsMcq({
      question: iLinkPath,
      optionCount: Number(optionCount),
      options: Array(options),
      correctOption: correctOption,
      explanationILink: explanationILinkPath,
      status: Boolean(status),
      type: Boolean(type),
    });
    let doc;
    try {
      doc = await questions.save();
    } catch (err) {
      console.log(err);
      return res.status(500).json("Something went wrong5!");
    }
    let doc1;
    let questionId = doc._id;
    let questionExam = new McqQuestionVsExam({
      McqQuestionId: questionId,
      examId: examId,
    });
    try {
      doc1 = await questionExam.save();
    } catch (err) {
      console.log(err);
      return res.status(500).json("Something went wrong!");
    }
    if (doc1 == null) {
      let delDoc = await QuestionsMcq.findByIdAndDelete(doc._id);
      return res.status(401).json("DB Error occur for insertion.");
    }
    if (doc != null && doc1 != null)
      return res.status(201).json({ message: "Question Succesfully added." });
    else return res.status(404).json("Not save correctly.");
  }
};
//add wriiten question function
const addQuestionWritten = async (req, res, next) => {
  //file upload handle
  const file = req.files;
  console.log(file);
  let questionILinkPath = null;
  // console.log(file.questionILink[0].filename);
  // return res.status(201).json("Ok");
  if (!file.questionILink[0].filename)
    return res.status(401).json("File not uploaded.");
  questionILinkPath = "uploads/".concat(file.questionILink[0].filename);
  //written question save to db table
  const { status } = req.body;
  let question = new QuestionsWritten({
    questionILink: questionILinkPath,
    status: Boolean(status),
  });
  let doc;
  try {
    doc = await question.save();
  } catch (err) {
    console.log(err);
    return res.status(500).json("Something went wrong!");
  }
  //exam block
  let examId = req.body.examId;
  try {
    examId = await Exam.findById(examId).select("_id");
  } catch (err) {
    console.log(err);
    return res.status(500).json("Something went wrong4!");
  }
  //data insert to reference table
  let doc1;
  let questionId = doc._id;
  let questionExam = new WrittenQuestionVsExam({
    writtenQuestionId: questionId,
    examId: examId,
  });
  try {
    doc1 = await questionExam.save();
  } catch (err) {
    console.log(err);
    return res.status(500).json("Something went wrong!");
  }
  if (doc1 == null) {
    let delDoc = await QuestionsWritten.findByIdAndDelete(doc._id);
    return res.status(401).json("DB Error occur for insertion.");
  }
  if (doc != null && doc1 != null) return res.status(201).json(doc);
  else return res.status(404).json("Not save correctly.");
};

//export functions
exports.createExam = createExam;
exports.getAllExam = getAllExam;
exports.addQuestionMcq = addQuestionMcq;
exports.addQuestionWritten = addQuestionWritten;
exports.getExamBySubject = getExamBySubject;
