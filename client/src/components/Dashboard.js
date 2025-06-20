import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Car, Plus, Search, Users, MessageCircle, Sun, Leaf, Heart, Star } from 'lucide-react';
import bannerImage from '../sun-festival-banner.png';

// Font loading component
const FontLoader = () => {
  useEffect(() => {
    const fontStyle = `
      @font-face {
        font-family: 'Solar United Natives';
        src: url(${process.env.PUBLIC_URL}/fonts/Solar.United.Natives_bold_teszt.ttf) format('truetype');
        font-weight: bold;
        font-style: normal;
        font-display: swap;
      }
    `;

    const styleElement = document.createElement('style');
    styleElement.textContent = fontStyle;
    document.head.appendChild(styleElement);

    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  return null;
};

function Dashboard() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-sun-50 via-earth-50 to-forest-50">
      <FontLoader />
      
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <div className="relative h-full w-full">
            {/* Background Image with Overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/50 to-black/70 z-0"></div>
            <img 
              src={bannerImage} 
              alt="S.U.N. Festival Banner" 
              className="absolute inset-0 w-full h-full object-cover object-center"
              style={{ '--banner-image': `url(${bannerImage})` }}
            />
            
            {/* Content Container */}
            <div className="relative z-10 w-full px-4 sm:px-6 lg:px-8 py-16">
              <div className="max-w-7xl mx-auto">
                <div className="text-center space-y-8 max-w-4xl mx-auto">
                  {/* CTA Buttons */}
                  <div className="flex flex-col sm:flex-row gap-4 justify-center mt-12">
                    <a 
                      href="https://cooltix.hu/event/66f323b00dd8d14ca3a779fd"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-12 py-5 bg-yellow-400/25 backdrop-blur-md text-white font-black rounded-full hover:bg-yellow-400/35 transition-all duration-500 transform hover:scale-105 shadow-2xl hover:shadow-3xl hover:shadow-yellow-500/30 flex items-center justify-center gap-3 group relative overflow-hidden border-2 border-yellow-400/50 hover:border-yellow-300/70 no-underline"
                      style={{ 
                        fontFamily: '"Solar United Natives", sans-serif',
                        textShadow: '0 2px 8px rgba(0, 0, 0, 0.8), 0 4px 16px rgba(0, 0, 0, 0.6)',
                        fontWeight: '900'
                      }}
                    >
                      {/* Magical sparkle effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out"></div>
                      
                      <Sun className="w-8 h-8 text-white group-hover:rotate-180 transition-transform duration-500 drop-shadow-lg" />
                      <span className="relative z-10 text-2xl font-black tracking-wide">S.U.N. Full Year Access</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Main Content */}
      <div className="container mx-auto px-4 py-16">
        {/* Spiritual Journey Actions */}
        <div className="relative py-20 bg-gradient-to-b from-gray-50 to-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <span className="inline-block text-festival-gold font-semibold text-lg mb-3">CONNECT</span>
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Your Journey Awaits</h2>
              <div className="h-1.5 w-20 bg-festival-gold mx-auto rounded-full"></div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <Link
                to="/rides"
                className="group relative bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 hover:-translate-y-2"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-50 to-yellow-100 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative p-8 text-center">
                  <div className="inline-flex items-center justify-center w-20 h-20 mx-auto mb-6 rounded-2xl bg-yellow-100 text-yellow-600 group-hover:bg-yellow-500 group-hover:text-white transition-colors duration-300">
                    <Search className="h-10 w-10" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Find Your Journey</h3>
                  <p className="text-gray-600 mb-6">
                    Connect with fellow souls traveling to our sacred gathering
                  </p>
                  <span className="inline-flex items-center text-festival-gold font-medium group-hover:text-yellow-700 transition-colors duration-300">
                    Find Rides
                    <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </span>
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-yellow-400 to-yellow-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </Link>

              <Link
                to="/create-ride"
                className="group relative bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 hover:-translate-y-2"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-green-100 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative p-8 text-center">
                  <div className="inline-flex items-center justify-center w-20 h-20 mx-auto mb-6 rounded-2xl bg-green-100 text-green-600 group-hover:bg-green-500 group-hover:text-white transition-colors duration-300">
                    <Plus className="h-10 w-10" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Share Your Path</h3>
                  <p className="text-gray-600 mb-6">
                    Offer a ride and share the journey with kindred spirits
                  </p>
                  <span className="inline-flex items-center text-green-600 font-medium group-hover:text-green-700 transition-colors duration-300">
                    Offer a Ride
                    <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </span>
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-green-400 to-green-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </Link>

              <Link
                to="/my-rides"
                className="group relative bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 hover:-translate-y-2"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-indigo-100 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative p-8 text-center">
                  <div className="inline-flex items-center justify-center w-20 h-20 mx-auto mb-6 rounded-2xl bg-indigo-100 text-indigo-600 group-hover:bg-indigo-500 group-hover:text-white transition-colors duration-300">
                    <Car className="h-10 w-10" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">My Sacred Rides</h3>
                  <p className="text-gray-600 mb-6">
                    Manage your journey offerings and connections
                  </p>
                  <span className="inline-flex items-center text-indigo-600 font-medium group-hover:text-indigo-700 transition-colors duration-300">
                    View My Rides
                    <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </span>
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-400 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </Link>

              <Link
                to="/chat"
                className="group relative bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 hover:-translate-y-2"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-cyan-100 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative p-8 text-center">
                  <div className="inline-flex items-center justify-center w-20 h-20 mx-auto mb-6 rounded-2xl bg-blue-100 text-blue-600 group-hover:bg-blue-500 group-hover:text-white transition-colors duration-300">
                    <MessageCircle className="h-10 w-10" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Community Chat</h3>
                  <p className="text-gray-600 mb-6">
                    Connect hearts and minds with your travel companions
                  </p>
                  <span className="inline-flex items-center text-blue-600 font-medium group-hover:text-blue-700 transition-colors duration-300">
                    Join the Conversation
                    <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </span>
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-400 to-cyan-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </Link>
            </div>
        </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;