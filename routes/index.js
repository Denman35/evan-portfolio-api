const express = require('express');
const router = express.Router();
const passport = require('passport');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.post('/login', passport.authenticate('local'), (req, res, next) => {
  res.json({ success: true });
});

router.get('/isAuthenticated', (req, res, next) => {
  res.json({ authenticated: req.isAuthenticated() });
});

module.exports = router;
