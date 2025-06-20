import React, { useState, useEffect, createContext, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import axios from 'axios';

// Initialize banner image
import './utils/setBannerImage';

// Components
import Navbar from './components/Navbar';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import RideList from './components/RideList';
import CreateRide from './components/CreateRide';
import MyRides from './components/MyRides';
import MyRequests from './components/MyRequests';
import ChatHub from './components/ChatHub';
import RideChat from './components/RideChat';
import AdminLogin from './components/admin/AdminLogin';
import AdminDashboard from './components/admin/AdminDashboard';
import AdminSettings from './components/admin/AdminSettings';
import AdminLocations from './components/admin/AdminLocations';
import AdminUsers from './components/admin/AdminUsers';

// Context
const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Set up axios defaults
// In production, API requests are made to the same domain
// In development, API requests are made to http://localhost:5000
axios.defaults.baseURL = process.env.NODE_ENV === 'production' ? '' : 'http://localhost:5000';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing token
    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      // Verify token with server
      axios.get('/api/auth/me')
        .then(response => {
          setUser(response.data);
        })
        .catch(() => {
          localStorage.removeItem('token');
          delete axios.defaults.headers.common['Authorization'];
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const login = (userData, token) => {
    localStorage.setItem('token', token);
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
  };

  const authValue = {
    user,
    login,
    logout,
    isAuthenticated: !!user,
    isAdmin: user?.isAdmin || false
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-festival-orange mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading Sun Festival Carpool...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={authValue}>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Toaster position="top-right" />
          
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={
              !user ? <Login /> : <Navigate to="/" />
            } />
            <Route path="/register" element={
              !user ? <Register /> : <Navigate to="/" />
            } />
            
            {/* Admin routes */}
            <Route path="/admin/login" element={
              !user?.isAdmin ? <AdminLogin /> : <Navigate to="/admin" />
            } />
            <Route path="/admin" element={
              user?.isAdmin ? <AdminDashboard /> : <Navigate to="/admin/login" />
            } />
            <Route path="/admin/settings" element={
              user?.isAdmin ? <AdminSettings /> : <Navigate to="/admin/login" />
            } />
            <Route path="/admin/locations" element={
              user?.isAdmin ? <AdminLocations /> : <Navigate to="/admin/login" />
            } />
            <Route path="/admin/users" element={
              user?.isAdmin ? <AdminUsers /> : <Navigate to="/admin/login" />
            } />
            
            {/* Protected routes */}
            <Route path="/" element={
              user ? (
                <div>
                  <Navbar />
                  <Dashboard />
                </div>
              ) : <Navigate to="/login" />
            } />
            <Route path="/rides" element={
              user ? (
                <div>
                  <Navbar />
                  <RideList />
                </div>
              ) : <Navigate to="/login" />
            } />
            <Route path="/create-ride" element={
              user ? (
                <div>
                  <Navbar />
                  <CreateRide />
                </div>
              ) : <Navigate to="/login" />
            } />
            <Route path="/my-rides" element={
              user ? (
                <div>
                  <Navbar />
                  <MyRides />
                </div>
              ) : <Navigate to="/login" />
            } />
            <Route path="/my-requests" element={
              user ? (
                <div>
                  <Navbar />
                  <MyRequests />
                </div>
              ) : <Navigate to="/login" />
            } />
            <Route path="/chat" element={
              user ? (
                <div>
                  <Navbar />
                  <ChatHub />
                </div>
              ) : <Navigate to="/login" />
            } />
            <Route path="/chat/:rideId" element={
              user ? (
                <div>
                  <Navbar />
                  <RideChat />
                </div>
              ) : <Navigate to="/login" />
            } />
          </Routes>
        </div>
      </Router>
    </AuthContext.Provider>
  );
}

export default App; 