import React from 'react';
import { Link } from 'react-router-dom';
import { Car, Plus, Search, Users, MessageCircle, Sun, Leaf, Heart, Star } from 'lucide-react';

function Dashboard() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-sun-50 via-earth-50 to-forest-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* S.U.N. Festival Welcome Header */}
        <div className="festival-header cosmic-container mb-8 relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center justify-center mb-4 space-x-4">
              <Sun className="h-12 w-12 sun-symbol animate-glow" />
              <div className="h-8 w-0.5 bg-white/30"></div>
              <Leaf className="h-8 w-8 nature-accent" />
              <div className="h-8 w-0.5 bg-white/30"></div>
              <Heart className="h-8 w-8 spirit-accent" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-3 font-spirit">
              ☀️ Welcome to S.U.N. Festival Carpool ☀️
            </h1>
            <p className="text-xl md:text-2xl opacity-95 mb-2 font-medium">
              Solar United Natives • Community Gathering
            </p>
            <p className="text-lg opacity-90 mb-3">
              June 30 - July 7, 2025 • Csobánkapuszta, Hungary
            </p>
            <div className="flex items-center justify-center space-x-6 text-base opacity-85">
              <span className="flex items-center space-x-2">
                <Leaf className="h-4 w-4" />
                <span>Love</span>
              </span>
              <span className="flex items-center space-x-2">
                <Sun className="h-4 w-4" />
                <span>Life</span>
              </span>
              <span className="flex items-center space-x-2">
                <Heart className="h-4 w-4" />
                <span>Peace</span>
              </span>
            </div>
          </div>
          
          {/* Sacred geometry background patterns */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-10 left-10 w-20 h-20 border border-white/30 rounded-full animate-pulse-gentle"></div>
            <div className="absolute top-20 right-20 w-16 h-16 border border-white/30 rounded-full animate-pulse-gentle" style={{animationDelay: '1s'}}></div>
            <div className="absolute bottom-10 left-1/3 w-12 h-12 border border-white/30 rounded-full animate-pulse-gentle" style={{animationDelay: '2s'}}></div>
            <div className="absolute bottom-20 right-10 w-24 h-24 border border-white/30 rounded-full animate-pulse-gentle" style={{animationDelay: '0.5s'}}></div>
          </div>
        </div>

        {/* Spiritual Journey Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          <Link
            to="/rides"
            className="card cosmic-container hover:transform hover:scale-105 transition-all duration-300 group"
          >
            <div className="text-center">
              <div className="bg-sun-gradient p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center group-hover:animate-float">
                <Search className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-earth-800 mb-2">Find Your Journey</h3>
              <p className="text-earth-600">
                Connect with fellow souls traveling to our sacred gathering
              </p>
            </div>
          </Link>

          <Link
            to="/create-ride"
            className="card-nature cosmic-container hover:transform hover:scale-105 transition-all duration-300 group"
          >
            <div className="text-center">
              <div className="bg-nature-gradient p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center group-hover:animate-float">
                <Plus className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-earth-800 mb-2">Share Your Path</h3>
              <p className="text-earth-600">
                Offer a ride and spread positive energy to the community
              </p>
            </div>
          </Link>

          <Link
            to="/my-rides"
            className="card-spirit cosmic-container hover:transform hover:scale-105 transition-all duration-300 group"
          >
            <div className="text-center">
              <div className="bg-spirit-gradient p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center group-hover:animate-float">
                <Car className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-earth-800 mb-2">My Sacred Rides</h3>
              <p className="text-earth-600">
                Manage your journey offerings and connections
              </p>
            </div>
          </Link>

          <Link
            to="/chat"
            className="card hover:transform hover:scale-105 transition-all duration-300 group bg-gradient-to-br from-peace-50/90 to-sun-50/90 backdrop-blur-md"
          >
            <div className="text-center">
              <div className="bg-gradient-to-r from-peace-400 to-peace-500 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center group-hover:animate-float">
                <MessageCircle className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-earth-800 mb-2">Community Chat</h3>
              <p className="text-earth-600">
                Connect hearts and minds with your travel companions
              </p>
            </div>
          </Link>
        </div>

        {/* Festival Spirit Information */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* About S.U.N. Festival */}
          <div className="card cosmic-container sacred-pattern">
            <div className="flex items-center mb-6">
              <Sun className="h-8 w-8 sun-symbol mr-3" />
              <h2 className="text-2xl font-bold text-earth-800 font-spirit">About S.U.N. Festival</h2>
            </div>
            <div className="space-y-4 text-earth-700">
              <p className="leading-relaxed">
                <strong className="text-sun-600">Solar United Natives</strong> is a sacred gathering where 
                love, life, and peace converge in the heart of nature. Our community celebrates 
                consciousness, healing, and the profound connection between all beings.
              </p>
              <p className="leading-relaxed">
                Nestled in the magical landscape of <strong className="text-forest-600">Csobánkapuszta, Hungary</strong>, 
                our festival grounds offer a sanctuary for spiritual growth, artistic expression, 
                and environmental harmony.
              </p>
              <div className="flex items-center space-x-4 pt-4">
                <span className="flex items-center space-x-2 text-sun-600">
                  <Star className="h-4 w-4" />
                  <span className="text-sm font-medium">Healing Sessions</span>
                </span>
                <span className="flex items-center space-x-2 text-forest-600">
                  <Leaf className="h-4 w-4" />
                  <span className="text-sm font-medium">Eco-Conscious</span>
                </span>
                <span className="flex items-center space-x-2 text-spirit-600">
                  <Heart className="h-4 w-4" />
                  <span className="text-sm font-medium">Community</span>
                </span>
              </div>
            </div>
          </div>

          {/* Carpooling Spirit */}
          <div className="card-nature cosmic-container">
            <div className="flex items-center mb-6">
              <Users className="h-8 w-8 nature-accent mr-3" />
              <h2 className="text-2xl font-bold text-earth-800 font-spirit">Carpooling Community</h2>
            </div>
            <div className="space-y-4 text-earth-700">
              <p className="leading-relaxed">
                Join our sacred circle of travelers! Carpooling embodies our values of 
                <strong className="text-forest-600"> environmental consciousness</strong>, 
                <strong className="text-spirit-600"> community connection</strong>, and 
                <strong className="text-peace-600"> shared abundance</strong>.
              </p>
              <div className="bg-gradient-to-r from-sun-50 to-forest-50 p-4 rounded-xl border-l-4 border-sun-400">
                <p className="text-sm italic text-earth-600">
                  "When we travel together, we reduce our footprint on Mother Earth 
                  while deepening our bonds with fellow souls. Every shared journey 
                  is a step toward global harmony." 
                </p>
              </div>
              <div className="flex space-x-3">
                <div className="text-center flex-1">
                  <div className="text-2xl font-bold text-sun-600">🌍</div>
                  <div className="text-xs text-earth-600">Eco-Friendly</div>
                </div>
                <div className="text-center flex-1">
                  <div className="text-2xl font-bold text-forest-600">🤝</div>
                  <div className="text-xs text-earth-600">Community</div>
                </div>
                <div className="text-center flex-1">
                  <div className="text-2xl font-bold text-spirit-600">💫</div>
                  <div className="text-xs text-earth-600">Sacred Bond</div>
                </div>
                <div className="text-center flex-1">
                  <div className="text-2xl font-bold text-peace-600">☮️</div>
                  <div className="text-xs text-earth-600">Peace</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Getting Started Journey */}
        <div className="card-spirit cosmic-container">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-earth-800 mb-4 font-spirit">
              🌟 Begin Your Sacred Journey 🌟
            </h2>
            <p className="text-lg text-earth-600 max-w-3xl mx-auto">
              Whether you're seeking passage to our gathering or offering your vehicle as a vessel 
              of connection, every step is part of the beautiful tapestry we weave together.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center space-y-3">
              <div className="bg-sun-gradient p-3 rounded-full w-12 h-12 mx-auto flex items-center justify-center">
                <span className="text-white font-bold">1</span>
              </div>
              <h3 className="font-semibold text-earth-800">Connect & Discover</h3>
              <p className="text-sm text-earth-600">
                Browse available rides or create your own offering to the community
              </p>
            </div>
            <div className="text-center space-y-3">
              <div className="bg-nature-gradient p-3 rounded-full w-12 h-12 mx-auto flex items-center justify-center">
                <span className="text-white font-bold">2</span>
              </div>
              <h3 className="font-semibold text-earth-800">Sacred Communication</h3>
              <p className="text-sm text-earth-600">
                Use our mindful chat system to coordinate and build beautiful connections
              </p>
            </div>
            <div className="text-center space-y-3">
              <div className="bg-spirit-gradient p-3 rounded-full w-12 h-12 mx-auto flex items-center justify-center">
                <span className="text-white font-bold">3</span>
              </div>
              <h3 className="font-semibold text-earth-800">Journey Together</h3>
              <p className="text-sm text-earth-600">
                Share the path to our sacred gathering with kindred spirits
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard; 