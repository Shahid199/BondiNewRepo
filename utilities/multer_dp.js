const multer = require("multer");
const fs = require("fs");
const path = require("path");

const dir = path.resolve(path.join(__dirname, "../profile-pictures"));

if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir);
}
const maxSize = 120 * 1000 * 1000;
const maxCount = 15;

const storage = multer.diskStorage({
  destination: function (req, file, callback) {
    // console.log(req.body.examId);
    callback(null, path.resolve(__dirname, "../profile-pictures"));
  },
  filename: function (req, file, callback) {
    const data = file.originalname;
    let arr = data.split(".");
    let extension = arr.pop();
    let arrData = String(arr).replace(/[" "-.\r]/g, "");
    arrData = arrData.replace(extension, "");
    const newName = arrData + Date.now().toString() + "." + extension;
    console.log("aa",newName);
    callback(null, newName);
  },
});
const uploadDp = multer({
  storage: storage,
  limits: { fileSize: maxSize },
  fileFilter: function (req, file, callback) {
    const mimeTypeList = [
      "image/jpg",
      "image/jpeg",
      "image/x-png",
      "image/png",
      "image/gif",
      "image/svg+xml",
      "text/csv",
    ];
    if (mimeTypeList.indexOf(file.mimetype) <= -1) {
      const cusError = new Error("File type is invalid");
      cusError.code = "INVALID_FILE_TYPE";
      cusError.field = file.fieldname;
      return callback(cusError);
    } else {
      return callback(null, true);
    }
  },
});
exports.uploadDp = uploadDp;
exports.maxCount = maxCount;
