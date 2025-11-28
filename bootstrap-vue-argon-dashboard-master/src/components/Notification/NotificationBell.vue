<template>
  <div class="notification-wrapper">
    <!-- Icon chuông -->
    <div class="bell-icon" :class="{ shake: hasNew }" @click="toggleList">
      <i class="fas fa-bell"></i>
      <span v-if="unreadCount > 0" class="badge">{{ unreadCount }}</span>
    </div>

    <!-- Dropdown thông báo -->
    <div v-if="showList" class="notification-list">
      <h4>Thông báo</h4>
      <div v-if="notifications.length === 0" class="empty">Không có thông báo</div>

      <div
        v-for="item in notifications"
        :key="item.id"
        class="notification-item"
        :class="{ unread: !item.is_read }"
        @click="markAsRead(item)"
      >
        <strong>{{ item.title }}</strong>
        <p>{{ item.message }}</p>
        <small>{{ formatDate(item.created_at) }}</small>
      </div>
    </div>
  </div>
</template>

<script>
import api from "@/api"; // axios instance

export default {
  name: "Notifications",
  data() {
    return {
      notifications: [],
      unreadCount: 0,
      showList: false,
      hasNew: false,
      userId: (JSON.parse(localStorage.getItem("user")) || {}).user_id,
    };
  },
  methods: {
    toggleList() {
      this.showList = !this.showList;

      // Nếu mở danh sách, đánh dấu tất cả là đã đọc
      if (this.showList && this.unreadCount > 0) {
        this.markAllRead();
      }

      this.hasNew = false;
    },

    formatDate(date) {
      return new Date(date).toLocaleString("vi-VN");
    },

    async loadNotifications() {
      try {
        const res = await api.get(`/notifications/${this.userId}`);
        this.notifications = res.data || [];
        this.unreadCount = this.notifications.filter(n => !n.is_read).length;
      } catch (err) {
        console.error("Lỗi tải thông báo:", err);
      }
    },

    async markAsRead(item) {
      if (!item.is_read) {
        try {
          await api.put(`/notifications/read/${item.id}`);
          item.is_read = true;
          this.unreadCount = this.notifications.filter(n => !n.is_read).length;
        } catch (err) {
          console.error("Không đánh dấu được:", err);
        }
      }
    },

    async markAllRead() {
      try {
        await api.put(`/notifications/read-all/${this.userId}`);
        this.notifications.forEach(n => (n.is_read = true));
        this.unreadCount = 0;
      } catch (err) {
        console.error("Không đánh dấu tất cả:", err);
      }
    },

    listenRealtime() {
      if (!window.Echo) return;
      window.Echo.private(`notifications.${this.userId}`)
        .listen(".new-notification", (data) => {
          this.notifications.unshift(data.notification);
          this.unreadCount = this.notifications.filter(n => !n.is_read).length;
          this.hasNew = true;
          setTimeout(() => (this.hasNew = false), 2000);
        });
    },
  },
  async mounted() {
    if (!this.userId) return;
    await this.loadNotifications();
    this.listenRealtime();
  },
};
</script>

<style scoped>
.notification-wrapper { position: relative; }
.bell-icon { font-size: 24px; color: #333; cursor: pointer; position: relative; }
.shake { animation: shake 0.4s ease; }
@keyframes shake {
  0% { transform: rotate(0deg); }
  25% { transform: rotate(-15deg); }
  50% { transform: rotate(10deg); }
  75% { transform: rotate(-10deg); }
  100% { transform: rotate(0deg); }
}
.badge {
  background: red;
  color: white;
  font-size: 12px;
  padding: 2px 6px;
  border-radius: 50%;
  position: absolute;
  top: -6px;
  right: -6px;
}
.notification-list {
  width: 320px;
  background: white;
  border-radius: 8px;
  padding: 10px;
  position: absolute;
  top: 35px;
  right: 0;
  box-shadow: 0px 3px 10px rgba(0,0,0,0.15);
  z-index: 1000;
}
.notification-item {
  padding: 10px;
  border-bottom: 1px solid #eee;
  cursor: pointer;
  transition: background 0.2s;
}
.notification-item:hover { background: #f3f4f6; }
.notification-item:last-child { border-bottom: none; }
.unread { background: #fef3c7; }
.empty { text-align: center; color: #888; padding: 20px; }
</style>
