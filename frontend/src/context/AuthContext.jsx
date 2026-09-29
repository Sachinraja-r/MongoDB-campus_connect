import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCurrentUser = async () => {
    try {
      const token = localStorage.getItem('campusconnect_token');
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }
      const res = await api.get('/auth/me');
      if (res.data.success) {
        setUser(res.data.user);
      }
    } catch (err) {
      console.error('[Auth] Failed to load current user:', err.response?.data?.message || err.message);
      localStorage.removeItem('campusconnect_token');
      localStorage.removeItem('campusconnect_user');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  // Google OAuth Login
  const loginWithGoogle = async (credential) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.post('/auth/google-login', { credential });
      if (res.data.success) {
        localStorage.setItem('campusconnect_token', res.data.token);
        localStorage.setItem('campusconnect_user', JSON.stringify(res.data.user));
        await fetchCurrentUser();
        return { success: true };
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Please verify credentials.';
      setError(msg);
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  };

  // Demo Login (One-click persona test switcher)
  const loginWithDemo = async (email) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.post('/auth/google-login', { email, isDemo: true });
      if (res.data.success) {
        localStorage.setItem('campusconnect_token', res.data.token);
        localStorage.setItem('campusconnect_user', JSON.stringify(res.data.user));
        await fetchCurrentUser();
        return { success: true };
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Demo login failed.';
      setError(msg);
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('campusconnect_token');
    localStorage.removeItem('campusconnect_user');
    setUser(null);
    window.location.href = '/login';
  };

  const updatePresence = (presenceData) => {
    if (user) {
      setUser((prev) => ({
        ...prev,
        presence: presenceData,
      }));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        loginWithGoogle,
        loginWithDemo,
        logout,
        refreshUser: fetchCurrentUser,
        updatePresence,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
