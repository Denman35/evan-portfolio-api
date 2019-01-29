const AWS = require('aws-sdk');
const ObjectID = require('mongodb').ObjectID;

const { mimeMap } = require('../Photo');
const { getDbClient, closeClient } = require('../../config/db');
const PHOTO_COLLECTION = 'photos';
const FEATURE_COLLECTION = 'featured';

const getFeatured = () => {
  return getDbClient()
    .then(client => {
      const db = client.db();
      const featureCollection = db.collection(FEATURE_COLLECTION);
      return featureCollection.find({}).toArray().then(closeClient(client));
    });
}

const uploadFeatureS3 = (buffer, s3key, mimetype) => {
  if (!(mimetype in mimeMap)) {
    return Promise.reject(`Unrecognized MIME type: ${mimetype}`);
  }

  const s3 = new AWS.S3();
  const Key = `${s3key}-FEAT.${mimeMap[mimetype]}`;
  return new Promise((resolve, reject) => {
    s3.putObject({
      Bucket: process.env.AWS_BUCKET,
      Key,
      Body: buffer,
      ContentType: mimetype,
    }, (err, data) => {
      if (err) return reject(err);
      resolve(`https://${process.env.AWS_BUCKET}.s3.amazonaws.com/${Key}`);
    });
  });
}

const createRecord = (ref, url) => {
  return getDbClient()
    .then(client => {
      const db = client.db();
      const collection = db.collection(FEATURE_COLLECTION);
      return collection.insertOne({ ref: new ObjectID(ref), url, }).then(closeClient(client));
    });
}

module.exports = {
  getFeatured,
  uploadFeatureS3,
  createRecord,
};
