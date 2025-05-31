const express = require('express');
const router = express.Router();
const { register, login, getProfile, searchUsers } = require('../controllers/authController');
const { authenticate } = require('../middlewares/authMiddleware');

// Register a new user
router.post('/register', register);

// Login user
router.post('/login', login);

// Get current user profile (protected route)
router.get('/profile', authenticate, getProfile);

// Search users by name or email (protected route)
router.get('/search', authenticate, searchUsers);

module.exports = router; 