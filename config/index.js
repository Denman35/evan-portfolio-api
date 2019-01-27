const AWS = require('aws-sdk');
const MongoClient = require('mongodb').MongoClient;

// Initialization steps
const initialize = () => {
  require('dotenv').config();

  AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY,
  });
};

module.exports = {
  initialize,
};
