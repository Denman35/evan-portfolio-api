const express = require('express');
const multer  = require('multer');
const uuidv1 = require('uuid/v1');

const router = express.Router();
const upload = multer();

const { breakpoints } = require('../config/image');
const { resizePhoto, getPhotoWidth } = require('../controllers/Photo');
const { uploadS3, createRecord, getPhotos } = require('../models/Photo');

router.get('/', function(req, res, next) {
  let { limit, skip } = req.query;
  limit = parseInt(limit, 10);
  skip = parseInt(skip, 10);
  if (isNaN(limit)) { limit = 0; }
  if (isNaN(skip)) { skip = 0; }

  getPhotos(limit, skip)
    .then(photos => res.json({ photos: photos }))
    .catch(err => next(err));
});

router.get('/:id', function(req, res, next) {
  res.json({ id: req.params.id });
});

router.post('/upload', upload.single('image'), (req, res, next) => {
  const { buffer } = req.file;
  const jobs = [];
  const widths = [];
  const id = uuidv1();
  breakpoints.forEach(b => {
    const resizeJob = resizePhoto(buffer, b.width);
    const uploadJob = resizeJob.then(buffer => uploadS3(buffer, id, b.size, req.file.mimetype));
    jobs.push(uploadJob);
    widths.push(b.width);
  });
  const og = getPhotoWidth(buffer)
    .then(width => {
      widths.push(width);
      return uploadS3(buffer, id, 'OG', req.file.mimetype);
    });
  jobs.push(og);

  Promise.all(jobs)
    .then(links => createRecord(req.body, links, widths))
    .then(() => res.json({ success: true }))
    .catch(err => next(err));
});

module.exports = router;
