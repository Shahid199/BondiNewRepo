const mongoose = require("mongoose");
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
    comment: {
        type: String,
        required: true,
        default:null,
      },
  },
  { timestamps: true } //createdAt,updatedAt auto genrate in the DB table.
);

module.exports = mongoose.model("Remark", remarkSchema);
