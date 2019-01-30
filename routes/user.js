const express = require('express');
const router = express.Router();

const { isEmpty, createUser } = require('../models/User');

router.post('/initializeAdmin', (req, res, next) => {
  isEmpty()
    .then(x => {
      if (!x) {
        res.status(403);
        throw new Error('Admin already exists');
      }
      if (!(req.body.username && req.body.password)) {
        res.status(400);
        throw new Error('Must supply username and password');
      }
      return createUser(req.body.username, req.body.password);
    })
    .then(() => { res.json({ success: true })})
    .catch(err => next(err));
});

module.exports = router;
