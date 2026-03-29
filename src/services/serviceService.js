import api from './api';

export const list = (params = {}) =>
  api.get('/services', { params });

export const get = (id) =>
  api.get(`/services/${id}`);

export const create = (data) =>
  api.post('/services', data);

export const update = (id, data) =>
  api.put(`/services/${id}`, data);

export const toggleStatus = (id, isActive) =>
  api.patch(`/services/${id}/status`, { is_active: isActive });
