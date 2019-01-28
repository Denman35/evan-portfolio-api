const ObjectID = require('mongodb').ObjectID;

const { getDbClient } = require('../../config/db');
const PHOTO_COLLECTION = 'photos';
const FEATURE_COLLECTION = 'featured';

const getFeatured = () => {
  return getDbClient()
    .then(client => {
      // TODO: FIXME
      const db = client.db();
      // const featureCollection = db.collection(FEATURE_COLLECTION);
      const photoCollection = db.collection(PHOTO_COLLECTION);
      return photoCollection.find({}, { limit: 5 }).toArray();
    });
}

module.exports = {
  getFeatured,
};
