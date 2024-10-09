const mongoose = require("mongoose");
const subjects = require("./Subject");
const Schema = mongoose.Schema;
const remarkSchema = new Schema(
  {
    examId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    questionNo:{
      type:Number,
      required:true
    },
    subjectId:{
      type: mongoose.Schema.Types.ObjectId,
      required:true,
      default:null,
      ref: subjects
    },
    comment: {
        type: String,
        required: true,
        default:null,
      },
  },
  { timestamps: true } //createdAt,updatedAt auto genrate in the DB table.
);

module.exports = mongoose.model("Remark", remarkSchema);
