import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { loginUser, registerUser, fetchCurrentUser, updateUserProfile } from '../api/auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('bookabite_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('bookabite_token') || null);
  const [loading, setLoading] = useState(false);

  // Sync current profile on mount if token and user exist
  useEffect(() => {
    if (token && user?.user_id) {
      fetchCurrentUser(user.user_id)
        .then((freshUser) => {
          setUser(freshUser);
          localStorage.setItem('bookabite_user', JSON.stringify(freshUser));
        })
        .catch(() => {
          // Token expired or invalid
        });
    }
  }, [token]);

  const login = useCallback(async (email, password) => {
    setLoading(true);
    try {
      const res = await loginUser(email, password);
      setToken(res.token);
      setUser(res.user);
      localStorage.setItem('bookabite_token', res.token);
      localStorage.setItem('bookabite_user', JSON.stringify(res.user));
      return res.user;
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (data) => {
    setLoading(true);
    try {
      const res = await registerUser(data);
      setToken(res.token);
      setUser(res.user);
      localStorage.setItem('bookabite_token', res.token);
      localStorage.setItem('bookabite_user', JSON.stringify(res.user));
      return res.user;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('bookabite_token');
    localStorage.removeItem('bookabite_user');
  }, []);

  const updateProfile = useCallback(async (profileData) => {
    if (!user?.user_id) return;
    const res = await updateUserProfile(user.user_id, profileData);
    setUser(res.user);
    localStorage.setItem('bookabite_user', JSON.stringify(res.user));
    return res.user;
  }, [user]);

  const refreshUser = useCallback(async () => {
    if (!user?.user_id) return null;
    const fresh = await fetchCurrentUser(user.user_id);
    setUser(fresh);
    localStorage.setItem('bookabite_user', JSON.stringify(fresh));
    return fresh;
  }, [user]);

  const isOwner = user?.role === 'owner' || user?.is_admin === true;
  const isAdmin = user?.role === 'admin' || user?.is_admin === true;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: Boolean(token && user),
        isOwner,
        isAdmin,
        login,
        register,
        logout,
        updateProfile,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}
