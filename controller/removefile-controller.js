const { default: mongoose } = require("mongoose");
const SpecialVsStudent = require("../model/SpecialVsStudent");
const fs = require("fs");
const JSZip = require("jszip");
const path = require("path");
const { ObjectId } = require("mongodb");
const Exam = require("../model/Exam");
const BothExam = require("../model/BothExam");
const SpecialExamNew = require("../model/SpecialExamNew");
const BothStudentExamVsQuestions = require("../model/BothStudentExamVsQuestions");
let dir = path.resolve(path.join(__dirname, "../uploads"));
let dir1 = path.resolve(path.join(__dirname, "../uploads/answers"));
let dir2 = path.resolve(path.join(__dirname, "../"));
const removeAnswerScript = async (req, res, next) => {
  let removeTitle = Number(req.query.title); //number 0=uploads 1=answer Script
  let examId = String(req.query.examId);
  // console.log(examId,removeTitle);
  // // if (!examId || !removeTitle) return res.status(404).json("data not valid.");
  // // console.log(examId);
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
    if (fs.existsSync(dir1)) {
      fs.rm(dir1, { recursive: true, force: true }, (err) => {
        if (err) {
          return res.status(404).json(err);
        } else console.log(`${dir1} is deleted!`);
      });
      return res.status(200).json("success");
    } else return res.status(200).json("already deleted.no folder found.");
  }
};
const removeOneTime = async (req, res, next) => {
  //let examId = req.query.examId;
  let examId1 = req.query.examId;
  let examId = new mongoose.Types.ObjectId(examId1);
  let type = 2; //0=written 1=both 2=special
  let path = [];
  if (type == 2) {
    let data = null;
    try {
      data = await BothStudentExamVsQuestions.find({ examId: examId });
    } catch (err) {
      return res.status(500).json("Something went wrong.");
    }
    if (data.length == 0) return res.status(404).json("No data found.");
    for (let i = 0; i < data.length; i++) {
      if(data[i].submittedScriptILink){
        for(let j=0;j<data[i].length;j++){
          if(data[i].submittedScriptILink[j]){
            for(let k=0;k<data[i].submittedScriptILink[j].length;k++){
              path.push(data[i].submittedScriptILink[j][k]);
            }
          }
        }
      }
    }
    //   //console.log(data[i].questionWritten);
    //   if (data[i].questionWritten) {
    //     //console.log(data[i].questionWritten);
    //     for (let j = 0; j < 4; j++) {
    //       if (data[i].questionWritten[j]) {
    //         let subjects = data[i].questionWritten[j].answerScriptILink;
    //         //console.log(subjects);
    //         if (subjects.length > 0) {
    //           for (let k = 0; k < subjects.length; k++) {
    //             if(subjects[k]!=null)
    //               for (let p = 0; p < subjects[k].length; p++) {
    //                 path.push(subjects[k][p]);
    //               }
    //           }
    //         }
    //       }
    //     }
    //   }
    // }
  }
  console.log("parth", path);
  // let count = 0;
  // for (let i = 0; i < path.length; i++) {
  //   if(fs.existsSync(dir2 + "/" + path[i])){
  //     fs.unlinkSync(dir2 + "/" + path[i]);
  //     count++;
  //     console.log(dir2 + "/" + path[i]);
  //   }
    
  // }
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
const getExam = async (req, res, next) => {
  let courseId = new mongoose.Types.ObjectId(req.query.courseId);
  let type = Number(req.query.type);
  let uploads = Number(req.query.uploads);
  //uploads 0=uploads(dir) uploads 1=answers(dir1)
  if (uploads == 0) {
    let exams = [];
    let examId = [];
    if (type == 1) {
      try {
        exams = await Exam.find({
          $and: [{ examVariation: 2 }, { courseId: courseId }],
        });
      } catch (err) {
        return res.status(500).json("Type:1 Something went wrong.");
      }
      console.log(exams.length);
      for (let i = 0; i < exams.length; i++) {
        let rowExamId = String(exams[i]._id);
        let path = dir + "/" + rowExamId;
        //console.log("path:", path);
        if (fs.existsSync(path)) {
          let data = {};
          data["examId"] = exams[i]._id;
          data["examName"] = exams[i].name;
          examId.push(data);
        }
      }
      return res.status(200).json(examId);
    } else if (type == 2) {
      try {
        exams = await BothExam.find({
          $and: [{ examVariation: 3 }, { courseId: courseId }],
        });
      } catch (err) {
        return res.status(500).json("Type:1 Something went wrong.");
      }
      for (let i = 0; i < exams.length; i++) {
        let rowExamId = String(exams[i]._id);
        let path = dir + "/" + rowExamId;
        if (fs.existsSync(path)) {
          let data = {};
          data["examId"] = exams[i]._id;
          data["examName"] = exams[i].name;
          examId.push(data);
        }
      }
      return res.status(200).json(examId);
    } else {
      try {
        exams = await SpecialExamNew.find({ courseId: courseId });
      } catch (err) {
        return res.status(500).json("Type:1 Something went wrong.");
      }
      console.log(exams.length, exams);
      for (let i = 0; i < exams.length; i++) {
        let rowExamId = String(exams[i]._id);
        let path = dir + "/" + rowExamId;
        console.log("path:", path);
        if (fs.existsSync(path)) {
          let data = {};
          data["examId"] = exams[i]._id;
          data["examName"] = exams[i].name;
          examId.push(data);
        }
      }
      return res.status(200).json(examId);
    }
  }
  if (uploads == 1) {
    let exams = [];
    let examId = [];
    if (type == 1) {
      try {
        exams = await Exam.find({
          $and: [{ examVariation: 2 }, { courseId: courseId }],
        });
      } catch (err) {
        return res.status(500).json("Type:1 Something went wrong.");
      }
      for (let i = 0; i < exams.length; i++) {
        let rowExamId = String(exams[i]._id);
        let path = dir1 + "/" + rowExamId;
        if (fs.existsSync(path)) {
          let data = {};
          data["examId"] = exams[i]._id;
          data["examName"] = exams[i].name;
          examId.push(data);
        }
      }
      console.log(data);
      return res.status(200).json(examId);
    } else if (type == 2) {
      try {
        exams = await BothExam.find({
          $and: [{ examVariation: 3 }, { courseId: courseId }],
        });
      } catch (err) {
        return res.status(500).json("Type:1 Something went wrong.");
      }
      for (let i = 0; i < exams.length; i++) {
        let rowExamId = String(exams[i]._id);
        let path = dir1 + "/" + rowExamId;
        if (fs.existsSync(path)) {
          let data = {};
          data["examId"] = exams[i]._id;
          data["examName"] = exams[i].name;
          examId.push(data);
        }
      }
      return res.status(200).json(examId);
    } else {
      try {
        exams = await SpecialExamNew.find({
          $and: [{ examVariation: 4 }, { courseId: courseId }],
        });
      } catch (err) {
        return res.status(500).json("Type:1 Something went wrong.");
      }
      for (let i = 0; i < exams.length; i++) {
        let rowExamId = String(exams[i]._id);
        let path = dir1 + "/" + rowExamId;
        if (fs.existsSync(path)) {
          let data = {};
          data["examId"] = exams[i]._id;
          data["examName"] = exams[i].name;
          examId.push(data);
        }
      }
      return res.status(200).json(examId);
    }
  }
};
exports.getExam = getExam;
exports.downloadImage = downloadImage;
exports.removeAnswerScript = removeAnswerScript;
exports.removeOneTime = removeOneTime;
