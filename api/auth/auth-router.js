const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const User = require('../users/users-model');

const checkPayload = (req, res, next) => {
  // needs req.body to include username, password
  if (!req.body.username || !req.body.password) {
    res.status(401).json('bad payload');
  } else {
    next();
  }
};
const checkUsernameUnique = async (req, res, next) => {
  // username must not be in the db already
  try {
    const rows = await User.findBy({ username: req.body.username });
    if (!rows.length) {
      next();
    } else {
      res.status(401).json('please register with a different username');
    }
  } catch (err) {
    res.status(500).json('something failed');
  }
};
router.post(
  ('/register',
  checkPayload,
  checkUsernameUnique,
  (req, res) => {
    console.log('registering');
  })
);

router.post(
  ('/login',
  (req, res) => {
    console.log('logiing');
  })
);

router.get(('/logout', (req, res) => {}));
module.exports = router;
