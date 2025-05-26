import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  MapPin, 
  Calendar, 
  Clock, 
  Users, 
  FileText,
  ArrowRight,
  Map
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../App';
import MapComponent from './MapComponent';

function CreateRide() {
  const [formData, setFormData] = useState({
    pickup_location: '',
    departure_date: '',
    departure_time: '',
    available_seats: 1,
    description: ''
  });
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedMapLocation, setSelectedMapLocation] = useState(null);
  const [showMap, setShowMap] = useState(true);
  const [useCustomLocation, setUseCustomLocation] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    fetchLocations();
    // Set default date to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setFormData(prev => ({
      ...prev,
      departure_date: tomorrow.toISOString().split('T')[0]
    }));
  }, []);

  const fetchLocations = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/rides/locations');
      setLocations(response.data);
    } catch (error) {
      toast.error('Failed to fetch pickup locations');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleMapLocationSelect = (location) => {
    setSelectedMapLocation(location);
    setFormData(prev => ({
      ...prev,
      pickup_location: location.formatted_address
    }));
  };

  const handleLocationModeChange = (useCustom) => {
    setUseCustomLocation(useCustom);
    if (!useCustom) {
      setSelectedMapLocation(null);
      setFormData(prev => ({
        ...prev,
        pickup_location: ''
      }));
    }
  };

  const handlePresetLocationChange = (locationName) => {
    const selectedLocation = locations.find(loc => loc.name === locationName);
    if (selectedLocation) {
      const mapLocation = {
        lat: parseFloat(selectedLocation.latitude),
        lng: parseFloat(selectedLocation.longitude),
        formatted_address: `${selectedLocation.name} - ${selectedLocation.address}`
      };
      setSelectedMapLocation(mapLocation);
    }
    setFormData(prev => ({
      ...prev,
      pickup_location: locationName
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.pickup_location) {
      toast.error('Please select a pickup location');
      return;
    }
    
    if (!formData.departure_date || !formData.departure_time) {
      toast.error('Please select departure date and time');
      return;
    }
    
    // Check if departure time is in the future
    const departureDateTime = new Date(`${formData.departure_date}T${formData.departure_time}`);
    const now = new Date();
    
    if (departureDateTime <= now) {
      toast.error('Departure time must be in the future');
      return;
    }

    setSubmitting(true);
    
    try {
      let pickup_coords = null;
      
      if (useCustomLocation && selectedMapLocation) {
        // Use coordinates from map selection
        pickup_coords = `${selectedMapLocation.lat},${selectedMapLocation.lng}`;
      } else if (!useCustomLocation) {
        // Find selected location coordinates from preset locations
        const selectedLocation = locations.find(loc => loc.name === formData.pickup_location);
        pickup_coords = selectedLocation 
          ? `${selectedLocation.latitude},${selectedLocation.longitude}` 
          : null;
      }

      const rideData = {
        pickup_location: formData.pickup_location,
        pickup_coords,
        departure_time: `${formData.departure_date}T${formData.departure_time}`,
        available_seats: parseInt(formData.available_seats),
        description: formData.description.trim()
      };

      await axios.post('/api/rides', rideData);
      toast.success('Ride created successfully!');
      navigate('/my-rides');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to create ride');
    } finally {
      setSubmitting(false);
    }
  };

  const minDate = new Date().toISOString().split('T')[0];
  const maxDate = new Date('2025-07-31').toISOString().split('T')[0]; // After festival

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
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Offer a Ride</h1>
        <p className="text-gray-600">
          Share your journey to Sun Festival and help fellow festival-goers get there sustainably
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Form Section */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center">
              <div className="bg-festival-gradient rounded-full p-2 mr-3">
                <Plus className="h-5 w-5 text-white" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Ride Details</h2>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Location Selection Mode */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                <MapPin className="h-4 w-4 inline mr-1" />
                Pickup Location *
              </label>
              
              <div className="mb-4">
                <div className="flex space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      checked={!useCustomLocation}
                      onChange={() => handleLocationModeChange(false)}
                      className="mr-2"
                    />
                    <span className="text-sm">Preset Locations</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      checked={useCustomLocation}
                      onChange={() => handleLocationModeChange(true)}
                      className="mr-2"
                    />
                    <span className="text-sm">Custom Location</span>
                  </label>
                </div>
              </div>

              {!useCustomLocation ? (
                <select
                  value={formData.pickup_location}
                  onChange={(e) => handlePresetLocationChange(e.target.value)}
                  className="input-field"
                  required
                >
                  <option value="">Select preset location</option>
                  {locations.map((location) => (
                    <option key={location.id} value={location.name}>
                      {location.name} - {location.address}
                    </option>
                  ))}
                </select>
              ) : (
                <div>
                  <input
                    type="text"
                    value={formData.pickup_location}
                    onChange={handleChange}
                    name="pickup_location"
                    placeholder="Selected from map..."
                    className="input-field"
                    readOnly
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Click on the map to select your pickup location
                  </p>
                </div>
              )}
            </div>

            {/* Date and Time */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="h-4 w-4 inline mr-1" />
                  Departure Date *
                </label>
                <input
                  type="date"
                  name="departure_date"
                  value={formData.departure_date}
                  onChange={handleChange}
                  min={minDate}
                  max={maxDate}
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Clock className="h-4 w-4 inline mr-1" />
                  Departure Time *
                </label>
                <input
                  type="time"
                  name="departure_time"
                  value={formData.departure_time}
                  onChange={handleChange}
                  className="input-field"
                  required
                />
              </div>
            </div>

            {/* Available Seats */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Users className="h-4 w-4 inline mr-1" />
                Available Seats *
              </label>
              <select
                name="available_seats"
                value={formData.available_seats}
                onChange={handleChange}
                className="input-field max-w-xs"
                required
              >
                {[1, 2, 3, 4, 5, 6, 7].map(num => (
                  <option key={num} value={num}>
                    {num} seat{num > 1 ? 's' : ''}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                How many passengers can you take?
              </p>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FileText className="h-4 w-4 inline mr-1" />
                Additional Information
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Add any additional details about your ride (meeting point, vehicle type, music preferences, etc.)"
                className="input-field"
                rows="4"
              />
              <p className="text-xs text-gray-500 mt-1">
                Optional: Share any extra details that might help passengers
              </p>
            </div>

            {/* Submit Button */}
            <div className="flex items-center justify-between pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              
              <button
                type="submit"
                disabled={submitting}
                className="btn-primary flex items-center"
              >
                {submitting ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                ) : (
                  <Plus className="h-4 w-4 mr-2" />
                )}
                {submitting ? 'Creating Ride...' : 'Create Ride'}
                {!submitting && <ArrowRight className="h-4 w-4 ml-2" />}
              </button>
            </div>
          </form>
        </div>

        {/* Map Section */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Map className="h-5 w-5 mr-2" />
                Location Map
              </h3>
              <button
                type="button"
                onClick={() => setShowMap(!showMap)}
                className="text-sm text-festival-orange hover:underline"
              >
                {showMap ? 'Hide Map' : 'Show Map'}
              </button>
            </div>

            {showMap && (
              <MapComponent
                height="400px"
                onLocationSelect={useCustomLocation ? handleMapLocationSelect : null}
                selectedLocation={selectedMapLocation}
                mode={useCustomLocation ? 'select' : 'view'}
                showSearch={useCustomLocation}
                zoom={6}
              />
            )}
          </div>

          {/* Festival Info Box */}
          <div className="bg-festival-gradient rounded-lg p-6 text-white">
            <h3 className="font-semibold mb-3">🌞 Destination: Sun Festival 2025</h3>
            <div className="text-sm space-y-2">
              <p><MapPin className="h-3 w-3 inline mr-1" />Csobánkapuszta, Hungary</p>
              <p><Calendar className="h-3 w-3 inline mr-1" />June 29 - July 6, 2025</p>
            </div>
          </div>

          {/* Community Guidelines */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">Community Guidelines</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Be punctual and communicate clearly with passengers</li>
              <li>• Share contact details for coordination</li>
              <li>• Discuss fuel cost sharing before departure</li>
              <li>• Keep your ride information updated</li>
              <li>• Be respectful and create a positive travel experience</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CreateRide; 