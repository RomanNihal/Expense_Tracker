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
  // Transactions
  getTransactions: (params) => api.get('/transactions', { params }),
  addTransaction: (data) => api.post('/transactions', data),
  updateTransaction: (id, data) => api.put(`/transactions/${id}`, data),
  deleteTransaction: (id) => api.delete(`/transactions/${id}`),

  // Legacy Aliases (to avoid breaking things immediately)
  addDailyExpense: (data) => api.post('/transactions', { ...data, type: 'EXPENSE' }),
  deleteDailyExpense: (id) => api.delete(`/transactions/${id}`),
  getDailyExpenses: (params) => api.get('/transactions', { params: { ...params, type: 'EXPENSE' } }),
  // Income
  setIncome: (data) => api.post('/income', data),
  getIncomeHistory: () => api.get('/income'),
  // Fixed Income Settings
  getFixedIncomes: () => api.get('/income/fixed'),
  addFixedIncome: (data) => api.post('/income/fixed', data),
  updateFixedIncome: (id, data) => api.put(`/income/fixed/${id}`, data),
  deleteFixedIncome: (id) => api.delete(`/income/fixed/${id}`),
  // Fixed Expense Settings
  getFixedExpenses: () => api.get('/fixed-expenses'),
  addFixedExpense: (data) => api.post('/fixed-expenses', data),
  updateFixedExpense: (id, data) => api.put(`/fixed-expenses/${id}`, data),
  deleteFixedExpense: (id) => api.delete(`/fixed-expenses/${id}`),
  // Savings Goals
  addGoal: (data) => api.post('/savings-goals', data),
  updateGoal: (id, data) => api.put(`/savings-goals/${id}`, data)
};

export const savingsService = {
  getSavingsData: () => api.get('/savings'),
  addLog: (data) => api.post('/savings/log', data),
  updateLog: (id, data) => api.put(`/savings/log/${id}`, data),
  deleteLog: (id) => api.delete(`/savings/log/${id}`),
  completeGoal: (id) => api.put(`/savings/goal/${id}/complete`),
  extendGoal: (id, data) => api.put(`/savings/goal/${id}/extend`, data),
  deleteGoal: (id) => api.delete(`/savings-goals/${id}`)
};



export default api;
