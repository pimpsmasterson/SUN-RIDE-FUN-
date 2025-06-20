# 🌞 S.U.N. Festival Ride Share Platform

![S.U.N. Festival](https://img.shields.io/badge/S.U.N.-Festival-gold?style=for-the-badge)
![React](https://img.shields.io/badge/React-18.x-blue?style=for-the-badge&logo=react)
![Node.js](https://img.shields.io/badge/Node.js-18.x-green?style=for-the-badge&logo=node.js)
![Status](https://img.shields.io/badge/Status-Active-brightgreen?style=for-the-badge)

A mystical, community-driven carpooling platform for the **Solar United Natives (S.U.N.) Festival** in Csobánkapuszta, Hungary. Connect with fellow festival-goers, share rides, and build meaningful connections on your journey to this sacred gathering.

## 🌟 Features

### 🚗 **Ride Sharing System**
- **Find Rides**: Connect with drivers heading to the festival
- **Offer Rides**: Share your vehicle and journey with kindred spirits
- **Manage Rides**: Track your ride offerings and requests
- **Smart Matching**: Location-based ride connections

### 💬 **Community Features**
- **Real-time Chat**: Communicate with potential travel companions
- **Community Hub**: Connect with the S.U.N. Festival community
- **Sacred Journey Planning**: Coordinate your festival experience

### 🎨 **Mystical Design**
- **Beautiful Forest Aesthetic**: Immersive mystical forest background
- **Responsive Design**: Works perfectly on all devices
- **Intuitive Interface**: Easy navigation for all users
- **Solar United Natives Branding**: Authentic festival theming

### 🎫 **Direct Membership Integration**
- **S.U.N. Full Year Access**: Direct link to official membership sales
- **Multiple Membership Options**: Annual, couples, groups, and lifetime memberships
- **Cooltix Integration**: Seamless connection to official ticketing platform

## 🚀 Quick Start (For Non-Technical Users)

### **Super Easy Setup - Just 2 Steps!**

1. **Install Node.js** (one-time setup):
   - Go to [nodejs.org](https://nodejs.org)
   - Download and install the **LTS version**
   - Restart your computer

2. **Run the Website**:
   - Double-click `EASY_SETUP.bat`
   - Wait for setup to complete
   - Website opens automatically at `http://localhost:3000`

**That's it!** 🎉 Your S.U.N. Festival website is now running locally.

> 📖 **Need help?** Read the detailed `HOW_TO_USE.txt` file included in the project.

## 🛠️ Technical Setup (For Developers)

### Prerequisites
- Node.js 18.x or higher
- npm or yarn package manager

### Installation

   ```bash
# Clone the repository
git clone https://github.com/pimpsmasterson/S.U.N-FESTIVAL-RIDE-SHARE.git
cd S.U.N-FESTIVAL-RIDE-SHARE

# Install main dependencies
npm install

# Install client dependencies
cd client
npm install

# Install server dependencies
cd ../server
npm install
```

### Development

   ```bash
# Start the development server
cd client
   npm start

# The website will be available at http://localhost:3000
```

### Production Build

```bash
# Build for production
cd client
npm run build
```

## 📁 Project Structure

```
S.U.N-FESTIVAL-RIDE-SHARE/
├── client/                 # React frontend application
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── services/       # API services
│   │   └── assets/         # Images and fonts
│   ├── public/             # Static files
│   └── package.json
├── server/                 # Node.js backend
│   ├── routes/             # API routes
│   ├── database/           # Database files
│   └── middleware/         # Express middleware
├── api/                    # Additional API endpoints
├── EASY_SETUP.bat          # One-click setup for non-technical users
├── HOW_TO_USE.txt          # User-friendly documentation
└── README.md               # This file
```

## 🎯 Key Components

### **Dashboard** (`client/src/components/Dashboard.js`)
- Hero section with mystical forest background
- Direct membership purchase integration
- Four main action cards for user journey

### **Ride Management**
- `RideList.js` - Browse available rides
- `CreateRide.js` - Offer new rides
- `MyRides.js` - Manage your rides

### **Community Features**
- `ChatComponent.js` - Real-time messaging
- `ChatHub.js` - Community discussions

### **Authentication**
- `Login.js` & `Register.js` - User authentication
- `AdminLogin.js` - Administrative access

## 🌐 Live Features

### **Membership Integration**
- Direct connection to [Cooltix ticketing platform](https://cooltix.hu/event/66f323b00dd8d14ca3a779fd)
- Multiple membership tiers available
- Seamless purchase experience

### **Festival Information**
- **Event**: S.U.N. Festival 2025
- **Dates**: June 30 - July 7, 2025
- **Location**: Csobánkapuszta, Hungary
- **Community**: Solar United Natives

## 🎨 Design Philosophy

The platform embraces the mystical and spiritual nature of the S.U.N. Festival:

- **Mystical Forest Theme**: Ancient tree spirits and magical forest imagery
- **Golden Accents**: Warm, solar-inspired color palette
- **Semi-transparent Elements**: Ethereal, glass-like UI components
- **Sacred Typography**: Custom Solar United Natives font
- **Smooth Animations**: Magical transitions and hover effects

## 🔧 Configuration

### 🚀 **HOSTING READY - No Environment Variables Needed!**

This application is **fully configured for public hosting** with a comprehensive admin panel that manages all settings through the database. No environment variables required!

**After deployment:**
1. Go to `https://yourdomain.com/admin/login`
2. Login with: `admin@sunfestival.com` / `admin123`
3. Configure all settings through the admin panel

See `HOSTING_GUIDE.md` for complete deployment instructions.

### Customization
- **Colors**: Modify `client/tailwind.config.js` for theme colors
- **Fonts**: Update `client/src/fonts.css` for typography
- **Images**: Replace banner image in `client/src/sun-festival-banner.png`

## 📱 Responsive Design

The platform is fully responsive and works beautifully on:
- **Desktop**: Full-featured experience
- **Tablet**: Optimized layout and navigation
- **Mobile**: Touch-friendly interface

## 🚀 Deployment

### Local Development
Use the provided `EASY_SETUP.bat` for instant local setup.

### Production Deployment
The project includes configuration for:
- **Vercel**: `vercel.json` configuration included
- **Render**: `render.yaml` configuration included
- **PM2**: `ecosystem.config.js` for process management

## 🤝 Contributing

This is a community-driven project for the S.U.N. Festival. Contributions are welcome!

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is created for the S.U.N. Festival community. Please respect the spiritual and community-driven nature of this platform.

## 🌟 Acknowledgments

- **S.U.N. Festival Community**: For inspiring this platform
- **Solar United Natives**: For the mystical branding and vision
- **Csobánkapuszta**: For hosting this sacred gathering
- **All Contributors**: Who help make this platform magical

## 📞 Support

For technical support or questions about the platform:
- Create an issue in this repository
- Contact the development team
- Join the community discussions

---

**🌞 Join the Sacred Journey - Connect, Share, Celebrate 🌞**

*Made with ❤️ for the S.U.N. Festival Community*