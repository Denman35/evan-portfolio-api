const AWS = require('aws-sdk');
const ObjectID = require('mongodb').ObjectID;

const { getDbClient, closeClient } = require('../../config/db');
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

const createRecord = (metadata, links, img) => {
  const images = links.map((x, i) => ({
    url: x,
    width: img[i].width,
    height: img[i].height,
  }));
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
      }).then(closeClient(client));
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
      }).toArray().then(closeClient(client));
    });
}

const getPhotoById = (id) => {
  return getDbClient()
    .then(client => {
      const db = client.db();
      const collection = db.collection(PHOTO_COLLECTION);

      const objID = new ObjectID(id);
      const find = collection.findOne({ _id: objID });
      const next = collection.find({ _id: { '$lt': objID }}, {
        sort: [['_id', -1]],
        limit: 1,
        projection: { _id: 1 },
      }).toArray();
      const prev = collection.find({ _id: { '$gt': objID }}, {
        sort: [['_id', 1]],
        limit: 1,
        projection: { _id: 1 },
      }).toArray();

      return Promise.all([find, prev, next]).then(closeClient(client));
    });
}

module.exports = {
  createRecord,
  getPhotos,
  getPhotoById,
  uploadS3,
  mimeMap,
};
