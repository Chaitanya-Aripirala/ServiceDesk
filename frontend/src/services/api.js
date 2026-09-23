import axios from 'axios';

// Always use the deployed Render backend in production builds (Vercel/Render Static)
// In local dev, /api is proxied to localhost:5000 via vite.config.js
const API_BASE = import.meta.env.PROD
  ? 'https://servicedesk-3t07.onrender.com/api'
  : '/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Inject token into request headers
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('servicedesk_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token on unauthorized if not on login page
      if (window.location.pathname !== '/login') {
        localStorage.removeItem('servicedesk_token');
        localStorage.removeItem('servicedesk_user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth Services
export const authService = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getMe: () => api.get('/auth/me'),
  getNotifications: () => api.get('/auth/notifications'),
  markNotificationRead: (id) => api.put(`/auth/notifications/${id}/read`),
  markAllNotificationsRead: () => api.put('/auth/notifications/read-all'),
};

// Ticket Services
export const ticketService = {
  getTickets: (params) => api.get('/tickets', { params }),
  getTicketById: (id) => api.get(`/tickets/${id}`),
  createTicket: (data) => api.post('/tickets', data),
  assignTicket: (id, technicianId) => api.put(`/tickets/${id}/assign`, { technicianId }),
  updateStatus: (id, statusData) => api.put(`/tickets/${id}/status`, statusData),
  addComment: (id, commentData) => api.post(`/tickets/${id}/comments`, commentData),
  addWorkLog: (id, workLogData) => api.post(`/tickets/${id}/worklogs`, workLogData),
  escalateTicket: (id, escalationData) => api.post(`/tickets/${id}/escalate`, escalationData),
  rateTicket: (id, ratingData) => api.post(`/tickets/${id}/rate`, ratingData),
  reopenTicket: (id, reasonData) => api.post(`/tickets/${id}/reopen`, reasonData),
  previewAiClassification: (data) => api.post('/tickets/ai-classify', data),
  getAiCopilot: (id) => api.get(`/tickets/${id}/ai-copilot`),
};

// Asset Services
export const assetService = {
  getAssets: (params) => api.get('/assets', { params }),
  getAssetById: (id) => api.get(`/assets/${id}`),
  createAsset: (data) => api.post('/assets', data),
  updateAsset: (id, data) => api.put(`/assets/${id}`, data),
  updateLifecycle: (id, data) => api.put(`/assets/${id}/lifecycle`, data),
  addMaintenanceLog: (id, data) => api.post(`/assets/${id}/maintenance`, data),
  deleteAsset: (id) => api.delete(`/assets/${id}`),
};

// Knowledge Base Services
export const kbService = {
  getArticles: (params) => api.get('/kb', { params }),
  getArticleById: (id) => api.get(`/kb/${id}`),
  createArticle: (data) => api.post('/kb', data),
  updateArticle: (id, data) => api.put(`/kb/${id}`, data),
  deleteArticle: (id) => api.delete(`/kb/${id}`),
  voteArticle: (id, isHelpful) => api.post(`/kb/${id}/vote`, { isHelpful }),
};

// User & Team Services
export const userService = {
  getUsers: (params) => api.get('/users', { params }),
  getTechnicians: () => api.get('/users/technicians'),
  createUser: (data) => api.post('/users', data),
  updateUser: (id, data) => api.put(`/users/${id}`, data),
};

// SLA & Configuration Services
export const slaService = {
  getPolicies: () => api.get('/sla/policies'),
  savePolicy: (data) => api.post('/sla/policies', data),
  getCategories: () => api.get('/sla/categories'),
  createCategory: (data) => api.post('/sla/categories', data),
};

// Analytics & Reports Services
export const analyticsService = {
  getDashboardAnalytics: () => api.get('/analytics/dashboard'),
};

// Audit Services
export const auditService = {
  getAuditLogs: (params) => api.get('/audit', { params }),
};

export default api;
