import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, 
  MapPin, 
  Clock, 
  Users, 
  MessageCircle, 
  Filter,
  RefreshCw,
  Calendar,
  Phone,
  Map,
  List
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../App';
import MapComponent from './MapComponent';

function RideList() {
  const [rides, setRides] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [requesting, setRequesting] = useState({});
  const [filters, setFilters] = useState({
    pickup_location: '',
    departure_date: ''
  });
  const [requestMessages, setRequestMessages] = useState({});
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'map'
  const { user } = useAuth();

  useEffect(() => {
    fetchRides();
    fetchLocations();
  }, []);

  const fetchRides = async () => {
    try {
      const response = await axios.get('/api/rides');
      setRides(response.data);
    } catch (error) {
      toast.error('Failed to fetch rides');
    } finally {
      setLoading(false);
    }
  };

  const fetchLocations = async () => {
    try {
      const response = await axios.get('/api/rides/locations');
      setLocations(response.data);
    } catch (error) {
      console.error('Failed to fetch locations');
    }
  };

  const handleRequestRide = async (rideId) => {
    const message = requestMessages[rideId] || '';
    
    setRequesting(prev => ({ ...prev, [rideId]: true }));
    try {
      await axios.post(`/api/rides/${rideId}/request`, { message });
      toast.success('Ride request sent!');
      setRequestMessages(prev => ({ ...prev, [rideId]: '' }));
      // Refresh rides to update available seats
      fetchRides();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to request ride');
    } finally {
      setRequesting(prev => ({ ...prev, [rideId]: false }));
    }
  };

  const filteredRides = rides.filter(ride => {
    if (filters.pickup_location && ride.pickup_location !== filters.pickup_location) {
      return false;
    }
    if (filters.departure_date) {
      const rideDate = new Date(ride.departure_time).toDateString();
      const filterDate = new Date(filters.departure_date).toDateString();
      if (rideDate !== filterDate) {
        return false;
      }
    }
    return true;
  });

  // Only show rides with coordinates on the map
  const ridesWithCoords = filteredRides.filter(ride => ride.pickup_coords);

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
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Find a Ride</h1>
            <p className="text-gray-600">Join fellow festival-goers heading to Sun Festival 2025</p>
          </div>
          
          {/* View Mode Toggle */}
          <div className="mt-4 md:mt-0 flex items-center space-x-2">
            <div className="bg-gray-100 p-1 rounded-lg">
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
                  viewMode === 'list'
                    ? 'bg-white text-festival-orange shadow'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <List className="h-4 w-4 mr-1 inline" />
                List
              </button>
              <button
                onClick={() => setViewMode('map')}
                className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
                  viewMode === 'map'
                    ? 'bg-white text-festival-orange shadow'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Map className="h-4 w-4 mr-1 inline" />
                Map
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow mb-6 p-6">
        <div className="flex items-center mb-4">
          <Filter className="h-5 w-5 text-festival-orange mr-2" />
          <h2 className="text-lg font-semibold">Filter Rides</h2>
          {viewMode === 'map' && ridesWithCoords.length !== filteredRides.length && (
            <span className="ml-auto text-sm text-amber-600 bg-amber-50 px-2 py-1 rounded">
              📍 Showing {ridesWithCoords.length} of {filteredRides.length} rides with locations
            </span>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Pickup Location
            </label>
            <select
              value={filters.pickup_location}
              onChange={(e) => setFilters(prev => ({ ...prev, pickup_location: e.target.value }))}
              className="input-field"
            >
              <option value="">All locations</option>
              {locations.map((location) => (
                <option key={location.id} value={location.name}>
                  {location.name}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Departure Date
            </label>
            <input
              type="date"
              value={filters.departure_date}
              onChange={(e) => setFilters(prev => ({ ...prev, departure_date: e.target.value }))}
              className="input-field"
            />
          </div>
          
          <div className="flex items-end">
            <button
              onClick={fetchRides}
              className="btn-secondary flex items-center"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Content based on view mode */}
      {viewMode === 'map' ? (
        /* Map View */
        <div className="bg-white rounded-lg shadow p-6">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Rides Map View
            </h3>
            <p className="text-gray-600 text-sm">
              Click on ride markers to see details and request rides
            </p>
          </div>
          
          {ridesWithCoords.length === 0 ? (
            <div className="bg-gray-50 rounded-lg p-8 text-center">
              <Map className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No rides to display</h3>
              <p className="text-gray-600 mb-4">
                {filteredRides.length === 0 
                  ? 'No rides match your current filters.'
                  : 'None of the filtered rides have location data for map display.'
                }
              </p>
              <Link to="/create-ride" className="btn-primary">
                Offer a Ride Instead
              </Link>
            </div>
          ) : (
            <MapComponent
              height="600px"
              rides={ridesWithCoords}
              mode="view"
              showSearch={false}
              showCurrentLocation={true}
              zoom={6}
            />
          )}
        </div>
      ) : (
        /* List View */
        <div className="space-y-4">
          {filteredRides.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <Search className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No rides found</h3>
              <p className="text-gray-600 mb-4">
                {filters.pickup_location || filters.departure_date 
                  ? 'Try adjusting your filters or check back later.'
                  : 'No rides available at the moment. Check back soon!'}
              </p>
              <Link to="/create-ride" className="btn-primary">
                Offer a Ride Instead
              </Link>
            </div>
          ) : (
            filteredRides.map((ride) => (
              <div key={ride.id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <div className="bg-festival-gradient rounded-full p-2 mr-3">
                          <Users className="h-4 w-4 text-white" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {ride.driver_name}
                        </h3>
                        {ride.pickup_coords && (
                          <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                            📍 On Map
                          </span>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="flex items-center text-gray-600">
                          <MapPin className="h-4 w-4 mr-2" />
                          <span className="text-sm">From: {ride.pickup_location}</span>
                        </div>
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
                      </div>

                      {ride.description && (
                        <p className="text-gray-600 text-sm mb-4">{ride.description}</p>
                      )}

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center text-green-600">
                            <Users className="h-4 w-4 mr-1" />
                            <span className="text-sm font-medium">
                              {ride.remaining_seats} seats available
                            </span>
                          </div>
                          <div className="flex items-center text-gray-500">
                            <Phone className="h-4 w-4 mr-1" />
                            <span className="text-sm">{ride.driver_phone}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action Section */}
                    <div className="mt-4 lg:mt-0 lg:ml-6 lg:w-80">
                      {ride.driver_id === user?.id ? (
                        <div className="text-center p-3 bg-blue-50 rounded-lg">
                          <p className="text-sm text-blue-800 font-medium">This is your ride</p>
                          <Link 
                            to="/my-rides" 
                            className="text-xs text-blue-600 hover:underline"
                          >
                            Manage in My Rides
                          </Link>
                        </div>
                      ) : ride.remaining_seats === 0 ? (
                        <div className="text-center p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-600">No seats available</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <textarea
                            placeholder="Optional message to the driver..."
                            value={requestMessages[ride.id] || ''}
                            onChange={(e) => setRequestMessages(prev => ({
                              ...prev,
                              [ride.id]: e.target.value
                            }))}
                            className="w-full p-2 border border-gray-300 rounded text-sm resize-none"
                            rows="2"
                          />
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleRequestRide(ride.id)}
                              disabled={requesting[ride.id]}
                              className="flex-1 btn-primary text-sm flex items-center justify-center"
                            >
                              {requesting[ride.id] ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                              ) : (
                                <>
                                  <Users className="h-4 w-4 mr-1" />
                                  Request Ride
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default RideList; 