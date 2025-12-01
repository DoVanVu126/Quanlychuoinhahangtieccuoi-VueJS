<template>
  <header class="home-header">
    <!-- Logo + Thanh tìm kiếm -->
    <div class="logo">
      <router-link to="/home" class="logo-link">
        <img src="/img/logo.png" alt="Wedding" />
      </router-link>
      <div class="search-bar">
        <input
          type="text"
          placeholder="Tìm nhà hàng, địa điểm..."
          v-model="keyword"
          @keyup.enter="goToSearch"
        />
      </div>
    </div>

    <nav>
      <a href="#gioi-thieu">Giới thiệu</a>
      <a href="#ho-tro">Hỗ trợ</a>

      <router-link to="/gio-hang" class="cart-icon">
        <i class="fas fa-shopping-cart"></i>
      </router-link>

      <!-- Language switch -->
      <div class="language-switch">
        <img src="/img/vn-flag.png" alt="VN" class="flag" />
        <select>
          <option>VN</option>
          <option>EN</option>
        </select>
      </div>

      <!-- Notification -->
      <div class="notification-wrapper" ref="notifWrapper">
        <!-- Bell icon -->
        <div class="bell-icon" :class="{ shake: hasNew }" @click.stop="toggleNotifDropdown">
          <i class="fas fa-bell"></i>
          <span v-if="unreadCount > 0" class="badge">{{ unreadCount }}</span>
        </div>

        <!-- Dropdown -->
        <div v-if="notifDropdownOpen" class="notification-list" @click.stop>
          <h4>Thông báo</h4>

          <div v-if="notifications.length === 0" class="empty">Không có thông báo</div>

          <div class="notif-scroll">
            <div
              v-for="item in visibleNotifications"
              :key="item.id"
              class="notification-item"
              :class="{ unread: !item.is_read }"
            >
              <div class="notif-content" @click="markAsRead(item)">
                <strong>{{ item.title }}</strong>
                <p>{{ item.message }}</p>
                <small>{{ formatDate(item.created_at) }}</small>
              </div>

              <button class="delete-btn" @click.stop="deleteNotification(item.id)">×</button>
            </div>
          </div>

          <div v-if="notifications.length > visibleCount" class="see-more">
            <button @click="loadMore">Xem thêm</button>
          </div>

          <div v-if="notifications.length > 0" class="notif-footer">
            <button @click="markAllRead">Đánh dấu tất cả</button>
            <button @click="deleteAll">Xóa tất cả</button>
          </div>
        </div>
      </div>

      <!-- User login / dropdown -->
      <div v-if="!user">
        <button class="homeheader-login-btn" @click="goToLogin">Đăng nhập</button>
        <button class="homeheader-signup-btn" @click="goToSignup">Tạo tài khoản</button>
      </div>

      <div v-else class="homeheader-user-dropdown" ref="userDropdownWrapper" @click.stop="toggleDropdown">
        <img
          v-if="user.image_url"
          :src="avatarUrl(user.image_url)"
          alt="avatar"
          class="user-avatar"
          @error="handleAvatarError"
        />
        <span>{{ user.username }}</span>
        <span class="user-level">{{ levelName }}</span>
        <i class="fas fa-caret-down"></i>

        <div v-if="dropdownOpen" class="homeheader-dropdown-menu">
          <router-link to="/profile">Trang cá nhân</router-link>
          <router-link to="/saved-promotions">Mã khuyến mãi đã lưu</router-link>
          <router-link to="/membership">Xem thẻ hội viên</router-link>
          <a @click="logout">Đăng xuất</a>
        </div>
      </div>

      <!-- Toast -->
      <ToastMessage ref="toast" />
    </nav>
  </header>
</template>

<script>
import api from "@/api";
import ToastMessage from "@/components/Notification/ToastMessage.vue";

export default {
  components: { ToastMessage },

  data() {
    return {
      keyword: "",
      user: null,
      membership: null,
      dropdownOpen: false,
      notifications: [],
      unreadCount: 0,
      notifDropdownOpen: false,
      hasNew: false,
      visibleCount: 5,
    };
  },

  computed: {
    visibleNotifications() {
      return this.notifications.slice(0, this.visibleCount);
    },
    initials() {
      return this.user && this.user.username ? this.user.username.charAt(0).toUpperCase() : "U";
    },
    levelName() {
      if (!this.membership) return "Bronze";
      const count = Number(this.membership.booking_count || 0);
      if (count >= 15) return "Diamond";
      if (count >= 10) return "Gold";
      if (count >= 5) return "Silver";
      return "Bronze";
    }
  },

  methods: {
    // ⭐ PHƯƠNG THỨC QUAN TRỌNG: Load user từ CẢNH localStorage VÀ sessionStorage
    loadUserFromStorage() {
      // Đọc từ localStorage trước (khi user chọn "Nhớ tài khoản")
      let userInfo = localStorage.getItem("user_info");
      let userToken = localStorage.getItem("user_token");
      
      // Nếu không có trong localStorage, kiểm tra sessionStorage
      if (!userInfo || !userToken) {
        userInfo = sessionStorage.getItem("user_info");
        userToken = sessionStorage.getItem("user_token");
      }

      // Parse và gán user
      if (userInfo && userToken) {
        try {
          this.user = JSON.parse(userInfo);
          console.log("✅ User loaded:", this.user);
          
          // Load thêm membership và notifications
          this.loadMembership();
          this.loadNotifications();
          this.listenRealtime();
        } catch (e) {
          console.error("❌ Error parsing user_info:", e);
          this.user = null;
        }
      } else {
        console.log("ℹ️ No user found in storage");
        this.user = null;
      }
    },

    goToSearch() {
      const query = this.keyword.trim();
      if (!query) return;
      this.$router.push({ path: "/search", query: { keyword: query } });
    },

    goToLogin() { this.$router.push("/login"); },
    goToSignup() { this.$router.push("/register"); },
    toggleDropdown() { this.dropdownOpen = !this.dropdownOpen; },
    
    logout() {
      // Xóa CẢNH localStorage VÀ sessionStorage
      localStorage.clear();
      sessionStorage.clear();
      
      this.user = null;
      this.membership = null;
      this.notifications = [];
      this.$router.push("/login");
    },

    avatarUrl(path) {
      if (!path) return "/img/default-avatar.png";
      if (path.startsWith("http")) return path;
      return "http://127.0.0.1:8088/" + path.replace(/^\/+/, "");
    },

    handleAvatarError(e) { e.target.src = "/img/default-avatar.png"; },

    async loadMembership() {
      if (!this.user) return;
      try {
        const res = await api.get(`/membership/${this.user.user_id}`);
        this.membership = res.data.membership || { booking_count: 0 };
      } catch (err) {
        console.error("Lỗi tải membership:", err);
        this.membership = { booking_count: 0 };
      }
    },

    toggleNotifDropdown() {
      this.notifDropdownOpen = !this.notifDropdownOpen;
    },

    async loadNotifications() {
      if (!this.user) return;
      try {
        const res = await api.get(`/notifications/${this.user.user_id}`);
        this.notifications = res.data || [];
        this.updateUnreadCount();
      } catch (err) { console.error(err); }
    },

    updateUnreadCount() {
      this.unreadCount = this.notifications.filter(n => !n.is_read).length;
    },

    formatDate(date) {
      return new Date(date).toLocaleString("vi-VN");
    },

    async markAsRead(item) {
      if (item.is_read) return;
      try {
        await api.put(`/notifications/read/${item.id}`);
        item.is_read = true;
        this.updateUnreadCount();
      } catch (err) { console.error(err); }
    },

    async deleteNotification(id) {
      try {
        await api.delete(`/notifications/${id}`);
        this.notifications = this.notifications.filter(n => n.id !== id);
        this.updateUnreadCount();
      } catch (err) { console.error(err); }
    },

    async deleteAll() {
      if (!this.user) return;
      try {
        await api.delete(`/notifications/delete-all/${this.user.user_id}`);
        this.notifications = [];
        this.unreadCount = 0;
      } catch (err) { console.error(err); }
    },

    async markAllRead() {
      if (!this.user) return;
      try {
        await api.put(`/notifications/read-all/${this.user.user_id}`);
        this.notifications.forEach(n => n.is_read = true);
        this.unreadCount = 0;
      } catch (err) { console.error(err); }
    },

    loadMore() { this.visibleCount += 5; },

    handleClickOutside(e) {
      if (this.dropdownOpen && this.$refs.userDropdownWrapper && !this.$refs.userDropdownWrapper.contains(e.target)) {
        this.dropdownOpen = false;
      }
      if (this.notifDropdownOpen && this.$refs.notifWrapper && !this.$refs.notifWrapper.contains(e.target)) {
        this.notifDropdownOpen = false;
      }
    },

    listenRealtime() {
      if (!window.Echo || !this.user) return;
      window.Echo.private(`notifications.${this.user.user_id}`)
        .listen(".new-notification", (data) => {
          this.notifications.unshift(data.notification);
          this.updateUnreadCount();

          if (this.$refs.toast) {
            this.$refs.toast.addToast({
              title: data.notification.title,
              message: data.notification.message,
              type: data.notification.type || "info",
            });
          }

          this.hasNew = true;
          setTimeout(() => this.hasNew = false, 1500);
        });
    }
  },

  mounted() {
    // Load user khi component mount
    this.loadUserFromStorage();
    
    // Click outside handler
    document.addEventListener("click", this.handleClickOutside);
  },

  beforeDestroy() {
    document.removeEventListener("click", this.handleClickOutside);
  },

  // ⭐ QUAN TRỌNG: Watch route để reload user khi chuyển trang
  watch: {
    '$route'() {
      // Khi route thay đổi (ví dụ từ /login về /home), reload user
      this.loadUserFromStorage();
    }
  }
};
</script>

<style src="../../assets/css/home-header.css"></style>