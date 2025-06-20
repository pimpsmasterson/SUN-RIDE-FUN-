const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../services/database');

// User registration
router.post('/register', async (req, res) => {
  try {
    // Check if registration is enabled
    const registrationEnabled = await db.getSetting('enable_registration', 'true');
    if (registrationEnabled !== 'true') {
      return res.status(403).json({ error: 'Registration is currently disabled' });
    }

    const { name, email, phone, password } = req.body;

    // Check if user already exists
    const existingUser = await db.getQuery(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const result = await db.runQuery(
      'INSERT INTO users (name, email, phone, password_hash) VALUES (?, ?, ?, ?)',
      [name, email, phone, hashedPassword]
    );

    // Generate JWT token using database settings
    const jwtSecret = await db.getSetting('jwt_secret', process.env.JWT_SECRET || 'festival-secret-key');
    const sessionTimeout = await db.getSetting('session_timeout', '7d');
    
    const token = jwt.sign(
      { userId: result.lastID },
      jwtSecret,
      { expiresIn: sessionTimeout }
    );

    res.status(201).json({
      token,
      user: {
        id: result.lastID,
        name,
        email,
        phone,
        isAdmin: false
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Server error during registration' });
  }
});

// User login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await db.getQuery(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    if (!user || !await bcrypt.compare(password, user.password_hash)) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token using database settings
    const jwtSecret = await db.getSetting('jwt_secret', process.env.JWT_SECRET || 'festival-secret-key');
    const sessionTimeout = await db.getSetting('session_timeout', '7d');
    
    const token = jwt.sign(
      { userId: user.id, isAdmin: user.is_admin },
      jwtSecret,
      { expiresIn: sessionTimeout }
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        isAdmin: user.is_admin
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error during login' });
  }
});

// Verify token middleware
const verifyToken = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    const jwtSecret = await db.getSetting('jwt_secret', process.env.JWT_SECRET || 'festival-secret-key');
    const decoded = jwt.verify(token, jwtSecret);
    const user = await db.getQuery('SELECT * FROM users WHERE id = ?', [decoded.userId]);
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid token.' });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(400).json({ error: 'Invalid token.' });
  }
};

// Get current user
router.get('/me', verifyToken, (req, res) => {
  res.json({
    id: req.user.id,
    name: req.user.name,
    email: req.user.email,
    phone: req.user.phone,
    isAdmin: req.user.is_admin
  });
});

// Update user profile
router.put('/profile', verifyToken, async (req, res) => {
  try {
    const { name, phone } = req.body;
    const userId = req.user.id;

    await db.runQuery(
      'UPDATE users SET name = ?, phone = ? WHERE id = ?',
      [name, phone, userId]
    );

    const updatedUser = await db.getQuery(
      'SELECT * FROM users WHERE id = ?',
      [userId]
    );

    res.json({
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      phone: updatedUser.phone,
      isAdmin: updatedUser.is_admin
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

module.exports = { router, verifyToken }; 