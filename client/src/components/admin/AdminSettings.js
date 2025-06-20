import React, { useState, useEffect } from 'react';
import { Save, TestTube, Globe, Calendar, Shield, Mail, BarChart3, RefreshCw } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

function AdminSettings() {
  const [settings, setSettings] = useState({});
  const [pendingChanges, setPendingChanges] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('api');
  const [testingApi, setTestingApi] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [changingPassword, setChangingPassword] = useState(false);

  const tabs = [
    { id: 'api', name: 'API & Maps', icon: Globe },
    { id: 'festival', name: 'Festival Info', icon: Calendar },
    { id: 'app', name: 'Application', icon: RefreshCw },
    { id: 'security', name: 'Security', icon: Shield },
    { id: 'email', name: 'Email', icon: Mail },
    { id: 'analytics', name: 'Analytics', icon: BarChart3 }
  ];

  // Calculate if there are unsaved changes
  const hasUnsavedChanges = Object.keys(pendingChanges).length > 0;

  useEffect(() => {
    fetchSettings();
  }, []);

  // Warn user before leaving with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
        return 'You have unsaved changes. Are you sure you want to leave?';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  const fetchSettings = async () => {
    try {
      const response = await axios.get('/api/admin/settings', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      const settingsObj = {};
      response.data.forEach(setting => {
        settingsObj[setting.setting_key] = setting.setting_value;
      });
      setSettings(settingsObj);
    } catch (error) {
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = async (key, value) => {
    // Store changes locally without saving immediately
    setPendingChanges(prev => ({ ...prev, [key]: value }));
  };

  const saveAllChanges = async () => {
    if (Object.keys(pendingChanges).length === 0) {
      toast.error('No changes to save');
      return;
    }

    try {
      setSaving(true);
      
      // Save all pending changes
      for (const [key, value] of Object.entries(pendingChanges)) {
        await axios.put(`/api/admin/settings/${key}`, 
          { value },
          { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }}
        );
      }
      
      // Update settings with pending changes
      setSettings(prev => ({ ...prev, ...pendingChanges }));
      setPendingChanges({});
      
      toast.success(`${Object.keys(pendingChanges).length} settings saved successfully!`);
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const discardChanges = () => {
    setPendingChanges({});
    toast.success('Changes discarded');
  };

  const getCurrentValue = (key) => {
    return pendingChanges.hasOwnProperty(key) ? pendingChanges[key] : settings[key];
  };

  const testGoogleMapsApi = async () => {
    try {
      setTestingApi(true);
      const response = await axios.post('/api/admin/test-maps-api', 
        { apiKey: settings.google_maps_api_key },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }}
      );
      
      if (response.data.valid) {
        toast.success('Google Maps API key is valid!');
      } else {
        toast.error(response.data.error);
      }
    } catch (error) {
      toast.error('API key test failed');
    } finally {
      setTestingApi(false);
    }
  };

  const changePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }

    try {
      setChangingPassword(true);
      await axios.post('/api/admin/change-password', 
        {
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword
        },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }}
      );
      
      toast.success('Password changed successfully!');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to change password');
    } finally {
      setChangingPassword(false);
    }
  };

  const SettingField = ({ 
    label, 
    value, 
    onChange, 
    type = 'text', 
    description, 
    howTo, 
    placeholder,
    required = false 
  }) => (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      {description && (
        <p className="text-sm text-gray-600 bg-blue-50 p-2 rounded border-l-4 border-blue-400">
          <strong>What this does:</strong> {description}
        </p>
      )}
      {howTo && (
        <p className="text-sm text-green-700 bg-green-50 p-2 rounded border-l-4 border-green-400">
          <strong>How to get this:</strong> {howTo}
        </p>
      )}
    </div>
  );

  const ToggleField = ({ label, value, onChange, description, whenEnabled, whenDisabled }) => (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">{label}</label>
        <button
          onClick={() => onChange(value === 'true' ? 'false' : 'true')}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            value === 'true' ? 'bg-blue-600' : 'bg-gray-200'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              value === 'true' ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>
      {description && (
        <p className="text-sm text-gray-600 bg-blue-50 p-2 rounded border-l-4 border-blue-400">
          <strong>What this does:</strong> {description}
        </p>
      )}
      {value === 'true' && whenEnabled && (
        <p className="text-sm text-green-700 bg-green-50 p-2 rounded border-l-4 border-green-400">
          <strong>Currently:</strong> {whenEnabled}
        </p>
      )}
      {value === 'false' && whenDisabled && (
        <p className="text-sm text-orange-700 bg-orange-50 p-2 rounded border-l-4 border-orange-400">
          <strong>Currently:</strong> {whenDisabled}
        </p>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Admin Settings</h1>
            <p className="text-gray-600 mt-1">Configure your Sun Festival Carpool application</p>
          </div>
          
          {hasUnsavedChanges && (
            <div className="flex items-center bg-orange-100 text-orange-800 px-3 py-2 rounded-lg">
              <div className="h-2 w-2 bg-orange-500 rounded-full mr-2 animate-pulse"></div>
              <span className="text-sm font-medium">
                {Object.keys(pendingChanges).length} unsaved change{Object.keys(pendingChanges).length !== 1 ? 's' : ''}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="h-4 w-4 mr-2" />
                {tab.name}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-lg shadow p-6">
        {activeTab === 'api' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">API & Maps Configuration</h2>
            
            <SettingField
              label="Google Maps API Key"
              value={getCurrentValue('google_maps_api_key')}
              onChange={(value) => updateSetting('google_maps_api_key', value)}
              placeholder="AIzaSyBdVl-cTICSwYKrZ95SuvNW2Aq_tK_W9qo"
              description="Enables location services, autocomplete, and map displays throughout your app. Required for users to search and select pickup locations."
              howTo="Go to Google Cloud Console → APIs & Services → Credentials → Create API Key. Enable 'Maps JavaScript API' and 'Places API' for your project."
              required
            />
            
            <div className="flex gap-2">
              <button
                onClick={testGoogleMapsApi}
                disabled={testingApi || !getCurrentValue('google_maps_api_key')}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 flex items-center"
              >
                <TestTube className="h-4 w-4 mr-2" />
                {testingApi ? 'Testing...' : 'Test API Key'}
              </button>
              </div>
            
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
              <h3 className="font-medium text-yellow-800">Important Notes:</h3>
              <ul className="text-sm text-yellow-700 mt-2 space-y-1">
                <li>• Without this API key, users cannot search for pickup locations</li>
                <li>• Google provides $200/month free credit for most small apps</li>
                <li>• Keep your API key secure - restrict it to your domain only</li>
              </ul>
            </div>
          </div>
        )}

        {activeTab === 'festival' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Festival Information</h2>
            
            <SettingField
              label="Festival Name"
              value={getCurrentValue('festival_name')}
              onChange={(value) => updateSetting('festival_name', value)}
              placeholder="Sun Festival 2025"
              description="The name of your event that appears throughout the app and in the browser title."
              required
            />
            
            <SettingField
              label="Festival Location"
              value={getCurrentValue('festival_location')}
              onChange={(value) => updateSetting('festival_location', value)}
              placeholder="Csobánkapuszta, Hungary"
              description="The main address or location name where your festival is taking place. This is the default destination for all rides."
              required
            />
            
            <SettingField
              label="Festival Coordinates"
              value={getCurrentValue('festival_coordinates')}
              onChange={(value) => updateSetting('festival_coordinates', value)}
              placeholder="46.9746,20.1353"
              description="GPS coordinates (latitude,longitude) of your festival location. Used for precise mapping and distance calculations."
              howTo="Right-click on Google Maps at your festival location and copy the coordinates, or use GPS coordinates from your venue."
            />
            
            <SettingField
              label="Festival Dates"
              value={getCurrentValue('festival_dates')}
              onChange={(value) => updateSetting('festival_dates', value)}
              placeholder="June 29 - July 6, 2025"
              description="When your festival is happening. This appears in the app header and helps users plan their carpools."
            />
            
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
              <h3 className="font-medium text-blue-800">Pro Tip:</h3>
              <p className="text-sm text-blue-700 mt-1">
                Make sure your festival information is accurate - users will see this when deciding whether to join rides!
              </p>
        </div>
      </div>
        )}

        {activeTab === 'app' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Application Settings</h2>
            
            <SettingField
              label="App Name"
              value={getCurrentValue('app_name')}
              onChange={(value) => updateSetting('app_name', value)}
              placeholder="Sun Festival Carpool"
              description="The name of your carpool application. Appears in the browser tab, navigation, and when users share your site."
              required
            />
            
            <SettingField
              label="App Description"
              value={getCurrentValue('app_description')}
              onChange={(value) => updateSetting('app_description', value)}
              placeholder="Community-driven carpooling web app for Sun Festival 2025"
              description="A brief description of your app. Used for search engine results and social media previews."
            />
            
            <SettingField
              label="Domain Name"
              value={getCurrentValue('domain_name')}
              onChange={(value) => updateSetting('domain_name', value)}
              placeholder="sunfestival.com"
              description="Your website's domain name (without http://). Used for security settings and email links."
              howTo="Purchase a domain from providers like Namecheap, GoDaddy, or use a free subdomain from your hosting provider."
            />
            
            <SettingField
              label="App Version"
              value={getCurrentValue('app_version')}
              onChange={(value) => updateSetting('app_version', value)}
              placeholder="1.0.0"
              description="Current version of your app. Helpful for tracking updates and troubleshooting."
            />
          </div>
        )}

        {activeTab === 'security' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Security Settings</h2>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">JWT Secret Key</label>
              <input
                type="password"
                value={getCurrentValue('jwt_secret') || ''}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                placeholder="Auto-generated secure key"
              />
              <p className="text-sm text-gray-600 bg-blue-50 p-2 rounded border-l-4 border-blue-400">
                <strong>What this does:</strong> This is a secret key that secures user login sessions. It's automatically generated and should never be shared.
              </p>
              <p className="text-sm text-green-700 bg-green-50 p-2 rounded border-l-4 border-green-400">
                <strong>Security:</strong> This key is automatically generated with high security. Never share it with anyone!
              </p>
            </div>

            {/* Password Change Section */}
            <div className="space-y-4 border-t pt-6">
              <h3 className="text-lg font-medium text-gray-900">Change Admin Password</h3>
              <p className="text-sm text-gray-600">Update your admin password for better security</p>
              
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Current Password</label>
                  <input
                    type="password"
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter current password"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">New Password</label>
                  <input
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter new password (min 6 characters)"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Confirm New Password</label>
                  <input
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Confirm new password"
                  />
                </div>
                
                <button
                  onClick={changePassword}
                  disabled={changingPassword || !passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword}
                  className="w-full sm:w-auto px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 flex items-center justify-center"
                >
                  {changingPassword ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  ) : (
                    <Shield className="h-4 w-4 mr-2" />
                  )}
                  {changingPassword ? 'Changing Password...' : 'Change Password'}
                </button>
              </div>
              
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                <h4 className="font-medium text-yellow-800">Password Security Tips:</h4>
                <ul className="text-sm text-yellow-700 mt-2 space-y-1">
                  <li>• Use at least 8 characters with mixed case, numbers, and symbols</li>
                  <li>• Don't reuse passwords from other accounts</li>
                  <li>• Change your password regularly for better security</li>
                  <li>• Never share your admin password with anyone</li>
                </ul>
              </div>
            </div>
            
            <SettingField
              label="Session Timeout"
              value={getCurrentValue('session_timeout')}
              onChange={(value) => updateSetting('session_timeout', value)}
              placeholder="24h"
              description="How long users stay logged in before needing to sign in again. Use formats like '24h', '7d', '30m'."
              howTo="Common values: '1h' (1 hour), '24h' (1 day), '7d' (1 week). Shorter is more secure, longer is more convenient."
            />
            
            <ToggleField
              label="Enable User Registration"
              value={getCurrentValue('enable_registration')}
              onChange={(value) => updateSetting('enable_registration', value)}
              description="Controls whether new users can create accounts on your platform."
              whenEnabled="New users can register and create accounts."
              whenDisabled="Only existing users can log in. Registration is blocked."
            />
            
            <ToggleField
              label="Maintenance Mode"
              value={getCurrentValue('maintenance_mode')}
              onChange={(value) => updateSetting('maintenance_mode', value)}
              description="Temporarily blocks all non-admin users from accessing the site. Use when updating or fixing issues."
              whenEnabled="⚠️ SITE IS IN MAINTENANCE MODE - Only admins can access the site!"
              whenDisabled="Site is live and accessible to all users."
            />
            
            <div className="bg-red-50 border-l-4 border-red-400 p-4">
              <h3 className="font-medium text-red-800">Security Warning:</h3>
              <p className="text-sm text-red-700 mt-1">
                Only enable maintenance mode when necessary. Users won't be able to access the site while it's active.
              </p>
            </div>
                  </div>
                )}

        {activeTab === 'email' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Email Configuration</h2>
            <p className="text-gray-600 mb-4">Configure email settings for notifications and communications (optional but recommended).</p>
            
            <SettingField
              label="SMTP Host"
              value={getCurrentValue('smtp_host')}
              onChange={(value) => updateSetting('smtp_host', value)}
              placeholder="smtp.gmail.com"
              description="The server that sends your emails. Each email provider has different settings."
              howTo="Gmail: smtp.gmail.com | Outlook: smtp-mail.outlook.com | Yahoo: smtp.mail.yahoo.com"
            />
            
            <SettingField
              label="SMTP Port"
              value={getCurrentValue('smtp_port')}
              onChange={(value) => updateSetting('smtp_port', value)}
              placeholder="587"
              type="number"
              description="The port number for your email server. 587 is standard for most providers."
              howTo="Most providers use port 587 (TLS) or 465 (SSL). Check your email provider's documentation."
            />
            
            <SettingField
              label="SMTP Username"
              value={getCurrentValue('smtp_user')}
              onChange={(value) => updateSetting('smtp_user', value)}
              placeholder="your-email@gmail.com"
              description="Your email address that will send notifications to users."
            />
            
            <SettingField
              label="SMTP Password"
              value={getCurrentValue('smtp_password')}
              onChange={(value) => updateSetting('smtp_password', value)}
              type="password"
              placeholder="Your email password or app password"
              description="Your email password. For Gmail, you'll need to create an 'App Password' in your security settings."
              howTo="For Gmail: Go to Google Account → Security → 2-Step Verification → App Passwords. Generate a password for 'Mail'."
            />
            
            <SettingField
              label="Admin Email"
              value={getCurrentValue('admin_email')}
              onChange={(value) => updateSetting('admin_email', value)}
              placeholder="admin@sunfestival.com"
              description="Your email address where you'll receive admin notifications and user messages."
            />
            
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
              <h3 className="font-medium text-yellow-800">Email Setup Tips:</h3>
              <ul className="text-sm text-yellow-700 mt-2 space-y-1">
                <li>• Email is optional - your app works without it</li>
                <li>• Gmail users need to enable "App Passwords" in security settings</li>
                <li>• Test your settings by sending yourself a test email</li>
                <li>• Consider using services like SendGrid or Mailgun for high volume</li>
              </ul>
              </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Analytics & Monitoring</h2>
            <p className="text-gray-600 mb-4">Track your app's performance and user behavior (optional).</p>
            
            <SettingField
              label="Google Analytics ID"
              value={getCurrentValue('google_analytics_id')}
              onChange={(value) => updateSetting('google_analytics_id', value)}
              placeholder="G-XXXXXXXXXX or UA-XXXXXXXXX-X"
              description="Track website visitors, page views, and user behavior. Helps you understand how people use your carpool app."
              howTo="Go to Google Analytics → Create Account → Create Property. Copy the Measurement ID (starts with 'G-' or 'UA-')."
            />
            
            <ToggleField
              label="Error Reporting"
              value={getCurrentValue('error_reporting_enabled')}
              onChange={(value) => updateSetting('error_reporting_enabled', value)}
              description="Automatically log errors and issues to help you fix problems quickly."
              whenEnabled="Errors are logged and you can monitor app health."
              whenDisabled="Error logging is disabled - you won't see technical issues."
            />
            
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
              <h3 className="font-medium text-blue-800">Why Use Analytics?</h3>
              <ul className="text-sm text-blue-700 mt-2 space-y-1">
                <li>• See how many people are using your carpool app</li>
                <li>• Understand which features are most popular</li>
                <li>• Track successful ride connections</li>
                <li>• Monitor app performance and loading times</li>
                        </ul>
            </div>
          </div>
        )}
        </div>

      {/* Save Button */}
      <div className="mt-6 flex justify-between items-center">
        {hasUnsavedChanges && (
          <div className="flex items-center text-orange-600">
            <div className="h-2 w-2 bg-orange-500 rounded-full mr-2 animate-pulse"></div>
            <span className="text-sm font-medium">
              {Object.keys(pendingChanges).length} unsaved change{Object.keys(pendingChanges).length !== 1 ? 's' : ''}
            </span>
          </div>
        )}
        
        {!hasUnsavedChanges && (
          <div className="flex items-center text-green-600">
            <div className="h-2 w-2 bg-green-500 rounded-full mr-2"></div>
            <span className="text-sm font-medium">All changes saved</span>
          </div>
        )}

        <div className="flex space-x-3">
          {hasUnsavedChanges && (
            <button
              onClick={discardChanges}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 flex items-center"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Discard Changes
            </button>
          )}
          
          <button
            onClick={saveAllChanges}
            disabled={saving || !hasUnsavedChanges}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center"
          >
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : `Save ${hasUnsavedChanges ? `(${Object.keys(pendingChanges).length})` : 'Changes'}`}
          </button>
        </div>
      </div>
    </div>
  );
}

export default AdminSettings; 