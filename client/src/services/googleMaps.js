import axios from 'axios';

class GoogleMapsService {
  constructor() {
    this.isLoaded = false;
    this.isLoading = false;
    this.apiKey = null;
    this.loadPromise = null;
  }

  async getApiKey() {
    if (this.apiKey) return this.apiKey;
    
    try {
      const response = await axios.get('/api/admin/settings');
      const apiKeySetting = response.data.find(setting => setting.setting_key === 'google_maps_api_key');
      this.apiKey = apiKeySetting?.setting_value;
      return this.apiKey;
    } catch (error) {
      console.error('Failed to fetch Google Maps API key:', error);
      return null;
    }
  }

  async loadGoogleMapsAPI() {
    if (this.isLoaded) return Promise.resolve(window.google);
    if (this.isLoading) return this.loadPromise;

    this.isLoading = true;
    this.loadPromise = new Promise(async (resolve, reject) => {
      try {
        const apiKey = await this.getApiKey();
        
        if (!apiKey) {
          reject(new Error('Google Maps API key not configured'));
          return;
        }

        // Check if Google Maps is already loaded
        if (window.google && window.google.maps) {
          this.isLoaded = true;
          this.isLoading = false;
          resolve(window.google);
          return;
        }

        // Create script element
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=initGoogleMaps`;
        script.async = true;
        script.defer = true;

        // Create global callback
        window.initGoogleMaps = () => {
          this.isLoaded = true;
          this.isLoading = false;
          resolve(window.google);
        };

        script.onerror = () => {
          this.isLoading = false;
          reject(new Error('Failed to load Google Maps API'));
        };

        document.head.appendChild(script);
      } catch (error) {
        this.isLoading = false;
        reject(error);
      }
    });

    return this.loadPromise;
  }

  async geocodeAddress(address) {
    await this.loadGoogleMapsAPI();
    
    return new Promise((resolve, reject) => {
      const geocoder = new window.google.maps.Geocoder();
      
      geocoder.geocode({ address }, (results, status) => {
        if (status === 'OK' && results[0]) {
          const location = results[0].geometry.location;
          resolve({
            lat: location.lat(),
            lng: location.lng(),
            formatted_address: results[0].formatted_address,
            place_id: results[0].place_id
          });
        } else {
          reject(new Error(`Geocoding failed: ${status}`));
        }
      });
    });
  }

  async reverseGeocode(lat, lng) {
    await this.loadGoogleMapsAPI();
    
    return new Promise((resolve, reject) => {
      const geocoder = new window.google.maps.Geocoder();
      const latlng = new window.google.maps.LatLng(lat, lng);
      
      geocoder.geocode({ location: latlng }, (results, status) => {
        if (status === 'OK' && results[0]) {
          resolve({
            formatted_address: results[0].formatted_address,
            place_id: results[0].place_id,
            lat,
            lng
          });
        } else {
          reject(new Error(`Reverse geocoding failed: ${status}`));
        }
      });
    });
  }

  // Default festival location (Csobánkapuszta, Hungary)
  getFestivalLocation() {
    return {
      lat: 46.9746,
      lng: 20.1353,
      formatted_address: 'Csobánkapuszta, Hungary'
    };
  }

  // Default center for Hungary
  getDefaultCenter() {
    return {
      lat: 47.1625,
      lng: 19.5033 // Budapest area
    };
  }

  // Calculate distance between two points
  calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371; // Radius of the Earth in km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLng = this.deg2rad(lng2 - lng1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * 
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c; // Distance in km
    return Math.round(distance * 10) / 10; // Round to 1 decimal place
  }

  deg2rad(deg) {
    return deg * (Math.PI/180);
  }
}

export default new GoogleMapsService(); 