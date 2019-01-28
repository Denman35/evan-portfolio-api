const express = require('express');

const router = express.Router();

const { getFeatured } = require('../models/Features');

router.get('/', function(req, res, next) {
  getFeatured()
    .then(featured => res.json(featured))
    .catch(err => next(err));
});

module.exports = router;
