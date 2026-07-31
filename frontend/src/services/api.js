import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.detail ||
      error.message ||
      'An unexpected error occurred';
    return Promise.reject(new Error(message));
  },
);

export const healthCheck = () => api.get('/');

export const analyticsApi = {
  getSummary: () => api.get('/analytics/summary'),
  getDistricts: () => api.get('/analytics/districts'),
  getUniversities: () => api.get('/analytics/universities'),
  getPlacement: () => api.get('/analytics/placement'),
  getScholarships: () => api.get('/analytics/scholarships'),
  getDashboard: () => api.get('/analytics/dashboard'),
};

export const chatApi = {
  sendMessage: (message, history = [], sessionId = 'default') =>
    api.post('/chat', { message, history, session_id: sessionId }),
};

export const predictionApi = {
  getEnrollment: () => api.get('/prediction/enrollment'),
  getBudget: () => api.get('/prediction/budget'),
  getPlacement: () => api.get('/prediction/placement'),
  getSummary: () => api.get('/prediction/summary'),
  predictAdmissions: (data) => api.post('/prediction/admissions', data),
  getModels: () => api.get('/prediction/models'),
};

export const recommendationApi = {
  getRecommendations: () => api.get('/recommendations'),
};

export const chatbotApi = {
  sendMessage: (message) => api.post('/chatbot/query', { message }),
  uploadCsv: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/chatbot/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

export default api;
