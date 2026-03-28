import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const API = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto-logout on 401
API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// ===== Auth =====
export const authAPI = {
  register: (data) => API.post('/auth/register', data),
  login: (data) => API.post('/auth/login', data),
};

// ===== Admin Auth (separate endpoint) =====
export const adminAuthAPI = {
  login: (data) => API.post('/admin/auth/login', data),
};

// ===== Internships =====
export const internshipAPI = {
  getAll: (params) => API.get('/internships', { params }),
  getById: (id) => API.get(`/internships/${id}`),
  getRecommendations: (params) => API.get('/recommendations', { params }),
  apply: (id, data) => API.post(`/internships/${id}/apply`, data),
};

// ===== User =====
export const userAPI = {
  getMyApplications: (params) => API.get('/user/applications', { params }),
};

// ===== Admin =====
export const adminAPI = {
  // Internship CRUD
  listInternships: (params) => API.get('/admin/internships', { params }),
  create: (data) => API.post('/admin/internships', data),
  update: (id, data) => API.put(`/admin/internships/${id}`, data),
  delete: (id) => API.delete(`/admin/internships/${id}`),
  // Stats & Users
  getStats: () => API.get('/admin/stats'),
  getAllUsers: (params) => API.get('/admin/users', { params }),
  deleteUser: (id) => API.delete(`/admin/users/${id}`),
  // Applicant management
  getAllApplications: (params) => API.get('/admin/applications', { params }),
  getApplicants: (internshipId, params) =>
    API.get(`/admin/internships/${internshipId}/applications`, { params }),
  updateApplicationStatus: (applicationId, status) =>
    API.put(`/admin/applications/${applicationId}/status`, { status }),
};

// ===== Chatbot =====
export const chatAPI = {
  sendMessage: (message) => API.post('/chat/message', { message }),
};

export default API;
