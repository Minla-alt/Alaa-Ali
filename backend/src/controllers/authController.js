const User = require('../models/User');
const jwt = require('jsonwebtoken');

/**
 * Generate JWT Token
 * @param {Object} user - User object
 * @returns {String} JWT token
 */
const generateToken = (user) => {
  const payload = {
    userId: user._id.toString(),
    email: user.email
  };

  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: '7d'
  });
};

/**
 * User Registration
 * POST /api/auth/signup
 */
const signup = async (req, res) => {
  try {
    const { email, password, name, language } = req.body;

    // Validate required fields
    if (!email || !password || !name) {
      return res.status(400).json({
        success: false,
        message: 'Email, password, and name are required',
        statusCode: 400
      });
    }

    // Validate email format
    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address',
        statusCode: 400
      });
    }

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long',
        statusCode: 400
      });
    }

    // Validate language if provided
    if (language && !['ar', 'en'].includes(language)) {
      return res.status(400).json({
        success: false,
        message: 'Language must be either "ar" or "en"',
        statusCode: 400
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered',
        statusCode: 400
      });
    }

    // Create new user
    const user = await User.create({
      email: email.toLowerCase(),
      password,
      name: name.trim(),
      language: language || 'en'
    });

    // Generate token
    const token = generateToken(user);

    // Return success response
    return res.status(201).json({
      success: true,
      message: 'User registered successfully',
      userId: user._id.toString(),
      token
    });
  } catch (error) {
    console.error('Signup error:', error);

    // Handle Mongoose validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', '),
        statusCode: 400
      });
    }

    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered',
        statusCode: 400
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Server error during registration',
      statusCode: 500
    });
  }
};

/**
 * User Login
 * POST /api/auth/login
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
        statusCode: 400
      });
    }

    // Find user and include password field
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    // Check if user exists
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
        statusCode: 401
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account has been deactivated',
        statusCode: 401
      });
    }

    // Compare password
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
        statusCode: 401
      });
    }

    // Generate token
    const token = generateToken(user);

    // Return success response
    return res.status(200).json({
      success: true,
      message: 'Login successful',
      userId: user._id.toString(),
      email: user.email,
      name: user.name,
      language: user.language,
      token
    });
  } catch (error) {
    console.error('Login error:', error);

    return res.status(500).json({
      success: false,
      message: 'Server error during login',
      statusCode: 500
    });
  }
};

/**
 * User Logout
 * POST /api/auth/logout
 * Note: Since we use stateless JWT tokens, logout is handled client-side
 * by removing the token from localStorage
 */
const logout = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error('Logout error:', error);

    return res.status(500).json({
      success: false,
      message: 'Server error during logout',
      statusCode: 500
    });
  }
};

/**
 * Get Current User
 * GET /api/auth/me
 * Returns user information from JWT token
 */
const getMe = async (req, res) => {
  try {
    // User is attached to request by verifyToken middleware
    const userId = req.user.userId;

    // Find user in database
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
        statusCode: 404
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account has been deactivated',
        statusCode: 401
      });
    }

    // Return user data
    return res.status(200).json({
      success: true,
      user: {
        userId: user._id.toString(),
        email: user.email,
        name: user.name,
        language: user.language,
        avatar: user.avatar,
        role: user.role,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('GetMe error:', error);

    return res.status(500).json({
      success: false,
      message: 'Server error fetching user data',
      statusCode: 500
    });
  }
};

module.exports = {
  signup,
  login,
  logout,
  getMe
};
