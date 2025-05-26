const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const databaseService = require('../services/database');
const contentModeration = require('../services/contentModeration');

// Get chat messages for a ride
router.get('/:rideId/messages', authMiddleware, async (req, res) => {
  try {
    const { rideId } = req.params;
    const { page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;

    // Check if user is authorized to access this chat (driver or confirmed passenger)
    const isAuthorized = await checkChatAccess(req.user.id, rideId);
    if (!isAuthorized) {
      return res.status(403).json({ 
        error: 'You must be the driver or a confirmed passenger to access this chat' 
      });
    }

    // Get messages with user information
    const messages = await databaseService.allQuery(`
      SELECT 
        cm.*,
        u.name as user_name,
        u.id = ? as is_own_message
      FROM chat_messages cm
      JOIN users u ON cm.user_id = u.id
      WHERE cm.ride_id = ?
      ORDER BY cm.created_at DESC
      LIMIT ? OFFSET ?
    `, [req.user.id, rideId, parseInt(limit), offset]);

    // Get total message count
    const totalResult = await databaseService.getQuery(
      'SELECT COUNT(*) as total FROM chat_messages WHERE ride_id = ?',
      [rideId]
    );

    // Get ride information
    const ride = await databaseService.getQuery(`
      SELECT 
        r.id,
        r.pickup_location,
        r.departure_time,
        r.status,
        u.name as driver_name,
        u.id as driver_id
      FROM rides r
      JOIN users u ON r.driver_id = u.id
      WHERE r.id = ?
    `, [rideId]);

    res.json({
      messages: messages.reverse(), // Send in chronological order
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalResult.total,
        totalPages: Math.ceil(totalResult.total / limit)
      },
      ride
    });

  } catch (error) {
    console.error('Error fetching chat messages:', error);
    res.status(500).json({ error: 'Failed to fetch chat messages' });
  }
});

// Send a message
router.post('/:rideId/messages', authMiddleware, async (req, res) => {
  try {
    const { rideId } = req.params;
    const { message, message_type = 'text', location_lat, location_lng } = req.body;

    // Validate input
    if (!message || message.trim().length === 0) {
      return res.status(400).json({ error: 'Message content is required' });
    }

    if (message.length > 1000) {
      return res.status(400).json({ error: 'Message is too long (max 1000 characters)' });
    }

    // Check if user is authorized to send messages
    const isAuthorized = await checkChatAccess(req.user.id, rideId);
    if (!isAuthorized) {
      return res.status(403).json({ 
        error: 'You must be the driver or a confirmed passenger to send messages' 
      });
    }

    // Check if ride is still active
    const ride = await databaseService.getQuery(
      'SELECT status FROM rides WHERE id = ?',
      [rideId]
    );

    if (!ride) {
      return res.status(404).json({ error: 'Ride not found' });
    }

    if (ride.status !== 'active') {
      return res.status(400).json({ 
        error: 'Cannot send messages to inactive rides' 
      });
    }

    // Get user's recent message count for spam detection
    const recentMessageCount = await databaseService.getQuery(`
      SELECT COUNT(*) as count 
      FROM chat_messages 
      WHERE user_id = ? AND ride_id = ? AND created_at > datetime('now', '-5 minutes')
    `, [req.user.id, rideId]);

    // Content moderation
    const moderationResult = contentModeration.moderateMessage(message, {
      recentMessageCount: recentMessageCount.count,
      userId: req.user.id,
      rideId
    });

    // Log moderation event
    contentModeration.logModerationEvent(
      req.user.id, 
      message, 
      moderationResult, 
      rideId
    );

    if (!moderationResult.isApproved) {
      const errorMessage = contentModeration.generateModerationMessage(
        moderationResult.flags, 
        moderationResult.severity
      );
      
      return res.status(400).json({ 
        error: errorMessage,
        moderation: {
          flags: moderationResult.flags,
          severity: moderationResult.severity
        }
      });
    }

    // Save message to database
    const result = await databaseService.runQuery(`
      INSERT INTO chat_messages (ride_id, user_id, message, message_type, location_lat, location_lng)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [rideId, req.user.id, moderationResult.filteredMessage, message_type, location_lat, location_lng]);

    // Get the created message with user info
    const newMessage = await databaseService.getQuery(`
      SELECT 
        cm.*,
        u.name as user_name,
        u.id = ? as is_own_message
      FROM chat_messages cm
      JOIN users u ON cm.user_id = u.id
      WHERE cm.id = ?
    `, [req.user.id, result.lastID]);

    // Emit to socket room for real-time updates
    const io = req.app.get('io');
    if (io) {
      io.to(`ride-${rideId}`).emit('new_message', newMessage);
    }

    res.status(201).json(newMessage);

  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// Delete a message (only own messages or by driver)
router.delete('/:rideId/messages/:messageId', authMiddleware, async (req, res) => {
  try {
    const { rideId, messageId } = req.params;

    // Get message and ride info
    const message = await databaseService.getQuery(`
      SELECT cm.*, r.driver_id
      FROM chat_messages cm
      JOIN rides r ON cm.ride_id = r.id
      WHERE cm.id = ? AND cm.ride_id = ?
    `, [messageId, rideId]);

    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    // Check if user can delete (own message or is driver)
    if (message.user_id !== req.user.id && message.driver_id !== req.user.id) {
      return res.status(403).json({ 
        error: 'You can only delete your own messages or messages in your ride' 
      });
    }

    // Delete message
    await databaseService.runQuery(
      'DELETE FROM chat_messages WHERE id = ?',
      [messageId]
    );

    // Emit deletion to socket room
    const io = req.app.get('io');
    if (io) {
      io.to(`ride-${rideId}`).emit('message_deleted', { messageId });
    }

    res.json({ success: true });

  } catch (error) {
    console.error('Error deleting message:', error);
    res.status(500).json({ error: 'Failed to delete message' });
  }
});

// Get chat participants for a ride
router.get('/:rideId/participants', authMiddleware, async (req, res) => {
  try {
    const { rideId } = req.params;

    // Check if user has access
    const isAuthorized = await checkChatAccess(req.user.id, rideId);
    if (!isAuthorized) {
      return res.status(403).json({ 
        error: 'You must be the driver or a confirmed passenger to view participants' 
      });
    }

    // Get driver
    const driver = await databaseService.getQuery(`
      SELECT u.id, u.name, u.phone, 'driver' as role
      FROM rides r
      JOIN users u ON r.driver_id = u.id
      WHERE r.id = ?
    `, [rideId]);

    // Get confirmed passengers
    const passengers = await databaseService.allQuery(`
      SELECT u.id, u.name, u.phone, 'passenger' as role
      FROM ride_requests rr
      JOIN users u ON rr.passenger_id = u.id
      WHERE rr.ride_id = ? AND rr.status = 'confirmed'
    `, [rideId]);

    const participants = [driver, ...passengers].filter(Boolean);

    res.json(participants);

  } catch (error) {
    console.error('Error fetching participants:', error);
    res.status(500).json({ error: 'Failed to fetch participants' });
  }
});

// Mark messages as read
router.post('/:rideId/mark-read', authMiddleware, async (req, res) => {
  try {
    const { rideId } = req.params;

    // Check access
    const isAuthorized = await checkChatAccess(req.user.id, rideId);
    if (!isAuthorized) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // In a more complex system, you'd track read status per user
    // For now, we'll just return success
    res.json({ success: true });

  } catch (error) {
    console.error('Error marking messages as read:', error);
    res.status(500).json({ error: 'Failed to mark messages as read' });
  }
});

// Helper function to check if user has access to chat
async function checkChatAccess(userId, rideId) {
  // Check if user is the driver
  const isDriver = await databaseService.getQuery(
    'SELECT id FROM rides WHERE id = ? AND driver_id = ?',
    [rideId, userId]
  );

  if (isDriver) {
    return true;
  }

  // Check if user is a confirmed passenger
  const isPassenger = await databaseService.getQuery(
    'SELECT id FROM ride_requests WHERE ride_id = ? AND passenger_id = ? AND status = ?',
    [rideId, userId, 'confirmed']
  );

  return !!isPassenger;
}

module.exports = router; 