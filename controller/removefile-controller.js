const { default: mongoose } = require("mongoose");
const SpecialVsStudent = require("../model/SpecialVsStudent");
const fs = require("fs");
const JSZip = require("jszip");
const path = require("path");
let dir = path.resolve(path.join(__dirname, "../uploads"));
let dir1 = path.resolve(path.join(__dirname, "../uploads/answers"));
let dir2 = path.resolve(path.join(__dirname, "../"));
const removeAnswerScript = async (req, res, next) => {
  let removeTitle = Number(req.query.title); //number 0=uploads 1=answer Script
  let examId = String(req.query.examId);
  if (!examId || !removeTitle) return res.status(404).json("data not valid.");
  console.log(examId);
  if (removeTitle == 0) {
    dir = dir + "/" + examId;
    if (fs.existsSync(dir)) {
      fs.rm(dir, { recursive: true, force: true }, (err) => {
        if (err) {
          return res.status(404).json(err);
        } else console.log(`${dir} is deleted!`);
      });
      return res.status(200).json("success");
    } else return res.status(200).json("already deleted.no folder found.");
  } else {
    dir1 = dir1 + "/" + examId;
    if (fs.existsSync(dir)) {
      fs.rm(dir, { recursive: true, force: true }, (err) => {
        if (err) {
          return res.status(404).json(err);
        } else console.log(`${dir} is deleted!`);
      });
      return res.status(200).json("success");
    } else return res.status(200).json("already deleted.no folder found.");
  }
};
const removeOneTime = async (req, res, next) => {
  let examId = req.query.examId;
  examId = new mongoose.Types.ObjectId(examId);
  let type = Number(req.query.type); //0=written 1=both 2=special
  let path = [];
  if (type == 2) {
    let data = null;
    try {
      data = await SpecialVsStudent.find({ examId: examId });
    } catch (err) {
      return res.status(500).json("Something went wrong.");
    }
    if (data.length == 0) return res.status(404).json("No data found.");
    for (let i = 0; i < data.length; i++) {
      if (!data[i].questionWritten) {
        for (let j = 0; j < 4; j++) {
          if (data[i].questionWritten[j]) {
            let subjects = data[i].questionWritten[j].submittedScriptILink;
            if (subjects.length > 0) {
              for (let k = 0; k < subjects.length; k++) {
                for (let p = 0; p < k.length; p++) {
                  path.push(subjects[k][p]);
                }
              }
            }
          }
        }
      }
    }
  }
  for (let i = 0; i < path.length; i++) {
    fs.unlinkSync(dir2 + "/" + path[i]);
  }
  //fs.unlinkSync(dir2 + "/"+);
  return res.status(200).json("Storage Removed");
};
const downloadImage = async (req, res, next) => {
  const zip = new JSZip();
  let examId = req.query.examId;
  examId = new mongoose.Types.ObjectId(examId);
  let type = Number(req.query.type); //0=written 1=both 2=special
  let path = [];
  if (type == 2) {
    let data = null;
    try {
      data = await SpecialVsStudent.find({ examId: examId });
    } catch (err) {
      return res.status(500).json("Something went wrong.");
    }
    if (data.length == 0) return res.status(404).json("No data found.");
    for (let i = 0; i < data.length; i++) {
      if (!data[i].questionWritten) {
        for (let j = 0; j < 4; j++) {
          if (data[i].questionWritten[j]) {
            let subjects = data[i].questionWritten[j].submittedScriptILink;
            if (subjects.length > 0) {
              for (let k = 0; k < subjects.length; k++) {
                for (let p = 0; p < k.length; p++) {
                  path.push(subjects[k][p]);
                }
              }
            }
          }
        }
      }
    }
  }
  const img = zip.folder(Striing(examId));
  try {
    for (let i = 0; i < path.length; i++) {
      let pathFile = dir2 + "/" + path[i];
      const pdfData = fs.readFileSync(pathFile);
      console.log(pdfData);
      img.file(path[i], pdfData);
    }
    zip
      .generateNodeStream({ type: "nodebuffer", streamFiles: true })
      .pipe(fs.createWriteStream("sample.zip"))
      .on("finish", function () {
        console.log("sample.zip written.");
      });
  } catch (err) {
    console.error(err);
  }

  return res.status(200).json("fs ok.");
};
exports.downloadImage = downloadImage;
exports.removeAnswerScript = removeAnswerScript;
exports.removeOneTime = removeOneTime;
