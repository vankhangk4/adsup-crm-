import api from './api';

// Note: Backend does not have a /departments endpoint.
// This service aggregates user data from /users by department_id.
export const list = async (params = {}) => {
  // Try /departments first if it exists
  try {
    const res = await api.get('/departments', { params });
    return res;
  } catch {
    // Fallback: return empty (departments page will handle aggregation)
    return { data: { items: [], total: 0 } };
  }
};

export const listUsersByDepartment = async (params = {}) => {
  // Use /users endpoint and aggregate by department_id on frontend
  const res = await api.get('/users', { params: { ...params, page_size: 200 } });
  return res;
};
