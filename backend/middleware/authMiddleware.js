const jwt = require('jsonwebtoken');

// ============================================
// VERIFY JWT TOKEN
// ============================================
exports.verifyToken = (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    // Verify token
    jwt.verify(token, process.env.JWT_SECRET || 'your_secret_key', (err, decoded) => {
      if (err) {
        return res.status(401).json({
          success: false,
          message: 'Invalid or expired token'
        });
      }

      // Add user info to request
      req.user = decoded;
      next();
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Token verification failed',
      error: error.message
    });
  }
};

// ============================================
// VERIFY ADMIN ROLE
// ============================================
exports.verifyAdmin = (req, res, next) => {
  try {
    // Check if user role is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }

    next();

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Authorization failed',
      error: error.message
    });
  }
};
