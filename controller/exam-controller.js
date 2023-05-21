const Course = require("../model/Course");
const Exam = require("../model/Exam");
const McqQuestionVsExam = require("../model/McqQuestionVsExam");
const QuestionsMcq = require("../model/QuestionsMcq");
const QuestionsWritten = require("../model/QuestionsWritten");
const Subject = require("../model/Subject");
const WrittenQuestionVsExam = require("../model/WrittenQuestionVsExam");
const CourseVsStudent = require("../model/CourseVsStudent");
const fs = require("fs");
const { default: mongoose } = require("mongoose");
const Limit = 1;

//create Exam
const createExam = async (req, res, next) => {
  const {
    courseName,
    subjectName,
    name,
    examType,
    examVariation,
    examFreeOrNot,
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
    return res.status(400).json({ message: "Exam name already exisit." });
  saveExam = new Exam({
    courseId: courseId,
    subjectId: subjectId,
    name: name,
    examType: Number(examType),
    examVariation: Number(examVariation),
    examFreeOrNot: Boolean(examFreeOrNot),
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
  let page = req.query.page;
  let skippedItem;
  if (page == null) {
    page = Number(1);
    skippedItem = (page - 1) * Limit;
  } else {
    page = Number(page);
    skippedItem = (page - 1) * Limit;
  }
  try {
    exams = await Exam.find({ examFreeOrNot: false }, "name startTime endTime")
      .skip(skippedItem)
      .limit(Limit);
  } catch (err) {
    console.log(err);
    return res.status(500).json("Something went wrong!");
  }
  return res.status(200).send(exams);
};
//get exam by subject(double parameter send from front-end needed)
const getExamBySubject = async (req, res, next) => {
  let subjectId;
  subjectId = req.query.subjectId;
  const variation = req.query.variation;
  let page = req.query.page;
  let skippedItem;
  if (page == null) {
    page = Number(1);
    skippedItem = (page - 1) * Limit;
  } else {
    page = Number(page);
    skippedItem = (page - 1) * Limit;
  }
  if (subjectId == null || variation == null) {
    return res.status(404).json("not found data.");
  }

  //let studentId = req.payload.studnetId;
  let courseId = null;
  try {
    courseId = await Subject.findById(subjectId).select("courseId");
    courseId = courseId.courseId;
  } catch (err) {
    console.log(err);
    return res.status(500).json("Something went wrong!");
  }
  let doc = "Sdf";
  // try {
  //   doc = await CourseVsStudent.findOne(
  //     {
  //       $and: [
  //         { status: true },
  //         { courseId: courseId },
  //         { studentId: studentId },
  //       ],
  //     },
  //     "_id"
  //   );
  // } catch (err) {
  //   console.log(err);
  //   return res.status(500).json("Something went wrong!");
  // }
  if (doc != null) {
    let exams = null;
    exams = await Exam.find(
      {
        $and: [
          { status: true },
          { subjectId: subjectId },
          { examVariation: variation },
          { examFreeOrNot: false },
          { endTime: { $gt: Date.now() } },
        ],
      },
      "name examVariation startTime endTime"
    )
      .skip(skippedItem)
      .limit(Limit);
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
    if (exams.length > 0 && courseName != null && subjectName != null)
      return res.status(200).json(examPage);
    else return res.status(404).json({ message: "No exam Found." });
  } else
    return res
      .status(404)
      .json({ message: "Student not allowed to the subject." });
};
//add questions
const addQuestionMcq = async (req, res, next) => {
  let iLinkPath = null;
  let explanationILinkPath = null;
  let data = new Object();
  let type = Boolean(req.body.type);
  let examId = req.body.examId;
  const { question, optionCount, options, correctOption, status } = req.body;
  //working with file upload

  //end of upload
  //read uploaded file path

  //end of read uploaded file path
  //question insert for text question(type=true)
  if (type == true) {
    const file = req.files;
    if (!file.explanationILink) {
      return res
        .status(404)
        .json({ message: "Expalnation File not uploaded." });
    }
    explanationILinkPath = "uploads/".concat(file.explanationILink[0].filename);

    try {
      examId = await Exam.findById(examId).select("_id");
    } catch (err) {
      console.log(err);
      return res.status(500).json("Something went wrong1!");
    }
    //option count check
    console.log(Number(optionCount));
    console.log(options);
    if (Number(optionCount) != options.length) {
      return res
        .status(400)
        .json({ message: "option count not same of options length" });
    }
    //end of option count
    //insert question
    let questions = new QuestionsMcq({
      question: question,
      optionCount: Number(optionCount),
      options: options,
      correctOption: Number(correctOption), //index value
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
    //end of insert question
    //insert question to reference mcqquestionexam table
    let doc1;
    let questionId = doc._id;
    if (!questionId) return res.status(400).send("question not inserted");
    let mcqQData,
      sizeMid,
      mId,
      mIdNew = [];
    try {
      mcqQData = await McqQuestionVsExam.findOne({ eId: examId }).select(
        "mId sizeMid"
      );
    } catch (err) {
      console.log(err);
      return res.status(500).json("Something went wrong2!");
    }
    if (mcqQData == null) {
      mIdNew.push(questionId);
      let questionExam = new McqQuestionVsExam({
        eId: examId,
        mId: mIdNew,
        sizeMid: Number(mIdNew.length),
      });
      try {
        doc1 = await questionExam.save();
      } catch (err) {
        console.log(err);
        return res.status(500).json("Something went wrong3!");
      }
    } else {
      mId = mcqQData.mId;
      sizeMid = mcqQData.sizeMid;
      sizeMid = sizeMid + 1;
      mIdNew = mId;
      mIdNew.push(questionId);
      try {
        doc1 = await McqQuestionVsExam.updateOne(
          { eId: examId },
          { $set: { mId: mIdNew, sizeMid: sizeMid } }
        );
      } catch (err) {
        console.log(err);
        return res.status(500).json("Something went wrong3!");
      }
    }
    //end of insert question to reference mcqquestionexam table
    //end of iinsert text question

    //start of insert question as image
    if (doc1 == null) {
      let delDoc = await QuestionsMcq.findByIdAndDelete(doc._id);
      return res.status(400).json("DB Error occur for insertion.");
    }
    if (doc != null && doc1 != null)
      return res.status(201).json({ message: "Question Succesfully added." });
    else return res.status(404).json("Not save correctly.");
  } else {
    const file = req.files;
    if (!file.iLink) {
      return res.status(404).json({ message: "Question File not uploaded." });
    }
    if (!file.explanationILink) {
      return res
        .status(404)
        .json({ message: "Expalnation File not uploaded." });
    }
    iLinkPath = "uploads/".concat(file.iLink[0].filename);
    explanationILinkPath = "uploads/".concat(file.explanationILink[0].filename);
    const { optionCount, options, correctOption, status } = req.body;
    let examId = req.body.examId;
    try {
      examId = await Exam.findById(examId).select("_id");
    } catch (err) {
      console.log(err);
      return res.status(500).json("Something went wrong4!");
    }
    if (Number(optionCount) != options.length) {
      return res
        .status(400)
        .json({ message: "option count not same of options length" });
    }
    let questions = new QuestionsMcq({
      question: iLinkPath,
      optionCount: Number(optionCount),
      options: options,
      correctOption: Number(correctOption),
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
    let mcqQData, sizeMid, mId, mIdNew;
    try {
      mcqQData = await McqQuestionVsExam.find({ eId: examId }).select(
        "mId sizeMid"
      );
    } catch (err) {
      console.log(err);
      return res.status(500).json("Something went wrong2!");
    }
    if (mcqQData == null) {
      mIdNew.push(questionId);
      let questionExam = new McqQuestionVsExam({
        eId: examId,
        mId: mIdNew,
        sizeMid: Number(mIdNew.length),
      });
      try {
        doc1 = await questionExam.save();
      } catch (err) {
        console.log(err);
        return res.status(500).json("Something went wrong3!");
      }
    } else {
      console.log(mcqQData);
      mId = mcqQData[0].mId;
      sizeMid = mcqQData[0].sizeMid;
      sizeMid = sizeMid + 1;
      mIdNew = mId;
      mIdNew.push(questionId);
      try {
        doc1 = await McqQuestionVsExam.updateOne(
          { eId: examId },
          { $set: { mId: mIdNew, sizeMid: sizeMid } }
        );
      } catch (err) {
        console.log(err);
        return res.status(500).json("Something went wrong3!");
      }
    }

    // mId = mcqQData[0].mId;
    // sizeMid = mcqQData[0].sizeMid;
    // sizeMid = sizeMid + 1;
    // mIdNew = mId;
    // mIdNew.push(questionId);
    // let questionExam = new McqQuestionVsExam({
    //   eId: examId,
    //   mId: mIdNew,
    //   sizeMid: sizeMid,
    // });
    // try {
    //   doc1 = await questionExam.save();
    // } catch (err) {
    //   console.log(err);
    //   return res.status(500).json("Something went wrong!");
    // }
    if (doc1 == null) {
      let delDoc = await QuestionsMcq.findByIdAndDelete(doc._id);
      return res.status(400).json("DB Error occur for insertion.");
    }
    if (doc != null && doc1 != null)
      return res.status(201).json({ message: "Question Succesfully added." });
    else return res.status(404).json("Not save correctly.");
  }
  //end of insert question as image
};
const getExamBySub = async (req, res, next) => {
  const subjectId = req.query.subjectId;
  const subjectIdObj = new mongoose.Types.ObjectId(subjectId);
  let examData = null;
  try {
    examData = await Exam.find(
      {
        $and: [{ subjectId: subjectIdObj }, { examFreeOrNot: false }],
      },
      "name"
    );
  } catch (err) {
    return res.status(500).json(err);
  }
  return res.status(200).json(examData);
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
    return res.status(400).json("File not uploaded.");
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
    return res.status(400).json("DB Error occur for insertion.");
  }
  if (doc != null && doc1 != null) return res.status(201).json(doc);
  else return res.status(404).json("Not save correctly.");
};

const examRuleSet = async (req, res, next) => {
  const examId = req.body.examId;
  const examIdObj = new mongoose.Types.ObjectId(examId);
  let examRule = null;
  try {
  } catch (err) {
    return res.status(500).json(err);
  }
};

//export functions
exports.createExam = createExam;
exports.getAllExam = getAllExam;
exports.addQuestionMcq = addQuestionMcq;
exports.addQuestionWritten = addQuestionWritten;
exports.getExamBySubject = getExamBySubject;
exports.getExamBySub = getExamBySub;
exports.examRuleSet = examRuleSet;
