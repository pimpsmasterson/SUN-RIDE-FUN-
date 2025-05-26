import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Car, 
  MapPin, 
  Calendar, 
  Users, 
  Clock, 
  MessageCircle, 
  Plus,
  Check,
  X,
  Trash2,
  RefreshCw,
  Phone,
  Mail,
  Edit3
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import ChatComponent from './ChatComponent';

function MyRides() {
  const [rides, setRides] = useState([]);
  const [requests, setRequests] = useState({});
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState({});
  const [activeTab, setActiveTab] = useState('rides');
  const [showChat, setShowChat] = useState(false);
  const [selectedRideForChat, setSelectedRideForChat] = useState(null);

  useEffect(() => {
    fetchMyRides();
  }, []);

  const fetchMyRides = async () => {
    try {
      const ridesResponse = await axios.get('/api/rides/my-rides');
      setRides(ridesResponse.data);
      
      // Fetch requests for each ride
      const requestsData = {};
      for (const ride of ridesResponse.data) {
        if (ride.status === 'active') {
          try {
            const requestsResponse = await axios.get(`/api/rides/${ride.id}/requests`);
            requestsData[ride.id] = requestsResponse.data;
          } catch (error) {
            console.error(`Failed to fetch requests for ride ${ride.id}`);
          }
        }
      }
      setRequests(requestsData);
    } catch (error) {
      toast.error('Failed to fetch your rides');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestResponse = async (requestId, status, rideId) => {
    setProcessing(prev => ({ ...prev, [requestId]: true }));
    
    try {
      await axios.put(`/api/rides/requests/${requestId}`, { status });
      toast.success(`Request ${status === 'confirmed' ? 'accepted' : 'rejected'}`);
      
      // Refresh rides and requests
      fetchMyRides();
    } catch (error) {
      toast.error(error.response?.data?.error || `Failed to ${status} request`);
    } finally {
      setProcessing(prev => ({ ...prev, [requestId]: false }));
    }
  };

  const handleUpdateRideStatus = async (rideId, status) => {
    setProcessing(prev => ({ ...prev, [`ride-${rideId}`]: true }));
    
    try {
      await axios.put(`/api/rides/${rideId}/status`, { status });
      toast.success(`Ride ${status}`);
      fetchMyRides();
    } catch (error) {
      toast.error(`Failed to ${status} ride`);
    } finally {
      setProcessing(prev => ({ ...prev, [`ride-${rideId}`]: false }));
    }
  };

  const handleDeleteRide = async (rideId) => {
    if (!window.confirm('Are you sure you want to delete this ride? This action cannot be undone.')) {
      return;
    }

    setProcessing(prev => ({ ...prev, [`delete-${rideId}`]: true }));
    
    try {
      await axios.delete(`/api/rides/${rideId}`);
      toast.success('Ride deleted successfully');
      fetchMyRides();
    } catch (error) {
      toast.error('Failed to delete ride');
    } finally {
      setProcessing(prev => ({ ...prev, [`delete-${rideId}`]: false }));
    }
  };

  const activeRides = rides.filter(ride => ride.status === 'active');
  const pastRides = rides.filter(ride => ride.status !== 'active');
  const totalPendingRequests = Object.values(requests).reduce((total, rideRequests) => 
    total + rideRequests.filter(req => req.status === 'pending').length, 0
  );

  const openChat = (ride) => {
    setSelectedRideForChat(ride);
    setShowChat(true);
  };

  const closeChat = () => {
    setShowChat(false);
    setSelectedRideForChat(null);
  };

  // Check if ride has confirmed passengers (chat available)
  const hasConfirmedPassengers = (rideId) => {
    const rideRequests = requests[rideId] || [];
    return rideRequests.some(req => req.status === 'confirmed');
  };

  const renderRideCard = (ride) => (
    <div key={ride.id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow">
      <div className="p-6">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
          <div className="flex-1">
            <div className="flex items-center mb-3">
              <div className="bg-festival-gradient rounded-full p-2 mr-3">
                <Car className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {ride.pickup_location}
                </h3>
                <p className="text-sm text-gray-600">
                  To Sun Festival • {ride.available_seats} seats offered
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="flex items-center text-gray-600">
                <Calendar className="h-4 w-4 mr-2" />
                <span className="text-sm">
                  {new Date(ride.departure_time).toLocaleDateString()} at{' '}
                  {new Date(ride.departure_time).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
              <div className="flex items-center text-gray-600">
                <Users className="h-4 w-4 mr-2" />
                <span className="text-sm">
                  {ride.confirmed_passengers || 0} confirmed • {ride.remaining_seats} available
                </span>
              </div>
            </div>

            {ride.description && (
              <p className="text-gray-600 text-sm mb-4">{ride.description}</p>
            )}

            {/* Passenger Requests Section */}
            {requests[ride.id] && requests[ride.id].length > 0 && (
              <div className="border-t pt-4 mt-4">
                <h4 className="font-medium text-gray-900 mb-3">
                  Passenger Requests ({requests[ride.id].filter(req => req.status === 'pending').length} pending)
                </h4>
                <div className="space-y-3">
                  {requests[ride.id].map((request) => (
                    <div key={request.id} className={`p-3 rounded-lg border ${
                      request.status === 'confirmed' ? 'bg-green-50 border-green-200' :
                      request.status === 'rejected' ? 'bg-red-50 border-red-200' :
                      'bg-yellow-50 border-yellow-200'
                    }`}>
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center">
                            <span className="font-medium text-gray-900">{request.passenger_name}</span>
                            <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                              request.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                              request.status === 'rejected' ? 'bg-red-100 text-red-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {request.status}
                            </span>
                          </div>
                          {request.message && (
                            <p className="text-sm text-gray-600 mt-1">{request.message}</p>
                          )}
                          <div className="flex items-center mt-2 space-x-4">
                            <a href={`tel:${request.passenger_phone}`} className="text-blue-600 hover:underline text-sm flex items-center">
                              <Phone className="h-3 w-3 mr-1" />
                              {request.passenger_phone}
                            </a>
                            <a href={`mailto:${request.passenger_email}`} className="text-blue-600 hover:underline text-sm flex items-center">
                              <Mail className="h-3 w-3 mr-1" />
                              Email
                            </a>
                          </div>
                        </div>
                        
                        {request.status === 'pending' && (
                          <div className="flex space-x-2 ml-4">
                            <button
                              onClick={() => handleRequestResponse(request.id, 'confirmed', ride.id)}
                              disabled={processing[request.id]}
                              className="p-2 bg-green-100 text-green-600 hover:bg-green-200 rounded-lg transition-colors"
                              title="Accept request"
                            >
                              <Check className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleRequestResponse(request.id, 'rejected', ride.id)}
                              disabled={processing[request.id]}
                              className="p-2 bg-red-100 text-red-600 hover:bg-red-200 rounded-lg transition-colors"
                              title="Reject request"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="mt-4 lg:mt-0 lg:ml-6 flex flex-col space-y-2">
            {/* Chat Button - Show always with appropriate messaging */}
            <button
              onClick={() => hasConfirmedPassengers(ride.id) ? openChat(ride) : null}
              disabled={!hasConfirmedPassengers(ride.id)}
              className={`flex items-center justify-center text-sm ${
                hasConfirmedPassengers(ride.id) 
                  ? 'btn-secondary' 
                  : 'btn-secondary opacity-50 cursor-not-allowed'
              }`}
              title={hasConfirmedPassengers(ride.id) 
                ? "Open ride chat" 
                : "Chat available once you have confirmed passengers"
              }
            >
              <MessageCircle className="h-4 w-4 mr-1" />
              Chat {hasConfirmedPassengers(ride.id) ? '' : '(No passengers yet)'}
            </button>

            {ride.status === 'active' && (
              <>
                <button
                  onClick={() => handleUpdateRideStatus(ride.id, 'completed')}
                  disabled={processing[`ride-${ride.id}`]}
                  className="btn-primary flex items-center justify-center text-sm"
                >
                  {processing[`ride-${ride.id}`] ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <>
                      <Check className="h-4 w-4 mr-1" />
                      Complete
                    </>
                  )}
                </button>
                <button
                  onClick={() => handleDeleteRide(ride.id)}
                  disabled={processing[`delete-${ride.id}`]}
                  className="text-red-600 hover:text-red-800 text-sm flex items-center justify-center"
                >
                  {processing[`delete-${ride.id}`] ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </>
                  )}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );

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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Rides</h1>
          <p className="text-gray-600">Manage your ride offers and passengers</p>
        </div>
        <div className="mt-4 md:mt-0 flex space-x-3">
          <button
            onClick={fetchMyRides}
            className="btn-secondary flex items-center"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </button>
          <Link to="/create-ride" className="btn-primary flex items-center">
            <Plus className="h-4 w-4 mr-2" />
            Offer New Ride
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <Car className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Active Rides</p>
              <p className="text-2xl font-semibold text-gray-900">{activeRides.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Pending Requests</p>
              <p className="text-2xl font-semibold text-gray-900">{totalPendingRequests}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Passengers</p>
              <p className="text-2xl font-semibold text-gray-900">
                {rides.reduce((total, ride) => total + (ride.confirmed_passengers || 0), 0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('rides')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'rides'
                ? 'border-festival-orange text-festival-orange'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Active Rides ({activeRides.length})
          </button>
          <button
            onClick={() => setActiveTab('requests')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'requests'
                ? 'border-festival-orange text-festival-orange'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Requests ({totalPendingRequests})
          </button>
          <button
            onClick={() => setActiveTab('past')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'past'
                ? 'border-festival-orange text-festival-orange'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Past Rides ({pastRides.length})
          </button>
        </nav>
      </div>

      {/* Content based on active tab */}
      <div className="space-y-6">
        {activeTab === 'rides' && (
          <div>
            {activeRides.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-8 text-center">
                <Car className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No active rides</h3>
                <p className="text-gray-600 mb-4">
                  You haven't created any rides yet. Start by offering a ride to the festival!
                </p>
                <Link to="/create-ride" className="btn-primary">
                  Offer Your First Ride
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {activeRides.map(ride => renderRideCard(ride))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'requests' && (
          <div>
            {totalPendingRequests === 0 ? (
              <div className="bg-white rounded-lg shadow p-8 text-center">
                <Clock className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No pending requests</h3>
                <p className="text-gray-600">
                  All requests have been handled or you have no active rides with requests.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {activeRides.filter(ride => requests[ride.id] && 
                  requests[ride.id].some(req => req.status === 'pending')).map(ride => renderRideCard(ride))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'past' && (
          <div>
            {pastRides.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-8 text-center">
                <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No past rides</h3>
                <p className="text-gray-600">
                  Your completed and cancelled rides will appear here.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {pastRides.map(ride => renderRideCard(ride))}
              </div>
            )}
          </div>
        )}
      </div>

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

export default MyRides; 