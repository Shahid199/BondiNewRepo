const mongoose = require('mongoose')
const Schema = mongoose.Schema

const RetakeExamTrackerSchema = new Schema(
  {
    examId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    numberOfRetakes: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true } //createdAt,updatedAt auto genrate in the DB table.
)

module.exports = mongoose.model('RetakeExamTracker', RetakeExamTrackerSchema)
