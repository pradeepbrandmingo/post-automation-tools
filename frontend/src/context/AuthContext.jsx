import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    checkLoggedInUser();
  }, []);

  const checkLoggedInUser = async () => {
    const token = localStorage.getItem('meta_autopost_token');
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      api.setToken(token);
      const data = await api.getProfile();
      if (data.success) {
        setUser(data.user);
      } else {
        api.setToken(null);
      }
    } catch (err) {
      console.warn('Session check failed:', err.message);
      api.setToken(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    setError(null);
    try {
      const data = await api.login(email, password);
      if (data.success) {
        api.setToken(data.token);
        setUser(data.user);
        return { success: true, role: data.user.role };
      }
      return { success: false, message: data.message };
    } catch (err) {
      setError(err.message);
      return { success: false, message: err.message };
    }
  };

  const logout = () => {
    api.setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        logout,
        isSuperAdmin: user?.role === 'super_admin',
        isAuthenticated: !!user
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
