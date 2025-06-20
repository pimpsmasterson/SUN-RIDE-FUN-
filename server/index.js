const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const path = require('path');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const dbService = require('./services/database');
const { router: authRoutes } = require('./routes/auth');
const ridesRoutes = require('./routes/rides');
const chatRoutes = require('./routes/chat');
const adminRoutes = require('./routes/admin');

// Settings service to load configuration from database
class SettingsService {
  constructor() {
    this.settings = {};
    this.initialized = false;
  }

  async initialize() {
    if (this.initialized) return;
    
    try {
      // Load all settings from database
      const allSettings = await dbService.allQuery('SELECT setting_key, setting_value FROM admin_settings');
      this.settings = {};
      allSettings.forEach(setting => {
        this.settings[setting.setting_key] = setting.setting_value;
      });
      this.initialized = true;
      console.log('✅ Settings loaded from database');
    } catch (error) {
      console.error('❌ Failed to load settings from database:', error);
      // Use fallback values
      this.settings = {
        jwt_secret: process.env.JWT_SECRET || 'festival-secret-key',
        cors_origins: '*',
        app_name: 'Sun Festival Carpool',
        enable_chat: 'true',
        maintenance_mode: 'false'
      };
    }
  }

  get(key, fallback = null) {
    return this.settings[key] || process.env[key.toUpperCase()] || fallback;
  }

  getBoolean(key, fallback = false) {
    const value = this.get(key, fallback.toString());
    return value === 'true' || value === true;
  }

  async refresh() {
    this.initialized = false;
    await this.initialize();
  }
}

const settingsService = new SettingsService();

const app = express();

// Only create HTTP server if not in Vercel environment
const isVercel = process.env.VERCEL === '1';
const server = isVercel ? null : http.createServer(app);

const PORT = process.env.PORT || 5000;

// Configure CORS immediately (before routes) - Fix for development
app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? '*' : ['http://localhost:3000', 'http://localhost:3004'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Middleware
app.use(express.json());

// Make settings service available to routes
app.use((req, res, next) => {
  req.settings = settingsService;
  next();
});

// Initialize database and settings
async function initializeApp() {
  try {
    await dbService.initializeDatabase();
    await settingsService.initialize();

    // Initialize Socket.IO with proper CORS
    if (!isVercel && server) {
      const io = socketIo(server, {
        cors: {
          origin: process.env.NODE_ENV === 'production' ? '*' : ['http://localhost:3000', 'http://localhost:3004'],
          methods: ['GET', 'POST'],
          credentials: true
        }
      });
      app.set('io', io);
      setupSocketIO(io);
    }

    console.log('🚀 Application initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize application:', error);
    process.exit(1);
  }
}

// Maintenance mode middleware
app.use(async (req, res, next) => {
  // Skip maintenance check for admin routes and health check
  if (req.path.startsWith('/api/admin') || req.path === '/api/health') {
    return next();
  }

  const maintenanceMode = settingsService.getBoolean('maintenance_mode', false);
  if (maintenanceMode) {
    return res.status(503).json({
      error: 'Service temporarily unavailable',
      message: 'The application is currently under maintenance. Please try again later.',
      maintenance: true
    });
  }
  next();
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/rides', ridesRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/admin', adminRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    environment: process.env.NODE_ENV || 'development',
    app_name: settingsService.get('app_name', 'Sun Festival Carpool'),
    version: settingsService.get('app_version', '1.0.0'),
    maintenance_mode: settingsService.getBoolean('maintenance_mode', false)
  });
});

// Settings endpoint for frontend
app.get('/api/settings/public', (req, res) => {
  res.json({
    app_name: settingsService.get('app_name', 'Sun Festival Carpool'),
    festival_name: settingsService.get('festival_name', 'Sun Festival 2025'),
    festival_location: settingsService.get('festival_location', 'Csobánkapuszta, Hungary'),
    festival_dates: settingsService.get('festival_dates', 'June 29 - July 6, 2025'),
    enable_registration: settingsService.getBoolean('enable_registration', true),
    enable_chat: settingsService.getBoolean('enable_chat', true),
    google_analytics_id: settingsService.get('google_analytics_id', '')
  });
});

// Socket.IO setup function
function setupSocketIO(io) {
  // Socket.IO authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication error: No token provided'));
      }

      const jwtSecret = settingsService.get('jwt_secret', 'festival-secret-key');
      const decoded = jwt.verify(token, jwtSecret);
      
      const user = await dbService.getQuery(
        'SELECT id, name, email FROM users WHERE id = ?',
        [decoded.userId]
      );

      if (!user) {
        return next(new Error('Authentication error: User not found'));
      }

      socket.userId = user.id;
      socket.user = user;
      next();
    } catch (error) {
      next(new Error('Authentication error: Invalid token'));
    }
  });

  // Socket.IO connection handling
  io.on('connection', (socket) => {
    console.log(`🔌 User connected: ${socket.user.name} (${socket.id})`);

    // Check if chat is enabled
    if (!settingsService.getBoolean('enable_chat', true)) {
      socket.emit('error', { message: 'Chat functionality is currently disabled' });
      socket.disconnect();
      return;
    }

    // Join ride chat room
    socket.on('join-ride-chat', async (rideId) => {
      try {
        // Verify user has access to this ride chat
        const hasAccess = await checkChatAccess(socket.userId, rideId);
        if (!hasAccess) {
          socket.emit('error', { message: 'Access denied to this ride chat' });
          return;
        }

        socket.join(`ride-${rideId}`);
        socket.currentRideId = rideId;
        
        console.log(`👥 ${socket.user.name} joined chat for ride ${rideId}`);
        
        // Notify other users in the room
        socket.to(`ride-${rideId}`).emit('user_joined', {
          userId: socket.userId,
          userName: socket.user.name,
          timestamp: new Date().toISOString()
        });

        // Send confirmation to user
        socket.emit('joined_chat', { rideId });
        
      } catch (error) {
        console.error('Error joining ride chat:', error);
        socket.emit('error', { message: 'Failed to join chat' });
      }
    });

    // Leave ride chat room
    socket.on('leave-ride-chat', (rideId) => {
      socket.leave(`ride-${rideId}`);
      socket.to(`ride-${rideId}`).emit('user_left', {
        userId: socket.userId,
        userName: socket.user.name,
        timestamp: new Date().toISOString()
      });
      console.log(`👋 ${socket.user.name} left chat for ride ${rideId}`);
    });

    // Handle typing indicators
    socket.on('typing_start', (rideId) => {
      socket.to(`ride-${rideId}`).emit('user_typing', {
        userId: socket.userId,
        userName: socket.user.name
      });
    });

    socket.on('typing_stop', (rideId) => {
      socket.to(`ride-${rideId}`).emit('user_stopped_typing', {
        userId: socket.userId
      });
    });

    // Handle location sharing
    socket.on('share_location', async (data) => {
      try {
        if (!settingsService.getBoolean('enable_location_sharing', true)) {
          socket.emit('error', { message: 'Location sharing is currently disabled' });
          return;
        }

        const { rideId, latitude, longitude, message } = data;
        
        // Verify access
        const hasAccess = await checkChatAccess(socket.userId, rideId);
        if (!hasAccess) {
          socket.emit('error', { message: 'Access denied' });
          return;
        }

        // Save location message to database
        const result = await dbService.runQuery(`
          INSERT INTO chat_messages (ride_id, user_id, message, message_type, location_lat, location_lng)
          VALUES (?, ?, ?, ?, ?, ?)
        `, [rideId, socket.userId, message || 'Shared location', 'location', latitude, longitude]);

        // Get the created message with user info
        const newMessage = await dbService.getQuery(`
          SELECT 
            cm.*,
            u.name as user_name,
            u.id = ? as is_own_message
          FROM chat_messages cm
          JOIN users u ON cm.user_id = u.id
          WHERE cm.id = ?
        `, [socket.userId, result.lastID]);

        // Emit to all users in the ride chat
        io.to(`ride-${rideId}`).emit('new_message', newMessage);
        
      } catch (error) {
        console.error('Error sharing location:', error);
        socket.emit('error', { message: 'Failed to share location' });
      }
    });

    // Handle ride status updates (for drivers)
    socket.on('update_ride_status', async (data) => {
      try {
        const { rideId, status } = data;
        
        // Verify user is the driver
        const isDriver = await dbService.getQuery(
          'SELECT id FROM rides WHERE id = ? AND driver_id = ?',
          [rideId, socket.userId]
        );

        if (!isDriver) {
          socket.emit('error', { message: 'Only the driver can update ride status' });
          return;
        }

        // Update ride status in database
        await dbService.runQuery(
          'UPDATE rides SET status = ? WHERE id = ?',
          [status, rideId]
        );

        // Notify all users in the ride chat
        io.to(`ride-${rideId}`).emit('ride_status_updated', {
          rideId,
          status,
          updatedBy: socket.user.name,
          timestamp: new Date().toISOString()
        });

        console.log(`🚗 Ride ${rideId} status updated to ${status} by ${socket.user.name}`);
        
      } catch (error) {
        console.error('Error updating ride status:', error);
        socket.emit('error', { message: 'Failed to update ride status' });
      }
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log(`🔌 User disconnected: ${socket.user.name} (${socket.id})`);
      
      // Leave any chat rooms
      if (socket.currentRideId) {
        socket.to(`ride-${socket.currentRideId}`).emit('user_left', {
          userId: socket.userId,
          userName: socket.user.name,
          timestamp: new Date().toISOString()
        });
      }
    });
  });
}

// Helper function to check chat access
async function checkChatAccess(userId, rideId) {
  try {
    // Check if user is the driver
    const isDriver = await dbService.getQuery(
      'SELECT id FROM rides WHERE id = ? AND driver_id = ?',
      [rideId, userId]
    );

    if (isDriver) return true;

    // Check if user has an accepted ride request
    const hasRequest = await dbService.getQuery(
      'SELECT id FROM ride_requests WHERE ride_id = ? AND passenger_id = ? AND status = "accepted"',
      [rideId, userId]
    );

    return !!hasRequest;
  } catch (error) {
    console.error('Error checking chat access:', error);
    return false;
  }
}

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../client/build', 'index.html'));
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Initialize and start server
initializeApp().then(() => {
  if (!isVercel && server) {
    server.listen(PORT, () => {
      console.log(`🌞 Sun Festival Carpool Server running on port ${PORT}`);
      console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🎯 App Name: ${settingsService.get('app_name', 'Sun Festival Carpool')}`);
    });
  }
});

// Export for serverless deployment
module.exports = app;