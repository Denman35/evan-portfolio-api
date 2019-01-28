const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const path = require('path');

const corsConfig = require('./config/cors');
const indexRouter = require('./routes/index');
const portfolioRouter = require('./routes/portfolio');
const featuredRouter = require('./routes/featured');

const app = express();

app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/portfolio', portfolioRouter);
app.use('/featured', featuredRouter);

module.exports = app;
