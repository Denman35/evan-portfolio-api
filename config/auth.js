const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

const { authenticate, findUser } = require('../models/User');

passport.use(new LocalStrategy({ session: true }, (username, password, done) => {
  authenticate(username, password)
    .then(user => {
      done(null, user);
    })
    .catch((err) => {
      done(null, false);
    });
}));

passport.serializeUser((user, done) => {
  done(null, user._id.toString());
});

passport.deserializeUser((id, done) => {
  findUser(id)
    .then(user => { done(null, user); })
    .catch(err => done(err, null));
});
