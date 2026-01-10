const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const { signup, login, logout, getMe } = require('../controllers/authController');

/**
 * Authentication Routes
 * Base path: /api/auth
 */

/**
 * @route   POST /api/auth/signup
 * @desc    Register a new user
 * @access  Public
 */
router.post('/signup', signup);

/**
 * @route   POST /api/auth/login
 * @desc    Login user and get JWT token
 * @access  Public
 */
router.post('/login', login);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user (client-side token removal)
 * @access  Public
 */
router.post('/logout', logout);

/**
 * @route   GET /api/auth/me
 * @desc    Get current user info from JWT token
 * @access  Private (requires valid token)
 */
router.get('/me', verifyToken, getMe);

module.exports = router;
