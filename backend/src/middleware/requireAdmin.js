const User = require('../models/User');

/**
 * Admin-only guard. Use after verifyToken.
 * Checks the role in the database, not in the token, so a role change
 * takes effect immediately.
 */
const requireAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId).select('role isActive');
    if (!user || user.isActive === false || user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required',
        statusCode: 403
      });
    }
    next();
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Authorization check failed', statusCode: 500 });
  }
};

module.exports = { requireAdmin };
