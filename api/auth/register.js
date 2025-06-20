const express = require('express');
const cors = require('cors');
const serverless = require('serverless-http');

const app = express();

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Registration endpoint
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

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Mock registration
  const { name, email, password, phone } = req.body;
  
  // Basic validation
  if (!name || !email || !password || !phone) {
    return res.status(400).json({ error: 'All fields are required' });
  }
  
  // Mock successful registration
  res.status(201).json({
    token: 'mock-jwt-token',
    user: {
      id: Math.floor(Math.random() * 1000),
      name: name,
      email: email,
      is_admin: false
    }
  });
};

// Options for preflight CORS
app.options('/api/auth/register', cors());

module.exports = app;
module.exports.handler = serverless(app); 