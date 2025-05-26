import React, { useEffect, useRef, useState } from 'react';
import { MapPin, Loader2, AlertCircle, Navigation } from 'lucide-react';
import googleMapsService from '../services/googleMaps';
import toast from 'react-hot-toast';

const MapComponent = ({
  height = '400px',
  onLocationSelect,
  selectedLocation,
  rides = [],
  showSearch = true,
  showCurrentLocation = true,
  zoom = 7,
  center = null,
  mode = 'select' // 'select', 'view', 'create'
}) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const selectedMarkerRef = useRef(null);
  const searchBoxRef = useRef(null);
  const autocompleteRef = useRef(null);
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchValue, setSearchValue] = useState('');
  const [userLocation, setUserLocation] = useState(null);

  useEffect(() => {
    initializeMap();
    return () => {
      cleanupMap();
    };
  }, []);

  useEffect(() => {
    if (mapInstanceRef.current && rides.length > 0) {
      displayRides();
    }
  }, [rides]);

  useEffect(() => {
    if (mapInstanceRef.current && selectedLocation) {
      updateSelectedLocation();
    }
  }, [selectedLocation]);

  const initializeMap = async () => {
    try {
      setIsLoading(true);
      setError(null);

      await googleMapsService.loadGoogleMapsAPI();

      const mapCenter = center || googleMapsService.getDefaultCenter();
      
      const map = new window.google.maps.Map(mapRef.current, {
        center: mapCenter,
        zoom: zoom,
        styles: [
          {
            featureType: 'poi',
            elementType: 'labels',
            stylers: [{ visibility: 'off' }]
          }
        ],
        mapTypeControl: true,
        streetViewControl: false,
        fullscreenControl: true,
        zoomControl: true,
      });

      mapInstanceRef.current = map;

      // Add click listener for location selection
      if (mode === 'select' || mode === 'create') {
        map.addListener('click', handleMapClick);
      }

      // Initialize search if enabled
      if (showSearch) {
        initializeSearch();
      }

      // Get user location if enabled
      if (showCurrentLocation) {
        getCurrentLocation();
      }

      // Display festival location
      addFestivalMarker();

      // Display rides if provided
      if (rides.length > 0) {
        displayRides();
      }

      // Display selected location if provided
      if (selectedLocation) {
        updateSelectedLocation();
      }

      setIsLoading(false);
    } catch (err) {
      console.error('Map initialization error:', err);
      setError(err.message);
      setIsLoading(false);
    }
  };

  const initializeSearch = () => {
    if (!searchBoxRef.current || !mapInstanceRef.current) return;

    const autocomplete = new window.google.maps.places.Autocomplete(
      searchBoxRef.current,
      {
        types: ['geocode'],
        componentRestrictions: { country: 'hu' }, // Restrict to Hungary
        fields: ['place_id', 'geometry', 'name', 'formatted_address']
      }
    );

    autocomplete.bindTo('bounds', mapInstanceRef.current);
    autocompleteRef.current = autocomplete;

    autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace();
      
      if (!place.geometry) {
        toast.error('No details available for this location');
        return;
      }

      const location = {
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng(),
        formatted_address: place.formatted_address,
        place_id: place.place_id
      };

      handleLocationSelection(location);
      
      mapInstanceRef.current.setCenter(place.geometry.location);
      mapInstanceRef.current.setZoom(13);
    });
  };

  const handleMapClick = async (event) => {
    const lat = event.latLng.lat();
    const lng = event.latLng.lng();

    try {
      const locationData = await googleMapsService.reverseGeocode(lat, lng);
      handleLocationSelection(locationData);
    } catch (error) {
      console.error('Reverse geocoding failed:', error);
      // Still allow selection even if reverse geocoding fails
      const location = {
        lat,
        lng,
        formatted_address: `${lat.toFixed(6)}, ${lng.toFixed(6)}`
      };
      handleLocationSelection(location);
    }
  };

  const handleLocationSelection = (location) => {
    if (onLocationSelect) {
      onLocationSelect(location);
    }
    updateSelectedMarker(location);
  };

  const updateSelectedMarker = (location) => {
    // Remove existing selected marker
    if (selectedMarkerRef.current) {
      selectedMarkerRef.current.setMap(null);
    }

    // Create new selected marker
    const marker = new window.google.maps.Marker({
      position: { lat: location.lat, lng: location.lng },
      map: mapInstanceRef.current,
      title: 'Selected pickup location',
      icon: {
        url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="16" cy="16" r="12" fill="#FF8C00" stroke="#fff" stroke-width="3"/>
            <circle cx="16" cy="16" r="4" fill="#fff"/>
          </svg>
        `),
        scaledSize: new window.google.maps.Size(32, 32),
        anchor: new window.google.maps.Point(16, 16)
      }
    });

    selectedMarkerRef.current = marker;

    // Add info window
    const infoWindow = new window.google.maps.InfoWindow({
      content: `
        <div class="p-2">
          <div class="font-semibold text-festival-orange">📍 Pickup Location</div>
          <div class="text-sm text-gray-600 mt-1">${location.formatted_address}</div>
        </div>
      `
    });

    marker.addListener('click', () => {
      infoWindow.open(mapInstanceRef.current, marker);
    });
  };

  const updateSelectedLocation = () => {
    if (!selectedLocation || !mapInstanceRef.current) return;
    
    updateSelectedMarker(selectedLocation);
    mapInstanceRef.current.setCenter({
      lat: selectedLocation.lat,
      lng: selectedLocation.lng
    });
  };

  const addFestivalMarker = () => {
    const festivalLocation = googleMapsService.getFestivalLocation();
    
    const marker = new window.google.maps.Marker({
      position: festivalLocation,
      map: mapInstanceRef.current,
      title: 'Sun Festival 2025',
      icon: {
        url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="20" cy="20" r="18" fill="#FFD700" stroke="#FF8C00" stroke-width="3"/>
            <text x="20" y="26" font-family="Arial" font-size="20" text-anchor="middle" fill="#FF8C00">🌞</text>
          </svg>
        `),
        scaledSize: new window.google.maps.Size(40, 40),
        anchor: new window.google.maps.Point(20, 20)
      }
    });

    const infoWindow = new window.google.maps.InfoWindow({
      content: `
        <div class="p-3">
          <div class="font-bold text-festival-orange">🌞 Sun Festival 2025</div>
          <div class="text-sm text-gray-600 mt-1">${festivalLocation.formatted_address}</div>
          <div class="text-xs text-gray-500 mt-1">June 29 - July 6, 2025</div>
        </div>
      `
    });

    marker.addListener('click', () => {
      infoWindow.open(mapInstanceRef.current, marker);
    });

    markersRef.current.push(marker);
  };

  const displayRides = () => {
    // Clear existing ride markers
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    // Add festival marker
    addFestivalMarker();

    // Add ride markers
    rides.forEach((ride, index) => {
      if (!ride.pickup_coords) return;

      const [lat, lng] = ride.pickup_coords.split(',').map(Number);
      
      const marker = new window.google.maps.Marker({
        position: { lat, lng },
        map: mapInstanceRef.current,
        title: `${ride.driver_name} - ${ride.pickup_location}`,
        icon: {
          url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="16" cy="16" r="12" fill="#32CD32" stroke="#fff" stroke-width="3"/>
              <text x="16" y="20" font-family="Arial" font-size="12" text-anchor="middle" fill="#fff">🚗</text>
            </svg>
          `),
          scaledSize: new window.google.maps.Size(32, 32),
          anchor: new window.google.maps.Point(16, 16)
        }
      });

      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <div class="p-3 max-w-xs">
            <div class="font-semibold text-festival-green">🚗 ${ride.driver_name}</div>
            <div class="text-sm text-gray-600 mt-1">${ride.pickup_location}</div>
            <div class="text-xs text-gray-500 mt-1">
              ${new Date(ride.departure_time).toLocaleDateString()} at 
              ${new Date(ride.departure_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
            <div class="text-xs mt-2">
              <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                ${ride.remaining_seats} seats available
              </span>
            </div>
            ${ride.description ? `<div class="text-xs text-gray-600 mt-2">${ride.description}</div>` : ''}
          </div>
        `
      });

      marker.addListener('click', () => {
        infoWindow.open(mapInstanceRef.current, marker);
      });

      markersRef.current.push(marker);
    });

    // Fit map to show all markers
    if (markersRef.current.length > 0) {
      const bounds = new window.google.maps.LatLngBounds();
      markersRef.current.forEach(marker => {
        bounds.extend(marker.getPosition());
      });
      
      // Include festival location
      bounds.extend(googleMapsService.getFestivalLocation());
      
      mapInstanceRef.current.fitBounds(bounds);
      
      // Ensure minimum zoom level
      const listener = window.google.maps.event.addListener(mapInstanceRef.current, 'idle', () => {
        if (mapInstanceRef.current.getZoom() > 10) {
          mapInstanceRef.current.setZoom(10);
        }
        window.google.maps.event.removeListener(listener);
      });
    }
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserLocation(location);
          
          // Add user location marker
          const marker = new window.google.maps.Marker({
            position: location,
            map: mapInstanceRef.current,
            title: 'Your current location',
            icon: {
              url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="10" cy="10" r="8" fill="#4169E1" stroke="#fff" stroke-width="2"/>
                  <circle cx="10" cy="10" r="3" fill="#fff"/>
                </svg>
              `),
              scaledSize: new window.google.maps.Size(20, 20),
              anchor: new window.google.maps.Point(10, 10)
            }
          });
          
          markersRef.current.push(marker);
        },
        (error) => {
          console.warn('Geolocation error:', error);
        }
      );
    }
  };

  const cleanupMap = () => {
    if (mapInstanceRef.current) {
      window.google.maps.event.clearInstanceListeners(mapInstanceRef.current);
    }
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];
    if (selectedMarkerRef.current) {
      selectedMarkerRef.current.setMap(null);
    }
  };

  const handleSearchSubmit = async (e) => {
    e.preventDefault();
    if (!searchValue.trim()) return;

    try {
      const location = await googleMapsService.geocodeAddress(searchValue);
      handleLocationSelection(location);
      mapInstanceRef.current.setCenter({ lat: location.lat, lng: location.lng });
      mapInstanceRef.current.setZoom(13);
    } catch (error) {
      toast.error('Location not found. Please try a different search term.');
    }
  };

  if (error) {
    return (
      <div className="w-full bg-red-50 border border-red-200 rounded-lg p-6 text-center" style={{ height }}>
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-red-900 mb-2">Map Error</h3>
        <p className="text-red-700 mb-4">{error}</p>
        <p className="text-sm text-red-600">
          Please ensure Google Maps API is configured in the admin settings.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full relative">
      {showSearch && (
        <div className="mb-4">
          <form onSubmit={handleSearchSubmit} className="flex space-x-2">
            <div className="flex-1 relative">
              <input
                ref={searchBoxRef}
                type="text"
                placeholder="Search for a location..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-festival-orange focus:border-transparent"
              />
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
            <button
              type="submit"
              className="btn-primary"
              disabled={!searchValue.trim()}
            >
              Search
            </button>
          </form>
        </div>
      )}

      <div className="relative">
        <div
          ref={mapRef}
          className="w-full rounded-lg shadow border"
          style={{ height }}
        />
        
        {isLoading && (
          <div className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center rounded-lg">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin text-festival-orange mx-auto mb-2" />
              <p className="text-sm text-gray-600">Loading map...</p>
            </div>
          </div>
        )}

        {showCurrentLocation && userLocation && (
          <button
            onClick={() => {
              mapInstanceRef.current.setCenter(userLocation);
              mapInstanceRef.current.setZoom(13);
            }}
            className="absolute bottom-4 right-4 bg-white p-2 rounded-lg shadow hover:shadow-md transition-shadow"
            title="Go to your location"
          >
            <Navigation className="h-5 w-5 text-festival-blue" />
          </button>
        )}
      </div>

      {mode === 'select' && (
        <div className="mt-2 text-sm text-gray-600">
          💡 Click on the map or search to select a pickup location
        </div>
      )}
    </div>
  );
};

export default MapComponent; 