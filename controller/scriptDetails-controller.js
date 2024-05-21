const ScriptDetails = require('../model/ScriptDetails')
const { ObjectId } = require('mongodb')
const { default: mongoose, Mongoose } = require('mongoose')
const McqSpecialExam = require('../model/McqSpecialExam')
const addCount = async (req, res, next) => {
  const teacherId = req.body.teacherId
  const examId = req.body.examId
  const numberOfQuestions = Number(req.body.noq);
  let tId1, eId1
  tId1 = new mongoose.Types.ObjectId(teacherId)
  eId1 = new mongoose.Types.ObjectId(examId)
  let retakes = null
  console.log(req.body);
  try {
    retakes = await ScriptDetails.findOne({
      $and: [{ teacherId: tId1 }, { examId: eId1 }],
    })
  } catch (err) {
    return res.status(500).json('Some Problems found')
  }
//   console.log("aaaaa",retakes);
//   return;
  let doc = null
  if (retakes) {
  let saveExamUpd
  let examData ;
  saveExamUpd = {
    teacherId: tId1,
    examId: eId1,
    numberOfQuestions: Number(retakes.numberOfQuestions)+numberOfQuestions,
    numberOfStudents: Number(retakes.numberOfStudents)+1,
  }
  try {
    doc = await ScriptDetails.updateOne({ _id: retakes._id }, saveExamUpd)
  } catch (err) {
    return res.status(500).json(err)
  }
  } 
   else {
    // console.log(retakes)
    let saveRetakeTracker = new ScriptDetails({
      teacherId: tId1,
      examId: eId1,
      numberOfQuestions: numberOfQuestions,
      numberOfStudents: 1,
    })
    try {
      doc = saveRetakeTracker.save()
    } catch (error) {
      return res.status(500).json(error)
    }
  }

  return res.status(201).json(doc)
}
const getData = async (req, res, next) => {
  const teacherId = req.query.teacherId
  let tId1
  tId1 = new mongoose.Types.ObjectId(teacherId)
  let data = []
//   console.log(req.body);
  try {
    data = await ScriptDetails.find({teacherId: tId1}).populate('examId').
    exec()
  } catch (err) {
    return res.status(500).json('Some Problems found')
  }

  return res.status(201).json(data)
}
const getAllData = async (req, res, next) => {
  let data = []
//   console.log(req.body);
  try {
    data = await ScriptDetails.find().populate('examId').populate('teacherId').
    exec()
  } catch (err) {
    return res.status(500).json('Some Problems found')
  }

  return res.status(201).json(data)
}
const changeStatus = async (req, res, next) => {
    let id = req.body.id;
    let data;
    try {
      data = await ScriptDetails.findById(id)
    } catch (err) {
      return res.status(500).json('Some Problems found')
    }
  //   console.log("aaaaa",retakes);
  //   return;
    let doc = null
    if (data) {
    let saveExamUpd;
    saveExamUpd = {
      paid:!(data.paid)
    }
    try {
      doc = await ScriptDetails.updateOne({ _id: data._id }, saveExamUpd)
    } catch (err) {
      return res.status(500).json(err)
    }
    } 
     else {
      // console.log(retakes)
      return res.status(500).json('Some Problems found')
     
    }
  
    return res.status(201).json(doc)
  }
exports.addCount = addCount
exports.getData = getData
exports.getAllData = getAllData
exports.changeStatus = changeStatus
