import api from './api';

export const list = (params = {}) =>
  api.get('/users', { params });

export const get = (id) =>
  api.get(`/users/${id}`);

export const create = (data) =>
  api.post('/users', data);

export const update = (id, data) =>
  api.put(`/users/${id}`, data);

export const toggleStatus = (id, isActive) =>
  api.patch(`/users/${id}/status`, { is_active: isActive });

export const listRoles = (params = {}) =>
  api.get('/roles', { params });

export const listPermissions = (params = {}) =>
  api.get('/permissions', { params });
