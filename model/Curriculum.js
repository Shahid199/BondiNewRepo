const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const CurriculumSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      max: 200,
    },
    isAdmission:{
      type: Boolean,
      required: true,
      default: false,
    },
  },
  { timestamps: true } //createdAt,updatedAt auto genrate in the DB table.
);

module.exports = mongoose.model("Curriculum", CurriculumSchema);
