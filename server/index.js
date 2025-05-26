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

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.NODE_ENV === 'production' ? false : ['http://localhost:3000'],
    methods: ['GET', 'POST']
  }
});

const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../client/build')));

// Make io available to routes
app.set('io', io);

// Initialize database
dbService.initializeDatabase();

// Socket.IO authentication middleware
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication error: No token provided'));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'festival-secret-key');
    
    // Get user info from database
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

  // Handle disconnection
  socket.on('disconnect', (reason) => {
    console.log(`🔌 User disconnected: ${socket.user.name} (${reason})`);
    
    // Notify current ride chat if user was in one
    if (socket.currentRideId) {
      socket.to(`ride-${socket.currentRideId}`).emit('user_left', {
        userId: socket.userId,
        userName: socket.user.name,
        timestamp: new Date().toISOString()
      });
    }
  });

  // Handle errors
  socket.on('error', (error) => {
    console.error(`🚫 Socket error for user ${socket.user.name}:`, error);
  });
});

// Helper function to check chat access (same as in chat routes)
async function checkChatAccess(userId, rideId) {
  // Check if user is the driver
  const isDriver = await dbService.getQuery(
    'SELECT id FROM rides WHERE id = ? AND driver_id = ?',
    [rideId, userId]
  );

  if (isDriver) {
    return true;
  }

  // Check if user is a confirmed passenger
  const isPassenger = await dbService.getQuery(
    'SELECT id FROM ride_requests WHERE ride_id = ? AND passenger_id = ? AND status = ?',
    [rideId, userId, 'confirmed']
  );

  return !!isPassenger;
}

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/rides', ridesRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/admin', adminRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    festival: 'Sun Festival 2025 - Csobánkapuszta',
    activeConnections: io.engine.clientsCount
  });
});

// Serve React app for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
});

server.listen(PORT, () => {
  console.log(`🌞 Sun Festival Carpooling Server running on port ${PORT}`);
  console.log(`🚗 Ready to connect festival-goers!`);
  console.log(`💬 Real-time chat enabled with content moderation`);
}); 