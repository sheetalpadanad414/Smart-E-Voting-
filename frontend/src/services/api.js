import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Handle responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth endpoints
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  adminLogin: (data) => api.post('/auth/admin/login', data),
  verifyOTP: (data) => api.post('/auth/verify-otp', data),
  resendOTP: (data) => api.post('/auth/resend-otp', data),
  getProfile: () => api.get('/auth/profile')
};

// Admin endpoints
export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),
  
  // Users
  getAllUsers: (page = 1, limit = 20, filters = {}) =>
    api.get('/admin/users', { params: { page, limit, ...filters } }),
  createUser: (data) => api.post('/admin/users', data),
  updateUser: (id, data) => api.put(`/admin/users/${id}`, data),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  
  // Elections
  getAllElections: (page = 1, limit = 20, filters = {}) =>
    api.get('/admin/elections', { params: { page, limit, ...filters } }),
  getElection: (id) => api.get(`/admin/elections/${id}`),
  createElection: (data) => api.post('/admin/elections', data),
  updateElection: (id, data) => api.put(`/admin/elections/${id}`, data),
  deleteElection: (id) => api.delete(`/admin/elections/${id}`),
  getElectionStatus: () => api.get('/admin/election/status'),
  startElection: () => api.post('/admin/election/start'),
  stopElection: () => api.post('/admin/election/stop'),
  
  // Candidates
  getAllCandidates: () => api.get('/admin/candidates'),
  getCandidates: (electionId, page = 1, limit = 50) =>
    api.get(`/admin/elections/${electionId}/candidates`, { params: { page, limit } }),
  createCandidate: (data) => api.post('/admin/candidates', data),
  updateCandidate: (id, data) => api.put(`/admin/candidates/${id}`, data),
  deleteCandidate: (id) => api.delete(`/admin/candidates/${id}`),
  
  // Audit logs
  getAuditLogs: (page = 1, limit = 50, filters = {}) =>
    api.get('/admin/audit-logs', { params: { page, limit, ...filters } })
};

// Voter endpoints
export const voterAPI = {
  getAvailableElections: (page = 1, limit = 20) =>
    api.get('/voter/elections', { params: { page, limit } }),
  getElectionDetails: (id) => api.get(`/voter/elections/${id}`),
  castVote: (data) => api.post('/voter/vote', data),
  requestVoteOTP: () => api.post('/voter/vote/request-otp'),
  verifyVoteOTP: (data) => api.post('/voter/vote/verify-otp', data),
  getVotingHistory: (page = 1, limit = 20) =>
    api.get('/voter/voting-history', { params: { page, limit } }),
  getElectionResults: (id) => api.get(`/voter/elections/${id}/results`),
  exportResultsPDF: (id) => api.get(`/voter/elections/${id}/results/export`, {
    responseType: 'blob'
  })
};

export default api;
