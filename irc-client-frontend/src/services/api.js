import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  getMe: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout'),
};

export const channelsAPI = {
  getChannels: () => api.get('/channels'),
  createChannel: (channelData) => api.post('/channels', channelData),
  joinChannel: (channelId) => api.post(`/channels/${channelId}/join`),
  leaveChannel: (channelId) => api.post(`/channels/${channelId}/leave`),
  getMessages: (channelId, page = 1) => api.get(`/channels/${channelId}/messages?page=${page}`),
};

export const messagesAPI = {
  sendMessage: (messageData) => api.post('/messages', messageData),
  addReaction: (messageId, emoji) => api.post(`/messages/${messageId}/react`, { emoji }),
};

export default api;
