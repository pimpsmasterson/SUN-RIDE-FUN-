import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Save, TestTube, Check, X, AlertCircle } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

function AdminSettings() {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState({});
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await axios.get('/api/admin/settings');
      const settingsObj = {};
      response.data.forEach(setting => {
        settingsObj[setting.setting_key] = setting.setting_value || '';
      });
      setSettings(settingsObj);
    } catch (error) {
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = async (key, value) => {
    setSaving(prev => ({ ...prev, [key]: true }));
    try {
      await axios.put(`/api/admin/settings/${key}`, { value });
      setSettings(prev => ({ ...prev, [key]: value }));
      toast.success('Setting updated successfully');
    } catch (error) {
      toast.error('Failed to update setting');
    } finally {
      setSaving(prev => ({ ...prev, [key]: false }));
    }
  };

  const testGoogleMapsAPI = async () => {
    const apiKey = settings.google_maps_api_key;
    if (!apiKey) {
      toast.error('Please enter an API key first');
      return;
    }

    setTesting(true);
    setTestResult(null);

    try {
      const response = await axios.post('/api/admin/test-maps-api', { apiKey });
      setTestResult({ success: true, message: response.data.message });
      toast.success('API key is valid!');
    } catch (error) {
      const message = error.response?.data?.error || 'API key test failed';
      setTestResult({ success: false, message });
      toast.error(message);
    } finally {
      setTesting(false);
    }
  };

  const settingConfigs = [
    {
      key: 'google_maps_api_key',
      label: 'Google Maps API Key',
      description: 'Your Google Maps JavaScript API key for location services',
      type: 'password',
      placeholder: 'AIzaSyC...',
      required: true,
      testable: true
    },
    {
      key: 'festival_name',
      label: 'Festival Name',
      description: 'The name of your festival',
      type: 'text',
      placeholder: 'Sun Festival 2025',
      required: true
    },
    {
      key: 'festival_location',
      label: 'Festival Location',
      description: 'The address or location of the festival',
      type: 'text',
      placeholder: 'Csobánkapuszta, Hungary',
      required: true
    },
    {
      key: 'festival_coordinates',
      label: 'Festival Coordinates',
      description: 'GPS coordinates of the festival (latitude,longitude)',
      type: 'text',
      placeholder: '46.9746,20.1353',
      required: true
    },
    {
      key: 'festival_dates',
      label: 'Festival Dates',
      description: 'The dates when the festival takes place',
      type: 'text',
      placeholder: 'June 29 - July 6, 2025',
      required: false
    }
  ];

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
                <h1 className="text-2xl font-bold text-gray-900">Admin Settings</h1>
                <p className="text-gray-600">Manage Google Maps API and festival configuration</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Settings Form */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Festival Configuration</h2>
            <p className="text-sm text-gray-600 mt-1">
              Configure your festival details and Google Maps integration
            </p>
          </div>

          <div className="p-6 space-y-6">
            {settingConfigs.map((config) => (
              <div key={config.key} className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-medium text-gray-700">
                    {config.label}
                    {config.required && <span className="text-red-500 ml-1">*</span>}
                  </label>
                  {config.testable && (
                    <button
                      onClick={testGoogleMapsAPI}
                      disabled={testing || !settings[config.key]}
                      className="flex items-center px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 disabled:opacity-50"
                    >
                      <TestTube className="h-4 w-4 mr-1" />
                      {testing ? 'Testing...' : 'Test API'}
                    </button>
                  )}
                </div>
                
                <div className="relative">
                  <input
                    type={config.type}
                    value={settings[config.key] || ''}
                    onChange={(e) => {
                      const newSettings = { ...settings, [config.key]: e.target.value };
                      setSettings(newSettings);
                    }}
                    onBlur={(e) => {
                      if (e.target.value !== (settings[config.key] || '')) {
                        updateSetting(config.key, e.target.value);
                      }
                    }}
                    placeholder={config.placeholder}
                    className="input-field pr-10"
                    disabled={saving[config.key]}
                  />
                  {saving[config.key] && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-festival-orange"></div>
                    </div>
                  )}
                </div>
                
                <p className="text-sm text-gray-500">{config.description}</p>

                {/* Test result for Google Maps API */}
                {config.key === 'google_maps_api_key' && testResult && (
                  <div className={`flex items-center p-3 rounded-md ${
                    testResult.success 
                      ? 'bg-green-50 text-green-800' 
                      : 'bg-red-50 text-red-800'
                  }`}>
                    {testResult.success ? (
                      <Check className="h-5 w-5 mr-2" />
                    ) : (
                      <X className="h-5 w-5 mr-2" />
                    )}
                    <span className="text-sm">{testResult.message}</span>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Google Maps Setup Guide */}
          <div className="border-t border-gray-200 px-6 py-4">
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <div className="flex">
                <AlertCircle className="h-5 w-5 text-blue-400 mt-0.5" />
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800">
                    Google Maps API Setup Guide
                  </h3>
                  <div className="mt-2 text-sm text-blue-700">
                    <ol className="list-decimal list-inside space-y-1">
                      <li>Go to <a href="https://console.cloud.google.com" target="_blank" rel="noopener noreferrer" className="underline">Google Cloud Console</a></li>
                      <li>Create a new project or select existing one</li>
                      <li>Enable the following APIs:
                        <ul className="list-disc list-inside ml-4 mt-1">
                          <li>Maps JavaScript API</li>
                          <li>Geocoding API</li>
                          <li>Places API</li>
                        </ul>
                      </li>
                      <li>Create credentials (API Key)</li>
                      <li>Restrict the API key to your domains for security</li>
                      <li>Copy the API key and paste it above</li>
                    </ol>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminSettings; 