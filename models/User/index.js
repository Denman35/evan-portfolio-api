const AWS = require('aws-sdk');
const bcrypt = require('bcryptjs');
const ObjectID = require('mongodb').ObjectID;

const { getDbClient, closeClient } = require('../../config/db');

const SALT_ROUNDS = 4;
const USER_COLLECTION = 'users';

const createUser = (username, password) => {
  const hashPassword = new Promise((resolve, reject) => {
    bcrypt.genSalt(SALT_ROUNDS, (err, salt) => {
      if (err) { return reject(err); }
      bcrypt.hash(password, salt, (err, hash) => {
        if (err) { return reject(err); }
        resolve(hash);
      });
    });
  });
  const dbClient = getDbClient();
  return Promise.all([hashPassword, dbClient])
    .then(arr => {
      const hashed = arr[0];
      const client = arr[1];

      const db = client.db();
      const collection = db.collection(USER_COLLECTION);
      return collection.insertOne({
        username,
        hashedPassword: hashed,
        createdat: new Date(),
      }).then(closeClient(client));
    });
}

const isEmpty = () => {
  return getDbClient()
    .then(client => {
      const db = client.db();
      const collection = db.collection(USER_COLLECTION);
      return collection.findOne({})
        .then(closeClient(client))
        .then(res => res === null);
    });
}

const findUser = (id) => {
  return getDbClient()
    .then(client => {
      const db = client.db();
      const collection = db.collection(USER_COLLECTION);
      return collection.findOne({ _id: new ObjectID(id) })
        .then(closeClient(client));
    });
}

const authenticate = (username, password) => {
  return getDbClient()
    .then(client => {
      const db = client.db();
      const collection = db.collection(USER_COLLECTION);
      return collection.findOne({ username })
        .then(user => {
          if (user === null) throw new Error('User does not exist');
          return bcrypt.compare(password, user.hashedPassword)
            .then(res => {
              if (res) return user;
              throw new Error('Mismatched password');
            });
        })
        .then(closeClient(client))
    });
}

module.exports = {
  createUser,
  isEmpty,
  findUser,
  authenticate,
};
