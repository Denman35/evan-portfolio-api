const express = require('express');;
const multer  = require('multer');
const uuidv1 = require('uuid/v1');

const router = express.Router();
const upload = multer();

const { ensureAuth } = require('../middlewares/auth');

const { getFeatured, uploadFeatureS3, createRecord } = require('../models/Features');

router.get('/', function(req, res, next) {
  getFeatured()
    .then(featured => res.json(featured))
    .catch(err => next(err));
});

router.post('/upload', ensureAuth, upload.single('image'), (req, res, next) => {
  const { buffer } = req.file;
  const s3key = uuidv1();

  uploadFeatureS3(buffer, s3key, req.file.mimetype)
    .then(link => createRecord(req.body.ref, link))
    .then(() => res.json({ success: true }))
    .catch(err => next(err));
});

module.exports = router;
