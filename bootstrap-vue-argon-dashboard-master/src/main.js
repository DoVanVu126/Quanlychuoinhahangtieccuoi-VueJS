/*!

=========================================================
* BootstrapVue Argon Dashboard - v1.0.0
=========================================================

* Product Page: https://www.creative-tim.com/product/bootstrap-vue-argon-dashboard
* Copyright 2020 Creative Tim (https://www.creative-tim.com)

* Coded by www.creative-tim.com

=========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

*/
import Vue from 'vue';
import DashboardPlugin from './plugins/dashboard-plugin';
import App from './App.vue';

// router setup
import router from './routes/router';

// THÊM VÀO: Import axios
import axios from 'axios';

// plugin setup
Vue.use(DashboardPlugin);

// ==========================================
// === THÊM VÀO: CẤU HÌNH AXIOS INTERCEPTOR ===
// (Tự động đính kèm token vào mọi request)



axios.interceptors.request.use(config => {
  
  // 1. Thử lấy token từ localStorage (cho "Nhớ tài khoản")
  let token = localStorage.getItem('user_token');

  // 2. Nếu không có, thử lấy từ sessionStorage (cho "Không nhớ")
  if (!token) {
    token = sessionStorage.getItem('user_token');
  }

  // 3. Nếu có token, đính kèm vào header 'Authorization'
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  return config;
});
// ==========================================


/* eslint-disable no-new */
new Vue({
  el: '#app',
  render: h => h(App),
  router
});
