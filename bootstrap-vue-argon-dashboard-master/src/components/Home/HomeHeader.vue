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
      <div class="cart-icon">
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
          <span>Chào, {{ user.username }}</span>
          <i class="fas fa-caret-down"></i>

          <div v-if="dropdownOpen" class="homeheader-dropdown-menu" @click.stop>
            <router-link to="/profile">Trang cá nhân</router-link>
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
      user: JSON.parse(localStorage.getItem("user")) || null,
      dropdownOpen: false,
    };
  },
  methods: {
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
      localStorage.removeItem("user");   // xóa thông tin user
      localStorage.removeItem("token");  // xóa token
      this.user = null;
      this.$router.push("/login");       // chuyển về trang login
    },
  },
};
</script>

<style src="../../assets/css/home-header.css"></style>
