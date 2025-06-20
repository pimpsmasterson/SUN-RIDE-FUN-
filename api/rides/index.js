// Rides endpoint
module.exports = (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

  // Handle OPTIONS request for CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Mock rides data
  const rides = [
    {
      id: 1,
      driver_id: 1,
      driver_name: 'John Driver',
      pickup_location: 'Budapest Center',
      destination: 'Sun Festival - Csobánkapuszta',
      departure_time: '2025-06-28T10:00:00Z',
      available_seats: 3,
      status: 'active'
    },
    {
      id: 2,
      driver_id: 2,
      driver_name: 'Sarah Driver',
      pickup_location: 'Szolnok',
      destination: 'Sun Festival - Csobánkapuszta',
      departure_time: '2025-06-29T08:30:00Z',
      available_seats: 2,
      status: 'active'
    }
  ];
  
  res.json({ rides, total: rides.length });
}; 