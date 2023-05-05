const passport = require('passport')
const Student = require('../model/Student');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;

const options = {
  "jwtFromRequest": ExtractJwt.fromAuthHeaderAsBearerToken(),
  "secretOrKey": process.env.SALT
}
passport.use(new JwtStrategy(options, async (payload, done) => {
  try {
    // const user = await Student.findById({ _id: payload.studentId }).exec();
    // if (user) {
    //   return done(null, user);
    // } else {
    //   return done(null, false);
    // }

    return done(null,payload);
  } catch (error) {
    return done(error, false);
  }
}));