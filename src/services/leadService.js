import api from './api';

export const list = (params) =>
  api.get('/leads', { params });

export const get = (id) =>
  api.get(`/leads/${id}`);

export const create = (data) =>
  api.post('/leads', data);

export const update = (id, data) =>
  api.put(`/leads/${id}`, data);

export const updateStatus = (id, status_code) =>
  api.patch(`/leads/${id}/status`, { status_code });

export const assignUser = (lead_id, user_id) =>
  api.post(`/leads/${lead_id}/assign-user`, { user_id });

export const assignGroup = (lead_id, group_id) =>
  api.post(`/leads/${lead_id}/assign-group`, { group_id });

export const route = (lead_id) =>
  api.post(`/leads/${lead_id}/route`);

export const fromConversation = (conv_id, data) =>
  api.post(`/leads/from-conversation/${conv_id}`, data);

export default {
  list, get, create, update, updateStatus,
  assignUser, assignGroup, route, fromConversation,
};
