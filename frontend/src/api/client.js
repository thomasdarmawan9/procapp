import axios from 'axios';

const apiClient = axios.create({
  baseURL: '/api',
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  login: (credentials) => apiClient.post('/auth/login', credentials),
};

export const requestsAPI = {
  getAll: (status = '') => apiClient.get(`/requests${status ? `?status=${status}` : ''}`),
  getById: (id) => apiClient.get(`/requests/${id}`),
  create: (data) => apiClient.post('/requests', data),
  updateStatus: (id, status) => apiClient.put(`/requests/${id}/status`, { status }),
};

export const approvalsAPI = {
  create: (requestId, data) => apiClient.post(`/requests/${requestId}/approvals`, data),
  getByRequest: (requestId) => apiClient.get(`/requests/${requestId}/approvals`),
};

export const vendorsAPI = {
  getAll: (params = {}) => apiClient.get('/vendors', { params }),
  getById: (id) => apiClient.get(`/vendors/${id}`),
  create: (data) => apiClient.post('/vendors', data),
  update: (id, data) => apiClient.put(`/vendors/${id}`, data),
  delete: (id) => apiClient.delete(`/vendors/${id}`),
};

export default apiClient;
