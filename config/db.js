const MongoClient = require('mongodb').MongoClient;

let CONFIG = {};

const LOCAL_CONFIG = {
  url: 'mongodb://localhost:27017',
  db: 'portfolio',
};

if (process.env.NODE_ENV === 'development') {
  CONFIG = LOCAL_CONFIG;
}

module.exports = {
  getDbClient: () => MongoClient.connect(`${CONFIG.url}/${CONFIG.db}`, { useNewUrlParser: true }),
};
