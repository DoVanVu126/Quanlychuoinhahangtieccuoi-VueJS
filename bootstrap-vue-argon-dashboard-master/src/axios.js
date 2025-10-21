// src/axios.js
import axios from 'axios';

export default axios.create({
  baseURL: 'http://localhost:8000/api', // ✅ Laravel mặc định chạy ở cổng 8000
  headers: {
    'Content-Type': 'application/json',
  },
});
