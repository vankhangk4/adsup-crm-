/**
 * Permission Service - API calls for Permissions & Roles modules
 */
import { get, post, put } from './api';

export async function listPermissions(params = {}) {
  const res = await get('/permissions', params);
  return res.data;
}

export async function createPermission(data) {
  const res = await post('/permissions', data);
  return res.data;
}

export async function listRoles(params = {}) {
  const res = await get('/roles', params);
  return res.data;
}

export async function createRole(data) {
  const res = await post('/roles', data);
  return res.data;
}

export async function updateRole(roleId, data) {
  const res = await put(`/roles/${roleId}`, data);
  return res.data;
}

export async function assignPermissionsToRole(roleId, permissionIds = [], codes = []) {
  const res = await post(`/roles/${roleId}/permissions`, {
    permission_ids: permissionIds,
    codes,
  });
  return res.data;
}
