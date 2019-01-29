const express = require('express');
const multer  = require('multer');
const uuidv1 = require('uuid/v1');

const router = express.Router();
const upload = multer();

const { breakpoints } = require('../config/image');
const { resizePhoto, getPhotoMetdata } = require('../controllers/Photo');
const {
  uploadS3,
  createRecord,
  getPhotos,
  getPhotoById,
  updatePhotoById,
} = require('../models/Photo');

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

router.post('/upload', upload.single('image'), (req, res, next) => {
  const { buffer } = req.file;
  const jobs = [];
  const metadata = breakpoints.map(() => ({}));
  const id = uuidv1();
  breakpoints.forEach((b, idx) => {
    const resizeJob = resizePhoto(buffer, b.width);
    const uploadJob = resizeJob.then(({ data, info }) => {
      metadata[idx].width = info.width;
      metadata[idx].height = info.height;
      return uploadS3(data, id, b.size, req.file.mimetype);
    });
    jobs.push(uploadJob);
  });
  const og = getPhotoMetdata(buffer)
    .then(m => {
      metadata.push({ width: m.width, height: m.height });
      return uploadS3(buffer, id, 'OG', req.file.mimetype);
    });
  jobs.push(og);

  Promise.all(jobs)
    .then(links => createRecord(req.body, links, metadata))
    .then(() => res.json({ success: true }))
    .catch(err => next(err));
});

router.get('/:id', function(req, res, next) {
  getPhotoById(req.params.id)
    .then(photoInfo => {
      let prev = photoInfo[1].length > 0 ? photoInfo[1][0]._id : null;
      let next = photoInfo[2].length > 0 ? photoInfo[2][0]._id : null;
      res.json({
        prev,
        next,
        photo: photoInfo[0],
      });
    })
    .catch(err => next(err));
});

const ALLOWED_FIELDS = ['location', 'description'];
router.put('/:id', (req, res, next) => {
  Object.keys(req.body).forEach(k => {
    if (ALLOWED_FIELDS.indexOf(k) === -1) { next(`Invalid field ${k}`); }
    if (typeof req.body[k] !== 'string') { next("Invalid Body"); }
  });
  updatePhotoById(req.params.id, req.body)
    .then(res.json({ success: true }))
    .catch(err => next(err));
});

module.exports = router;
