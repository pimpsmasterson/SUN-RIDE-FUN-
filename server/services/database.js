const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');

const dbPath = path.join(__dirname, '../database/festival.db');

class DatabaseService {
  constructor() {
    this.db = null;
  }

  initializeDatabase() {
    return new Promise((resolve, reject) => {
      // Ensure database directory exists
      const fs = require('fs');
      const dbDir = path.dirname(dbPath);
      if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true });
      }

      this.db = new sqlite3.Database(dbPath, (err) => {
        if (err) {
          console.error('Error opening database:', err);
          reject(err);
        } else {
          console.log('Connected to SQLite database');
          this.createTables().then(resolve).catch(reject);
        }
      });
    });
  }

  async createTables() {
    const queries = [
      // Users table
      `CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        phone TEXT NOT NULL,
        password_hash TEXT NOT NULL,
        is_admin BOOLEAN DEFAULT FALSE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,

      // Rides table
      `CREATE TABLE IF NOT EXISTS rides (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        driver_id INTEGER NOT NULL,
        pickup_location TEXT NOT NULL,
        pickup_coords TEXT,
        destination TEXT DEFAULT 'Sun Festival - Csobánkapuszta',
        destination_coords TEXT DEFAULT '46.9746,20.1353',
        departure_time DATETIME NOT NULL,
        available_seats INTEGER NOT NULL,
        description TEXT,
        status TEXT DEFAULT 'active',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (driver_id) REFERENCES users (id)
      )`,

      // Ride requests table
      `CREATE TABLE IF NOT EXISTS ride_requests (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        ride_id INTEGER NOT NULL,
        passenger_id INTEGER NOT NULL,
        status TEXT DEFAULT 'pending',
        message TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (ride_id) REFERENCES rides (id),
        FOREIGN KEY (passenger_id) REFERENCES users (id)
      )`,

      // Chat messages table
      `CREATE TABLE IF NOT EXISTS chat_messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        ride_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        message TEXT,
        location_lat REAL,
        location_lng REAL,
        message_type TEXT DEFAULT 'text',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (ride_id) REFERENCES rides (id),
        FOREIGN KEY (user_id) REFERENCES users (id)
      )`,

      // Admin settings table (for Google Maps API management)
      `CREATE TABLE IF NOT EXISTS admin_settings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        setting_key TEXT UNIQUE NOT NULL,
        setting_value TEXT,
        description TEXT,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,

      // Festival locations table (predefined pickup points)
      `CREATE TABLE IF NOT EXISTS festival_locations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        address TEXT NOT NULL,
        latitude REAL NOT NULL,
        longitude REAL NOT NULL,
        is_active BOOLEAN DEFAULT TRUE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`
    ];

    for (const query of queries) {
      await this.runQuery(query);
    }

    // Insert default admin settings
    await this.insertDefaultSettings();
    await this.insertDefaultLocations();
    await this.createDefaultAdmin();
  }

  async insertDefaultSettings() {
    const defaultSettings = [
      // API Configuration
      {
        key: 'google_maps_api_key',
        value: '',
        description: 'Google Maps JavaScript API Key for location services'
      },
      
      // Festival Configuration
      {
        key: 'festival_name',
        value: 'Sun Festival 2025',
        description: 'Name of the festival'
      },
      {
        key: 'festival_location',
        value: 'Csobánkapuszta, Hungary',
        description: 'Festival location address'
      },
      {
        key: 'festival_coordinates',
        value: '46.9746,20.1353',
        description: 'Festival GPS coordinates (lat,lng)'
      },
      {
        key: 'festival_dates',
        value: 'June 29 - July 6, 2025',
        description: 'Festival dates'
      },
      
      // Security Configuration
      {
        key: 'jwt_secret',
        value: this.generateSecureSecret(),
        description: 'JWT Secret for authentication (auto-generated)'
      },
      {
        key: 'session_timeout',
        value: '24h',
        description: 'User session timeout duration'
      },
      
      // Application Configuration
      {
        key: 'app_name',
        value: 'Sun Festival Carpool',
        description: 'Application name displayed to users'
      },
      {
        key: 'app_version',
        value: '1.0.0',
        description: 'Current application version'
      },
      {
        key: 'app_description',
        value: 'Community-driven carpooling web app for Sun Festival 2025',
        description: 'Application description for SEO and branding'
      },
      
      // Email Configuration (for future use)
      {
        key: 'smtp_host',
        value: '',
        description: 'SMTP server hostname for email notifications'
      },
      {
        key: 'smtp_port',
        value: '587',
        description: 'SMTP server port'
      },
      {
        key: 'smtp_user',
        value: '',
        description: 'SMTP username'
      },
      {
        key: 'smtp_password',
        value: '',
        description: 'SMTP password'
      },
      {
        key: 'admin_email',
        value: 'admin@sunfestival.com',
        description: 'Administrator email address'
      },
      
      // Hosting Configuration
      {
        key: 'domain_name',
        value: '',
        description: 'Your website domain (e.g., sunfestival.com)'
      },
      {
        key: 'cors_origins',
        value: '*',
        description: 'Allowed CORS origins (comma-separated)'
      },
      {
        key: 'rate_limit_requests',
        value: '100',
        description: 'Rate limit: requests per window'
      },
      {
        key: 'rate_limit_window',
        value: '15',
        description: 'Rate limit: window in minutes'
      },
      
      // Feature Flags
      {
        key: 'enable_chat',
        value: 'true',
        description: 'Enable/disable chat functionality'
      },
      {
        key: 'enable_location_sharing',
        value: 'true',
        description: 'Enable/disable location sharing in chat'
      },
      {
        key: 'enable_registration',
        value: 'true',
        description: 'Enable/disable new user registration'
      },
      {
        key: 'maintenance_mode',
        value: 'false',
        description: 'Enable maintenance mode (blocks non-admin access)'
      },
      
      // Database Configuration
      {
        key: 'db_backup_enabled',
        value: 'true',
        description: 'Enable automatic database backups'
      },
      {
        key: 'db_backup_interval',
        value: '24',
        description: 'Database backup interval in hours'
      },
      
      // Analytics & Monitoring
      {
        key: 'google_analytics_id',
        value: '',
        description: 'Google Analytics tracking ID (optional)'
      },
      {
        key: 'error_reporting_enabled',
        value: 'true',
        description: 'Enable error reporting and logging'
      }
    ];

    for (const setting of defaultSettings) {
      await this.runQuery(
        `INSERT OR IGNORE INTO admin_settings (setting_key, setting_value, description) VALUES (?, ?, ?)`,
        [setting.key, setting.value, setting.description]
      );
    }
  }

  generateSecureSecret() {
    const crypto = require('crypto');
    return crypto.randomBytes(64).toString('hex');
  }

  // Helper method to get a setting value
  async getSetting(key, defaultValue = null) {
    const setting = await this.getQuery(
      'SELECT setting_value FROM admin_settings WHERE setting_key = ?',
      [key]
    );
    return setting ? setting.setting_value : defaultValue;
  }

  // Helper method to update a setting
  async updateSetting(key, value) {
    await this.runQuery(
      'UPDATE admin_settings SET setting_value = ?, updated_at = CURRENT_TIMESTAMP WHERE setting_key = ?',
      [value, key]
    );
  }

  async insertDefaultLocations() {
    const defaultLocations = [
      { name: 'Budapest Center', address: 'Budapest, Deák Ferenc tér', lat: 47.4979, lng: 19.0402 },
      { name: 'Szolnok', address: 'Szolnok, Hungary', lat: 47.1733, lng: 20.1764 },
      { name: 'Debrecen', address: 'Debrecen, Hungary', lat: 47.5316, lng: 21.6273 },
      { name: 'Szeged', address: 'Szeged, Hungary', lat: 46.2530, lng: 20.1414 },
      { name: 'Pécs', address: 'Pécs, Hungary', lat: 46.0727, lng: 18.2340 }
    ];

    for (const location of defaultLocations) {
      await this.runQuery(
        `INSERT OR IGNORE INTO festival_locations (name, address, latitude, longitude) VALUES (?, ?, ?, ?)`,
        [location.name, location.address, location.lat, location.lng]
      );
    }
  }

  async createDefaultAdmin() {
    const adminExists = await this.getQuery(
      'SELECT id FROM users WHERE is_admin = TRUE LIMIT 1'
    );

    if (!adminExists) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await this.runQuery(
        `INSERT INTO users (name, email, phone, password_hash, is_admin) VALUES (?, ?, ?, ?, ?)`,
        ['Festival Admin', 'admin@sunfestival.com', '+36-70-123-4567', hashedPassword, true]
      );
      console.log('Default admin created: admin@sunfestival.com / admin123');
    }
  }

  runQuery(query, params = []) {
    return new Promise((resolve, reject) => {
      this.db.run(query, params, function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ lastID: this.lastID, changes: this.changes });
        }
      });
    });
  }

  getQuery(query, params = []) {
    return new Promise((resolve, reject) => {
      this.db.get(query, params, (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  allQuery(query, params = []) {
    return new Promise((resolve, reject) => {
      this.db.all(query, params, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  close() {
    return new Promise((resolve) => {
      this.db.close((err) => {
        if (err) {
          console.error('Error closing database:', err);
        } else {
          console.log('Database connection closed');
        }
        resolve();
      });
    });
  }

  // Helper method to get a setting value
  async getSetting(key, defaultValue = null) {
    const setting = await this.getQuery(
      'SELECT setting_value FROM admin_settings WHERE setting_key = ?',
      [key]
    );
    return setting ? setting.setting_value : defaultValue;
  }

  // Helper method to update a setting
  async updateSetting(key, value) {
    await this.runQuery(
      'UPDATE admin_settings SET setting_value = ?, updated_at = CURRENT_TIMESTAMP WHERE setting_key = ?',
      [value, key]
    );
  }

  generateSecureSecret() {
    const crypto = require('crypto');
    return crypto.randomBytes(64).toString('hex');
  }
}

module.exports = new DatabaseService(); 