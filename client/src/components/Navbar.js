import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../App';
import { LogOut, Menu, X, Sun, Heart, MessageCircle, Car, Search, Plus, User } from 'lucide-react';

function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigation = [
    { name: 'Sacred Home', href: '/', icon: Sun },
    { name: 'Find Journeys', href: '/rides', icon: Search },
    { name: 'Share Path', href: '/create-ride', icon: Plus },
    { name: 'My Rides', href: '/my-rides', icon: Car },
    { name: 'My Requests', href: '/my-requests', icon: User },
    { name: 'Community Chat', href: '/chat', icon: MessageCircle }
  ];

  const isCurrentPath = (path) => {
    return location.pathname === path;
  };

  const handleLogout = () => {
    logout();
    setIsMobileMenuOpen(false);
  };

  if (!user) {
    return null;
  }

  return (
    <nav className="navbar-with-banner shadow-xl border-b border-earth-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* S.U.N. Festival Logo */}
          <div className="flex items-center">
            <Link 
              to="/" 
              className="flex items-center space-x-3 group"
            >
              <div className="relative">
                <Sun className="h-10 w-10 sun-symbol group-hover:animate-glow transition-all duration-300" />
                <div className="absolute inset-0 bg-sun-500 rounded-full opacity-20 group-hover:opacity-30 transition-opacity duration-300 animate-pulse-gentle"></div>
              </div>
              <div className="hidden md:block">
                <div className="text-xl font-bold bg-gradient-to-r from-sun-600 via-forest-600 to-spirit-600 bg-clip-text text-transparent font-spirit">
                  S.U.N. Carpool
                </div>
                <div className="text-xs text-earth-600 -mt-1">
                  Solar United Natives
                </div>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 flex items-center space-x-2 ${
                    isCurrentPath(item.href)
                      ? 'bg-sun-gradient text-white shadow-lg shadow-sun-500/30'
                      : 'text-earth-700 hover:bg-gradient-to-r hover:from-sun-50 hover:to-forest-50 hover:text-earth-800'
                  }`}
                >
                  <Icon className={`h-4 w-4 ${isCurrentPath(item.href) ? 'text-white' : 'text-earth-600'}`} />
                  <span className="text-sm">{item.name}</span>
                </Link>
              );
            })}
          </div>

          {/* User Menu */}
          <div className="hidden md:flex items-center space-x-4">
            <div className="flex items-center space-x-3 px-4 py-2 bg-gradient-to-r from-spirit-50 to-peace-50 rounded-xl border border-spirit-200">
              <Heart className="h-4 w-4 spirit-accent" />
              <span className="text-sm font-medium text-earth-700">
                Welcome, {user.name}
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-earth-400 to-earth-500 hover:from-earth-500 hover:to-earth-600 text-white rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
            >
              <LogOut className="h-4 w-4" />
              <span className="text-sm">Journey's End</span>
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-xl text-earth-600 hover:text-earth-800 hover:bg-sun-50 transition-all duration-300"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white/95 rounded-2xl mt-4 p-4 border border-earth-200 shadow-xl" style={{backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)'}}>
            {/* User info */}
            <div className="flex items-center space-x-3 p-3 mb-4 bg-gradient-to-r from-spirit-50 to-peace-50 rounded-xl border border-spirit-200">
              <Heart className="h-5 w-5 spirit-accent" />
              <span className="font-medium text-earth-700">Welcome, {user.name}</span>
            </div>

            {/* Navigation links */}
            <div className="space-y-2 mb-4">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-xl font-medium transition-all duration-300 ${
                      isCurrentPath(item.href)
                        ? 'bg-sun-gradient text-white shadow-lg'
                        : 'text-earth-700 hover:bg-gradient-to-r hover:from-sun-50 hover:to-forest-50'
                    }`}
                  >
                    <Icon className={`h-5 w-5 ${isCurrentPath(item.href) ? 'text-white' : 'text-earth-600'}`} />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>

            {/* Logout button */}
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-earth-400 to-earth-500 text-white rounded-xl transition-all duration-300 hover:shadow-lg"
            >
              <LogOut className="h-5 w-5" />
              <span>Journey's End</span>
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar; 