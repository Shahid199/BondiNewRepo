const Remark = require("../model/Remark")
// const ObjectId = mongoose.Types.ObjectId;
const { default: mongoose, mongo } = require("mongoose");

const add = async (req, res, next) => {
  const studentId = req.body.studentId
  const examId = req.body.examId
  console.log(studentId,examId);
  let sId1, eId1
  sId1 = new mongoose.Types.ObjectId(studentId)
  eId1 = new mongoose.Types.ObjectId(examId)

  let data = null
  console.log(sId1, eId1)
  try {
    data = await Remark.findOne({
      $and: [{ studentId: sId1 }, { examId: eId1 }],
    })
  } catch (err) {
    return res.status(500).json('Some Problems found')
  }
  console.log(data);
  let doc = null;

  if (data) {
    let myData = {
      examId: eId1,
      studentId: sId1,
      comment: req.body.comment,
    }
    try {
      doc = await Remark.updateOne({ _id: data._id }, myData)
    } catch (err) {
      return res.status(500).json(err)
    }
  } else {
    let saveData = new Remark({
      examId: eId1,
      studentId: sId1,
      comment: req.body.comment,
    })
    try {
      doc = saveData.save()
    } catch (error) {
      return res.status(500).json(error)
    }
  }

  return res.status(201).json(doc)
}
exports.add = add