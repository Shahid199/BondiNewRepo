const express = require('express')
const authorize = require('../utilities/authorizationMiddleware')
const passport = require('passport')
const { upload } = require('../utilities/multer')
const { upload1 } = require('../utilities/multer_questions')
const {
  createBothExam,
  updateBothExam,
  deactivateBothExam,
  getBothExamBySubject,
  getBothExamById,
  bothExamRuleSet,
  bothExamRuleGet,
  bothExamRuleGetAll,
  bothAddQuestionMcqBulk,
  bothAddQuestionMcq,
  bothGetMcqQuestionByExamId,
  bothAddQuestionWritten,
  bothQuestionByExamId,
  updateBothExamPhoto,
  questionByExamIdAndSet,
  slotAvailable,
  refillQuestion,
  updateBothStudentMarks,
  addTextQuestion,
  updateQuestionStatus,
  getStudentExamDetails
} = require('../controller/both-controller')
const router = express.Router()

// router.get('/updateresult', updateBothStudentMarks)

router.post(
  '/createbothexam',
  [
    passport.authenticate('jwt', { session: false }),
    authorize(),
    upload.single('iLink'),
  ],
  createBothExam
)
router.get(
  '/getexamsingle',
  [
    passport.authenticate('jwt', { session: false }),
    authorize(['student', 'superadmin', 'moderator', 'teacher'])
  ],
  getStudentExamDetails
)
router.put(
  "/updatequestionstatus",
  [passport.authenticate("jwt", { session: false }), authorize()],
  updateQuestionStatus
);
router.post(
  '/updateBothExamPhoto',
  [
    passport.authenticate('jwt', { session: false }),
    authorize(),
    upload.single('iLink'),
  ],
  updateBothExamPhoto
)
router.put(
  '/updatebothexam',
  [
    passport.authenticate('jwt', { session: false }),
    authorize(),
    upload.single('iLink'),
  ],
  updateBothExam
)
router.put(
  '/deactivatebothexam',
  [passport.authenticate('jwt', { session: false }), authorize()],
  deactivateBothExam
)

router.get(
  '/slotAvailable',
  [
    passport.authenticate('jwt', { session: false }),
    authorize(['student', 'superadmin', 'moderator', 'teacher']),
  ],
  //authorize(["student"]),
  slotAvailable
)
router.get(
  '/getbothexambysubject',
  [
    passport.authenticate('jwt', { session: false }),
    authorize(['student', 'superadmin', 'moderator', 'teacher']),
  ],
  //authorize(["student"]),
  getBothExamBySubject
)
router.get(
  '/questionByExamIdAndSet',
  [
    passport.authenticate('jwt', { session: false }),
    authorize(['superadmin', 'moderator', 'student']),
  ],
  questionByExamIdAndSet
)

router.get(
  '/getbothexambyid',
  [
    passport.authenticate('jwt', { session: false }),
    authorize(['superadmin', 'moderator', 'student']),
  ],
  getBothExamById
)
//exam rule
router.post(
  '/bothexamruleset',
  [
    passport.authenticate('jwt', { session: false }),
    authorize(),
    upload.single('ruleILink'),
  ],
  bothExamRuleSet
)
router.get(
  '/bothexamruleget',
  [passport.authenticate('jwt', { session: false })],
  authorize(['superadmin', 'moderator', 'student', 'freeStudent']),
  bothExamRuleGet
)
router.get(
  '/bothexamrulegetall',
  [
    passport.authenticate('jwt', { session: false }),
    authorize(['superadmin', 'moderator']),
  ],
  bothExamRuleGetAll
)
router.post(
  "/addTextQuestion",
  [
    passport.authenticate("jwt", { session: false }),
    authorize(),
  ],
  addTextQuestion
);
router.put(
  '/bothaddquestionmcqbulk',
  [passport.authenticate('jwt', { session: false }), authorize()],
  bothAddQuestionMcqBulk
)
router.post(
  '/bothaddquestionmcq',
  [
    passport.authenticate('jwt', { session: false }),
    authorize(),
    upload1.single('iLink'),
  ],
  bothAddQuestionMcq
)
router.get(
  '/bothgetmcqquestionbyexamid',
  [
    passport.authenticate('jwt', { session: false }),
    authorize(['superadmin', 'moderator']),
  ],
  bothGetMcqQuestionByExamId
)
router.post(
  '/bothaddquestionwritten',
  [
    passport.authenticate('jwt', { session: false }),
    authorize(),
    upload1.fields([{ name: 'questionILink', maxCount: 1 }]),
  ],
  bothAddQuestionWritten
)

router.get(
  '/bothquestionbyexamid',
  [passport.authenticate('jwt', { session: false }), authorize()],
  bothQuestionByExamId
)
router.post(
  '/refillquestion',
  [
    passport.authenticate('jwt', { session: false }),
    authorize(['superadmin', 'moderator']),
  ],
  refillQuestion
)
module.exports = router
