import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authService = {
  login: (credentials) => api.post('/auth/login', credentials),
  signup: (userData) => api.post('/auth/signup', userData),
  getMe: () => api.get('/auth/me')
};

export const expenseService = {
  getDashboard: () => api.get('/dashboard'),
  setIncome: (data) => api.post('/income', data),
  getIncomeHistory: () => api.get('/income'),
  deleteIncome: (id) => api.delete(`/income/${id}`),
  addFixedExpense: (data) => api.post('/fixed-expenses', data),
  deleteFixedExpense: (id) => api.delete(`/fixed-expenses/${id}`),
  addDailyExpense: (data) => api.post('/daily-expenses', data),
  getDailyExpenses: (params) => api.get('/daily-expenses', { params }),
  deleteDailyExpense: (id) => api.delete(`/daily-expenses/${id}`),
  addGoal: (data) => api.post('/savings-goals', data)
};

export default api;
