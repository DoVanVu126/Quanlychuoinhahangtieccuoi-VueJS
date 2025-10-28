import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8088/api', // ✅ Dùng đúng cổng Laravel
});

export default api;
