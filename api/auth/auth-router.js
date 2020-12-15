const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const User = require('../users/users-model');

const checkPayload = (req, res, next) => {
  // needs req.body to include username, password
  if (!req.body.username || !req.body.password) {
    res.status(401).json('username and password are required');
  } else {
    next();
  }
};
const checkUsernameUnique = async (req, res, next) => {
  // no duplicate usernames should be stored in db
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

const checkUsernameExists = async (req, res, next) => {
  // username must be in the db already

  try {
    const rows = await User.findBy({ username: req.body.username });
    if (rows.length) {
      // we should also tack the user in db to the req object
      req.userData = rows[0];
      next();
    } else {
      res.status(401).json('the username does not exist');
    }
  } catch (err) {
    res.status(500).json('something failed');
  }
};

router.post(
  '/register',
  checkPayload,
  checkUsernameUnique,
  async (req, res) => {
    console.log('registering');
    try {
      const hash = bcrypt.hashSync(req.body.password, 10);
      const newUser = await User.add({
        username: req.body.username,
        password: hash,
      });
      res.status(201).json(newUser);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);
// use middleware function checkPaylod to make sure username and password is entered
// also make the username exists in db to be able to login, use a new piece of middleware to check that
router.post('/login', checkPayload, checkUsernameExists, (req, res) => {
  console.log('logiing');
  try {
    // check req.body.password (raw password) against the hash saved inside req.userData.password
    const verifyUser = bcrypt.compareSync(
      req.body.password,
      req.userData.password
    );
    if (verifyUser) {
      req.session.user = req.userData;
      res.json(`Hi ${req.userData.username}, you're logged in successfully`);
    } else {
      res.status(401).json('check your credentials');
    }
  } catch (error) {
    res.status(500).json('something failed');
  }
});

router.get(('/logout', (req, res) => {}));
module.exports = router;
