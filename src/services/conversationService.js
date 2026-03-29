/**
 * Conversation Service - API calls for Chat module
 */
import { get, post, patch } from './api';

export async function listConversations(params = {}) {
  const res = await get('/conversations', params);
  return res.data;
}

export async function getConversation(convId) {
  const res = await get(`/conversations/${convId}`);
  return res.data;
}

export async function createConversation(data) {
  const res = await post('/conversations', data);
  return res.data;
}

export async function updateConversation(convId, data) {
  const res = await patch(`/conversations/${convId}`, data);
  return res.data;
}

export async function listMessages(convId, params = {}) {
  const res = await get(`/conversations/${convId}/messages`, params);
  return res.data;
}

export async function sendMessage(convId, messageText, senderType = 'page_staff') {
  const res = await post(`/conversations/${convId}/messages`, {
    message_text: messageText,
    sender_type: senderType,
    message_type: 'text',
  });
  return res.data;
}

export async function assignConversation(convId, userId) {
  const res = await post(`/conversations/${convId}/assign`, { user_id: userId });
  return res.data;
}

export async function addTags(convId, tagNames) {
  const res = await post(`/conversations/${convId}/tags`, { tag_names: tagNames });
  return res.data;
}

export async function updateStatus(convId, status) {
  const res = await patch(`/conversations/${convId}/status`, { status });
  return res.data;
}

export async function markHot(convId, isHot) {
  const res = await post(`/conversations/${convId}/mark-hot`, { is_hot: isHot });
  return res.data;
}

export async function markPhoneCollected(convId, phone) {
  const res = await post(`/conversations/${convId}/mark-phone-collected`, { phone });
  return res.data;
}

export async function markWaitingTele(convId) {
  const res = await post(`/conversations/${convId}/mark-waiting-tele`);
  return res.data;
}

export async function updateInternalNote(convId, note) {
  const res = await patch(`/conversations/${convId}/internal-note`, { note });
  return res.data;
}
