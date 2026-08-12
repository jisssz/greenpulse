import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('greenpulse_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('greenpulse_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyUser = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await api.get('/auth/me');
        if (res && res.success && res.data) {
          setUser(res.data);
          localStorage.setItem('greenpulse_user', JSON.stringify(res.data));
        }
      } catch (err) {
        console.warn('Session verification fallback:', err);
        const saved = localStorage.getItem('greenpulse_user');
        if (!saved) {
          logout();
        }
      } finally {
        setLoading(false);
      }
    };
    verifyUser();
  }, [token]);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res && res.success && res.data) {
      setToken(res.data.token);
      setUser(res.data.user);
      localStorage.setItem('greenpulse_token', res.data.token);
      localStorage.setItem('greenpulse_user', JSON.stringify(res.data.user));
      return res.data.user;
    }
    throw new Error(res?.message || 'Login failed');
  };

  const register = async (userData) => {
    const res = await api.post('/auth/register', userData);
    if (res && res.success && res.data) {
      setToken(res.data.token);
      setUser(res.data.user);
      localStorage.setItem('greenpulse_token', res.data.token);
      localStorage.setItem('greenpulse_user', JSON.stringify(res.data.user));
      return res.data.user;
    }
    throw new Error(res?.message || 'Registration failed');
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('greenpulse_token');
    localStorage.removeItem('greenpulse_user');
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
