const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const SmsTempSchema = new Schema(
  {
    template: {
      type: String,
      required: true,
    },
    status: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  { timestamps: true } //createdAt,updatedAt auto genrate in the DB table.
);

module.exports = mongoose.model("SmsTemp", SmsTempSchema);
