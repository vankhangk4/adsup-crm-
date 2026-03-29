import api from './api';

export const listRules = (params = {}) =>
  api.get('/routing-rules', { params });

export const createRule = (data) =>
  api.post('/routing-rules', data);

export const updateRule = (id, data) =>
  api.put(`/routing-rules/${id}`, data);

export const toggleRuleStatus = (id) =>
  api.patch(`/routing-rules/${id}/status`);

export const deleteRule = (id) =>
  api.delete(`/routing-rules/${id}`);

export const listQueues = (params = {}) =>
  api.get('/lead-queues', { params });

export const releaseQueue = (id, data) =>
  api.post(`/lead-queues/${id}/release`, data);
