const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../services/database');

// Middleware to verify admin token
const verifyAdmin = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'festival-secret-2025');
    const user = await db.getQuery('SELECT * FROM users WHERE id = ? AND is_admin = TRUE', [decoded.userId]);
    
    if (!user) {
      return res.status(403).json({ error: 'Access denied. Admin privileges required.' });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(400).json({ error: 'Invalid token.' });
  }
};

// Admin login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await db.getQuery(
      'SELECT * FROM users WHERE email = ? AND is_admin = TRUE',
      [email]
    );

    if (!user || !await bcrypt.compare(password, user.password_hash)) {
      return res.status(400).json({ error: 'Invalid admin credentials' });
    }

    const token = jwt.sign(
      { userId: user.id, isAdmin: true },
      process.env.JWT_SECRET || 'festival-secret-2025',
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        isAdmin: true
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error during admin login' });
  }
});

// Get all admin settings
router.get('/settings', verifyAdmin, async (req, res) => {
  try {
    const settings = await db.allQuery('SELECT * FROM admin_settings ORDER BY setting_key');
    res.json(settings);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch admin settings' });
  }
});

// Update admin setting
router.put('/settings/:key', verifyAdmin, async (req, res) => {
  try {
    const { key } = req.params;
    const { value } = req.body;

    await db.runQuery(
      'UPDATE admin_settings SET setting_value = ?, updated_at = CURRENT_TIMESTAMP WHERE setting_key = ?',
      [value, key]
    );

    const updatedSetting = await db.getQuery(
      'SELECT * FROM admin_settings WHERE setting_key = ?',
      [key]
    );

    res.json(updatedSetting);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update setting' });
  }
});

// Test Google Maps API
router.post('/test-maps-api', verifyAdmin, async (req, res) => {
  try {
    const { apiKey } = req.body;
    
    // Simple test - in production, you might want to make an actual API call
    if (!apiKey || apiKey.trim() === '') {
      return res.status(400).json({ 
        valid: false, 
        error: 'API key is required' 
      });
    }

    // Basic format check for Google Maps API key
    const apiKeyPattern = /^AIza[0-9A-Za-z-_]{35}$/;
    if (!apiKeyPattern.test(apiKey)) {
      return res.status(400).json({ 
        valid: false, 
        error: 'Invalid API key format' 
      });
    }

    // If format is valid, save it
    await db.runQuery(
      'UPDATE admin_settings SET setting_value = ?, updated_at = CURRENT_TIMESTAMP WHERE setting_key = ?',
      [apiKey, 'google_maps_api_key']
    );

    res.json({ 
      valid: true, 
      message: 'API key format is valid and has been saved' 
    });
  } catch (error) {
    res.status(500).json({ 
      valid: false, 
      error: 'Failed to test API key' 
    });
  }
});

// Get festival locations
router.get('/locations', verifyAdmin, async (req, res) => {
  try {
    const locations = await db.allQuery(
      'SELECT * FROM festival_locations ORDER BY name'
    );
    res.json(locations);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch locations' });
  }
});

// Add new festival location
router.post('/locations', verifyAdmin, async (req, res) => {
  try {
    const { name, address, latitude, longitude } = req.body;

    const result = await db.runQuery(
      'INSERT INTO festival_locations (name, address, latitude, longitude) VALUES (?, ?, ?, ?)',
      [name, address, latitude, longitude]
    );

    const newLocation = await db.getQuery(
      'SELECT * FROM festival_locations WHERE id = ?',
      [result.lastID]
    );

    res.json(newLocation);
  } catch (error) {
    res.status(500).json({ error: 'Failed to add location' });
  }
});

// Update festival location
router.put('/locations/:id', verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, address, latitude, longitude, is_active } = req.body;

    await db.runQuery(
      'UPDATE festival_locations SET name = ?, address = ?, latitude = ?, longitude = ?, is_active = ? WHERE id = ?',
      [name, address, latitude, longitude, is_active, id]
    );

    const updatedLocation = await db.getQuery(
      'SELECT * FROM festival_locations WHERE id = ?',
      [id]
    );

    res.json(updatedLocation);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update location' });
  }
});

// Delete festival location
router.delete('/locations/:id', verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    await db.runQuery('DELETE FROM festival_locations WHERE id = ?', [id]);
    res.json({ message: 'Location deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete location' });
  }
});

// Get dashboard stats
router.get('/dashboard', verifyAdmin, async (req, res) => {
  try {
    const stats = {};

    // Get user count
    const userCount = await db.getQuery('SELECT COUNT(*) as count FROM users WHERE is_admin = FALSE');
    stats.totalUsers = userCount.count;

    // Get active rides count
    const rideCount = await db.getQuery('SELECT COUNT(*) as count FROM rides WHERE status = "active"');
    stats.activeRides = rideCount.count;

    // Get total chat messages
    const messageCount = await db.getQuery('SELECT COUNT(*) as count FROM chat_messages');
    stats.totalMessages = messageCount.count;

    // Get pending ride requests
    const requestCount = await db.getQuery('SELECT COUNT(*) as count FROM ride_requests WHERE status = "pending"');
    stats.pendingRequests = requestCount.count;

    // Recent activities
    const recentRides = await db.allQuery(`
      SELECT r.*, u.name as driver_name 
      FROM rides r 
      JOIN users u ON r.driver_id = u.id 
      ORDER BY r.created_at DESC 
      LIMIT 5
    `);
    stats.recentRides = recentRides;

    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
});

module.exports = router; 