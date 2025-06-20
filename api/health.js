// Health check endpoint
module.exports = (req, res) => {
  res.json({
    status: 'ok',
    message: 'Sun Festival Carpool API is running',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  });
}; 