const express = require('express');
const router = express.Router();
const passport = require('passport');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

// Login Page
router.get('/login', (req, res) => {
  res.render('login', { 
    title: 'Login - exposly.de',
    error_msg: req.query.error || null
  });
});

// Register Page
router.get('/register', (req, res) => {
  res.render('register', { 
    title: 'Registrieren - exposly.de',
    error_msg: null
  });
});

// Login POST
router.post('/login', passport.authenticate('local', {
  successRedirect: '/dashboard',
  failureRedirect: '/auth/login?error=Login fehlgeschlagen',
  failureFlash: false
}));

// Register POST
router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    
    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.render('register', {
        title: 'Registrieren - exposly.de',
        error_msg: 'E-Mail bereits registriert'
      });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create user
    const user = new User({
      email,
      password: hashedPassword,
      name
    });
    
    await user.save();
    
    res.redirect('/auth/login');
  } catch (err) {
    console.error(err);
    res.render('register', {
      title: 'Registrieren - exposly.de',
      error_msg: 'Ein Fehler ist aufgetreten'
    });
  }
});

// Logout
router.get('/logout', (req, res) => {
  req.logout(() => {
    res.redirect('/');
  });
});

module.exports = router;
