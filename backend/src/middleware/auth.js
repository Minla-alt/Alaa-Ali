const jwt = require('jsonwebtoken');

/**
 * Authentication Middleware
 * Verifies JWT token and attaches user data to request
 */
const verifyToken = (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;

    // Check if token exists
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'No token provided. Authorization header required.',
        statusCode: 401
      });
    }

    // Extract token from "Bearer <token>"
    const token = authHeader.split(' ')[1];

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach decoded user data to request
    req.user = {
      userId: decoded.userId,
      email: decoded.email
    };

    next();
  } catch (error) {
    // Handle specific JWT errors
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token',
        statusCode: 401
      });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired',
        statusCode: 401
      });
    }

    // Generic error
    return res.status(500).json({
      success: false,
      message: 'Authentication failed',
      statusCode: 500
    });
  }
};

/**
 * Optional authentication middleware
 * Attaches user data if token is valid, but doesn't require it
 */
const optionalAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = {
      userId: decoded.userId,
      email: decoded.email
    };

    next();
  } catch (error) {
    // If token is invalid, just continue without user data
    next();
  }
};

module.exports = {
  verifyToken,
  optionalAuth
};
