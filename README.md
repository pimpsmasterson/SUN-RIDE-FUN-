# 🌞 Sun Festival Carpool 2025

A community-driven carpooling web application for the Sun Festival (Solar United Natives) in Csobánkapuszta, Hungary, from June 29 to July 6, 2025.

## 🚗 Features

- **User Registration & Authentication** - Secure login system for festival-goers
- **Ride Offering & Requesting** - Drivers can offer rides, passengers can request them
- **Real-time Chat** - Text messaging and location sharing between ride participants
- **Admin Panel** - Google Maps API management and festival configuration
- **Predefined Locations** - Common pickup points (Budapest, Szolnok, Debrecen, etc.)
- **Mobile-Friendly** - Responsive design works on all devices
- **Community-Driven** - No payment system, based on trust and community spirit

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern UI framework
- **Tailwind CSS** - Utility-first styling
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **React Hot Toast** - Notifications
- **Lucide React** - Beautiful icons

### Backend
- **Node.js** - Server runtime
- **Express.js** - Web framework
- **SQLite** - Lightweight database
- **Socket.IO** - Real-time communication
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing

### APIs & Services
- **Google Maps API** - Location services (configurable via admin)
- **WebSocket** - Real-time chat and updates

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ and npm
- 4GB+ RAM for local server
- Stable internet connection

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd sun-festival-carpool
   ```

2. **Install dependencies**
   ```bash
   npm run install-all
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - Admin Panel: http://localhost:3000/admin/login

### Default Admin Access
- **Email:** admin@sunfestival.com
- **Password:** admin123

⚠️ **Important:** Change these credentials after first login!

## 🔧 Configuration

### Google Maps API Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing one
3. Enable the following APIs:
   - Maps JavaScript API
   - Geocoding API
   - Places API
4. Create credentials (API Key)
5. Restrict the API key to your domains for security
6. Add the API key through the admin panel at `/admin/settings`

### Festival Configuration

All festival settings can be configured through the admin panel:
- Festival name and dates
- Location and coordinates
- Pickup locations
- Google Maps API integration

## 📱 Usage

### For Festival-Goers

1. **Register/Login** - Create an account or sign in
2. **Find Rides** - Browse available rides to the festival
3. **Offer Rides** - Share your car and help others
4. **Chat** - Coordinate with your ride partners
5. **Share Location** - Real-time location sharing during travel

### For Admins

1. **Login** - Access admin panel at `/admin/login`
2. **Configure APIs** - Set up Google Maps integration
3. **Manage Locations** - Add/edit pickup points
4. **Monitor Activity** - View dashboard statistics

## 🌐 Deployment

### Local PC Server Setup

1. **Install Node.js** on your local PC
2. **Configure port forwarding** on your router (port 5000)
3. **Optional:** Use dynamic DNS service (e.g., No-IP) for friendly URL
4. **Install NGINX** for production (optional but recommended)

### Production Build

```bash
# Build the React app
npm run build

# Start production server
NODE_ENV=production npm run server
```

### Sharing the App

- Share the URL via Facebook and festival channels
- Create a simple guide for users
- Ensure stable internet connection during festival dates

## 📊 Database Schema

The app uses SQLite with the following main tables:
- `users` - User accounts and authentication
- `rides` - Ride offers and details
- `ride_requests` - Passenger requests to join rides
- `chat_messages` - Text and location messages
- `admin_settings` - Google Maps API and festival config
- `festival_locations` - Predefined pickup points

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcryptjs
- Admin-only access to sensitive settings
- Input validation and sanitization
- CORS protection

## 🤝 Community Guidelines

- Be respectful and communicate clearly
- Share contact details for coordination
- Confirm ride details before departure
- Split fuel costs fairly among passengers
- Leave on time and keep commitments
- Report issues to festival organizers

## ⚖️ Legal Disclaimer

This is a community-driven service. Users arrange rides at their own risk. Please use common sense and stay safe while traveling.

## 🛣️ Development Roadmap

### Phase 1 (Current) ✅
- Basic authentication and user management
- Admin panel for Google Maps API configuration
- Database setup and core infrastructure
- Responsive UI with festival theme

### Phase 2 (Next)
- Complete ride offering and requesting system
- Real-time chat with location sharing
- Google Maps integration for locations
- Enhanced admin location management

### Phase 3 (Future)
- Push notifications for ride updates
- Advanced filtering and search
- User profiles and preferences
- Mobile app (React Native)

## 🐛 Troubleshooting

### Common Issues

1. **Database not created**
   - Ensure write permissions in server/database/ directory
   - Check Node.js version (16+ required)

2. **Google Maps not working**
   - Verify API key in admin settings
   - Check API quotas and billing in Google Cloud
   - Ensure required APIs are enabled

3. **Real-time features not working**
   - Check WebSocket connection
   - Verify port 5000 is accessible
   - Check firewall settings

## 📞 Support

For technical issues or questions:
- Check the troubleshooting section above
- Review the admin dashboard for system status
- Contact festival organizers for community support

## 📄 License

MIT License - Feel free to use and modify for your own festival!

---

**Built with ❤️ for the Sun Festival community**

*Connecting festival-goers through sustainable carpooling* 🌞🚗 