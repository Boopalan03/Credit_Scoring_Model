const express = require('express');
const router = express.Router();
const { registerUser, loginUser, logoutUser, changePassword } = require('../controllers/authController');
const { authLimiter } = require('../middleware/rateLimiter');
const { validate } = require('../middleware/validateMiddleware');
const { check } = require('express-validator');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', authLimiter, validate([
  check('name', 'Name is required').not().isEmpty(),
  check('email', 'Please include a valid email').isEmail(),
  check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 })
]), registerUser);

router.post('/login', authLimiter, validate([
  check('email', 'Please include a valid email').isEmail(),
  check('password', 'Password is required').exists()
]), loginUser);

router.post('/logout', logoutUser);

router.put('/change-password', protect, validate([
  check('currentPassword', 'Current password is required').not().isEmpty(),
  check('newPassword', 'Please enter a new password with 6 or more characters').isLength({ min: 6 })
]), changePassword);

module.exports = router;
