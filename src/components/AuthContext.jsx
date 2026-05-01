import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getApiUrl, fetchWithLogging } from '../config/api';

const UserContext = createContext(null);

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [balance, setBalance] = useState({ totalEquity: '0.00', totalAvailableBalance: '0.00' });
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user_profile');
    setUser(null);
    setAuthenticated(false);
    setBalance({ totalEquity: '0.00', totalAvailableBalance: '0.00' });
    
    // Only redirect if we are in a protected area
    if (window.location.pathname.startsWith('/dashboard')) {
      navigate('/sign-in');
    }
  }, [navigate]);

  const fetchProfile = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token || token === 'null' || token === 'undefined') {
      setLoading(false);
      setAuthenticated(false);
      return;
    }

    try {
      if (response.ok) {
        const res = await response.json();
        // Standardized response uses { ok: true, data: { ... } }
        const profileData = res.data;
        
        if (profileData) {
          setUser(profileData);
          setAuthenticated(true);
          if (profileData.balance) {
            setBalance(profileData.balance);
          }
        }
      } else if (response.status === 401) {
        logout();
      }
    } catch (err) {
      console.error('Failed to fetch profile:', err);
    } finally {
      setLoading(false);
    }
  }, [logout]);

  useEffect(() => {
    fetchProfile();
    // Poll for balance every 30s as a fallback for WS
    const interval = setInterval(fetchProfile, 30000);
    return () => clearInterval(interval);
  }, [fetchProfile]);

  return (
    <UserContext.Provider value={{ user, balance, loading, authenticated, logout, refresh: fetchProfile }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export const ProtectedRoute = ({ children }) => {
  const { authenticated, loading } = useUser();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!loading && !authenticated) {
      navigate('/sign-in', { state: { from: location } });
    }
  }, [loading, authenticated, navigate, location]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0a0f1d]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return authenticated ? children : null;
};
