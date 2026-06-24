import api from './axios'

// Auth
export const authApi = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
}

// Kategoriler
export const categoryApi = {
  getAll: () => api.get('/categories'),
  getByNameContaining: (search) => api.get('/categories/keyword',{ params: { search } }),
  create: (data) => api.post('/categories', data),
  update: (id, data) => api.put(`/categories/${id}`, data),
  delete: (id) => api.delete(`/categories/${id}`),
  uploadImage: (file) => {
    const fd = new FormData()
    fd.append('file', file)
    return api.post('/categories/upload-image', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
  },
  generateImage: (prompt) => api.post('/categories/generate-image', { prompt }),
}

// Hizmetler
export const serviceApi = {
  getAll: (params) => api.get('/services', { params }),
  getFeatured: () => api.get('/services/featured'),
  getById: (id) => api.get(`/services/${id}`),
  create: (data) => api.post('/services', data),
  update: (id, data) => api.put(`/services/${id}`, data),
  delete: (id) => api.delete(`/services/${id}`),
  getPackages: (id) => api.get(`/services/${id}/packages`),
  uploadImage: (file) => {
    const fd = new FormData()
    fd.append('file', file)
    return api.post('/services/upload-image', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
  },
  generateImage: (prompt) => api.post('/services/generate-image', { prompt }),
}

// Paketler
export const packageApi = {
  create: (data) => api.post('/packages', data),
  update: (id, data) => api.put(`/packages/${id}`, data),
}

// Slotlar & Randevular
export const appointmentApi = {
  getSlots: (serviceId, date) => api.get('/slots', { params: { serviceId, date } }),
  createSlot: (data) => api.post('/slots', data),
  create: (data) => api.post('/appointments', data),
  getMy: () => api.get('/appointments/my'),
  getAll: () => api.get('/appointments'),
  updateStatus: (id, status) => api.put(`/appointments/${id}/status`, { status }),
}

// Sepet
export const cartApi = {
  get: () => api.get('/cart'),
  addItem: (data) => api.post('/cart/items', data),
  removeItem: (itemId) => api.delete(`/cart/items/${itemId}`),
  clear: () => api.delete('/cart'),
}

// Ödeme & Sipariş
export const orderApi = {
  createIntent: () => api.post('/payments/create-intent'),
  createOrder: (paymentIntentId) => api.post('/orders', { paymentIntentId }),
  getMy: () => api.get('/orders/my'),
  getById: (id) => api.get(`/orders/${id}`),
  getAll: () => api.get('/orders'),
}

// Yorumlar
export const reviewApi = {
  getByService: (serviceId) => api.get(`/reviews/service/${serviceId}`),
  create: (data) => api.post('/reviews', data),
  delete: (id) => api.delete(`/reviews/${id}`),
  getAll: () => api.get('/admin/reviews'),
}

// Admin
export const adminApi = {
  getStats: () => api.get('/admin/stats'),
  getUsers: () => api.get('/admin/users'),
  updateUserRole: (id, role) => api.put(`/admin/users/${id}/role`, { role }),
}

// AI Chat
export const aiApi = {
  chat: (message) => api.post('/ai/chat', { message }),
}
