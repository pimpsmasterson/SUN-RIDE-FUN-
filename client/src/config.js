const isProduction = process.env.NODE_ENV === 'production';

export const API_URL = isProduction 
  ? '/api' // Relative URL in production (same domain)
  : 'http://localhost:5000/api'; // Local development

export const SOCKET_URL = isProduction
  ? window.location.origin // Same domain in production
  : 'http://localhost:5000'; // Local development

export default {
  API_URL,
  SOCKET_URL,
  APP_NAME: 'Sun Festival Carpool',
  VERSION: '1.0.0',
};
