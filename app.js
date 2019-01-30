const express = require('express');
const cors = require('cors');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const passport = require('passport');
const path = require('path');

const { mongoOptions } = require('./config/db');
const indexRouter = require('./routes/index');
const portfolioRouter = require('./routes/portfolio');
const featuredRouter = require('./routes/featured');
const userRouter = require('./routes/user');

const app = express();

app.use(cors(require('./config/cors')));
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: process.env.SECRET,
  store: new MongoStore(mongoOptions),
  saveUninitialized: false,
  resave: false,
}));
app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) => {
  console.log(req.cookies);
  next();
})

app.use('/', indexRouter);
app.use('/portfolio', portfolioRouter);
app.use('/featured', featuredRouter);
app.use('/user', userRouter);

module.exports = app;
