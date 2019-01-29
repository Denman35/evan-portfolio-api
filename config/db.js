const MongoClient = require('mongodb').MongoClient;

const closeClient = (client) => (x) => {
  client.close();
  return Promise.resolve(x);
}

module.exports = {
  getDbClient: () => MongoClient.connect(process.env.MONGO_URI, { useNewUrlParser: true }),
  closeClient,
};
