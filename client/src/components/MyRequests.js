import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Clock, 
  MapPin, 
  Calendar, 
  Users, 
  MessageCircle, 
  Phone, 
  Mail,
  Check,
  X,
  RefreshCw,
  Search,
  Trash2
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import ChatComponent from './ChatComponent';

function MyRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState({});
  const [showChat, setShowChat] = useState(false);
  const [selectedRideForChat, setSelectedRideForChat] = useState(null);

  useEffect(() => {
    fetchMyRequests();
  }, []);

  const fetchMyRequests = async () => {
    try {
      const response = await axios.get('/api/rides/my-requests');
      setRequests(response.data);
    } catch (error) {
      toast.error('Failed to fetch your requests');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelRequest = async (requestId) => {
    if (!window.confirm('Are you sure you want to cancel this ride request?')) {
      return;
    }

    setCancelling(prev => ({ ...prev, [requestId]: true }));
    
    try {
      await axios.put(`/api/rides/requests/${requestId}`, { status: 'cancelled' });
      toast.success('Request cancelled');
      fetchMyRequests();
    } catch (error) {
      toast.error('Failed to cancel request');
    } finally {
      setCancelling(prev => ({ ...prev, [requestId]: false }));
    }
  };

  const openChat = (request) => {
    setSelectedRideForChat({ 
      id: request.ride_id, 
      pickup_location: request.pickup_location,
      departure_time: request.departure_time 
    });
    setShowChat(true);
  };

  const closeChat = () => {
    setShowChat(false);
    setSelectedRideForChat(null);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'confirmed':
        return <Check className="h-4 w-4" />;
      case 'rejected':
        return <X className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const renderRequestCard = (request) => (
    <div key={request.id} className={`bg-white rounded-lg shadow ${
      request.status === 'confirmed' ? 'border-l-4 border-green-500' :
      request.status === 'rejected' ? 'border-l-4 border-red-500' :
      request.status === 'pending' ? 'border-l-4 border-yellow-500' :
      'border-l-4 border-gray-300'
    }`}>
      <div className="p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div className="flex-1">
            <div className="flex items-center mb-2">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                {getStatusIcon(request.status)}
                <span className="ml-1">{request.status.charAt(0).toUpperCase() + request.status.slice(1)}</span>
              </span>
            </div>

            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {request.pickup_location} → Sun Festival
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="flex items-center text-gray-600">
                <Calendar className="h-4 w-4 mr-2" />
                <span className="text-sm">
                  {new Date(request.departure_time).toLocaleDateString()} at{' '}
                  {new Date(request.departure_time).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
              <div className="flex items-center text-gray-600">
                <Users className="h-4 w-4 mr-2" />
                <span className="text-sm">Driver: {request.driver_name}</span>
              </div>
            </div>

            {request.message && (
              <div className="mb-4">
                <p className="text-sm text-gray-600">
                  <strong>Your message:</strong> {request.message}
                </p>
              </div>
            )}

            <div className="flex items-center space-x-4">
              <a 
                href={`tel:${request.driver_phone}`} 
                className="text-blue-600 hover:underline text-sm flex items-center"
              >
                <Phone className="h-3 w-3 mr-1" />
                {request.driver_phone}
              </a>
              <a 
                href={`mailto:${request.driver_email}`} 
                className="text-blue-600 hover:underline text-sm flex items-center"
              >
                <Mail className="h-3 w-3 mr-1" />
                Email Driver
              </a>
            </div>
          </div>

          <div className="mt-4 lg:mt-0 lg:ml-6 flex flex-col space-y-2">
            {/* Chat Button - Only show if request is confirmed */}
            {request.status === 'confirmed' && (
              <button
                onClick={() => openChat(request)}
                className="btn-secondary flex items-center justify-center text-sm"
                title="Open ride chat"
              >
                <MessageCircle className="h-4 w-4 mr-1" />
                Chat
              </button>
            )}

            {/* Cancel Button - Only show if request is pending or confirmed */}
            {['pending', 'confirmed'].includes(request.status) && (
              <button
                onClick={() => handleCancelRequest(request.id)}
                disabled={cancelling[request.id]}
                className="text-red-600 hover:text-red-800 text-sm flex items-center justify-center"
              >
                {cancelling[request.id] ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4 mr-1" />
                    Cancel Request
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const pendingRequests = requests.filter(req => req.status === 'pending');
  const confirmedRequests = requests.filter(req => req.status === 'confirmed');
  const otherRequests = requests.filter(req => !['pending', 'confirmed'].includes(req.status));

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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Requests</h1>
          <p className="text-gray-600">Track your ride requests and connect with drivers</p>
        </div>
        <div className="mt-4 md:mt-0 flex space-x-3">
          <button
            onClick={fetchMyRequests}
            className="btn-secondary flex items-center"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </button>
          <Link to="/rides" className="btn-primary flex items-center">
            <Search className="h-4 w-4 mr-2" />
            Find More Rides
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Pending</p>
              <p className="text-2xl font-semibold text-gray-900">{pendingRequests.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <Check className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Confirmed</p>
              <p className="text-2xl font-semibold text-gray-900">{confirmedRequests.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Requests</p>
              <p className="text-2xl font-semibold text-gray-900">{requests.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* No Requests State */}
      {requests.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <Clock className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No ride requests yet</h3>
          <p className="text-gray-600 mb-4">
            You haven't requested any rides yet. Browse available rides and connect with drivers.
          </p>
          <Link to="/rides" className="btn-primary">
            Find Your First Ride
          </Link>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Confirmed Requests */}
          {confirmedRequests.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <Check className="h-5 w-5 text-green-600 mr-2" />
                Confirmed Rides ({confirmedRequests.length})
              </h2>
              <div className="space-y-4">
                {confirmedRequests.map(request => renderRequestCard(request))}
              </div>
            </div>
          )}

          {/* Pending Requests */}
          {pendingRequests.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <Clock className="h-5 w-5 text-yellow-600 mr-2" />
                Pending Requests ({pendingRequests.length})
              </h2>
              <div className="space-y-4">
                {pendingRequests.map(request => renderRequestCard(request))}
              </div>
            </div>
          )}

          {/* Other Requests (Rejected, Cancelled) */}
          {otherRequests.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <X className="h-5 w-5 text-gray-600 mr-2" />
                Past Requests ({otherRequests.length})
              </h2>
              <div className="space-y-4">
                {otherRequests.map(request => renderRequestCard(request))}
              </div>
            </div>
          )}

          {/* Help Section */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="font-medium text-blue-900 mb-2">💡 Request Status Guide</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-blue-800">
              <div>
                <span className="font-medium">Pending:</span> Your request is waiting for the driver's response.
              </div>
              <div>
                <span className="font-medium">Confirmed:</span> Driver accepted! You can now access the ride chat.
              </div>
              <div>
                <span className="font-medium">Rejected:</span> Driver declined your request. Try other rides!
              </div>
            </div>
          </div>
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

export default MyRequests; 