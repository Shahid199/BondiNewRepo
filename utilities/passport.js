const passport = require('passport')
const User = require('../model/User');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;

const options = {
  "jwtFromRequest": ExtractJwt.fromAuthHeaderAsBearerToken(),
  "secretOrKey": process.env.SALT
}
passport.use(new JwtStrategy(options, async (payload, done) => {
  try {
    const user = await User.findById({ _id: payload.id }, { password: 0 }).exec();
    if (user) {
      return done(null, user);
    } else {
      return done(null, false);
    }
  } catch (error) {
    return done(error, false);
  }
}));