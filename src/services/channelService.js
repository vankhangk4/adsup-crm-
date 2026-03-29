import api from './api';

export const list = (params = {}) =>
  api.get('/channels', { params });

export const get = (id) =>
  api.get(`/channels/${id}`);

export const create = (data) =>
  api.post('/channels', data);

export const update = (id, data) =>
  api.put(`/channels/${id}`, data);
