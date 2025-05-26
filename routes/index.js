const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Note = require('../models/Note');

// Root route
router.get('/', (req, res) => {
  if (req.session.userId) {
    res.redirect('/dashboard');
  } else {
    res.redirect('/login');
  }
});

// Middleware to protect routes
function isAuthenticated(req, res, next) {
  if (req.session.userId) return next();
  res.redirect('/login');
}

// Register
router.get('/register', (req, res) => res.render('register'));
router.post('/register', async (req, res) => {
  const { email, password } = req.body;
  await User.create({ email, password });
  res.redirect('/login');
});

// Login
router.get('/login', (req, res) => res.render('login'));
router.post('/login', async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  if (user && await user.comparePassword(req.body.password)) {
    req.session.userId = user._id;
    res.redirect('/dashboard');
  } else {
    res.send('Invalid credentials');
  }
});

// Dashboard - View/Create/Delete Notes
router.get('/dashboard', isAuthenticated, async (req, res) => {
  const notes = await Note.find({ userId: req.session.userId });
  res.render('dashboard', { notes });
});

router.post('/note', isAuthenticated, async (req, res) => {
  const { title, content } = req.body;
  await Note.create({ userId: req.session.userId, title, content });
  res.redirect('/dashboard');
});

router.post('/note/delete/:id', isAuthenticated, async (req, res) => {
  await Note.deleteOne({ _id: req.params.id, userId: req.session.userId });
  res.redirect('/dashboard');
});

// Logout
router.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login');
  });
});

module.exports = router;
