const jwt = require('jsonwebtoken');
const databaseService = require('../services/database');

const authMiddleware = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'festival-secret-key');
    
    // Get user from database
    const user = await databaseService.getQuery(
      'SELECT id, name, email FROM users WHERE id = ?',
      [decoded.userId]
    );

    if (!user) {
      throw new Error('User not found');
    }

    // Add user info to request
    req.user = user;
    req.token = token;

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ error: 'Please authenticate' });
  }
};

module.exports = authMiddleware; 