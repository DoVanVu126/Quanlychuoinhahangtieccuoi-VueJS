// src/api.js

import axios from 'axios';

// Tạo axios instance
const api = axios.create({
  baseURL: process.env.VUE_APP_API_URL || 'http://localhost:8088/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// ✅ REQUEST INTERCEPTOR - Tự động thêm token vào mọi request
api.interceptors.request.use(
  (config) => {
    // Lấy token từ localStorage (sau khi login)
    const token = localStorage.getItem('token');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ✅ RESPONSE INTERCEPTOR - Xử lý lỗi 401 (Unauthorized)
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Nếu token hết hạn hoặc không hợp lệ (401)
    if (error.response && error.response.status === 401) {
      console.error('❌ Token không hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập lại.');
      
      // Xóa token cũ
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('cart');
      localStorage.removeItem('remembered_login');
      localStorage.removeItem('remember_me');
      
      // Redirect về trang login
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    
    // Nếu là lỗi 403 (Forbidden - không có quyền)
    if (error.response && error.response.status === 403) {
      console.error('❌ Bạn không có quyền truy cập tài nguyên này.');
      alert('Bạn không có quyền thực hiện thao tác này!');
    }
    
    // Nếu là lỗi 500 (Server error)
    if (error.response && error.response.status === 500) {
      console.error('❌ Lỗi server:', error.response.data);
    }
    
    return Promise.reject(error);
  }
);

export default api;