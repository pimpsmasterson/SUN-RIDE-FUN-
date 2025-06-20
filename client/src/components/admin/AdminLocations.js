import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, MapPin, Plus, Edit3, Trash2, Save, X, Check } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

function AdminLocations() {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    latitude: '',
    longitude: '',
    is_active: true
  });

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    try {
      const response = await axios.get('/api/admin/locations');
      setLocations(response.data);
    } catch (error) {
      toast.error('Failed to load locations');
    } finally {
      setLoading(false);
    }
  };

  const handleAddLocation = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/admin/locations', formData);
      setLocations([...locations, response.data]);
      setFormData({ name: '', address: '', latitude: '', longitude: '', is_active: true });
      setShowAddForm(false);
      toast.success('Location added successfully');
    } catch (error) {
      toast.error('Failed to add location');
    }
  };

  const handleUpdateLocation = async (id, updatedData) => {
    try {
      const response = await axios.put(`/api/admin/locations/${id}`, updatedData);
      setLocations(locations.map(loc => loc.id === id ? response.data : loc));
      setEditingId(null);
      toast.success('Location updated successfully');
    } catch (error) {
      toast.error('Failed to update location');
    }
  };

  const handleDeleteLocation = async (id) => {
    if (!window.confirm('Are you sure you want to delete this location?')) {
      return;
    }
    
    try {
      await axios.delete(`/api/admin/locations/${id}`);
      setLocations(locations.filter(loc => loc.id !== id));
      toast.success('Location deleted successfully');
    } catch (error) {
      toast.error('Failed to delete location');
    }
  };

  const toggleLocationStatus = async (id, currentStatus) => {
    const location = locations.find(loc => loc.id === id);
    if (!location) return;

    await handleUpdateLocation(id, {
      ...location,
      is_active: !currentStatus
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-festival-orange"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link 
                to="/admin"
                className="flex items-center text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Back to Dashboard
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Manage Locations</h1>
                <p className="text-gray-600">Add and edit pickup locations for the festival</p>
              </div>
            </div>
            <button
              onClick={() => setShowAddForm(true)}
              className="btn-primary flex items-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Location
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Add Location Form */}
        {showAddForm && (
          <div className="bg-white rounded-lg shadow mb-6">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Add New Location</h2>
            </div>
            <form onSubmit={handleAddLocation} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="input-field"
                    placeholder="Budapest Center"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address *
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    className="input-field"
                    placeholder="Budapest, Deák Ferenc tér"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Latitude *
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={formData.latitude}
                    onChange={(e) => setFormData({...formData, latitude: e.target.value})}
                    className="input-field"
                    placeholder="47.4979"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Longitude *
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={formData.longitude}
                    onChange={(e) => setFormData({...formData, longitude: e.target.value})}
                    className="input-field"
                    placeholder="19.0402"
                    required
                  />
                </div>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                  className="h-4 w-4 text-festival-orange focus:ring-festival-orange border-gray-300 rounded"
                />
                <label htmlFor="is_active" className="ml-2 text-sm text-gray-700">
                  Active (visible to users)
                </label>
              </div>
              <div className="flex space-x-3">
                <button type="submit" className="btn-primary">
                  <Save className="h-4 w-4 mr-2" />
                  Add Location
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false);
                    setFormData({ name: '', address: '', latitude: '', longitude: '', is_active: true });
                  }}
                  className="btn-secondary"
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Locations List */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Festival Pickup Locations ({locations.length})
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Manage predefined pickup locations for festival carpooling
            </p>
          </div>

          {locations.length === 0 ? (
        <div className="text-center py-16">
          <MapPin className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No locations yet</h3>
              <p className="text-gray-600 mb-4">Add your first pickup location to get started</p>
              <button
                onClick={() => setShowAddForm(true)}
                className="btn-primary"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Location
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Location
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Address
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Coordinates
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {locations.map((location) => (
                    <LocationRow
                      key={location.id}
                      location={location}
                      editingId={editingId}
                      setEditingId={setEditingId}
                      onUpdate={handleUpdateLocation}
                      onDelete={handleDeleteLocation}
                      onToggleStatus={toggleLocationStatus}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Location Row Component for editing
function LocationRow({ location, editingId, setEditingId, onUpdate, onDelete, onToggleStatus }) {
  const [editData, setEditData] = useState(location);
  const isEditing = editingId === location.id;

  const handleSave = () => {
    onUpdate(location.id, editData);
  };

  const handleCancel = () => {
    setEditData(location);
    setEditingId(null);
  };

  if (isEditing) {
    return (
      <tr className="bg-yellow-50">
        <td className="px-6 py-4">
          <input
            type="text"
            value={editData.name}
            onChange={(e) => setEditData({...editData, name: e.target.value})}
            className="input-field text-sm"
            placeholder="Location name"
          />
        </td>
        <td className="px-6 py-4">
          <input
            type="text"
            value={editData.address}
            onChange={(e) => setEditData({...editData, address: e.target.value})}
            className="input-field text-sm"
            placeholder="Address"
          />
        </td>
        <td className="px-6 py-4">
          <div className="flex space-x-2">
            <input
              type="number"
              step="any"
              value={editData.latitude}
              onChange={(e) => setEditData({...editData, latitude: e.target.value})}
              className="input-field text-sm w-24"
              placeholder="Lat"
            />
            <input
              type="number"
              step="any"
              value={editData.longitude}
              onChange={(e) => setEditData({...editData, longitude: e.target.value})}
              className="input-field text-sm w-24"
              placeholder="Lng"
            />
          </div>
        </td>
        <td className="px-6 py-4">
          <input
            type="checkbox"
            checked={editData.is_active}
            onChange={(e) => setEditData({...editData, is_active: e.target.checked})}
            className="h-4 w-4 text-festival-orange focus:ring-festival-orange border-gray-300 rounded"
          />
        </td>
        <td className="px-6 py-4">
          <div className="flex space-x-2">
            <button
              onClick={handleSave}
              className="text-green-600 hover:text-green-800"
              title="Save"
            >
              <Check className="h-4 w-4" />
            </button>
            <button
              onClick={handleCancel}
              className="text-gray-600 hover:text-gray-800"
              title="Cancel"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </td>
      </tr>
    );
  }

  return (
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <MapPin className="h-4 w-4 text-gray-400 mr-2" />
          <span className="text-sm font-medium text-gray-900">{location.name}</span>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {location.address}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {location.latitude}, {location.longitude}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <button
          onClick={() => onToggleStatus(location.id, location.is_active)}
          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
            location.is_active
              ? 'bg-green-100 text-green-800 hover:bg-green-200'
              : 'bg-red-100 text-red-800 hover:bg-red-200'
          }`}
        >
          {location.is_active ? 'Active' : 'Inactive'}
        </button>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex space-x-2">
          <button
            onClick={() => setEditingId(location.id)}
            className="text-blue-600 hover:text-blue-800"
            title="Edit"
          >
            <Edit3 className="h-4 w-4" />
          </button>
          <button
            onClick={() => onDelete(location.id)}
            className="text-red-600 hover:text-red-800"
            title="Delete"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </td>
    </tr>
  );
}

export default AdminLocations; 