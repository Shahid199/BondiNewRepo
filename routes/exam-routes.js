const express = require('express');
const { upload } = require('../utilities/multer');
const { upload1 } = require('../utilities/multer_questions');
const passport = require('passport');
const authorize = require('../utilities/authorizationMiddleware');
const {
  createExam,
  getAllExam,
  addQuestionMcq,
  addQuestionWritten,
  getExamBySubject,
  getExamBySub,
  examRuleSet,
  examRuleGet,
  examRuleGetAll,
  examByCourseSubject,
  getExamById,
  questionByExamId,
  updateQuestionStatus,
  updateExam,
  addQuestionMcqBulk,
  deactivateExam,
  freeExamStatus,
  getExamType,
  assignTeacher,
  assignStudentToTeacher,
  removeQuestionWritten,
  freeCourseSub,
  getWrittenQuestionByexam,
  getMcqBySub,
  getWrittenBySub,
  bothAssignStudentToTeacher,
  getExamBySubQuestion,
  getExamBySubWritten,
  getExamBySubAdmin,
  resetExam,
  columnAdd,
  downloadExamImage,
  uploadSollution,
  getSollution,
  updateExamPhoto,
  questionByExamIdAndSet,
  getAllData,
  slotAvailable,
  refillQuestion,
  changeCorrectAnswer,
  calculateMarks,
  addTextQuestion,
  leaderboard,
  examByCourse,
  columnAdd11,
  updateQuestion,
  studentUpdate,
} = require('../controller/exam-controller');
const router = express.Router();

router.get('/studentUpdate', studentUpdate);
router.post(
  '/createexam',
  [
    passport.authenticate('jwt', { session: false }),
    authorize(),
    upload.single('iLink'),
  ],
  createExam,
);
router.post(
  '/addTextQuestion',
  [passport.authenticate('jwt', { session: false }), authorize()],
  addTextQuestion,
);
router.post(
  '/changeanswer',
  [
    passport.authenticate('jwt', { session: false }),
    authorize(),
    upload.single('iLink'),
  ],
  changeCorrectAnswer,
);
router.get(
  '/slotAvailable',
  [
    passport.authenticate('jwt', { session: false }),
    authorize(['superadmin', 'mdoerator', 'student']),
  ],
  slotAvailable,
);
router.get(
  '/leaderboard',
  [
    passport.authenticate('jwt', { session: false }),
    authorize(['superadmin', 'mdoerator', 'student']),
  ],
  leaderboard,
);
router.get(
  '/exambycourse',
  [
    passport.authenticate('jwt', { session: false }),
    authorize(['superadmin', 'student']),
  ],
  examByCourse,
);
router.get(
  '/getallexam',
  [
    passport.authenticate('jwt', { session: false }),
    authorize(['superadmin', 'mdoerator', 'student']),
  ],
  getAllExam,
);
router.get(
  '/getAllData',
  [
    passport.authenticate('jwt', { session: false }),
    authorize(['superadmin', 'mdoerator', 'student']),
  ],
  getAllData,
);
router.get(
  '/questionByExamIdAndSet',
  [
    passport.authenticate('jwt', { session: false }),
    authorize(['superadmin', 'mdoerator', 'student']),
  ],
  questionByExamIdAndSet,
);
router.post(
  '/addquestionmcq',
  [
    passport.authenticate('jwt', { session: false }),
    authorize(),
    upload1.single('iLink'),
  ],
  addQuestionMcq,
);
router.get(
  '/getexambysubject',
  [
    passport.authenticate('jwt', { session: false }),
    authorize(['student', 'superadmin', 'moderator']),
  ],
  //authorize(["student"]),
  getExamBySubject,
);

router.get(
  '/getexambysub',
  [
    passport.authenticate('jwt', { session: false }),
    authorize(['superadmin', 'moderator', 'student', 'teacher']),
  ],
  getExamBySub,
);
router.get(
  '/getexambysubadmin',
  [
    passport.authenticate('jwt', { session: false }),
    authorize(['superadmin', 'moderator', 'student', 'teacher']),
  ],
  getExamBySubAdmin,
);
router.get(
  '/getexambysubwritten',
  [
    passport.authenticate('jwt', { session: false }),
    authorize(['superadmin', 'moderator', 'student', 'teacher']),
  ],
  getExamBySubWritten,
);
router.get(
  '/getexambysubquestion',
  [
    passport.authenticate('jwt', { session: false }),
    authorize(['superadmin', 'moderator', 'student', 'teacher']),
  ],
  getExamBySubQuestion,
);
router.get(
  '/getmcqbysub',
  [
    passport.authenticate('jwt', { session: false }),
    authorize(['superadmin', 'moderator', 'student']),
  ],
  getMcqBySub,
);
router.get(
  '/getwrittenbysub',
  [
    passport.authenticate('jwt', { session: false }),
    authorize(['superadmin', 'moderator', 'student']),
  ],
  getWrittenBySub,
);
router.post(
  '/examruleset',
  [
    passport.authenticate('jwt', { session: false }),
    authorize(),
    upload.single('ruleILink'),
  ],
  examRuleSet,
);
router.get(
  '/examruleget',
  [passport.authenticate('jwt', { session: false })],
  authorize(['superadmin', 'moderator', 'student', 'freeStudent']),
  examRuleGet,
);
router.get(
  '/examrulegetall',
  [
    passport.authenticate('jwt', { session: false }),
    authorize(['superadmin', 'moderator', 'student']),
  ],
  examRuleGetAll,
);
router.get(
  '/exambycoursesubject',
  [
    passport.authenticate('jwt', { session: false }),
    authorize(['superadmin', 'moderator', 'student']),
  ],
  examByCourseSubject,
);
router.get(
  '/getexambyid',
  [
    passport.authenticate('jwt', { session: false }),
    authorize(['superadmin', 'moderator', 'student']),
  ],
  getExamById,
);
router.get(
  '/questionbyexamid',
  [passport.authenticate('jwt', { session: false }), authorize()],
  questionByExamId,
);
router.put(
  '/updatequestionstatus',
  [passport.authenticate('jwt', { session: false }), authorize()],
  updateQuestionStatus,
);
router.post(
  '/updateQuestion',
  [passport.authenticate('jwt', { session: false }), authorize()],
  updateQuestion,
);
router.put(
  '/updateexam',
  [
    passport.authenticate('jwt', { session: false }),
    authorize(),
    upload.single('iLink'),
  ],
  updateExam,
);
router.put(
  '/addquestionmcqbulk',
  [passport.authenticate('jwt', { session: false }), authorize()],
  addQuestionMcqBulk,
);
router.put(
  '/deactivateexam',
  [passport.authenticate('jwt', { session: false }), authorize()],
  deactivateExam,
);

router.get(
  '/freeexamstatus',
  [
    passport.authenticate('jwt', { session: false }),
    authorize(['superadmin', 'moderator', 'freeStudent']),
  ],
  freeExamStatus,
);
router.get(
  '/getexamtype',
  [
    passport.authenticate('jwt', { session: false }),
    authorize(['superadmin', 'moderator']),
  ],
  getExamType,
);
router.get(
  '/freecoursesub',
  [
    passport.authenticate('jwt', { session: false }),
    authorize(['superadmin', 'moderator']),
  ],
  freeCourseSub,
);

//written routes
router.post(
  '/addquestionwritten',
  [
    passport.authenticate('jwt', { session: false }),
    authorize(),
    upload1.fields([{ name: 'questionILink', maxCount: 1 }]),
  ],
  addQuestionWritten,
);

router.post(
  '/removequestionwritten',
  [
    passport.authenticate('jwt', { session: false }),
    authorize(['superadmin', 'moderator']),
  ],
  removeQuestionWritten,
);
router.get(
  '/getwrittenquestionbyexam',
  [
    passport.authenticate('jwt', { session: false }),
    authorize(['superadmin', 'moderator', 'student', 'teacher']),
  ],
  getWrittenQuestionByexam,
);

router.post(
  '/assignteacher',
  [
    passport.authenticate('jwt', { session: false }),
    authorize(['superadmin', 'moderator']),
  ],
  assignTeacher,
);
router.post(
  '/assignstudenttoteacher',
  [
    passport.authenticate('jwt', { session: false }),
    authorize(['superadmin', 'moderator']),
  ],
  assignStudentToTeacher,
);
router.post(
  '/bothassignstudenttoteacher',
  [
    passport.authenticate('jwt', { session: false }),
    authorize(['superadmin', 'moderator']),
  ],
  bothAssignStudentToTeacher,
);
router.post(
  '/resetexam',
  [
    passport.authenticate('jwt', { session: false }),
    authorize(['superadmin', 'moderator']),
  ],
  resetExam,
);
router.post(
  '/updateExamPhoto',
  [
    passport.authenticate('jwt', { session: false }),
    authorize(),
    upload.single('iLink'),
  ],
  updateExamPhoto,
); //afser

router.get('/columnadd', columnAdd);
// router.get("/columnstudentadd", columnAdd11);

router.post('/downloadimage', downloadExamImage);
router.post('/uploadsollution', uploadSollution);
router.get('/getsollution', getSollution);
router.post(
  '/refillquestion',
  [
    passport.authenticate('jwt', { session: false }),
    authorize(['superadmin', 'moderator']),
  ],
  refillQuestion,
);
router.post(
  '/calculatemartks',
  // [
  //   passport.authenticate("jwt", { session: false }),
  //   authorize(["superadmin", "moderator"]),
  // ],
  calculateMarks,
);
module.exports = router;
