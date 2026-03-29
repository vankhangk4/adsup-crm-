/**
 * Tele Service - API calls for Telemarketing module
 */
import { get, post, patch } from './api';

export async function listLeads(params = {}) {
  const res = await get('/tele/leads', params);
  return res.data;
}

export async function getLead(leadId) {
  const res = await get(`/tele/leads/${leadId}`);
  return res.data;
}

export async function listGroupLeads(params = {}) {
  const res = await get('/tele/group/leads', params);
  return res.data;
}

export async function addCallLog(leadId, data) {
  const res = await post(`/tele/leads/${leadId}/call-logs`, data);
  return res.data;
}

export async function listCallLogs(leadId) {
  const res = await get(`/tele/leads/${leadId}/call-logs`);
  return res.data;
}

export async function addNote(leadId, note) {
  const res = await post(`/tele/leads/${leadId}/notes`, { note });
  return res.data;
}

export async function listNotes(leadId) {
  const res = await get(`/tele/leads/${leadId}/notes`);
  return res.data;
}

export async function createFollowUp(leadId, data) {
  const res = await post(`/tele/leads/${leadId}/follow-ups`, data);
  return res.data;
}

export async function listFollowUps(leadId) {
  const res = await get(`/tele/leads/${leadId}/follow-ups`);
  return res.data;
}

export async function createAppointment(leadId, data) {
  const res = await post(`/tele/leads/${leadId}/appointments`, data);
  return res.data;
}

export async function listAppointments(leadId) {
  const res = await get(`/tele/leads/${leadId}/appointments`);
  return res.data;
}

export async function updateStatus(leadId, statusCode) {
  const res = await patch(`/tele/leads/${leadId}/status`, { status_code: statusCode });
  return res.data;
}
