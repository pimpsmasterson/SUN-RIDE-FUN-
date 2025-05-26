import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  MessageCircle, 
  Calendar, 
  MapPin, 
  Users, 
  Clock, 
  Car,
  RefreshCw,
  Search
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import ChatComponent from './ChatComponent';

function ChatHub() {
  const [availableChats, setAvailableChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showChat, setShowChat] = useState(false);
  const [selectedRideForChat, setSelectedRideForChat] = useState(null);

  useEffect(() => {
    fetchAvailableChats();
  }, []);

  const fetchAvailableChats = async () => {
    try {
      setLoading(true);
      
      // Fetch user's rides with confirmed passengers
      const ridesResponse = await axios.get('/api/rides/my-rides');
      const rides = ridesResponse.data.filter(ride => ride.confirmed_passengers > 0);
      
      // Fetch user's confirmed requests
      const requestsResponse = await axios.get('/api/rides/my-requests');
      const confirmedRequests = requestsResponse.data.filter(req => req.status === 'confirmed');
      
      // Combine both types
      const chats = [
        ...rides.map(ride => ({
          id: ride.id,
          type: 'driver',
          title: `${ride.pickup_location} → Sun Festival`,
          subtitle: `${ride.confirmed_passengers} passenger(s)`,
          departure_time: ride.departure_time,
          status: ride.status,
          participants: ride.confirmed_passengers
        })),
        ...confirmedRequests.map(req => ({
          id: req.ride_id,
          type: 'passenger',
          title: `${req.pickup_location} → Sun Festival`,
          subtitle: `Driver: ${req.driver_name}`,
          departure_time: req.departure_time,
          status: 'confirmed',
          driver_name: req.driver_name
        }))
      ];
      
      // Remove duplicates (in case user is both driver and passenger for same ride)
      const uniqueChats = chats.filter((chat, index, self) => 
        index === self.findIndex(c => c.id === chat.id && c.type === chat.type)
      );
      
      setAvailableChats(uniqueChats);
    } catch (error) {
      console.error('Error fetching chats:', error);
      toast.error('Failed to load available chats');
    } finally {
      setLoading(false);
    }
  };

  const openChat = (chat) => {
    setSelectedRideForChat({
      id: chat.id,
      pickup_location: chat.title.split(' → ')[0],
      departure_time: chat.departure_time
    });
    setShowChat(true);
  };

  const closeChat = () => {
    setShowChat(false);
    setSelectedRideForChat(null);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (date.toDateString() === now.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString();
    }
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-festival-orange"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center">
            <MessageCircle className="h-8 w-8 mr-3 text-festival-orange" />
            Chat Hub
          </h1>
          <p className="text-gray-600">Connect with your ride partners</p>
        </div>
        <div className="mt-4 md:mt-0">
          <button
            onClick={fetchAvailableChats}
            className="btn-secondary flex items-center"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <MessageCircle className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Available Chats</p>
              <p className="text-2xl font-semibold text-gray-900">{availableChats.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <Car className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">As Driver</p>
              <p className="text-2xl font-semibold text-gray-900">
                {availableChats.filter(c => c.type === 'driver').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">As Passenger</p>
              <p className="text-2xl font-semibold text-gray-900">
                {availableChats.filter(c => c.type === 'passenger').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Chat List */}
      {availableChats.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <MessageCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No chats available</h3>
          <p className="text-gray-600 mb-6">
            You can chat with your ride partners once you have:
          </p>
          <div className="text-left max-w-md mx-auto mb-6">
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center">
                <Car className="h-4 w-4 mr-2 text-green-600" />
                Confirmed passengers in your ride offers
              </li>
              <li className="flex items-center">
                <Users className="h-4 w-4 mr-2 text-blue-600" />
                Confirmed ride requests from drivers
              </li>
            </ul>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/create-ride" className="btn-primary">
              Offer a Ride
            </Link>
            <Link to="/rides" className="btn-secondary">
              Find Rides
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {availableChats.map((chat) => (
            <div key={`${chat.id}-${chat.type}`} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <div className={`p-2 rounded-full mr-3 ${
                        chat.type === 'driver' ? 'bg-green-100' : 'bg-blue-100'
                      }`}>
                        {chat.type === 'driver' ? (
                          <Car className={`h-5 w-5 ${chat.type === 'driver' ? 'text-green-600' : 'text-blue-600'}`} />
                        ) : (
                          <Users className={`h-5 w-5 ${chat.type === 'driver' ? 'text-green-600' : 'text-blue-600'}`} />
                        )}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {chat.title}
                        </h3>
                        <p className="text-sm text-gray-600">{chat.subtitle}</p>
                      </div>
                      <span className={`ml-3 px-2 py-1 text-xs rounded-full ${
                        chat.type === 'driver' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {chat.type === 'driver' ? 'Driver' : 'Passenger'}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {formatDate(chat.departure_time)}
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {formatTime(chat.departure_time)}
                      </div>
                      {chat.status && (
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          chat.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {chat.status}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="ml-6">
                    <button
                      onClick={() => openChat(chat)}
                      className="btn-primary flex items-center"
                    >
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Open Chat
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Chat Modal */}
      {showChat && selectedRideForChat && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-4xl h-[80vh] flex flex-col">
            <ChatComponent 
              rideId={selectedRideForChat.id} 
              onClose={closeChat}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default ChatHub; 