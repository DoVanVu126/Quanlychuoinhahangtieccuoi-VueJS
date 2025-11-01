<template>
  <header class="home-header">
    <!-- Logo + Thanh tìm kiếm -->
    <div class="logo">
      <img src="/img/logo.png" alt="Wedding" />
      <div class="search-bar">
        <input type="text" placeholder="Tìm nhà hàng, địa điểm..." />
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

      <button class="login-btn">Đăng nhập</button>
      <button class="signup-btn">Tạo tài khoản</button>
    </nav>
  </header>
</template>

<script>
export default {
  name: "HomeHeader",
};
</script>

<style src="../../assets/css/home-header.css"></style>
