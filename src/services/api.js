import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach access token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('crm_access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 → refresh token
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = localStorage.getItem('crm_refresh_token');
      if (refreshToken) {
        try {
          const { data } = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refresh_token: refreshToken,
          });

          const newAccessToken = data.data?.access_token;
          const newRefreshToken = data.data?.refresh_token;

          if (newAccessToken) {
            localStorage.setItem('crm_access_token', newAccessToken);
            if (newRefreshToken) {
              localStorage.setItem('crm_refresh_token', newRefreshToken);
            }
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            return api(originalRequest);
          }
        } catch (refreshError) {
          // Refresh failed — clear tokens and redirect to login
          localStorage.removeItem('crm_access_token');
          localStorage.removeItem('crm_refresh_token');
          localStorage.removeItem('crm_user');
          window.location.href = '/login';
          return Promise.reject(refreshError);
        }
      }
    }

    return Promise.reject(error);
  }
);

export const apiGet = (path, params) =>
  api.get(path, { params }).then((res) => res.data);

export const apiPost = (path, data) =>
  api.post(path, data).then((res) => res.data);

export const apiPut = (path, data) =>
  api.put(path, data).then((res) => res.data);

export const apiDelete = (path) =>
  api.delete(path).then((res) => res.data);

export const apiPatch = (path, data) =>
  api.patch(path, data).then((res) => res.data);

// Aliases for service files
export const get = apiGet;
export const post = apiPost;
export const put = apiPut;
export const patch = apiPatch;
export const del = apiDelete;

export default api;
