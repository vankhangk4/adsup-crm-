import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  // Initialize user from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('crm_user');
      if (stored) {
        setUser(JSON.parse(stored));
      }
    } catch {
      setUser(null);
    }
  }, []);

  const login = useCallback(async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    const data = response.data;

    if (!data.success) {
      throw new Error(data.message || 'Login failed');
    }

    const { access_token, refresh_token, user: userData } = data.data;

    localStorage.setItem('crm_access_token', access_token);
    localStorage.setItem('crm_refresh_token', refresh_token);
    localStorage.setItem('crm_user', JSON.stringify(userData));
    setUser(userData);

    return userData;
  }, []);

  const logout = useCallback(async () => {
    const refreshToken = localStorage.getItem('crm_refresh_token');

    if (refreshToken) {
      try {
        await api.post('/auth/logout', { refresh_token: refreshToken });
      } catch {
        // Ignore logout errors — still clear local state
      }
    }

    localStorage.removeItem('crm_access_token');
    localStorage.removeItem('crm_refresh_token');
    localStorage.removeItem('crm_user');
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
