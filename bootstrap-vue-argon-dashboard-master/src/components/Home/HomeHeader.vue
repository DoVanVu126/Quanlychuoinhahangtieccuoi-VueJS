<template>
  <header class="home-header">
    <!-- Logo + Thanh tìm kiếm -->
    <div class="logo">
      <img src="/img/logo.png" alt="Wedding" />
      <div class="search-bar">
        <input type="text" placeholder="Tìm nhà hàng, địa điểm..." v-model="keyword" @keyup.enter="goToSearch" />
      </div>
    </div>

    <!-- Thanh điều hướng + icon -->
    <nav>
      <a href="#gioi-thieu">Giới thiệu</a>
      <a href="#ho-tro">Hỗ trợ</a>

      <!-- Icon giỏ hàng -->
      <div class="cart-icon" @click="goToCart" style="cursor: pointer;">
        <i class="fas fa-shopping-cart"></i>
      </div>

      <!-- Chọn ngôn ngữ -->
      <div class="language-switch">
        <img src="/img/vn-flag.png" alt="VN" class="flag" />
        <select>
          <option>VN</option>
          <option>EN</option>
        </select>
      </div>

      <!-- Nếu chưa đăng nhập -->
      <template v-if="!user">
        <button class="homeheader-login-btn" @click="goToLogin">Đăng nhập</button>
        <button class="homeheader-signup-btn" @click="goToSignup">Tạo tài khoản</button>
      </template>

      <!-- Nếu đã đăng nhập -->
      <template v-else>
        <div class="homeheader-user-dropdown" @click="toggleDropdown">
          <span>{{ user.username }}</span>
          <i class="fas fa-caret-down"></i>

          <div v-if="dropdownOpen" class="homeheader-dropdown-menu" @click.stop>
            <router-link to="/profileUser">Trang cá nhân</router-link>
            <a @click="logout">Đăng xuất</a>
          </div>
        </div>
      </template>
    </nav>
  </header>
</template>

<script>
export default {
  name: "HomeHeader",
  data() {
    return {
      keyword: "",
      user: null, 
      dropdownOpen: false,
    };
  },
  
  // 1. Chạy khi load trang (F5)
  created() {
    this.checkUserStatus();
  },

  // 2. Chạy khi chuyển trang (Login -> Home)
  watch: {
    '$route'() {
      this.checkUserStatus();
      this.dropdownOpen = false; // Tự đóng menu nếu đang mở
    }
  },

  methods: {
    // 3. Logic kiểm tra user (Đã sửa để check cả sessionStorage)
    checkUserStatus() {
      let userInfo = localStorage.getItem("user_info");
      if (!userInfo) {
        userInfo = sessionStorage.getItem("user_info");
      }

      if (userInfo) {
        try {
          this.user = JSON.parse(userInfo);
        } catch (e) {
          this.user = null;
        }
      } else {
        this.user = null;
      }
    },

    goToCart() {
      this.$router.push('/gio-hang');
    },
    goToSearch() {
      const query = this.keyword.trim();
      if (!query) return;
      this.$router.push({ path: "/search", query: { keyword: query } });
    },
    goToLogin() {
      this.$router.push("/login");
    },
    goToSignup() {
      this.$router.push("/register");
    },
    toggleDropdown() {
      this.dropdownOpen = !this.dropdownOpen;
    },
    logout() {
      // Xóa cả 2 nơi cho chắc
      localStorage.removeItem("user_info");
      localStorage.removeItem("user_token");
      sessionStorage.removeItem("user_info");
      sessionStorage.removeItem("user_token");
      
      this.user = null;
      this.dropdownOpen = false;
      
      this.$router.push("/login");
    },
  },
};
</script>

<style src="../../assets/css/home-header.css"></style>
