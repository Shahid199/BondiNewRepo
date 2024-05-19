const { ObjectId } = require('mongodb')
const { default: mongoose } = require('mongoose')
const McqSpecialExam = require('../model/McqSpecialExam')
const McqSpecialExamRule = require('../model/McqSpecialExamRule')
const McqSpecialVsStudent = require('../model/McqSpecialVsStudent')
const QuestionsMcq = require('../model/QuestionsMcq')
const McqSpecialRank = require('../model/McqSpecialRank')
const moment = require('moment')
const pagination = require('../utilities/pagination')

const shuffle = (array) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[array[i], array[j]] = [array[j], array[i]]
  }
  return array
}
function checkIfEmpty(array) {
  return (
    Array.isArray(array) && (array.length == 0 || array.every(checkIfEmpty))
  )
}
const refillQuestion = async (req, res, next) => {
  const examId = req.body.examId
  const subjectId = req.body.subjectId
  // console.log(subjectId);

  if (!ObjectId.isValid(examId) || !ObjectId.isValid(subjectId))
    return res.status(404).json('exam Id or subject Id is invalid.')
  let examIdObj = new mongoose.Types.ObjectId(examId)
  let subjectIdObj = new mongoose.Types.ObjectId(subjectId)

  let mIdArray = null,
    examDetails = null
  try {
    examDetails = await McqSpecialExam.findById(examId)
  } catch (err) {
    return res.status(500).json(err)
  }
  //console.log("midarray:", mIdArray);
  mIdArray = examDetails.questionMcq
  //console.log("midarray:", mIdArray);
  let numOfQuestions = null,
    numberOfSlotAvailable = null
  let bulkData = []

  // code for all set made empty

  // for (let i = 0; i < examDetails.questionMcq.length; i++) {
  //     if (String(examDetails.questionMcq[i].subjectId) === subjectId) {
  //       for (
  //         let j = 0;
  //         j < examDetails.questionMcq[i].mcqQuestions.length;
  //         j++
  //       ) {
  //         if (examDetails.questionMcq[i].mcqQuestions[j].setName !== 0) {
  //           // shuffleIds = shuffle(bulkData)
  //           examDetails.questionMcq[i].mcqQuestions[j].mcqIds = []
  //           // shuffleIds = []
  //         }
  //       }
  //     }
  //   }
  //   try {
  //     sav = await SpecialExam.findOneAndUpdate(
  //       { _id: examIdObj },
  //       {
  //         questionMcq: examDetails.questionMcq,
  //       }
  //     )
  //   } catch (err) {
  //     return res.status(500).json(err)
  //   }
  //   return res.status(400).json("All sets are made empty")

  // all sets are made empty except the first

  let updatedMcqQuestions
  if (examDetails) {
    for (let i = 0; i < examDetails.subjectInfo.length; i++) {
      if (String(examDetails.subjectInfo[i].subjectId) === subjectId) {
        numOfQuestions = examDetails.subjectInfo[i].noOfQuestionsMcq
      }
    }
    for (let i = 0; i < examDetails.questionMcq.length; i++) {
      if (String(examDetails.questionMcq[i].subjectId) === subjectId) {
        for (
          let j = 0;
          j < examDetails.questionMcq[i].mcqQuestions.length;
          j++
        ) {
          if (examDetails.questionMcq[i].mcqQuestions[j].setName === 0) {
            if (
              examDetails.questionMcq[i].mcqQuestions[j].mcqIds.length !==
              numOfQuestions
            ) {
              return res
                .status(400)
                .json('Please fill the first set with questions')
            } else {
              bulkData = examDetails.questionMcq[i].mcqQuestions[j].mcqIds
            }
          } else {
            if (examDetails.questionMcq[i].mcqQuestions[j].mcqIds.length > 0) {
              return res.status(400).json('Only First Set can have questions!')
            }
          }
        }
      }
    }

    for (let i = 0; i < examDetails.questionMcq.length; i++) {
      if (String(examDetails.questionMcq[i].subjectId) === subjectId) {
        for (
          let j = 0;
          j < examDetails.questionMcq[i].mcqQuestions.length;
          j++
        ) {
          updatedMcqQuestions = []
          if (examDetails.questionMcq[i].mcqQuestions[j].setName !== 0) {
            updatedMcqQuestions = shuffle(bulkData)
            console.log('setnumber : ' + j + ' ')
            // for(let m = 0 ; m<shuffleIds.length; m++){
            //   console.log(shuffleIds[m])
            // }
            let newArr = []
            for (let x = updatedMcqQuestions.length - 1; x >= 0; x--) {
              newArr.push(updatedMcqQuestions[x])
            }
            console.log(newArr)
            examDetails.questionMcq[i].mcqQuestions[j].mcqIds = newArr
            try {
              sav = await McqSpecialExam.findOneAndUpdate(
                { _id: examIdObj },
                {
                  questionMcq: examDetails.questionMcq,
                },
                { new: true }
              )
              //  examDetails.markModified('anything');
              // await examDetails.save();
            } catch (err) {
              return res.status(500).json(err)
            }
            // console.log(examDetails.questionMcq[i].mcqQuestions[j].mcqIds)
          }
        }
      }
    }
    updatedMcqQuestions = examDetails.questionMcq
  }

  // console.log(updatedMcqQuestions[0].mcqQuestions)
  // return res.status(404).json("checking");

  return res.status(201).json('updated All set questions.')
}
const createSpecialMcqExam = async (req, res, next) => {
  const file = req.file
  let iLinkPath = null
  if (file) {
    iLinkPath = 'uploads/'.concat(file.filename)
  }

  const {
    courseId,
    name,
    startTime,
    endTime,
    duration,
    marksPerMcq,
    totalQuestionMcq,
    totalMarksMcq,
    status,
    curriculumName,
    isAdmission,
    noOfTotalSubject,
    noOfExamSubject,
    noOfOptionalSubject,
    noOfFixedSubject,
    allSubject,
    optionalSubject,
    fixedSubject,
    subjectInfo,
    solutionSheet,
    questionType,
    numberOfRetakes,
    numberOfOptions,
    numberOfSet,
    isOptionalAvailable,
  } = req.body
  const negative = req.body.negativeMarks
  if (!ObjectId.isValid(courseId)) {
    return res.status(404).json('Course Id is not valid.')
  }
  let fixedSubjects = []
  let fixedSubjectsId = JSON.parse(fixedSubject)
  for (let i = 0; i < fixedSubjectsId.length; i++) {
    fixedSubjects[i] = new mongoose.Types.ObjectId(fixedSubjectsId[i].value)
  }
  let allSubjects = []
  let subjectId = JSON.parse(allSubject)
  for (let i = 0; i < subjectId.length; i++) {
    allSubjects[i] = new mongoose.Types.ObjectId(subjectId[i])
  }
  let mcqQuestionSub = []
  for (let i = 0; i < allSubjects.length; i++) {
    let subObj = {}
    subObj['subjectId'] = allSubjects[i]
    subObj.mcqQuestions = []

    for (let j = 0; j < numberOfSet; j++) {
      const mcqObject = {}
      mcqObject.setName = j
      mcqObject.mcqIds = []
      subObj.mcqQuestions[j] = mcqObject
    }
    mcqQuestionSub.push(subObj)
  }
  let optionalSubjects = []
  let optionalId = JSON.parse(optionalSubject)
  for (let i = 0; i < optionalId.length; i++) {
    optionalSubjects[i] = new mongoose.Types.ObjectId(optionalId[i])
  }
  let subjectsInfos = []
  let subjectInfoId = JSON.parse(subjectInfo)
  for (let i = 0; i < subjectInfoId.length; i++) {
    let dataOb = {}
    dataOb['subjectId'] = new mongoose.Types.ObjectId(
      subjectInfoId[i].subjectId
    )
    dataOb['noOfQuestionsMcq'] = subjectInfoId[i].noOfQuestionsMcq
    subjectsInfos.push(dataOb)
  }
  let startTime1, endTime1
  startTime1 = new Date(startTime)
  endTime1 = new Date(endTime)
  let courseIdObj
  courseIdObj = new mongoose.Types.ObjectId(courseId)
  let saveExam = new McqSpecialExam({
    courseId: courseIdObj,
    name: name,
    examVariation: 5,
    startTime: moment(startTime).add(6, 'h'),
    endTime: moment(endTime).add(6, 'h'),
    duration,
    marksPerMcq: marksPerMcq,
    negativeMarksMcq: negative,
    totalQuestionsMcq: totalQuestionMcq,
    totalMarksMcq: totalMarksMcq,
    noOfTotalSubject: noOfTotalSubject,
    noOfExamSubject: noOfExamSubject,
    noOfOptionalSubject: noOfOptionalSubject,
    noOfFixedSubject: noOfFixedSubject,
    subjectInfo: subjectsInfos,
    optionalSubject: optionalSubjects,
    allSubject: allSubjects,
    fixedSubject: fixedSubjects,
    questionMcq: mcqQuestionSub,
    curriculumName: curriculumName,
    isAdmission: JSON.parse(isAdmission),
    status: JSON.parse(status),
    publishStatus: false,
    iLink: iLinkPath,
    solutionSheet: solutionSheet,
    questionType: questionType,
    numberOfRetakes: Number(numberOfRetakes),
    numberOfOptions: Number(numberOfOptions),
    numberOfSet: Number(numberOfSet),
    isOptionalAvailable: JSON.parse(isOptionalAvailable),
  })
  let updStatus = null
  try {
    updStatus = await saveExam.save()
  } catch (err) {
    return res.status(500).json('Something went wrong.')
  }
  return res.status(201).json('Created Exam successfully.')
}

const updateSpecialExam = async (req, res, next) => {
  const file = req.file
  let iLinkPath = null
  if (file) {
    iLinkPath = 'uploads/'.concat(file.filename)
  } else {
    iLinkPath = String(req.body.iLink)
  }
  const {
    examId,
    name,
    startTime,
    endTime,
    marksPerMcq,
    totalDuration,
    totalMarksMcq,
  } = req.body
  const negative = req.body.negativeMarks

  let saveExam = {
    name: name,
    startTime: moment(startTime).add(6, 'h'),
    endTime: moment(endTime).add(6, 'h'),
    marksPerMcq: marksPerMcq,
    negativeMarksMcq: negative,
    duration: totalDuration,
    totalMarksMcq,
  }
  let updStatus = null
  //console.log("number of tota subhect:", req.query.noOfTotalSubject);
  try {
    updStatus = await McqSpecialExam.findByIdAndUpdate(examId, saveExam)
  } catch (err) {
    //console.log(err);
    return res.status(500).json('Something went wrong.')
  }
  //console.log(updStatus);
  return res.status(201).json(updStatus)
}
const showSpecialExamById = async (req, res, next) => {
  let examId = req.query.examId
  if (!ObjectId.isValid(examId)) return res.status(404).json('Invalid Exam Id.')
  examId = new mongoose.Types.ObjectId(examId)
  let data = null
  try {
    data = await McqSpecialExam.findOne({
      $and: [{ _id: examId }, { status: true }],
    }).populate({ path: 'questionMcq', populate: { path: 'subjectId' } })
  } catch (err) {
    return res.status(500).json('Something went wrong.')
  }
  // console.log(data);
  if (data == null) return res.status(404).json('No data found.')
  return res.status(200).json(data)
}

const showMcqSpecialExamByCourse = async (req, res, next) => {
  let courseId = req.query.courseId
  if (!ObjectId.isValid(courseId))
    return res.status(404).json('Invalid Course Id.')
  courseId = new mongoose.Types.ObjectId(courseId)
  let data = null
  try {
    data = await McqSpecialExam.find({
      $and: [{ courseId: courseId }, { status: true }],
    })
  } catch (err) {
    return res.status(500).json('Something went wrong.')
  }
  //console.log("data.length", data.length);
  if (data == null) return res.status(404).json('No data found.')
  let dataObj = []
  for (let i = 0; i < data.length; i++) {
    let data1 = {}
    let dataRule = '0'
    try {
      dataRule = await McqSpecialExamRule.findOne({
        examId: data[i]._id,
      }).select('ruleILink -_id')
    } catch (err) {
      return res.status(500).json('Something went wrong.')
    }
    if (dataRule == null) {
      data1['RuleImage'] = '0'
    } else {
      data1['RuleImage'] = dataRule.ruleILink
    }
    data1['_id'] = data[i]._id
    data1['name'] = data[i].name
    data1['examVariation'] = data[i].examVariation
    data1['noOfTotalSubject'] = data[i].noOfTotalSubject
    data1['noOfExamSubject'] = data[i].noOfExamSubject
    data1['noOfOptionalSubject'] = data[i].noOfOptionalSubject
    data1['allSubject'] = data[i].allSubject
    data1['optionalSubject'] = data[i].optionalSubject
    data1['subjectInfo'] = data[i].subjectInfo
    data1['startTime'] = data[i].startTime
    data1['endTime'] = data[i].endTime
    data1['duration'] = data[i].duration
    data1['totalQuestionsMcq'] = data[i].totalQuestionsMcq
    data1['marksPerMcq'] = data[i].marksPerMcq
    data1['totalMarksMcq'] = data[i].totalMarksMcq
    data1['negativeMarksMcq'] = data[i].negativeMarksMcq
    data1['curriculumName'] = data[i].curriculumName
    data1['courseId'] = data[i].courseId
    data1['iLink'] = data[i].iLink
    data1['solutionSheet'] = data[i].solutionSheet
    data1['questionMcq'] = data[i].questionMcq
    data1['createdAt'] = data[i].createdAt
    data1['updatedAt'] = data[i].updatedAt
    data1['__v'] = data[i].__v
    dataObj.push(data1)
  }
  data = dataObj
  //console.log("data", data);
  return res.status(200).json(data)
}

const submitAnswer = async (req, res, next) => {
  const eId = req.body.eId
  const sId = req.user.studentId
  if (!ObjectId.isValid(eId) || !ObjectId.isValid(sId))
    return res.status(404).json('Invalid studnet Id or Exam Id')
  let studentIdObj = new mongoose.Types.ObjectId(sId)
  let examIdObj = new mongoose.Types.ObjectId(eId)
  let status = null
  try {
    status = await McqSpecialVsStudent.findOne({
      $and: [{ studentId: studentIdObj }, { examId: examIdObj }],
    })
  } catch (err) {
    return res.status(500).json('2.Something went wrong.')
  }
  if (status.finishStatus == true) return res.status(200).json('ended')
  const examEndTime = new Date()
  let eId1, sId1
  sId1 = new mongoose.Types.ObjectId(sId)
  eId1 = new mongoose.Types.ObjectId(eId)
  //exam status Check:start
  let studentCheck = null
  try {
    studentCheck = await McqSpecialVsStudent.findOne({
      $and: [{ examId: eId1 }, { studentId: sId1 }],
    })
      .populate({
        path: 'questionMcq',
        populate: {
          path: 'mcqId',
          match: { status: true },
          select: 'question type options optionCount status correctOption _id',
        },
      })
      .populate('examId')
      .populate({
        path: 'questionMcq',
        populate: { path: 'subjectId', select: 'name' },
      })
  } catch (err) {
    return res.status(500).json('Something went wrong.')
  }
  // console.log(studentCheck);
  ////console.log("studentCheck:", studentCheck.questionMcq[i].mcqId.length);
  //exam status Check:end
  let findId = studentCheck._id
  let timeStudent = []
  timeStudent[0] = studentCheck.startTimeMcq
  timeStudent[1] = studentCheck.endTimeMcq
  let submitTime = moment(new Date())
  let totalObtainedMarks = 0
  for (let i = 0; i < studentCheck.questionMcq.length; i++) {
    let totalCorrectAnswer = 0,
      totalCorrectMarks = 0,
      totalWrongAnswer = 0,
      totalWrongMarks = 0,
      totalNotAnswered = 0
    let subjectId = studentCheck.questionMcq[i].subjectId
    let lengthMcq = studentCheck.questionMcq[i].mcqId.length
    for (let j = 0; j < lengthMcq; j++) {
      let questions = studentCheck.questionMcq[i].mcqId[j]
      ////console.log("questions:", questions);
      if (studentCheck.questionMcq[i].mcqAnswer[j] == -1) {
        totalNotAnswered++
      } else if (
        questions.correctOption == studentCheck.questionMcq[i].mcqAnswer[j]
      ) {
        totalCorrectAnswer++
      } else if (
        questions.correctOption !== studentCheck.questionMcq[i].mcqAnswer[j]
      )
        totalWrongAnswer++
    }
    studentCheck.questionMcq[i].totalCorrectAnswer = totalCorrectAnswer
    studentCheck.questionMcq[i].totalWrongAnswer = totalWrongAnswer
    studentCheck.questionMcq[i].totalNotAnswered = totalNotAnswered
    studentCheck.questionMcq[i].totalCorrectMarks =
      totalCorrectAnswer * studentCheck.examId.marksPerMcq
    studentCheck.questionMcq[i].totalWrongMarks =
      totalWrongAnswer * (studentCheck.examId.negativeMarksMcq / 100)
    studentCheck.questionMcq[i].mcqMarksPerSub =
      totalCorrectAnswer * studentCheck.examId.marksPerMcq -
      totalWrongAnswer * (studentCheck.examId.negativeMarksMcq / 100)
    totalObtainedMarks =
      totalObtainedMarks + studentCheck.questionMcq[i].mcqMarksPerSub
  }
  ////console.log("studentCheck:", studentCheck.questionMcq);
  let dataUpd = {
    totalObtainedMarks: totalObtainedMarks,
    questionMcq: studentCheck.questionMcq,
    finishStatus: true,
    runningStatus: false,
    endTimeMcq: moment(submitTime).add(6, 'h'),
    mcqDuration:
      (moment(submitTime).add(6, 'h') - moment(timeStudent[0])) / 60000,
  }

  let sav = null
  try {
    sav = await McqSpecialVsStudent.findByIdAndUpdate(findId, dataUpd)
  } catch (err) {
    return res.status(500).json('Problem when updating student marks.')
  }
  return res.status(201).json('submited mcq Successfully.')
  // let data1 = {};
  // data1["examId"] = studentCheck.examId.name;
  // data1["startTime"] = moment(studentCheck.examId.startTime).format("LLL");
  // data1["endTime"] = moment(studentCheck.examId.endTime).format("LLL");
  // data1["totalMarksMcq"] = studentCheck.examId.totalMarksMcq;
  // data1["examVariation"] = 4;
  // data1["totalCorrectAnswer"] =
  //   studentCheck.questionMcq[0].totalCorrectAnswer +
  //   studentCheck.questionMcq[1].totalCorrectAnswer +
  //   studentCheck.questionMcq[2].totalCorrectAnswer +
  //   studentCheck.questionMcq[3].totalCorrectAnswer;

  // data1["totalWrongAnswer"] =
  //   studentCheck.questionMcq[0].totalWrongAnswer +
  //   studentCheck.questionMcq[1].totalWrongAnswer +
  //   studentCheck.questionMcq[2].totalWrongAnswer +
  //   studentCheck.questionMcq[3].totalWrongAnswer;
  // data1["totalCorrectMarks"] =
  //   studentCheck.questionMcq[0].totalCorrectMarks +
  //   studentCheck.questionMcq[1].totalCorrectMarks +
  //   studentCheck.questionMcq[2].totalCorrectMarks +
  //   studentCheck.questionMcq[3].totalCorrectMarks;
  // data1["totalWrongMarks"] =
  //   studentCheck.questionMcq[0].totalWrongMarks +
  //   studentCheck.questionMcq[1].totalWrongMarks +
  //   studentCheck.questionMcq[2].totalWrongMarks +
  //   studentCheck.questionMcq[3].totalWrongMarks;
  // data1["totalNotAnswered"] =
  //   studentCheck.questionMcq[0].totalNotAnswered +
  //   studentCheck.questionMcq[1].totalNotAnswered +
  //   studentCheck.questionMcq[2].totalNotAnswered +
  //   studentCheck.questionMcq[3].totalNotAnswered;
  // data1["rank"] = -1;
  // data1["studExamStartTime"] = moment(timeStudent[0]).format("LLL");
  // data1["studExamEndTime"] = moment(submitTime).format("LLL");
  // data1["studExamTime"] = (moment(timeStudent[0]) - moment(submitTime)) / 60000;

  // return res.status(200).json(data1);
}
const updateExamPhoto = async (req, res, next) => {
  const file = req.file
  let iLinkPath = null
  // console.log(file);
  if (file) {
    iLinkPath = 'uploads/'.concat(file.filename)
  }
  const { examId } = req.body
  const filter = { _id: examId }
  // console.log(filter);
  let update
  try {
    update = await McqSpecialExam.findOneAndUpdate(
      filter,
      {
        iLink: iLinkPath,
      },
      { new: true }
    )
  } catch (error) {
    res.status(404).json(error)
  }
  if (update) {
    res.status(202).json('Successfully Uploaded the photo')
  } else {
    res.status(404).json('could not update the photo!')
  }
}

const deactivateSpecialExam = async (req, res, next) => {
  let examId = req.body.examId
  if (!ObjectId.isValid(examId))
    return res.status(404).json('examId is not valid.')
  let upd = null
  try {
    upd = await McqSpecialExam.findByIdAndUpdate(examId, { status: false })
  } catch (err) {
    return res.status(500).json('Something went wrong.')
  }
  if (upd == null) return res.status(404).json('No data found.')
  return res.status(201).json('Deactivated.')
}

const showSpecialExamByIdStudent = async (req, res, next) => {
  let examId = req.query.examId
  let studentId = req.user.studentId
  if (!ObjectId.isValid(examId)) return res.status(404).json('Invalid Exam Id.')
  examId = new mongoose.Types.ObjectId(examId)
  let data = null
  try {
    data = await McqSpecialVsStudent.findOne({
      $and: [{ examId: examId }, { studentId: studentId }],
    }).populate({ path: 'questionMcq', populate: { path: 'subjectId' } })
  } catch (err) {
    return res.status(500).json('Something went wrong.')
  }
  let dataWritten = null
  try {
    dataWritten = await McqSpecialExam.findById(examId)
  } catch (err) {
    return res.status(500).json('Something went wrong.')
  }
  let mcqObj = {}
  mcqObj['totalMcqMarks'] = dataWritten.totalMarksMcq
  mcqObj['mcqDuration'] = dataWritten.mcqDuration
  mcqObj['marksPerSub'] = Math.round(dataWritten.totalMarksMcq / 4)
  mcqObj['negativeMarks'] = dataWritten.negativeMarksMcq
  mcqObj['negativeValue'] = Math.round(
    (dataWritten.marksPerMcq * dataWritten.negativeMarksMcq) / 100
  )
  mcqObj['totalQuestion'] = dataWritten.totalQuestionsMcq
  mcqObj['marksPerMcq'] = dataWritten.marksPerMcq
  //console.log("data", data);
  let subjectsId = []
  for (let i = 0; i < data.questionMcq.length; i++) {
    subjectsId = [...subjectsId, data.questionMcq[i].subjectId._id]
  }

  if (data == null) return res.status(404).json('No data found.')
  return res.status(200).json({ data, mcqObj, subjectsId })
}
const getExamSubjects = async (req, res, next) => {
  let examId = req.query.examId
  let sId = req.user.studentId
  let sav = {}
  if (!ObjectId.isValid(examId)) return res.status(404).json('Invalid Exam Id.')
  examId = new mongoose.Types.ObjectId(examId)
  let data = null
  try {
    data = await McqSpecialVsStudent.findOne({
      $and: [{ examId: examId }, { studentId: sId }],
    })
      .populate({
        path: 'questionMcq',
        populate: {
          path: 'mcqId',
          match: { status: true },
          select: 'question type options optionCount status _id',
        },
      })
      .populate('examId')
      .populate({
        path: 'questionMcq',
        populate: { path: 'subjectId', select: 'name' },
      })
  } catch (err) {
    return res.status(500).json('Something went wrong.')
  }
  let subjects = []
  for (let i = 0; i < data.questionMcq.length; i++) {
    subjects.push(data.questionMcq[i].subjectId)
  }
  // console.log('aaa', subjects)
  let examData = {}
  try {
    examData = await McqSpecialExam.findById(examId).populate({
      path: 'questionMcq',
      populate: {
        path: 'mcqId',
        match: { status: true },
        select:
          'question type options marksPerMcq optionCount status duration numberOfSet noOfTotalSubject noOfExamSubject _id',
      },
    })
  } catch (err) {
    res.status(500).json('Exam not found')
  }
  let runningData = []
  let totSub = examData.noOfExamSubject
  let noAllSub = examData.noOfTotalSubject
  // console.log(totSub);
  let noOfSet = examData.numberOfSet
  const selectedSet = parseInt(Date.now()) % noOfSet
  let mcqIds = []
  let questionsId = []
  let questionMcq ;
  let check
  try {
    check = await McqSpecialExam.findById(examId).populate({
      path: 'questionMcq',
      populate: {
        path: 'mcqQuestions',
        populate: {
          path: 'mcqIds',
          match: { status: true },
          select: 'question type options optionCount correctOption status _id',
        },
      },
    })
  } catch (err) {
    res.status(500).json('Exam not found')
  }
  questionMcq = check.questionMcq;
  let negMarking = (Number(check.negativeMarksMcq));
  let marksPerMcq = check.marksPerMcq;
  negMarking = Number((Number(negMarking/100))*(Number(check.marksPerMcq)));
  
  // console.log("aaaaaa",check.questionMcq[0].mcqQuestions[0].mcqIds[0]);
  // return;
  for (let i = 0; i < totSub; i++) {
    let flag = 0
    let doc = []
    for (let j = 0; j < noAllSub; j++) {
      if (String(questionMcq[j].subjectId) == String(subjects[i]._id)) {
        
        mcqIds = questionMcq[j].mcqQuestions[selectedSet].mcqIds
        break
      }
    }
    doc.push(mcqIds)
    questionsId.push(doc)
  }
  // console.log(questionsId)
  
  // console.log('check', check.questionMcq[0].mcqQuestions[0])
  // return
  let studExamStartTime = moment(new Date())
  let studExamEndTime = moment(studExamStartTime).add(examData.duration, 'm')
  if (
    Number(moment(studExamEndTime).add(6, 'h') - moment(examData.endTime)) > 0
  ) {
    studExamEndTime = examData.endTime
  } else studExamEndTime = moment(studExamEndTime).add(6, 'h')

  let mcqData = []
  for (let i = 0; i < totSub; i++) {
    let objSub = {}
    objSub['subjectId'] = subjects[i]
    let objMcq = []
    let dataQ = questionsId[i]
    let noOfQuesBySub
    for (let p = 0; p < dataQ.length; p++) {
      objSub['mcqId'] = dataQ[p]
      noOfQuesBySub = dataQ[p].length
    }

    let answerArr = []
    for (let j = 0; j < questionsId[i][0].length; j++) {
      answerArr[j] = -1
    }
    objSub['mcqAnswer'] = answerArr
    objSub['subjectMarks'] = parseInt(noOfQuesBySub * examData.marksPerMcq)
    objSub['totalCorrectAnswer'] = 0
    objSub['totalWrongAnswer'] = 0
    objSub['totalCorrectMarks'] = 0
    objSub['totalWrongMarks'] = 0
    mcqData[i] = objSub
  }
  let examTotalMarks = 0;
  for(let i = 0 ; i<mcqData.length; i++){
    examTotalMarks = examTotalMarks +mcqData[i].subjectMarks;
  }
  sav = {
    studentId: sId,
    examId: examId,
    startTimeMcq: moment(studExamStartTime).add(6, 'h'),
    endTimeMcq: moment(studExamEndTime),
    mcqDuration:
      (studExamEndTime - moment(studExamStartTime).add(6, 'h')) / 60000,
    questionMcq: mcqData,
    runningStatus: true,
    finishStatus: false,
  }
  for (let i = 0; i < mcqData.length; i++) {
    let dataQ = {}
    dataQ['questions'] = mcqData[i].mcqId
    dataQ['answeredOptions'] = mcqData[i].mcqAnswer
    dataQ['subjectId'] = mcqData[i].subjectId._id
    dataQ['subjectName'] = mcqData[i].subjectId.name
    dataQ['subjectMarks'] = mcqData[i].subjectMarks
    dataQ['marksMcqPerSub'] = 0;
    runningData[i] = dataQ
  }
  console.log(runningData)
  //return res.status(200).json(questionsId);
  let allData = {}
  allData['studStartTime'] = moment(studExamStartTime).add(6, 'h')
  allData['studEndTime'] = moment(studExamEndTime)
  allData['examStartTime'] = examData.startTime
  allData['examEndTime'] = examData.endTime
  allData['mcqDuration'] =
    (studExamEndTime - moment(studExamStartTime).add(6, 'h')) / 60000
    allData['negativeMarking'] =-negMarking;
    allData['marksPerMcq'] = marksPerMcq;
  allData['data'] = sav
  allData['examTotalMarks'] = examTotalMarks;
  allData['totalMarks'] = 0;

  return res.status(201).json({ allData, runningData })

  // return res.status(200).json(examData);
}
const getRunningDataMcq = async (req, res, next) => {
  const sId = req.user.studentId
  const eId = req.query.examId
  if (!ObjectId.isValid(sId) || !ObjectId.isValid(eId))
    return res.status(404).json('invalid student ID or exam ID.')
  let eId1, sId1
  sId1 = new mongoose.Types.ObjectId(sId)
  eId1 = new mongoose.Types.ObjectId(eId)
  //exam status Check:start
  let studentCheck = null
  let getQuestionMcq, getExamData
  try {
    getQuestionMcq = await McqSpecialVsStudent.findOne({
      $and: [{ studentId: sId1 }, { examId: eId1 }],
    })
      .populate({
        path: 'questionMcq',
        populate: {
          path: 'mcqId',
          match: { status: true },
          select: 'question type options optionCount status _id',
        },
      })
      .populate('examId')
      .populate({
        path: 'questionMcq',
        populate: { path: 'subjectId', select: 'name' },
      })
  } catch (err) {
    return res.status(500).json("can't get question.Problem Occur.")
  }
  //console.log(getQuestionMcq);
  let examData = getQuestionMcq
  //exam status Check:end
  getQuestionMcq = getQuestionMcq.questionMcq
  let data = []
  for (let i = 0; i < getQuestionMcq.length; i++) {
    let dataQ = {}
    dataQ['questions'] = getQuestionMcq[i].mcqId
    dataQ['answeredOptions'] = getQuestionMcq[i].mcqAnswer
    dataQ['subjectId'] = getQuestionMcq[i].subjectId._id
    dataQ['subjectName'] = getQuestionMcq[i].subjectId.name
    data[i] = dataQ
  }
  let examDet = {}
  examDet['studExamStartTime'] = examData.startTimeMcq
  examDet['studExamEndTime'] = examData.endTimeMcq
  examDet['duration'] = examData.mcqDuration
  //console.log("start");
  let timeS = moment(new Date())
  //console.log(timeS);
  //console.log(examData.endTimeMcq);
  examDet['dueDuration'] =
    (moment(examData.endTimeMcq) - moment(timeS).add(12, 'h')) / 60000

  return res.status(200).json({ data, examDet })
}
const assignQuestionMcq = async (req, res, next) => {
  const eId = req.query.examId
  let subjects = req.query.subjects.split(',')
  // console.log(typeof(subjects));
  // console.log(subjects);
  // return;
  const studentId = req.user.studentId
  let eId1, sId
  sId = new mongoose.Types.ObjectId(studentId)
  eId1 = new mongoose.Types.ObjectId(eId)
  let existData = []
  try {
    existData = await McqSpecialVsStudent.find({
      $and: [{ examId: eId1 }, { studentId: sId }],
    })
  } catch (err) {
    return res.status(500).json('1.something went wrong.')
  }
  if (existData.length > 0) return res.status(200).json('Mcq running')
  subjects = subjects.map((e) => new mongoose.Types.ObjectId(e))
  let examData = null
  try {
    examData = await McqSpecialExam.findById(eId).populate({
      path: 'questionMcq',
      populate: {
        path: 'mcqId',
        match: { status: true },
        select:
          'question type options marksPerMcq optionCount status duration numberOfSet noOfTotalSubject noOfExamSubject _id',
      },
    })
  } catch (err) {
    return res.status(500).json('1.something went wrong.')
  }
  ////console.log(examData.questionMcq);
  if (!examData) return res.status(404).json('No Exam found.')
  let questionMcq = examData.questionMcq
  let totSub = examData.noOfExamSubject
  let noAllSub = examData.noOfTotalSubject
  let noOfSet = examData.numberOfSet
  const selectedSet = parseInt(Date.now()) % noOfSet
  let mcqIds = []
  let questionsId = []
  for (let i = 0; i < totSub; i++) {
    let flag = 0
    let doc = []
    for (let j = 0; j < noAllSub; j++) {
      if (String(questionMcq[j].subjectId) == String(subjects[i])) {
        // console.log("assigning",questionMcq[j].mcqQuestions[selectedSet].mcqIds);
        mcqIds = questionMcq[j].mcqQuestions[selectedSet].mcqIds
        break
      }
    }
    doc.push(mcqIds)
    questionsId.push(doc)
  }
  // console.log(questionsId);
  let studExamStartTime = moment(new Date())
  let studExamEndTime = moment(studExamStartTime).add(examData.duration, 'm')
  if (
    Number(moment(studExamEndTime).add(6, 'h') - moment(examData.endTime)) > 0
  ) {
    studExamEndTime = examData.endTime
  } else studExamEndTime = moment(studExamEndTime).add(6, 'h')
  let sav = null,
    mcqData = []
  for (let i = 0; i < totSub; i++) {
    let objSub = {}
    objSub['subjectId'] = subjects[i]
    let objMcq = []
    let dataQ = questionsId[i]
    let noOfQuesBySub
    for (let p = 0; p < dataQ.length; p++) {
      objSub['mcqId'] = dataQ[p]
      noOfQuesBySub = dataQ[p].length
    }

    let answerArr = []
    for (let j = 0; j < questionsId[i][0].length; j++) {
      answerArr[j] = -1
    }
    objSub['mcqAnswer'] = answerArr
    objSub['mcqMarksPerSub'] = parseInt(noOfQuesBySub * examData.marksPerMcq)
    objSub['totalCorrectAnswer'] = 0
    objSub['totalWrongAnswer'] = 0
    objSub['totalCorrectMarks'] = 0
    objSub['totalWrongMarks'] = 0
    mcqData[i] = objSub
  }
  let upd = new McqSpecialVsStudent({
    studentId: sId,
    examId: eId1,
    startTimeMcq: moment(studExamStartTime).add(6, 'h'),
    endTimeMcq: moment(studExamEndTime),
    mcqDuration:
      (studExamEndTime - moment(studExamStartTime).add(6, 'h')) / 60000,
    questionMcq: mcqData,
    runningStatus: true,
    finishStatus: false,
  })
  try {
    sav = await upd.save()
  } catch (err) {
    return res.status(500).json('Something went wrong.')
  }
  if (!sav) return res.status(404).json('not assign mcq questions.')
  //return res.status(200).json(questionsId);
  questionsId.push({ studStartTime: moment(studExamStartTime).add(6, 'h') })
  questionsId.push({ studEndTime: moment(studExamEndTime) })
  questionsId.push({ examStartTime: examData.startTime })
  questionsId.push({ examEndTime: examData.endTime })
  questionsId.push({
    mcqDuration:
      (studExamEndTime - moment(studExamStartTime).add(6, 'h')) / 60000,
  })
  questionsId.push({ data: sav })

  return res.status(201).json(questionsId)
}
const assignQuestionMcqWithoutOptional = async (req, res, next) => {
  const eId = req.query.examId
  // let examDetails ={};
  let subjects;
  // console.log(typeof(subjects));
  // console.log(subjects);
  // return;
  const studentId = req.user.studentId
  let eId1, sId
  sId = new mongoose.Types.ObjectId(studentId)
  eId1 = new mongoose.Types.ObjectId(eId)
  let existData = []
  try {
    existData = await McqSpecialVsStudent.find({
      $and: [{ examId: eId1 }, { studentId: sId }],
    })
  } catch (err) {
    return res.status(500).json('1.something went wrong.')
  }
  if (existData.length > 0) return res.status(200).json('Mcq running')
  // subjects = subjects.map((e) => new mongoose.Types.ObjectId(e))
  let examData = null
  try {
    examData = await McqSpecialExam.findById(eId).populate({
      path: 'questionMcq',
      populate: {
        path: 'mcqId',
        match: { status: true },
        select:
          'question type options marksPerMcq optionCount status duration numberOfSet noOfTotalSubject noOfExamSubject _id',
      },
    })
  } catch (err) {
    return res.status(500).json('1.something went wrong.')
  }
  subjects = examData.allSubject;
  ////console.log(examData.questionMcq);
  if (!examData) return res.status(404).json('No Exam found.')
  let questionMcq = examData.questionMcq
  let totSub = examData.noOfExamSubject
  let noAllSub = examData.noOfTotalSubject
  let noOfSet = examData.numberOfSet
  const selectedSet = parseInt(Date.now()) % noOfSet
  let mcqIds = []
  let questionsId = []
  for (let i = 0; i < totSub; i++) {
    let flag = 0
    let doc = []
    for (let j = 0; j < noAllSub; j++) {
      if (String(questionMcq[j].subjectId) == String(subjects[i])) {
        // console.log("assigning",questionMcq[j].mcqQuestions[selectedSet].mcqIds);
        mcqIds = questionMcq[j].mcqQuestions[selectedSet].mcqIds
        break
      }
    }
    doc.push(mcqIds)
    questionsId.push(doc)
  }
  // console.log(questionsId);
  let studExamStartTime = moment(new Date())
  let studExamEndTime = moment(studExamStartTime).add(examData.duration, 'm')
  if (
    Number(moment(studExamEndTime).add(6, 'h') - moment(examData.endTime)) > 0
  ) {
    studExamEndTime = examData.endTime
  } else studExamEndTime = moment(studExamEndTime).add(6, 'h')
  let sav = null,
    mcqData = []
  for (let i = 0; i < totSub; i++) {
    let objSub = {}
    objSub['subjectId'] = subjects[i]
    let objMcq = []
    let dataQ = questionsId[i]
    let noOfQuesBySub
    for (let p = 0; p < dataQ.length; p++) {
      objSub['mcqId'] = dataQ[p]
      noOfQuesBySub = dataQ[p].length
    }

    let answerArr = []
    for (let j = 0; j < questionsId[i][0].length; j++) {
      answerArr[j] = -1
    }
    objSub['mcqAnswer'] = answerArr
    objSub['mcqMarksPerSub'] = parseInt(noOfQuesBySub * examData.marksPerMcq)
    objSub['totalCorrectAnswer'] = 0
    objSub['totalWrongAnswer'] = 0
    objSub['totalCorrectMarks'] = 0
    objSub['totalWrongMarks'] = 0
    mcqData[i] = objSub
  }
  let upd = new McqSpecialVsStudent({
    studentId: sId,
    examId: eId1,
    startTimeMcq: moment(studExamStartTime).add(6, 'h'),
    endTimeMcq: moment(studExamEndTime),
    mcqDuration:
      (studExamEndTime - moment(studExamStartTime).add(6, 'h')) / 60000,
    questionMcq: mcqData,
    runningStatus: true,
    finishStatus: false,
  })
  try {
    sav = await upd.save()
  } catch (err) {
    return res.status(500).json('Something went wrong.')
  }
  if (!sav) return res.status(404).json('not assign mcq questions.')
  //return res.status(200).json(questionsId);
  questionsId.push({ studStartTime: moment(studExamStartTime).add(6, 'h') })
  questionsId.push({ studEndTime: moment(studExamEndTime) })
  questionsId.push({ examStartTime: examData.startTime })
  questionsId.push({ examEndTime: examData.endTime })
  questionsId.push({
    mcqDuration:
      (studExamEndTime - moment(studExamStartTime).add(6, 'h')) / 60000,
  })
  questionsId.push({ data: sav })

  return res.status(201).json(questionsId)
}
const showSpecialExamByIdStudentAdmin = async (req, res, next) => {
  let examId = req.query.examId
  let studentId = req.query.studentId
  if (!ObjectId.isValid(examId)) return res.status(404).json('Invalid Exam Id.')
  examId = new mongoose.Types.ObjectId(examId)
  let data = null
  try {
    data = await SpecialVsStudent.findOne({
      $and: [{ examId: examId }, { studentId: studentId }],
    })
      .populate({ path: 'questionMcq', populate: { path: 'subjectId' } })
      .populate({ path: 'questionWritten', populate: { path: 'subjectId' } })
  } catch (err) {
    return res.status(500).json('Something went wrong.')
  }
  let dataWritten = null
  try {
    dataWritten = await SpecialExam.findById(examId)
  } catch (err) {
    return res.status(500).json('Something went wrong.')
  }
  let writtenObj = {}
  writtenObj['totalWrittenMarks'] = dataWritten.totalMarksWritten
  writtenObj['writtenDuration'] = dataWritten.writtenDuration
  writtenObj['marksPerSub'] = Math.round(dataWritten.totalMarksWritten / 4)
  let mcqObj = {}
  mcqObj['totalMcqMarks'] = dataWritten.totalMarksMcq
  mcqObj['mcqDuration'] = dataWritten.mcqDuration
  mcqObj['marksPerSub'] = Math.round(dataWritten.totalMarksMcq / 4)
  mcqObj['negativeMarks'] = dataWritten.negativeMarksMcq
  mcqObj['negativeValue'] = Math.round(
    (dataWritten.marksPerMcq * dataWritten.negativeMarksMcq) / 100
  )
  mcqObj['totalQuestion'] = dataWritten.totalQuestionsMcq
  mcqObj['marksPerMcq'] = dataWritten.marksPerMcq
  //console.log("data", data);
  let subjectsId = [
    data.questionMcq[0].subjectId._id,
    data.questionMcq[1].subjectId._id,
    data.questionMcq[2].subjectId._id,
    data.questionMcq[3].subjectId._id,
  ]
  if (data == null) return res.status(404).json('No data found.')
  return res.status(200).json({ data, writtenObj, mcqObj, subjectsId })
}

const examRuleSet = async (req, res, next) => {
  const file = req.file
  let ruleILinkPath = null
  if (file) {
    ruleILinkPath = 'uploads/'.concat(file.filename)
  }
  ////console.log(ruleILinkPath);
  const examId = req.body.examId
  if (!ObjectId.isValid(examId))
    return res.status(404).json('exam Id is not valid.')
  const examIdObj = new mongoose.Types.ObjectId(examId)
  let existingElem = null
  try {
    existingElem = await McqSpecialExamRule.findOne({ examId: examIdObj })
  } catch (err) {
    return re.status(500).json(err)
  }

  if (existingElem == null) {
    let examRule = new McqSpecialExamRule({
      examId: examIdObj,
      ruleILink: ruleILinkPath,
    })
    let data = null
    try {
      data = await examRule.save()
    } catch (err) {
      return res.status(500).json(err)
    }
    return res.status(201).json({ inserted: data })
  } else {
    let data = null
    try {
      data = await McqSpecialExamRule.updateOne(
        { examId: examIdObj },
        { rulILink: ruleILinkPath }
      )
    } catch (err) {
      return res.status(500).json(err)
    }
    return res.status(201).json({ updated: data })
  }
}
const examRuleGet = async (req, res, next) => {
  let examId = req.query.examId
  if (!ObjectId.isValid(examId))
    return res.status(422).json('exam Id is not valid.')
  let examIdObj = new mongoose.Types.ObjectId(examId)
  let data = null
  try {
    data = await McqSpecialExamRule.findOne({ examId: examIdObj })
  } catch (err) {
    return res.status(500).json(err)
  }
  // if (data) return res.status(200).json(data.ruleILink);
  // else return res.status(404).json("No data found.");
  return res.status(200).json(data)
}
const examRuleGetAll = async (req, res, next) => {
  let page = req.query.page
  let skippedItem
  if (page == null) {
    page = Number(1)
    skippedItem = (page - 1) * Limit
  } else {
    page = Number(page)
    skippedItem = (page - 1) * Limit
  }
  let data = []
  try {
    data = await McqSpecialExamRule.find({}).skip(skippedItem).limit(Limit)
  } catch (err) {
    return res.status(500).json(err)
  }
  if (data) return res.status(200).json(data)
  else return res.status(404).json('No data found.')
}

const addQuestionMcq = async (req, res, next) => {
  let iLinkPath = null
  let explanationILinkPath = null
  let examIdObj
  //let type = req.query.type;
  let question
  const {
    questionText,
    optionCount,
    correctOption,
    status,
    examId,
    type,
    subjectId,
    setName,
  } = req.body
  let options = JSON.parse(req.body.options)
  if (!ObjectId.isValid(examId) || !ObjectId.isValid(subjectId))
    return res.status(404).json('examId Id or subject Id is not valid.')
  const file = req.files
  //question insert for text question(type=true)
  if (JSON.parse(type) == true) {
    question = questionText
  } else {
    if (!file.iLink) {
      return res.status(404).json('Question File not uploaded.')
    }
    iLinkPath = 'questions/' + String(examId) + '/' + file.iLink[0].filename
    question = iLinkPath
    options = []
  }
  examIdObj = new mongoose.Types.ObjectId(examId)
  let subjectIdObj = new mongoose.Types.ObjectId(subjectId)
  //insert question
  let questions = new QuestionsMcq({
    question: question,
    optionCount: Number(optionCount),
    options: options,
    correctOption: Number(correctOption),
    explanationILink: explanationILinkPath,
    status: JSON.parse(status),
    type: JSON.parse(type),
  })
  let doc
  try {
    doc = await questions.save()
  } catch (err) {
    ////console.log(err);
    return res.status(500).json(err)
  }
  let questionId = doc._id
  //console.log(questionId);
  if (!questionId) return res.status(400).send('question not inserted')

  let examDetails = {}

  try {
    examDetails = await McqSpecialExam.findOne({
      _id: new mongoose.Types.ObjectId(examId),
    })
  } catch (error) {
    return res.status(404).json('Problem with exam settings')
  }
  let numOfQuestions = null,
    numberOfSlotAvailable = null
  if (examDetails) {
    //console.log(examDetails);
    for (let i = 0; i < examDetails.subjectInfo.length; i++) {
      if (String(examDetails.subjectInfo[i].subjectId) === subjectId) {
        numOfQuestions = examDetails.subjectInfo[i].noOfQuestionsMcq
      }
    }
    for (let i = 0; i < examDetails.questionMcq.length; i++) {
      if (String(examDetails.questionMcq[i].subjectId) === subjectId) {
        for (
          let j = 0;
          j < examDetails.questionMcq[i].mcqQuestions.length;
          j++
        ) {
          if (
            examDetails.questionMcq[i].mcqQuestions[j].setName ===
            Number(setName)
          ) {
            numberOfSlotAvailable =
              numOfQuestions -
              examDetails.questionMcq[i].mcqQuestions[j].mcqIds.length
            if (numberOfSlotAvailable <= 0) {
              return res.status(404).json('Set is full')
            }
            examDetails.questionMcq[i].mcqQuestions[j].mcqIds.push(questionId)
          }
        }
      }
    }
  }

  //console.log("mcqQues:", mcqQues);

  let doc1
  try {
    doc1 = await McqSpecialExam.findOneAndUpdate(
      { _id: examIdObj },
      {
        questionMcq: examDetails.questionMcq,
      }
    )
  } catch (err) {
    return res.status(500).json(err)
  }

  return res.status(201).json('Saved.')
}
const addQuestionMcqBulk = async (req, res, next) => {
  let questionArray = req.body.questionArray
  const examId = req.body.examId
  const subjectId = req.body.subjectId
  const setName = Number(req.body.setName)
  questionArray = shuffle(questionArray)
  //console.log(examId);
  //console.log(subjectId);
  if (!ObjectId.isValid(examId) || !ObjectId.isValid(subjectId))
    return res.status(404).json('exam Id or subject Id is invalid.')
  let examIdObj = new mongoose.Types.ObjectId(examId)
  let subjectIdObj = new mongoose.Types.ObjectId(subjectId)
  let finalIds = []
  for (let i = 0; i < questionArray.length; i++) {
    if (ObjectId.isValid(questionArray[i]))
      finalIds.push(new mongoose.Types.ObjectId(questionArray[i]))
    else continue
  }
  //console.log(finalIds);
  if (finalIds.length == 0)
    return res.status(404).json('question IDs is not valid.')
  let mIdArray = null,
    examDetails = null
  try {
    examDetails = await McqSpecialExam.findById(examId)
  } catch (err) {
    return res.status(500).json(err)
  }
  //console.log("midarray:", mIdArray);
  mIdArray = examDetails.questionMcq
  //console.log("midarray:", mIdArray);
  let numOfQuestions = null,
    numberOfSlotAvailable = null
  let bulkData = []
  if (examDetails) {
    for (let i = 0; i < examDetails.subjectInfo.length; i++) {
      if (String(examDetails.subjectInfo[i].subjectId) === subjectId) {
        numOfQuestions = examDetails.subjectInfo[i].noOfQuestionsMcq
      }
    }
    for (let i = 0; i < examDetails.questionMcq.length; i++) {
      if (String(examDetails.questionMcq[i].subjectId) === subjectId) {
        for (
          let j = 0;
          j < examDetails.questionMcq[i].mcqQuestions.length;
          j++
        ) {
          if (
            examDetails.questionMcq[i].mcqQuestions[j].setName ===
            Number(setName)
          ) {
            numberOfSlotAvailable =
              numOfQuestions -
              examDetails.questionMcq[i].mcqQuestions[j].mcqIds.length
            if (numberOfSlotAvailable <= 0) {
              return res.status(404).json('Set is full')
            }
            bulkData = examDetails.questionMcq[i].mcqQuestions[j].mcqIds
            break
          }
        }
      }
    }
  }
  //console.log("subdid:", subjectId);

  ////console.log(mIdArray);
  let finalIdsString = []
  finalIdsString = finalIds.map((e) => String(e))
  bulkData = bulkData.map((e) => String(e))
  //console.log("bulk:", bulkData);
  bulkData = bulkData.concat(finalIdsString)
  //console.log("bulk:", bulkData);
  let withoutDuplicate = Array.from(new Set(bulkData))
  withoutDuplicate = withoutDuplicate.map((e) => new mongoose.Types.ObjectId(e))
  if (withoutDuplicate.length > numberOfSlotAvailable) {
    return res
      .status(400)
      .json(`You can transfer only ${numberOfSlotAvailable}`)
  }
  for (let i = 0; i < mIdArray.length; i++) {
    if (subjectId == String(mIdArray[i].subjectId)) {
      for (let j = 0; j < mIdArray[i].mcqQuestions.length; j++) {
        if (mIdArray[i].mcqQuestions[j].setName === Number(setName)) {
          mIdArray[i].mcqQuestions[j].mcqIds = withoutDuplicate
          break
        }
      }
    }
  }
  ////console.log(withoutDuplicate);
  try {
    sav = await McqSpecialExam.findOneAndUpdate(
      { _id: examIdObj },
      {
        questionMcq: mIdArray,
      }
    )
  } catch (err) {
    return res.status(500).json(err)
  }
  return res.status(201).json('Inserted question to the exam.')
}
const questionByExamSub = async (req, res, next) => {
  const examId = req.query.examId
  const subjectId = req.query.subjectId
  if (!ObjectId.isValid(examId) || !ObjectId.isValid(subjectId))
    return res.status(404).json('exam Id is not valid.')
  const examIdObj = new mongoose.Types.ObjectId(examId)
  const subjectIdIdObj = new mongoose.Types.ObjectId(subjectId)
  let queryResult = null

  try {
    queryResult = await McqSpecialExam.findById(examId)
  } catch (err) {
    return res.status(500).json(err)
  }
  queryResult = queryResult.questionMcq
  let mcqId = []
  for (let i = 0; i < queryResult.length; i++) {
    if (subjectId == String(queryResult[i].subjectId)) {
      mcqId = queryResult[i].mcqId
      break
    }
  }
  mcqId = mcqId.map((e) => new mongoose.Types.ObjectId(e))
  let quesData = []
  try {
    quesData = await QuestionsMcq.find({
      $and: [{ _id: { $in: mcqId } }, { status: true }],
    })
  } catch (err) {
    return res.status(500).json(err)
  }
  let resultAll = []
  for (let i = 0; i < quesData.length; i++) {
    let result = {}
    // if (queryResult.mId[i] == null) continue;
    result['type'] = quesData[i].type
    result['question'] = quesData[i].question
    result['options'] = quesData[i].options
    result['correctOption'] = quesData[i].correctOption
    result['explanation'] = quesData[i].explanationILink
    result['questionId'] = quesData[i]._id
    result['status'] = quesData[i].status
    resultAll.push(result)
  }
  // resultAll.push({ totalQuestion: queryResult.mId.length });
  // resultAll.push({ examId: String(queryResult.eId) });
  return res.status(200).json(resultAll)
}

const viewSollutionMcq = async (req, res, next) => {
  ////console.log(req.query);
  const studentId = req.user.studentId
  const examId = req.query.examId
  if (!ObjectId.isValid(studentId) || !ObjectId.isValid(examId))
    return res.status(404).json('student Id or examId is not valid.')
  let studentIdObj = new mongoose.Types.ObjectId(studentId)
  let examIdObj = new mongoose.Types.ObjectId(examId)
  ////console.log(studentIdObj, examIdObj);
  let data = null
  let examDetials = {}
  try {
    examDetials = await McqSpecialExam.findOne({ _id: examIdObj })
  } catch (error) {
    return res.status(500).json('No Exam found.')
  }
  try {
    data = await McqSpecialVsStudent.findOne({
      $and: [{ studentId: studentIdObj }, { examId: examIdObj }],
    })
      .populate({
        path: 'questionMcq',
        populate: { path: 'mcqId' },
      })
      .populate({
        path: 'questionMcq',
        populate: { path: 'subjectId' },
      })
      .populate('examId')
  } catch (err) {
    return res.status(500).json('1.Something went wrong.')
  }
  // console.log(examDetials);
  const perMarks = examDetials.marksPerMcq;
  if (data == null)
    return res.status(404).json('No exam found under this student.')
  let resultData = {};
  let subjectDetails =[];
  for (let i = 0; i < examDetials.noOfExamSubject; i++) {
    //console.log("data", data.questionMcq[i].mcqId);
    let data1 = {}
    data1['subjectName'] = data.questionMcq[i].subjectId.name
    data1['totalObtainedMarksPerSub'] =
      data.questionMcq[i].mcqMarksPerSub.toFixed(2)
    data1['totalMarksPerSub'] = Number(data.questionMcq[i].mcqId.length * perMarks)
    data1['questions'] = []
    for (let j = 0; j < data.questionMcq[i].mcqId.length; j++) {
      let qData = {}
      qData['iLink'] = data.questionMcq[i].mcqId[j].question
      qData['options'] = data.questionMcq[i].mcqId[j].options
      qData['correctOptions'] = data.questionMcq[i].mcqId[j].correctOption
      // qData['explanationILink'] = data.questionMcq[i].mcqId[j].explanationILink
      qData['type'] = data.questionMcq[i].mcqId[j].type
      qData['answeredOption'] = data.questionMcq[i].mcqAnswer[j]
      qData['correctOption'] = data.questionMcq[i].mcqId[j].correctOption
      qData['optionCount'] = data.questionMcq[i].mcqId[j].optionCount
      data1['questions'].push(qData)
    }

    subjectDetails.push(data1)
  }
  resultData.subjectDetails = subjectDetails;
  resultData.totalmarks=data.examId.totalMarksMcq;
  resultData.totalObtainedMarks= data.totalObtainedMarks.toFixed(2);
  return res.status(200).json(resultData)
}

const specialGetHistory = async (req, res, next) => {
  const examId = req.query.examId
  if (!ObjectId.isValid(examId))
    return res.status(404).json('Student ID not valid.')
  let page = req.query.page || 1

  let examIdObj = new mongoose.Types.ObjectId(examId)
  let count = []
  try {
    count = await McqSpecialVsStudent.find({
      $and: [{ examId: examIdObj }],
    })
      .sort({ totalObtainedMarks: -1 })
      .populate('studentId')
      .populate('examId')
  } catch (err) {
    return res.status(500).json('1.Something went wrong.')
  }
  if (count.length == 0) {
    return res.status(404).json('No data found.')
  }
  let uniqueIds = []
  let studentIds = count.filter((element) => {
    const isDuplicate = uniqueIds.includes(element.studentId._id)

    if (!isDuplicate) {
      uniqueIds.push(element.studentId._id)
      return true
    }
    return false
  })
  let data = []
  for (let i = 0; i < studentIds.length; i++) {
    let data1 = {}
    studentIds[i].rank = i + 1
    data1['studentId'] = studentIds[i].studentId._id
    data1['examStud'] = studentIds[i]
    data1['totalObtainedMarks'] = studentIds[i].totalObtainedMarks.toFixed(2)
    data1['meritPosition'] = studentIds[i].rank
    data1['examStartTime'] = moment(studentIds[i].examStartTimeMcq).format(
      'LLL'
    )
    data1['examEndTime'] = moment(studentIds[i].examEndTimeMcq).format('LLL')
    data1['duration'] = studentIds[i].mcqDuration
    data1['totalObtainedMarksMcq'] = studentIds[i].totalMarksMcq
    data.push(data1)
  }
  examDetails = studentIds[0].examId
  //let paginateData = pagination(studentIds.length, page);

  let examInfo = {
    id: String(examDetails._id),
    name: examDetails.name,
    courseName: examDetails.courseId.name,
    startTime: moment(examDetails.examStartTime).format('LLL'),
    endTime: moment(examDetails.examEndTime).format('LLL'),
    totalMarks: examDetails.totalMarksMcq,
  }
  let count1 = data.length
  let paginateData = pagination(count1, page)
  let start, end
  start = (page - 1) * paginateData.perPage
  end = page * paginateData.perPage
  // //console.log(paginateData);
  // //console.log(start);
  // //console.log(end);
  // //console.log(data.length);
  let data2 = []
  if (count1 > 0) {
    for (let i = start; i < end; i++) {
      if (i == data.length) break
      //console.log("i value:", i, data[i]);
      data2.push(data[i])
    }
  }
  ////console.log("data1", data2);
  data = data2
  return res.status(200).json({ data, examInfo, paginateData })
}
const specialGetHistoryFilter = async (req, res, next) => {
  const examId = req.query.examId
  const regNo = req.query.regNo
  if (!ObjectId.isValid(examId) || !regNo)
    return res.status(404).json('Student ID not valid.')
  let page = req.query.page || 1

  let examIdObj = new mongoose.Types.ObjectId(examId)
  let count = []
  try {
    count = await McqSpecialVsStudent.find({
      $and: [{ examId: examIdObj }],
    })
      .sort({ totalObtainedMarks: -1 })
      .populate('studentId')
      .populate('examId')
  } catch (err) {
    return res.status(500).json('1.Something went wrong.')
  }
  if (count.length == 0) {
    return res.status(404).json('No data found.')
  }
  let uniqueIds = []
  let studentIds = count.filter((element) => {
    const isDuplicate = uniqueIds.includes(element.studentId._id)

    if (!isDuplicate) {
      uniqueIds.push(element.studentId._id)
      return true
    }
    return false
  })
  let data = []
  for (let i = 0; i < studentIds.length; i++) {
    let data1 = {}
    studentIds[i].rank = i + 1
    data1['studentId'] = studentIds[i].studentId._id
    data1['regNo'] = studentIds[i].studentId.regNo
    data1['examStud'] = studentIds[i]
    data1['totalObtainedMarks'] = studentIds[i].totalObtainedMarks.toFixed(2)
    data1['meritPosition'] = studentIds[i].rank
    data1['examStartTime'] = moment(studentIds[i].examStartTimeMcq).format(
      'LLL'
    )
    data1['examEndTime'] = moment(studentIds[i].examEndTimeMcq).format('LLL')
    data1['duration'] = studentIds[i].mcqDuration
    data1['totalObtainedMarksMcq'] = studentIds[i].totalMarksMcq
    data.push(data1)
  }
  const regex = new RegExp('.*' + regNo.toLowerCase() + '.*', 'i')
  data = data.filter(({ regNo }) => regNo.match(regex))
  examDetails = studentIds[0].examId
  //let paginateData = pagination(studentIds.length, page);

  let examInfo = {
    id: String(examDetails._id),
    name: examDetails.name,
    courseName: examDetails.courseId.name,
    startTime: moment(examDetails.examStartTime).format('LLL'),
    endTime: moment(examDetails.examEndTime).format('LLL'),
    totalMarks: examDetails.totalMarksMcq,
  }
  let count1 = data.length
  let paginateData = pagination(count1, page)
  let start, end
  start = (page - 1) * paginateData.perPage
  end = page * paginateData.perPage
  // //console.log(paginateData);
  // //console.log(start);
  // //console.log(end);
  // //console.log(data.length);
  let data2 = []
  if (count1 > 0) {
    for (let i = start; i < end; i++) {
      if (i == data.length) break
      //console.log("i value:", i, data[i]);
      data2.push(data[i])
    }
  }
  ////console.log("data1", data2);
  data = data2

  return res.status(200).json({ data, examInfo, paginateData })
}
const viewSollutionMcqAdmin = async (req, res, next) => {
  ////console.log(req.query);
  const studentId = req.query.studentId
  const examId = req.query.examId
  if (!ObjectId.isValid(studentId) || !ObjectId.isValid(examId))
    return res.status(404).json('student Id or examId is not valid.')
  let studentIdObj = new mongoose.Types.ObjectId(studentId)
  let examIdObj = new mongoose.Types.ObjectId(examId)
  ////console.log(studentIdObj, examIdObj);
  let data = null
  try {
    data = await McqSpecialVsStudent.findOne({
      $and: [{ studentId: studentIdObj }, { examId: examIdObj }],
    })
      .populate({
        path: 'questionMcq',
        populate: { path: 'mcqId' },
      })
      .populate({
        path: 'questionMcq',
        populate: { path: 'subjectId' },
      })
      .populate('examId')
  } catch (err) {
    return res.status(500).json('1.Something went wrong.')
  }

  if (data == null)
    return res.status(404).json('No exam found under this student.')
  let resultData = []
  for (let i = 0; i <data.questionMcq.length ; i++) {
    //console.log("data", data.questionMcq[i].mcqId);
    let data1 = {}
    data1['subjectName'] = data.questionMcq[i].subjectId.name
    data1['totalObtainedMarksPerSub'] = data.questionMcq[i].mcqMarksPerSub
    data1['totalMarksPerSub'] = data.examId.totalMarksMcq / 4
    data1['questions'] = []
    for (let j = 0; j < data.questionMcq[i].mcqId.length; j++) {
      let qData = {}
      qData['iLink'] = data.questionMcq[i].mcqId[j].question
      qData['options'] = data.questionMcq[i].mcqId[j].options
      qData['correctOptions'] = data.questionMcq[i].mcqId[j].correctOption
      qData['explanationILink'] = data.questionMcq[i].mcqId[j].explanationILink
      qData['type'] = data.questionMcq[i].mcqId[j].type
      qData['answeredOption'] = data.questionMcq[i].mcqAnswer[j]
      qData['correctOption'] = data.questionMcq[i].mcqId[j].correctOption
      qData['optionCount'] = data.questionMcq[i].mcqId[j].optionCount
      data1['questions'].push(qData)
    }

    resultData.push(data1)
  }
  resultData.push({ totalMarks: data.examId.totalMarksMcq })
  resultData.push({ totalObtainedMarks: data.totalObtainedMarks })
  return res.status(200).json(resultData)
}

const historyData = async (req, res, next) => {
  const studentId = req.user.studentId
  if (!ObjectId.isValid(studentId))
    return res.status(404).json('Student ID not valid.')
  let page = req.query.page || 1

  let studentIdObj = new mongoose.Types.ObjectId(studentId)
  let data
  let count = 0
  try {
    count = await McqSpecialVsStudent.find({
      $and: [{ studentId: studentIdObj }, { publishStatus: true }],
    }).count()
  } catch (err) {
    return res.status(500).json('Something went wrong.')
  }
  let paginateData = pagination(count, page)
  try {
    data = await McqSpecialVsStudent.find({
      $and: [{ studentId: studentIdObj }, { publishStatus: true }],
    })
      .populate({
        path: 'examId',
        populate: { path: 'courseId', select: 'name -_id' },
      })
      .populate({
        path: 'questionMcq',
        populate: { path: 'subjectId', select: 'name -_id' },
      })
      .skip(paginateData.skippedIndex)
      .limit(paginateData.perPage)
  } catch (err) {
    return res.status(500).json('1.SOmething went wrong.')
  }
  //return res.status(200).json(data);
  // //console.log(data);
  let resultData = []
  let flag = false
  ////console.log(data.length);
  let examIdObTest = '-1'
  for (let i = 0; i < data.length; i++) {
    let data1 = {}
    let rank = null
    examIdObj = new mongoose.Types.ObjectId(data[i].examId._id)
    if (String(examIdObj) == String(examIdObTest)) {
      //console.log(" examIdObTest:", examIdObTest);
      continue
    }
    examIdObTest = examIdObj
    let resultRank = null
    let totalStudent = 0
    try {
      resultRank = await McqSpecialRank.findOne({
        $and: [{ examId: examIdObj }, { studentId: studentIdObj }],
      })
      totalStudent = await McqSpecialRank.find({
        examId: examIdObj,
      }).count()
    } catch (err) {
      return res.status(500).json('Something went wrong.')
    }
    ////console.log("res", resultRank);
    if (resultRank == null) resultRank = '-1'
    else resultRank = resultRank.rank
    data1['examId'] = data[i].examId._id
    data1['title'] = data[i].examId.name
    data1['examStartTime'] = moment(data[i].examId.startTime)
      .subtract(6, 'h')
      .format('LLL')
    data1['examEndTime'] = moment(data[i].examId.endTime)
      .subtract(6, 'h')
      .format('LLL')
    data1['variation'] = 'MCQ Special Exam'
    data1['examType'] = 'no'
    data1['totalObtainedMarks'] = data[i].totalObtainedMarks.toFixed(2)
    data1['totalMarksMcqExam'] = data[i].totalMarksMcq
    data1['totalMarksMcq'] = data[i].examId.totalMarksMcq
    data1['solutionSheet'] = data[i].examId.solutionSheet
    data1['meritPosition'] = resultRank
    data1['examStartTimeMcq'] = moment(data[i].startTimeMcq).format('LLL')
    data1['examEndTimeMcq'] = moment(data[i].endTimeMcq).format('LLL')
    data1['mcqDuration'] = data[i].mcqDuration
    data1['totalDuration'] = data[i].mcqDuration
    data1['courseName'] = data[i].examId.courseId.name
    let subObj = []

    for (let j = 0; j < data[i].questionMcq.length; j++) {
      
      // console.log("aaaa",j+data[i].questionMcq[j]);
      subObj.push(data[i].questionMcq[j].subjectId.name)
    }
    
    // return ;
    data1['subjectName'] = subObj.join('+ ')
    data1['totalStudent'] = totalStudent
    resultData.push(data1)
  }

  return res.status(200).json({ resultData, paginateData })
}
const studentSubmittedExamDetail = async (req, res, next) => {
  const studentId = req.user.studentId
  const examId = req.query.examId
  if (!ObjectId.isValid(studentId) || !ObjectId.isValid(examId))
    return res.status(404).json('Student Id is not valid.')
  const studentIdObj = new mongoose.Types.ObjectId(studentId)
  const examIdObj = new mongoose.Types.ObjectId(examId)
  let examDetails = {}
  try {
    examDetails = await McqSpecialExam.findOne({ _id: examIdObj })
  } catch (err) {
    return res.status(500).json('1.Something went wrong.')
  }
  // console.log(examDetails);
  let data = null
  try {
    data = await McqSpecialVsStudent.findOne({
      $and: [{ studentId: studentIdObj }, { examId: examIdObj }],
    })
      .populate('examId')
      .populate({ path: 'questionMcq', populate: { path: 'subjectId' } })
  } catch (err) {
    return res.status(500).json('1.Something went wrong.')
  }
  if (data == null) return res.status(404).json('No data found.')
  //star rank
  let mcqRank = null
  try {
    mcqRank = await McqSpecialRank.findOne({
      $and: [{ studentId: studentIdObj }, { examId: examIdObj }],
    })
  } catch (err) {
    return res.status(500).json('2.Something went wrong.')
  }
  if (mcqRank != null) mcqRank = mcqRank.rank
  else mcqRank = '-1'
  //end rank
  let dataEx = {}
  let subjectDetails = []
  for (let i = 0; i < examDetails.noOfExamSubject; i++) {
    let dataObject = {}
    dataObject['subjectId'] = data.questionMcq[i].subjectId._id
    dataObject['subjectName'] = data.questionMcq[i].subjectId.name
    let searchedId = new mongoose.Types.ObjectId(
      data.questionMcq[i].subjectId._id
    )
    // console.log(examDetails.subjectInfo,examDetails.subjectInfo.filter(s=>String(s.subjectId)===String(searchedId)),new mongoose.Types.ObjectId(data.questionMcq[i].subjectId._id));
    // return;
    let numOfQuesPerSub = examDetails.subjectInfo.filter(
      (s) => String(s.subjectId) === String(searchedId)
    )[0].noOfQuestionsMcq
    if (data.questionMcq[i].mcqMarksPerSub > data.examId.totalMarksMcq / 4) {
      dataObject['marksMcqPerSub'] = 0
    } else {
      dataObject['marksMcqPerSub'] =
        data.questionMcq[i].mcqMarksPerSub.toFixed(2)
    }
    dataObject['subjectMarks'] = numOfQuesPerSub * examDetails.marksPerMcq
    subjectDetails.push(dataObject)
  }
  dataEx['subjectDetails'] = subjectDetails
  dataEx['totalMarks'] = data.examId.totalMarksMcq
  dataEx['totalObtainedMarks'] = data.totalObtainedMarks.toFixed(2)
  dataEx['rank'] = mcqRank
  dataEx['studDuration'] = data.mcqDuration
  dataEx['studExamStartTimeMcq'] = moment(data.startTimeMcq).format('LLLL')
  dataEx['studExamEndTimeMcq'] = moment(data.endTimeMcq).format('LLLL')
  dataEx['startTime'] = moment(data.examId.startTime).format('LLLL')
  dataEx['endTime'] = moment(data.examId.endTime).format('LLLL')
  dataEx['examVariation'] = 'MCQ Special Exam'
  dataEx['examName'] = examDetails.name
  // console.log(dataEx);
  // return ;
  return res.status(200).json(dataEx)
}

const getOptionalSubects = async (req, res, next) => {
  const examId = req.query.examId
  const studentId = req.user.studentId
  if (!ObjectId.isValid(examId) || !ObjectId.isValid(studentId))
    return res.status(404).json('Exam Id or Student Id is not valid.')
  let subjects = null
  try {
    subjects = await McqSpecialExam.findById(examId).populate({
      path: 'optionalSubject',
      select: 'name',
    })
  } catch (err) {
    return res.status(500).json('1.sonmething went wrong.')
  }
  let optionalSubjects = subjects

  return res.status(200).json(optionalSubjects.optionalSubject)
}
const getCombination = async (req, res, next) => {
  let selectedId = req.query.optionalSubjectId
  let selectIdArr = []
  selectIdArr.push(selectedId)
  let examId = req.query.examId
  let fixedId = null
  try {
    fixedId = await McqSpecialExam.findById(examId)
      .select('fixedSubject allSubject optionalSubject noOfExamSubject -_id')
      .populate({
        path: 'fixedSubject',
        select: 'name',
      })
      .populate({
        path: 'optionalSubject',
        select: 'name',
      })
      .populate({
        path: 'allSubject',
        select: 'name',
      })
  } catch (err) {
    return res.status(500).json(err)
  }
  let fixedIds = fixedId.fixedSubject
  const totSub = fixedId.noOfExamSubject
  let optionalId = fixedId.optionalSubject
  let allId = fixedId.allSubject
  let fSubject = []
  let k = 0
  const combinations = []
  const exceptFixedSub = []
  let selectedOptional = {}
  let flag = 0
  for (let i = 0; i < allId.length; i++) {
    flag = 0
    if (String(allId[i]._id) === selectedId) {
      selectedOptional = allId[i]
    }
    for (let j = 0; j < fixedIds.length; j++) {
      if (
        String(allId[i]._id) === String(fixedIds[j]._id) ||
        String(allId[i]._id) === selectedId
      ) {
        // console.log("dhujse")
        flag = 1
        break
      }
    }
    if (flag === 0) {
      exceptFixedSub.push(allId[i])
    }
  }
  // console.log("aaaa",exceptFixedSub);
  let fixedAndOptional = [...fixedIds, selectedOptional]
  // fixedAndOptional.push();
  console.log(fixedAndOptional)
  if(fixedAndOptional.length<totSub){
    for (let i = 0; i < exceptFixedSub.length; i++) {
      let temp = []
      temp = [...fixedAndOptional, exceptFixedSub[i]]
      combinations[i] = temp
    }
  }else{
    combinations[0] = fixedAndOptional
  }
 

  // for(let i = 0 ; i<totSub;i++){
  //   combinations[i] =
  // }
  // console.log(fixedIds,allId);
  // let result1 = allId.filter(
  //   (obj1) => !fixedIds.some((obj2) => String(obj1._id) === String(obj2._id))
  // )
  // let result3 = allId.filter((obj1) =>
  //   selectIdArr.some((obj2) => String(obj1._id) === String(obj2))
  // )
  // let result2 = result1.filter(
  //   (obj1) => !selectIdArr.some((obj2) => String(obj1._id) === String(obj2))
  // )
  // // console.log(result3)
  // let data = []
  // //console.log(optionalId[sIndex]);
  // data.push([fixedIds[0], fixedIds[1], result2[0], result3[0]])
  // data.push([fixedIds[0], fixedIds[1], result2[1], result3[0]])
  // data.push([fixedIds[0], fixedIds[1], result2[2], result3[0]])
  // console.log(data)
 
  return res.status(200).json(combinations)
}

const updateStudentExamInfo = async (req, res, next) => {
  const examId = req.body.examId
  if (!ObjectId.isValid(examId))
    return res.status(404).json('Exam Id is not valid.')
  const examIdObj = new mongoose.Types.ObjectId(examId)
  let getEndTime = null
  try {
    getEndTime = await McqSpecialExam.findById(examId).select('endTime -_id')
  } catch (err) {
    return res.status(500).json('1.Something went wrong.')
  }
  let examUncheckStudent = null
  try {
    examUncheckStudent = await McqSpecialVsStudent.find(
      {
        $and: [
          { examId: examIdObj },
          { finishStatus: false },
          { runningStatus: true },
        ],
      },
      '_id'
    )
  } catch (err) {
    return res.status(500).json('2.Something went wrong.')
  }
  let studentIds = []
  try {
    studentIds = await McqSpecialVsStudent.find(
      {
        $and: [
          { examId: examIdObj },
          { finishStatus: false },
          { runningStatus: true },
        ],
      },
      'studentId -_id'
    )
  } catch (err) {
    return res.status(500).json('3.Something went wrong.')
  }
  if (examUncheckStudent.length > 0) {
    let updateStatus = null
    try {
      updateStatus = await McqSpecialVsStudent.updateMany(
        {
          _id: { $in: examUncheckStudent },
        },
        { $set: { runningStatus: false, finishStatus: true } }
      )
    } catch (err) {
      return res.status(500).json('4.Something went wrong.')
    }
    for (let i = 0; i < studentIds.length; i++) {
      let totalMarksMcq = 0
      let examData = null
      try {
        examData = await McqSpecialVsStudent.findOne({
          $and: [{ studentId: studentIds[i] }, { examId: examIdObj }],
        })
          .populate({
            path: 'questionMcq',
            populate: { path: 'mcqId' },
            populate: { path: 'subjectId' },
          })
          .populate('examId')
      } catch (err) {
        return res.status(500).json('Problem when get exam data.')
      }

      let id = String(examData._id)
      let correctMarks = examData.examId.marksPerMcq
      let negativeMarks = examData.examId.negativeMarks
      let negativeMarksValue = (correctMarks * negativeMarks) / 100
      for (let j = 0; j < 4; j++) {
        let examDataMcq = examData.questionMcq[j].mcqId
        let answered = examData.mcqAnswer
        let notAnswered = 0
        let totalCorrectAnswer = 0
        let totalWrongAnswer = 0
        let totalObtainedMarks = 0
        let totalCorrectMarks = 0
        let totalWrongMarks = 0
        for (let p = 0; p < examDataMcq.length; p++) {
          if (answered[p] == '-1') {
            notAnswered = notAnswered + 1
          } else if (answered[p] == examDataMcq.mcqId[p].correctOption) {
            totalCorrectAnswer = totalCorrectAnswer + 1
          } else totalWrongAnswer = totalWrongAnswer + 1
        }
        totalCorrectMarks = totalCorrectAnswer * correctMarks
        totalWrongMarks = totalWrongAnswer * negativeMarksValue
        totalObtainedMarks = totalCorrectMarks - totalWrongMarks
        examData.questionMcq[j].totalCorrectMarks = totalCorrectMarks
        examData.questionMcq[j].totalWrongMarks = totalWrongMarks
        examData.questionMcq[j].mcqMarksPerSub = totalObtainedMarks
        examData.questionMcq[j].totalCorrectAnswer = totalCorrectAnswer
        examData.questionMcq[j].totalWrongAnswer = totalWrongAnswer
        examData.questionMcq[j].totalNotAnswered = notAnswered
        totalMarksMcq = totalMarksMcq + totalObtainedMarks
      }
      let result = null
      let upd = {
        questionMcq: examData.questionMcq,
        totalMarksMcq: totalMarksMcq,
        totalObtainedMarksMcq: totalMarksMcq,
      }
      try {
        result = await McqSpecialVsStudent.findByIdAndUpdate(id, upd)
      } catch (err) {
        return res.status(500).json('Problem when update total obtained marks.')
      }
    }
  }
  return res.status(201).json('Updated successfully.')
}
const updateRank = async (req, res, next) => {
  let examId = req.body.examId
  if (!ObjectId.isValid(examId)) return res.status(404).json('Invalid exam Id.')
  let examIdObj = new mongoose.Types.ObjectId(examId)
  let delData = null
  try {
    delData = await McqSpecialRank.find({ examId: examIdObj })
  } catch (err) {
    //console.log(err);
    return res.status(500).json('1.Something went wrong.')
  }
  if (delData.length > 0) {
    let deleteData = null
    try {
      deleteData = await McqSpecialRank.deleteMany({ examId: examIdObj })
    } catch (err) {
      return res.status(500).json('2.Something went wrong.')
    }
  }
  let ranks = null
  try {
    ranks = await McqSpecialVsStudent.find({ examId: examIdObj })
      .sort({
        totalObtainedMarks: -1,
      })
      .populate('studentId')
  } catch (err) {
    return res.status(500).json('3.Something went wrong.')
  }
  let examDetails = null
  try {
    examDetails = await McqSpecialExam.findOne({ _id: examIdObj })
  } catch (err) {
    return res.status(500).json('3.Something went wrong.')
  }
  let uniqueIds = []
  ranks = ranks.filter((element) => {
    const isDuplicate = uniqueIds.includes(element.studentId._id)

    if (!isDuplicate) {
      uniqueIds.push(element.studentId._id)
      return true
    }
    return false
  })
  //console.log("ranks:", ranks);
  let dataLength = ranks.length
  let dataIns = []
  for (let i = 0; i < dataLength; i++) {
    let dataFree = {}
    dataFree['examId'] = ranks[i].examId
    dataFree['studentId'] = ranks[i].studentId
    dataFree['totalObtainedMarks'] = ranks[i].totalObtainedMarks
    dataFree['totalMarksMcq'] = examDetails.totalMarksMcq
    dataFree['rank'] = i + 1
    dataIns.push(dataFree)
  }
  console.log('dataIns:', dataIns)
  let sav = null
  try {
    sav = await McqSpecialRank.insertMany(dataIns, { ordered: false })
  } catch (err) {
    return res.status(500).json('4.Something went wrong.')
  }
  return res.status(201).json('Success!')
}
const getRank = async (req, res, next) => {
  let examId = req.query.examId
  let studentId = req.query.studentId
  if (!ObjectId.isValid(examId) || !!ObjectId.isValid(studentId))
    return res.status(200).json('Invalid examId or mobileNo.')
  let examIdObj = new mongoose.Types.ObjectId(examId)
  let studentIdObj = new mongoose.Types.ObjectId(studentId)
  let resultRank = null
  try {
    resultRank = await McqSpecialRank.findOne({
      $and: [{ examId: examIdObj }, { studentId: studentIdObj }],
    }).select('rank -_id')
  } catch (err) {
    return res.status(500).json('Something went wrong.')
  }
  if (!resultRank) return res.status(404).json('Exam not finshed yet.')
  ////console.log(resultRank.rank);
  resultRank = Number(resultRank.rank)
  let data1 = {},
    getResult = null
  try {
    getResult = await McqSpecialVsStudent.findOne({
      $and: [{ examId: examIdObj }, { studentId: studentIdObj }],
    }).populate('examId studentId')
  } catch (err) {
    return res.status(500).json('Problem when get Student Exam info.')
  }
  let totalStudent = null
  try {
    totalStudent = await McqSpecialVsStudent.find({
      examId: examIdObj,
    }).count()
  } catch (err) {
    return res.status(500).json('Something went wrong.')
  }
  data1['name'] = getResult.studentId.name
  data1['mobileNo'] = getResult.studentId.mobileNo
  data1['institution'] = getResult.studentId.institution
  data1['rank'] = resultRank
  data1['totalStudent'] = totalStudent
  data1['examName'] = getResult.examId.name
  data1['startTime'] = moment(getResult.examId.startTime).format('LLL')
  data1['endTime'] = moment(getResult.examId.endTime).format('LLL')
  data1['examVariation'] = 'specialExam'
  data1['totalObtainedMarks'] = getResult.totalObtainedMarks
  data1['studExamStartTime'] = moment(getResult.startTimeMcq).format('LLL')
  data1['studExamEndTime'] = moment(getResult.endTimeMcq).format('LLL')
  data1['studExamTime'] = getResult.mcqDuration
  return res.status(200).json(data1)
}
const getAllRank = async (req, res, next) => {
  let examId = req.query.examId
  if (!ObjectId.isValid(examId)) return res.status(200).json('Invalid examId.')
  let examIdObj = new mongoose.Types.ObjectId(examId)
  let resultRank = null
  let examDetails = null ;
  
  try {
    examDetails = await McqSpecialExam.findOne({ _id: examIdObj })
  } catch (err) {
    return res.status(500).json('Exam Result is not generated yet.')
  }
  let totalMarks = examDetails.totalQuestionsMcq*examDetails.marksPerMcq;
  try {
    resultRank = await McqSpecialRank.find({ examId: examIdObj })
      .sort('rank')
      .populate('examId studentId')
  } catch (err) {
    return res.status(500).json('Something went wrong.')
  }
  if (!resultRank) return res.status(404).json('Exam not finshed yet.')
  ////console.log(resultRank);
  //eturn res.status(200).json(resultRank);
  let allData = []
  let totalStudent = null
  for (let i = 0; i < resultRank.length; i++) {
    let markData = null
    try {
      markData = await McqSpecialVsStudent.findOne({
        $and: [
          { examId: resultRank[i].examId._id },
          { studentId: resultRank[i].studentId._id },
        ],
      })
    } catch (err) {
      return res.status(500).json('something went wrong.')
    }
    let data1 = {}
    let conData = '*******'
    data1['examName'] = resultRank[i].examId.name
    data1['studentName'] = resultRank[i].studentId.name
    data1['mobileNoOrg'] = resultRank[i].studentId.mobileNo
    data1['mobileNo'] = conData.concat(
      resultRank[i].studentId.mobileNo.slice(7)
    )
    data1['institution'] = resultRank[i].studentId.institution
    data1['totalObtainedMarks'] = resultRank[i].totalObtainedMarks.toFixed(2)
    data1['rank'] = resultRank[i].rank
    data1['totalStudent'] = resultRank.length
    data1['totalMarks'] = totalMarks;
    allData.push(data1)
  }
  return res.status(200).json(allData)
}
const examCheckMiddleware = async (req, res, next) => {
  const examId = req.query.examId
  const studentId = req.user.studentId
  let examIdObj, studentIdObj
  studentIdObj = new mongoose.Types.ObjectId(studentId)
  examIdObj = new mongoose.Types.ObjectId(examId)
  let status = null
  let query = null
  let examEndTime = null
  let currentDate = moment(new Date())
  //console.log(currentDate, "current Date");
  try {
    query = await McqSpecialExam.findById(examId, 'endTime')
  } catch (err) {
    return res.status(500).json('1.Something went wrong.')
  }
  examEndTime = query.endTime
  if (moment(examEndTime) < moment(currentDate))
    return res.status(200).json('Exam ended')
  try {
    status = await McqSpecialVsStudent.findOne({
      $and: [{ studentId: studentIdObj }, { examId: examIdObj }],
    })
  } catch (err) {
    return res.status(500).json('2.Something went wrong.')
  }

  if (status == null) return res.status(200).json('Mcq assign')
  else {
    if (status.finishStatus == true && status.uploadStatus == true)
      return res.status(200).json('ended')
    if (status.finishStatus == true) return res.status(200).json('Mcq ended')
    return res.status(200).json('Mcq running')
  }
}

const updateAssignQuestion = async (req, res, next) => {
  let studentId = req.user.studentId
  let examId = req.body.examId
  let subjectId = req.body.subjectId
  let questionIndexNumber = Number(req.body.questionIndexNumber)
  let optionIndexNumber = Number(req.body.optionIndexNumber)
  //console.log(questionIndexNumber);
  //console.log(optionIndexNumber);
  studentId = new mongoose.Types.ObjectId(studentId)
  examId = new mongoose.Types.ObjectId(examId)
  subjectId = new mongoose.Types.ObjectId(subjectId)
  let result
  let studentCheck = null
  try {
    studentCheck = await McqSpecialVsStudent.findOne({
      $and: [{ examId: examId }, { studentId: studentId }],
    })
  } catch (err) {
    return res.status(500).json('Something went wrong.')
  }
  if (studentCheck.finishStatus == true)
    return res
      .status(200)
      .json(
        'Already Submitted from another device.You will be redirected to written exam within 5 seconds.'
      )
  let data = [],
    insertId,
    sIndex = 0
  insertId = studentCheck._id
  const noOfSubject = studentCheck.questionMcq.length
  for (let i = 0; i < noOfSubject; i++) {
    if (String(subjectId) == String(studentCheck.questionMcq[i].subjectId)) {
      data = studentCheck.questionMcq
      sIndex = i
      break
    }
  }
  // if (data[sIndex].mcqAnswer[questionIndexNumber] != -1)
  //   return res
  //     .status(200)
  //     .json(
  //       "Already rewrite the answer from another device.Please reload the page."
  //     );
  data[sIndex].mcqAnswer[questionIndexNumber] = optionIndexNumber
  let upd = { questionMcq: data }
  try {
    result = await McqSpecialVsStudent.findByIdAndUpdate(insertId, upd)
  } catch (err) {
    return res.status(500).json('cant save to db')
  }
  if (result) return res.status(201).json('Ok')
  else return res.status(201).json('Not updated.')
}

const slotAvailable = async (req, res, next) => {
  let numberOfSlotAvailable, mcqQData

  const { examId, setName, subjectId } = req.query
  let setName1 = parseInt(setName)

  let examDetails = {}

  try {
    examDetails = await McqSpecialExam.findOne({
      _id: new mongoose.Types.ObjectId(examId),
    })
  } catch (error) {
    return res.status(404).json('Problem with exam settings')
  }
  let numOfQuestions = null
  if (examDetails) {
    console.log(examDetails)
    for (let i = 0; i < examDetails.subjectInfo.length; i++) {
      if (String(examDetails.subjectInfo[i].subjectId) === subjectId) {
        numOfQuestions = examDetails.subjectInfo[i].noOfQuestionsMcq
      }
    }
    for (let i = 0; i < examDetails.questionMcq.length; i++) {
      if (String(examDetails.questionMcq[i].subjectId) === subjectId) {
        for (
          let j = 0;
          j < examDetails.questionMcq[i].mcqQuestions.length;
          j++
        ) {
          if (
            examDetails.questionMcq[i].mcqQuestions[j].setName ===
            Number(setName)
          ) {
            numberOfSlotAvailable =
              numOfQuestions -
              examDetails.questionMcq[i].mcqQuestions[j].mcqIds.length
          }
        }
      }
    }
  }
  if (numberOfSlotAvailable < 0) {
    return res.status(500).json('Operational error! Please check all questions')
  } else {
    return res.status(200).json({ slots: numberOfSlotAvailable })
  }
}
const questionByExamIdSubjectAndSet = async (req, res, next) => {
  const { examId, subjectId } = req.query
  const setName = Number(req.query.setName)

  if (!ObjectId.isValid(examId) || !ObjectId.isValid(subjectId))
    return res.status(404).json('exam Id is not valid.')
  const examIdObj = new mongoose.Types.ObjectId(examId)
  const subjectIdIdObj = new mongoose.Types.ObjectId(subjectId)
  let queryResult = null

  try {
    queryResult = await McqSpecialExam.findById(examId)
  } catch (err) {
    return res.status(500).json(err)
  }
  queryResult = queryResult.questionMcq
  let mcqId = []
  for (let i = 0; i < queryResult.length; i++) {
    if (subjectId == String(queryResult[i].subjectId)) {
      for (let j = 0; j < queryResult[i].mcqQuestions.length; j++) {
        if (queryResult[i].mcqQuestions[j].setName === setName) {
          mcqId = queryResult[i].mcqQuestions[j].mcqIds
          break
        }
      }
    }
  }
  mcqId = mcqId.map((e) => new mongoose.Types.ObjectId(e))
  let quesData = []
  try {
    quesData = await QuestionsMcq.find({
      $and: [{ _id: { $in: mcqId } }, { status: true }],
    })
  } catch (err) {
    return res.status(500).json(err)
  }
  let resultAll = []
  for (let i = 0; i < quesData.length; i++) {
    let result = {}
    // if (queryResult.mId[i] == null) continue;
    result['type'] = quesData[i].type
    result['question'] = quesData[i].question
    result['options'] = quesData[i].options
    result['correctOption'] = quesData[i].correctOption
    result['explanation'] = quesData[i].explanationILink
    result['questionId'] = quesData[i]._id
    result['status'] = quesData[i].status
    resultAll.push(result)
  }
  // resultAll.push({ totalQuestion: queryResult.mId.length });
  // resultAll.push({ examId: String(queryResult.eId) });
  return res.status(200).json(resultAll)
}
const publishExam = async (req, res, next) => {
  let examId = req.body.examId
  if (!ObjectId.isValid(examId)) {
    return res.status(404).json('Exam Id is not valid.')
  }
  let examIdObj = new mongoose.Types.ObjectId(examId)
  let upd = null
  try {
    upd = await McqSpecialExam.findByIdAndUpdate(examId, {
      publishStatus: true,
    })
  } catch (err) {
    return res.status(500).json('1.Something went wrong.')
  }
  let upd1 = null
  try {
    upd1 = await McqSpecialVsStudent.updateMany(
      { examId: examIdObj },
      {
        publishStatus: true,
        runningStatus: false,
        finishStatus: true,
      }
    )
  } catch (err) {
    return res.status(500).json('2.Something went wrong.')
  }
  let dataStud = null
  try {
    dataStud = await McqSpecialVsStudent.find({
      $and: [{ examId: examIdObj }, { publishStatus: true }],
    })
  } catch (err) {
    return res.status(500).json('3.Something went wrong.')
  }

  return res.status(201).json('successfully!')
}
exports.slotAvailable = slotAvailable
exports.assignQuestionMcqWithoutOptional = assignQuestionMcqWithoutOptional
exports.getExamSubjects = getExamSubjects
exports.submitAnswer = submitAnswer
exports.publishExam = publishExam
exports.refillQuestion = refillQuestion
exports.questionByExamIdSubjectAndSet = questionByExamIdSubjectAndSet
exports.getRunningDataMcq = getRunningDataMcq
exports.assignQuestionMcq = assignQuestionMcq
exports.examCheckMiddleware = examCheckMiddleware
exports.updateExamPhoto = updateExamPhoto
exports.getAllRank = getAllRank
exports.getRank = getRank
exports.updateRank = updateRank
exports.updateStudentExamInfo = updateStudentExamInfo
exports.getCombination = getCombination
exports.getOptionalSubects = getOptionalSubects
exports.historyData = historyData
exports.viewSollutionMcqAdmin = viewSollutionMcqAdmin
exports.showSpecialExamByIdStudentAdmin = showSpecialExamByIdStudentAdmin
exports.showSpecialExamByIdStudent = showSpecialExamByIdStudent
exports.deactivateSpecialExam = deactivateSpecialExam
exports.showMcqSpecialExamByCourse = showMcqSpecialExamByCourse
exports.createSpecialMcqExam = createSpecialMcqExam
exports.updateSpecialExam = updateSpecialExam
exports.showSpecialExamById = showSpecialExamById
exports.updateAssignQuestion = updateAssignQuestion
exports.studentSubmittedExamDetail = studentSubmittedExamDetail
exports.specialGetHistoryFilter = specialGetHistoryFilter
// exports.updateWrittenMinus = updateWrittenMinus;
// exports.specialGetHistoryAdmin = specialGetHistoryAdmin;
exports.specialGetHistory = specialGetHistory
// exports.marksCalculationAdmin = marksCalculationAdmin;
// exports.checkScriptSingleAdmin = checkScriptSingleAdmin;
// exports.getRecheckStudentDataAdmin = getRecheckStudentDataAdmin;
// exports.statusUpdate = statusUpdate;
// exports.getStudentDataAdmin = getStudentDataAdmin;
// exports.getWrittenStudentSingleByExamAdmin = getWrittenStudentSingleByExamAdmin;
// exports.getWrittenStudentSingleByExam = getWrittenStudentSingleByExam;
// exports.updateRank = updateRank;
// exports.getRank = getRank;
// exports.getAllRank = getAllRank;
// exports.publishExam = publishExam;
// exports.marksCalculation = marksCalculation;
// exports.checkScriptSingle = checkScriptSingle;
// exports.getWrittenScriptSingle = getWrittenScriptSingle;
// exports.getRecheckStudentData = getRecheckStudentData;
// exports.getStudentData = getStudentData;
// exports.updateStudentExamInfo = updateStudentExamInfo;
// exports.assignStudentToTeacher = assignStudentToTeacher;
// exports.showSpecialExamByIdStudent = showSpecialExamByIdStudent;
// exports.historyData = historyData;
// exports.viewSollutionWrittenAdmin = viewSollutionWrittenAdmin;
// exports.viewSollutionMcqAdmin = viewSollutionMcqAdmin;
// exports.viewSollutionWritten = viewSollutionWritten;
exports.viewSollutionMcq = viewSollutionMcq
// exports.submitAnswerMcq = submitAnswerMcq;
// exports.submitWritten = submitWritten;
// exports.submitStudentScript = submitStudentScript;
// exports.ruunningWritten = ruunningWritten;
// exports.getRunningDataMcq = getRunningDataMcq;
// exports.assignQuestionWritten = assignQuestionWritten;
// exports.assignQuestionMcq = assignQuestionMcq;
// exports.getCombination = getCombination;
// exports.getOptionalSubects = getOptionalSubects;
// exports.examCheckMiddleware = examCheckMiddleware;
// exports.addQuestionWritten = addQuestionWritten;
exports.questionByExamSub = questionByExamSub
exports.addQuestionMcqBulk = addQuestionMcqBulk
exports.examRuleSet = examRuleSet
exports.examRuleGet = examRuleGet
exports.examRuleGetAll = examRuleGetAll
exports.addQuestionMcq = addQuestionMcq
// exports.showSpecialExamByCourse = showSpecialExamByCourse;
// exports.createSpecialExam = createSpecialExam;
// exports.updateSpecialExam = updateSpecialExam;
// exports.showSpecialExamById = showSpecialExamById;
// exports.showSpecialExamAll = showSpecialExamAll;
// exports.deactivateSpecialExam = deactivateSpecialExam;
// exports.getWrittenQuestionByExamSub = getWrittenQuestionByExamSub;
// exports.specialGetHistoryAdminFilter = specialGetHistoryAdminFilter;
// exports.showSpecialExamByIdStudentAdmin = showSpecialExamByIdStudentAdmin;
