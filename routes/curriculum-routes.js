const express = require('express')
const {
  createCurriculum,
  getCurriculums,
  updateCurriculum,
  removeCurriculum,
} = require('../controller/curriculum-controller')
const authorize = require('../utilities/authorizationMiddleware')
const passport = require('passport')
const router = express.Router()

router.post(
  '/createcurriculum',
  [
    passport.authenticate('jwt', { session: false }),
    authorize(['superadmin', 'mdoerator', 'student']),
  ],
  createCurriculum
)
router.get(
  '/getcurriculums',
  [
    passport.authenticate('jwt', { session: false }),
    authorize(['superadmin', 'mdoerator', 'student']),
  ],
  getCurriculums
)
router.post('/updatecurriculum', updateCurriculum)
router.post('/removecurriculum', removeCurriculum)

module.exports = router
