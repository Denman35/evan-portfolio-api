const AWS = require('aws-sdk');

const { getDbClient } = require('../../config/db');
const PHOTO_COLLECTION = 'photos';

const mimeMap = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
};

const uploadS3 = (buffer, id, size, mimetype) => {
  if (!(mimetype in mimeMap)) {
    return Promise.reject(`Unrecognized MIME type: ${mimetype}`);
  }

  const s3 = new AWS.S3();
  const Key = `${id}-${size}.${mimeMap[mimetype]}`;
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

const createRecord = (metadata, links, widths) => {
  const images = links.map((x, i) => ({ url: x, width: widths[i] }));
  return getDbClient()
    .then(client => {
      const db = client.db();
      const collection = db.collection(PHOTO_COLLECTION);
      return collection.insertOne({
        title: metadata.title,
        location: metadata.location,
        description: metadata.description,
        images,
        createdat: new Date(),
      });
    });
}

const getPhotos = (limit, skip) => {
  return getDbClient()
    .then(client => {
      const db = client.db();
      const collection = db.collection(PHOTO_COLLECTION);
      return collection.find({}, {
        sort: [['createdat', -1]],
        limit,
        skip,
      }).toArray();
    });
}

module.exports = {
  createRecord,
  getPhotos,
  uploadS3,
};
