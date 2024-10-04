const express = require('express')
const authorize = require('../utilities/authorizationMiddleware')
const passport = require('passport')

const {
    add
} =require('../controller/remark-controller')

const router = express.Router()

router.post(
    '/add',
    [
    passport.authenticate('jwt', { session: false }),
    authorize(['student', 'superadmin', 'moderator', 'teacher']),
    ],
    add
  )


  module.exports = router