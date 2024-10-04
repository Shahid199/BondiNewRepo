const RetakeExamTracker = require('../model/RetakeExamTracker')
const { ObjectId } = require('mongodb')
const { default: mongoose, Mongoose } = require('mongoose')
const McqSpecialExam = require('../model/McqSpecialExam')
const SpecialExamNew = require('../model/SpecialExamNew')
const addCount = async (req, res, next) => {
  const studentId = req.user.studentId
  const examId = req.body.examId
  let sId1, eId1
  sId1 = new mongoose.Types.ObjectId(studentId)
  eId1 = new mongoose.Types.ObjectId(examId)
  let retakes = null
  // console.log(sId1, eId1)
  try {
    retakes = await RetakeExamTracker.findOne({
      $and: [{ studentId: sId1 }, { examId: eId1 }],
    })
  } catch (err) {
    return res.status(500).json('Some Problems found')
  }
  
  let doc = null
  if (retakes) {
  let saveExamUpd
  let examData ;
  try {
    examData = await McqSpecialExam.findOne({_id:eId1})
  } catch (err) {
    return res.status(404).json("Exam not found");
  }
  const result = Number(retakes.numberOfRetakes);
  if(examData.numberOfRetakes<result){
    return res.status(500).json("Retake limit reached");
  }
    // console.log('hi')
    saveExamUpd = {
      examId: eId1,
      studentId: sId1,
      numberOfRetakes: Number(retakes.numberOfRetakes)+1,
    }
    try {
      doc = await RetakeExamTracker.updateOne({ _id: retakes._id }, saveExamUpd)
    } catch (err) {
      return res.status(500).json(err)
    }
  } 
   else {
    // console.log(retakes)
    let saveRetakeTracker = new RetakeExamTracker({
      examId: eId1,
      studentId: sId1,
      numberOfRetakes: 1,
    })
    try {
      doc = saveRetakeTracker.save()
    } catch (error) {
      return res.status(500).json(error)
    }
  }

  return res.status(201).json(doc)
}
const specialAddCount = async (req, res, next) => {
  const studentId = req.user.studentId
  const examId = req.body.examId
  let sId1, eId1
  sId1 = new mongoose.Types.ObjectId(studentId)
  eId1 = new mongoose.Types.ObjectId(examId)
  let retakes = null
  console.log(sId1, eId1)
  try {
    retakes = await RetakeExamTracker.findOne({
      $and: [{ studentId: sId1 }, { examId: eId1 }],
    })
  } catch (err) {
    return res.status(500).json('Some Problems found')
  }
  
  let doc = null
  if (retakes) {
  let saveExamUpd
  let examData ;
  try {
    examData = await SpecialExamNew.findOne({_id:eId1})
  } catch (err) {
    return res.status(404).json("Exam not found");
  }
  const result = Number(retakes.numberOfRetakes);
  if(examData.numberOfRetakes<result){
    return res.status(500).json("Retake limit reached");
  }
    console.log('hi')
    saveExamUpd = {
      examId: eId1,
      studentId: sId1,
      numberOfRetakes: Number(retakes.numberOfRetakes)+1,
    }
    try {
      doc = await RetakeExamTracker.updateOne({ _id: retakes._id }, saveExamUpd)
    } catch (err) {
      return res.status(500).json(err)
    }
  } 
   else {
    // console.log(retakes)
    let saveRetakeTracker = new RetakeExamTracker({
      examId: eId1,
      studentId: sId1,
      numberOfRetakes: 1,
    })
    try {
      doc = saveRetakeTracker.save()
    } catch (error) {
      return res.status(500).json(error)
    }
  }

  return res.status(201).json(doc)
}
exports.addCount = addCount
exports.specialAddCount = specialAddCount
