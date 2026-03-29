/**
 * Script Service - API calls for Scripts module
 */
import { get, post } from './api';

export async function listScripts(params = {}) {
  const res = await get('/scripts', params);
  return res.data;
}

export async function getScript(scriptId) {
  const res = await get(`/scripts/${scriptId}`);
  return res.data;
}

export async function createScript(data) {
  const res = await post('/scripts', data);
  return res.data;
}
