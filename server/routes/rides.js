const express = require('express');
const router = express.Router();
const { verifyToken } = require('./auth');
const db = require('../services/database');

// Get all active rides
router.get('/', async (req, res) => {
  try {
    const rides = await db.allQuery(`
      SELECT 
        r.*,
        u.name as driver_name,
        u.phone as driver_phone,
        u.email as driver_email,
        (r.available_seats - COALESCE(rr.confirmed_requests, 0)) as remaining_seats
      FROM rides r
      JOIN users u ON r.driver_id = u.id
      LEFT JOIN (
        SELECT ride_id, COUNT(*) as confirmed_requests
        FROM ride_requests 
        WHERE status = 'confirmed'
        GROUP BY ride_id
      ) rr ON r.id = rr.ride_id
      WHERE r.status = 'active' AND r.departure_time > datetime('now')
      ORDER BY r.departure_time ASC
    `);

    res.json(rides);
  } catch (error) {
    console.error('Error fetching rides:', error);
    res.status(500).json({ error: 'Failed to fetch rides' });
  }
});

// Get festival locations for pickup
router.get('/locations', async (req, res) => {
  try {
    const locations = await db.allQuery(
      'SELECT * FROM festival_locations WHERE is_active = TRUE ORDER BY name'
    );
    res.json(locations);
  } catch (error) {
    console.error('Error fetching locations:', error);
    res.status(500).json({ error: 'Failed to fetch locations' });
  }
});

// Create a new ride
router.post('/', verifyToken, async (req, res) => {
  try {
    const {
      pickup_location,
      pickup_coords,
      departure_time,
      available_seats,
      description
    } = req.body;

    // Validate required fields
    if (!pickup_location || !departure_time || !available_seats) {
      return res.status(400).json({ 
        error: 'Pickup location, departure time, and available seats are required' 
      });
    }

    // Validate departure time is in the future
    const departureDate = new Date(departure_time);
    const now = new Date();
    
    if (departureDate <= now) {
      return res.status(400).json({ 
        error: 'Departure time must be in the future' 
      });
    }

    // Validate available seats
    const seats = parseInt(available_seats);
    if (isNaN(seats) || seats < 1 || seats > 7) {
      return res.status(400).json({ 
        error: 'Available seats must be between 1 and 7' 
      });
    }

    // Check if user already has an active ride at similar time (within 2 hours)
    const existingRide = await db.getQuery(`
      SELECT id FROM rides 
      WHERE driver_id = ? 
      AND status = 'active' 
      AND abs(julianday(departure_time) - julianday(?)) * 24 < 2
    `, [req.user.id, departure_time]);

    if (existingRide) {
      return res.status(400).json({ 
        error: 'You already have a ride scheduled within 2 hours of this time' 
      });
    }

    const result = await db.runQuery(`
      INSERT INTO rides (
        driver_id, pickup_location, pickup_coords, departure_time, 
        available_seats, description
      ) VALUES (?, ?, ?, ?, ?, ?)
    `, [
      req.user.id,
      pickup_location,
      pickup_coords,
      departure_time,
      seats,
      description || null
    ]);

    const newRide = await db.getQuery(`
      SELECT r.*, u.name as driver_name, u.phone as driver_phone
      FROM rides r
      JOIN users u ON r.driver_id = u.id
      WHERE r.id = ?
    `, [result.lastID]);

    res.status(201).json(newRide);
  } catch (error) {
    console.error('Error creating ride:', error);
    res.status(500).json({ error: 'Failed to create ride' });
  }
});

// Get user's rides (as driver)
router.get('/my-rides', verifyToken, async (req, res) => {
  try {
    const rides = await db.allQuery(`
      SELECT 
        r.*,
        (r.available_seats - COALESCE(rr.confirmed_requests, 0)) as remaining_seats,
        COALESCE(rr.confirmed_requests, 0) as confirmed_passengers
      FROM rides r
      LEFT JOIN (
        SELECT ride_id, COUNT(*) as confirmed_requests
        FROM ride_requests 
        WHERE status = 'confirmed'
        GROUP BY ride_id
      ) rr ON r.id = rr.ride_id
      WHERE r.driver_id = ?
      ORDER BY r.departure_time ASC
    `, [req.user.id]);

    res.json(rides);
  } catch (error) {
    console.error('Error fetching user rides:', error);
    res.status(500).json({ error: 'Failed to fetch your rides' });
  }
});

// Get user's ride requests (as passenger)
router.get('/my-requests', verifyToken, async (req, res) => {
  try {
    const requests = await db.allQuery(`
      SELECT 
        rr.*,
        r.pickup_location,
        r.departure_time,
        r.description,
        r.id as ride_id,
        u.name as driver_name,
        u.phone as driver_phone,
        u.email as driver_email
      FROM ride_requests rr
      JOIN rides r ON rr.ride_id = r.id
      JOIN users u ON r.driver_id = u.id
      WHERE rr.passenger_id = ?
      ORDER BY r.departure_time ASC
    `, [req.user.id]);

    res.json(requests);
  } catch (error) {
    console.error('Error fetching user requests:', error);
    res.status(500).json({ error: 'Failed to fetch your requests' });
  }
});

// Request to join a ride
router.post('/:rideId/request', verifyToken, async (req, res) => {
  try {
    const { rideId } = req.params;
    const { message } = req.body;

    // Check if ride exists and is active
    const ride = await db.getQuery(`
      SELECT r.*, 
        (r.available_seats - COALESCE(rr.confirmed_requests, 0)) as remaining_seats
      FROM rides r
      LEFT JOIN (
        SELECT ride_id, COUNT(*) as confirmed_requests
        FROM ride_requests 
        WHERE status = 'confirmed'
        GROUP BY ride_id
      ) rr ON r.id = rr.ride_id
      WHERE r.id = ? AND r.status = 'active' AND r.departure_time > datetime('now')
    `, [rideId]);

    if (!ride) {
      return res.status(404).json({ error: 'Ride not found, inactive, or already departed' });
    }

    // Check if user is trying to request their own ride
    if (ride.driver_id === req.user.id) {
      return res.status(400).json({ error: 'Cannot request your own ride' });
    }

    // Check if ride has available seats
    if (ride.remaining_seats <= 0) {
      return res.status(400).json({ error: 'No seats available for this ride' });
    }

    // Check if user already has a request for this ride
    const existingRequest = await db.getQuery(
      'SELECT id, status FROM ride_requests WHERE ride_id = ? AND passenger_id = ?',
      [rideId, req.user.id]
    );

    if (existingRequest) {
      return res.status(400).json({ 
        error: `You already have a ${existingRequest.status} request for this ride` 
      });
    }

    // Create ride request
    const result = await db.runQuery(
      'INSERT INTO ride_requests (ride_id, passenger_id, message) VALUES (?, ?, ?)',
      [rideId, req.user.id, message || null]
    );

    const newRequest = await db.getQuery(`
      SELECT rr.*, u.name as passenger_name, u.phone as passenger_phone, u.email as passenger_email
      FROM ride_requests rr
      JOIN users u ON rr.passenger_id = u.id
      WHERE rr.id = ?
    `, [result.lastID]);

    res.status(201).json(newRequest);
  } catch (error) {
    console.error('Error creating ride request:', error);
    res.status(500).json({ error: 'Failed to create ride request' });
  }
});

// Get requests for a specific ride (for drivers)
router.get('/:rideId/requests', verifyToken, async (req, res) => {
  try {
    const { rideId } = req.params;

    // Verify that the user is the driver of this ride
    const ride = await db.getQuery(
      'SELECT driver_id FROM rides WHERE id = ?',
      [rideId]
    );

    if (!ride || ride.driver_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const requests = await db.allQuery(`
      SELECT rr.*, u.name as passenger_name, u.phone as passenger_phone, u.email as passenger_email
      FROM ride_requests rr
      JOIN users u ON rr.passenger_id = u.id
      WHERE rr.ride_id = ?
      ORDER BY rr.created_at ASC
    `, [rideId]);

    res.json(requests);
  } catch (error) {
    console.error('Error fetching ride requests:', error);
    res.status(500).json({ error: 'Failed to fetch ride requests' });
  }
});

// Update ride request status (accept/reject)
router.put('/requests/:requestId', verifyToken, async (req, res) => {
  try {
    const { requestId } = req.params;
    const { status } = req.body;

    if (!['confirmed', 'rejected', 'cancelled'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    // Get request details and verify ownership
    const request = await db.getQuery(`
      SELECT rr.*, r.driver_id, r.available_seats,
        (r.available_seats - COALESCE(confirmed_reqs.confirmed_count, 0)) as remaining_seats
      FROM ride_requests rr
      JOIN rides r ON rr.ride_id = r.id
      LEFT JOIN (
        SELECT ride_id, COUNT(*) as confirmed_count
        FROM ride_requests 
        WHERE status = 'confirmed'
        GROUP BY ride_id
      ) confirmed_reqs ON r.id = confirmed_reqs.ride_id
      WHERE rr.id = ?
    `, [requestId]);

    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }

    // Check authorization
    if (status === 'cancelled') {
      // Passengers can cancel their own requests
      if (request.passenger_id !== req.user.id) {
        return res.status(403).json({ error: 'Can only cancel your own requests' });
      }
    } else {
      // Only drivers can confirm/reject requests
      if (request.driver_id !== req.user.id) {
        return res.status(403).json({ error: 'Only the driver can accept or reject requests' });
      }
    }

    // Check seat availability for confirmations
    if (status === 'confirmed' && request.remaining_seats <= 0) {
      return res.status(400).json({ error: 'No seats available' });
    }

    // Update request status
    await db.runQuery(
      'UPDATE ride_requests SET status = ? WHERE id = ?',
      [status, requestId]
    );

    res.json({ message: `Request ${status} successfully` });
  } catch (error) {
    console.error('Error updating request status:', error);
    res.status(500).json({ error: 'Failed to update request status' });
  }
});

// Update ride status
router.put('/:rideId/status', verifyToken, async (req, res) => {
  try {
    const { rideId } = req.params;
    const { status } = req.body;

    if (!['active', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    // Verify ownership
    const ride = await db.getQuery(
      'SELECT driver_id FROM rides WHERE id = ?',
      [rideId]
    );

    if (!ride || ride.driver_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    await db.runQuery(
      'UPDATE rides SET status = ? WHERE id = ?',
      [status, rideId]
    );

    res.json({ message: `Ride ${status} successfully` });
  } catch (error) {
    console.error('Error updating ride status:', error);
    res.status(500).json({ error: 'Failed to update ride status' });
  }
});

// Delete ride
router.delete('/:rideId', verifyToken, async (req, res) => {
  try {
    const { rideId } = req.params;

    // Verify ownership
    const ride = await db.getQuery(
      'SELECT driver_id FROM rides WHERE id = ?',
      [rideId]
    );

    if (!ride || ride.driver_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Check if ride has confirmed passengers
    const confirmedPassengers = await db.getQuery(
      'SELECT COUNT(*) as count FROM ride_requests WHERE ride_id = ? AND status = "confirmed"',
      [rideId]
    );

    if (confirmedPassengers.count > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete ride with confirmed passengers. Mark as cancelled instead.' 
      });
    }

    // Delete ride and related requests
    await db.runQuery('DELETE FROM ride_requests WHERE ride_id = ?', [rideId]);
    await db.runQuery('DELETE FROM rides WHERE id = ?', [rideId]);

    res.json({ message: 'Ride deleted successfully' });
  } catch (error) {
    console.error('Error deleting ride:', error);
    res.status(500).json({ error: 'Failed to delete ride' });
  }
});

module.exports = router; 