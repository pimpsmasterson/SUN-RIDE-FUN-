const express = require('express');
const cors = require('cors');
const serverless = require('serverless-http');
const path = require('path');

// Import routes
const authRoutes = require('../server/routes/auth');
const ridesRoutes = require('../server/routes/rides');
const chatRoutes = require('../server/routes/chat');
const adminRoutes = require('../server/routes/admin');

// Create Express app
const app = express();

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/rides', ridesRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/admin', adminRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', environment: process.env.NODE_ENV || 'development' });
});

// API info endpoint
app.get('/api', (req, res) => {
  res.json({
    name: 'Sun Festival Carpool API',
    version: '1.0.0',
    description: 'Community-driven carpooling web app for Sun Festival 2025',
    endpoints: [
      { path: '/api', method: 'GET', description: 'API information' },
      { path: '/api/health', method: 'GET', description: 'API health check' },
      { path: '/api/auth/*', method: 'POST', description: 'Authentication endpoints' },
      { path: '/api/rides/*', method: 'GET,POST,PUT,DELETE', description: 'Rides management' },
      { path: '/api/chat/*', method: 'GET,POST', description: 'Chat functionality' },
      { path: '/api/admin/*', method: 'GET,POST,PUT,DELETE', description: 'Admin endpoints' }
    ],
    status: 'online',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Export handler function for serverless deployment
module.exports.handler = serverless(app);

// For local development
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}