import React, { createContext, useContext, useState, useEffect } from 'react';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../firebase';
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

  // Firebase Google OAuth Login — opens popup, sends Firebase ID token to backend
  const loginWithGoogle = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const firebaseUser = result.user;
      // Get a fresh Firebase ID token (JWT) to send to our backend for verification
      const idToken = await firebaseUser.getIdToken(/* forceRefresh */ true);

      const res = await api.post('/auth/google-login', {
        credential: idToken,
        firebaseUid: firebaseUser.uid,
        name: firebaseUser.displayName,
        avatar: firebaseUser.photoURL,
      });

      if (res.data.success) {
        localStorage.setItem('campusconnect_token', res.data.token);
        localStorage.setItem('campusconnect_user', JSON.stringify(res.data.user));
        await fetchCurrentUser();
        return { success: true };
      } else {
        const msg = res.data.message || 'Login failed.';
        setError(msg);
        return { success: false, message: msg };
      }
    } catch (err) {
      // Firebase popup closed / cancelled
      if (err.code === 'auth/popup-closed-by-user' || err.code === 'auth/cancelled-popup-request') {
        return { success: false, message: 'Sign-in cancelled.' };
      }
      const msg = err.response?.data?.message || err.message || 'Google sign-in failed.';
      setError(msg);
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  };

  // Demo Login (One-click persona test switcher — bypasses Firebase for evaluation)
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
      const msg = res.data.message || 'Demo login failed.';
      setError(msg);
      return { success: false, message: msg };
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
    // Also sign out from Firebase
    auth.signOut().catch(() => {});
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
