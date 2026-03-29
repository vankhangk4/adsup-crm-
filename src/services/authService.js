import api from './api';

export const saveTokens = (token, refreshToken, user) => {
  localStorage.setItem('crm_access_token', token);
  localStorage.setItem('crm_refresh_token', refreshToken);
  if (user) {
    localStorage.setItem('crm_user', JSON.stringify(user));
  }
};

export const clearTokens = () => {
  localStorage.removeItem('crm_access_token');
  localStorage.removeItem('crm_refresh_token');
  localStorage.removeItem('crm_user');
};

export const getAccessToken = () => localStorage.getItem('crm_access_token');

export const getUser = () => {
  const userStr = localStorage.getItem('crm_user');
  return userStr ? JSON.parse(userStr) : null;
};

export const login = (email, password) =>
  api.post('/auth/login', { email, password });

export const logout = (refreshToken) =>
  api.post('/auth/logout', { refresh_token: refreshToken });

export const refresh = (refreshToken) =>
  api.post('/auth/refresh', { refresh_token: refreshToken });

export const me = () => api.get('/auth/me');
