// src/services/api.js
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Important for session cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

export const authAPI = {
  register: (userData) => api.post('/register', userData),
  login: (credentials) => api.post('/login', credentials),
  logout: () => api.post('/logout'),
  getProfile: () => api.get('/profile'),
};

export const productsAPI = {
  getAll: () => api.get('/products'),
  create: (product) => api.post('/products', product),
  update: (id, product) => api.put(`/products/${id}`, product),
  delete: (id) => api.delete(`/products/${id}`),
};

export const suppliersAPI = {
  getAll: () => api.get('/suppliers'),
  create: (supplier) => api.post('/suppliers', supplier),
  update: (id, supplier) => api.put(`/suppliers/${id}`, supplier),
  delete: (id) => api.delete(`/suppliers/${id}`),
};

export const inventoryAPI = {
  getAll: () => api.get('/inventory'),
  create: (inventory) => api.post('/inventory', inventory),
  update: (id, inventory) => api.put(`/inventory/${id}`, inventory),
  delete: (id) => api.delete(`/inventory/${id}`),
};

export const transactionsAPI = {
  getAll: () => api.get('/transactions'),
  create: (transaction) => api.post('/transactions', transaction),
  delete: (id) => api.delete(`/transactions/${id}`),
};

export const alertsAPI = {
  getAll: () => api.get('/alerts'),
  create: (alert) => api.post('/alerts', alert),
  update: (id, alert) => api.put(`/alerts/${id}`, alert),
  delete: (id) => api.delete(`/alerts/${id}`),
};

export const dashboardAPI = {
  getStats: () => api.get('/dashboard/stats'),
  getInventoryStatus: () => api.get('/dashboard/inventory-status'),
  getTransactionTrends: () => api.get('/dashboard/transaction-trends'),
  getLowStockProducts: () => api.get('/dashboard/low-stock-products'),
  getCategoryDistribution: () => api.get('/dashboard/category-distribution'),
};



export default api;
