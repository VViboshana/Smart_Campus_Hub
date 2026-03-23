import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
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

// Auth APIs
export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  getMe: () => api.get('/auth/me'),
  updateMe: (data) => api.put('/auth/me', data),
  changePassword: (data) => api.patch('/auth/me/password', data),
  deleteMe: () => api.delete('/auth/me'),
  getPreferences: () => api.get('/auth/me/preferences'),
  updatePreferences: (data) => api.patch('/auth/me/preferences', data),
};

// Resource APIs
export const resourceAPI = {
  getAll: () => api.get('/resources'),
  getById: (id) => api.get(`/resources/${id}`),
  search: (params) => api.get('/resources/search', { params }),
  create: (data) => api.post('/resources', data),
  update: (id, data) => api.put(`/resources/${id}`, data),
  delete: (id) => api.delete(`/resources/${id}`),
};

// Booking APIs
export const bookingAPI = {
  create: (data) => api.post('/bookings', data),
  getMyBookings: () => api.get('/bookings/my'),
  getById: (id) => api.get(`/bookings/${id}`),
  getAll: (params) => api.get('/bookings', { params }),
  review: (id, data) => api.put(`/bookings/${id}/review`, data),
  cancel: (id) => api.patch(`/bookings/${id}/cancel`),
  getByResource: (resourceId) => api.get(`/bookings/resource/${resourceId}`),
};

// Ticket APIs
export const ticketAPI = {
  create: (formData) => api.post('/tickets', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  getMyTickets: () => api.get('/tickets/my'),
  getById: (id) => api.get(`/tickets/${id}`),
  getAll: (params) => api.get('/tickets', { params }),
  updateStatus: (id, data) => api.put(`/tickets/${id}/status`, data),
  assignTechnician: (id, techId) => api.patch(`/tickets/${id}/assign/${techId}`),
  getAssigned: () => api.get('/tickets/assigned'),
  delete: (id) => api.delete(`/tickets/${id}`),
};

// Comment APIs
export const commentAPI = {
  getByTicket: (ticketId) => api.get(`/tickets/${ticketId}/comments`),
  add: (ticketId, data) => api.post(`/tickets/${ticketId}/comments`, data),
  update: (ticketId, commentId, data) => api.put(`/tickets/${ticketId}/comments/${commentId}`, data),
  delete: (ticketId, commentId) => api.delete(`/tickets/${ticketId}/comments/${commentId}`),
};

// Notification APIs
export const notificationAPI = {
  getAll: () => api.get('/notifications'),
  getUnread: () => api.get('/notifications/unread'),
  getUnreadCount: () => api.get('/notifications/unread/count'),
  markAsRead: (id) => api.patch(`/notifications/${id}/read`),
  markAllAsRead: () => api.patch('/notifications/read-all'),
  delete: (id) => api.delete(`/notifications/${id}`),
};

// Admin APIs
export const adminAPI = {
  getAllUsers: () => api.get('/admin/users'),
  getUsersByRole: (role) => api.get(`/admin/users/role/${role}`),
  updateUserRoles: (userId, roles) => api.put(`/admin/users/${userId}/roles`, roles),
  deleteUser: (userId) => api.delete(`/admin/users/${userId}`),
};

// Chat APIs
export const chatAPI = {
  sendMessage: (message) => api.post('/chat', { message }),
  createBooking: (data) => api.post('/chat/book', data),
  createTicket: (data) => api.post('/chat/ticket', data),
};

export default api;
