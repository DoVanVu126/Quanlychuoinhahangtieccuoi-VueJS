<template>
  <div>
    <HomeHeader />

    <!-- Nút BACK -->
    <button class="back-btn" @click="$router.back()">
      ← Quay lại
    </button>

    <div class="detail-wrapper">
      <header class="user-header">
        <div class="avatar" @click="selectAvatar">
          <img
            v-if="user && user.image_url"
            :src="avatarUrl(user.image_url)"
            alt="avatar"
            @error="handleAvatarError"
          />
          <span v-else>{{ initials }}</span>
        </div>

        <input type="file" ref="fileInput" @change="uploadAvatar" style="display:none" accept="image/*" />

        <div class="info">
          <h2 v-if="user">Chào, {{ user.username }}</h2>
          <h2 v-else>Chào, Guest</h2>

          <div class="badges">
            <span class="vip-tag" v-if="levelName !== 'Bronze'">★ {{ levelName }}</span>
            <span class="bronze-tag" v-else>Đồng</span>
          </div>
        </div>
      </header>

      <!-- Loading -->
      <div v-if="loading" class="loading-wrap">
        <div class="spinner"></div>
        <div>Đang tải thông tin hội viên...</div>
      </div>

      <!-- NEXT TIER BOX -->
      <div v-else-if="nextTier" class="next-tier-box">
        🏆 Bạn cần thêm
        <b>{{ nextTier.need }}</b> booking để lên hạng
        <b>{{ nextTier.tier }}</b>!
      </div>

      <section class="stats" v-if="!loading && membership">
        <div class="stat-item">
          <p class="label">Hạng của quý khách</p>
          <h3>{{ levelName }}</h3>
        </div>
        <div class="stat-item">
          <p class="label">Hạng hết hạn vào</p>
          <h3>—</h3>
        </div>
        <div class="stat-item">
          <p class="label">Booking của bạn</p>
          <h3>{{ membership.booking_count || 0 }}</h3>
        </div>
      </section>

      <section class="progress-box" v-if="!loading && membership">
        <p class="progress-title">
          {{ membership.booking_count || 0 }}/20 bookings completed in last 2 years
        </p>

        <div class="progress-line">
          <div v-for="(lv, i) in levels" :key="i" class="progress-step">
            <div :class="['icon', { active: i <= currentIndex }]">★</div>
            <p class="lvl-title">{{ lv.title }}</p>
            <p class="lvl-sub">{{ lv.sub }}</p>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import HomeHeader from "@/components/Home/HomeHeader.vue";

export default {
  name: "MembershipDetailPage",
  components: { HomeHeader },

  data() {
    return {
      user: JSON.parse(localStorage.getItem("user_info")) || null,
      membership: null,
      apiBase: "http://localhost:8088",
      loading: true
    };
  },

  computed: {
    initials() {
      return this.user && this.user.username
        ? this.user.username.charAt(0).toUpperCase()
        : "U";
    },

    levelName() {
      if (!this.membership) return "Bronze";
      var count = Number(this.membership.booking_count || 0);

      if (count >= 20) return "Diamond";
      if (count >= 15) return "VIP";
      if (count >= 10) return "Gold";
      if (count >= 5) return "Silver";
      return "Bronze";
    },

    levels() {
      return [
        { title: "Bronze", sub: "0 bookings" },
        { title: "Silver", sub: "5 bookings" },
        { title: "Gold", sub: "10 bookings" },
        { title: "VIP", sub: "15 bookings" },
        { title: "Diamond", sub: "20 bookings" }
      ];
    },

    currentIndex() {
      return this.levels.findIndex(function (lv) {
        return lv.title === this.levelName;
      }.bind(this));
    },

    // NEXT TIER (tính tự động) - sửa đúng theo mốc 5/10/15/20
    nextTier() {
      var count = Number(
        (this.membership && this.membership.booking_count)
          ? this.membership.booking_count
          : 0
      );

      if (count < 5) {
        return { tier: "Silver", need: 5 - count };
      }
      if (count < 10) {
        return { tier: "Gold", need: 10 - count };
      }
      if (count < 15) {
        return { tier: "VIP", need: 15 - count };
      }
      if (count < 20) {
        return { tier: "Diamond", need: 20 - count };
      }

      return null; // đã đạt Diamond
    }
  },

  mounted() {
    if (!this.user) {
      this.$router.push("/login");
      return;
    }
    this.loadMembership();
  },

  methods: {
    avatarUrl(path) {
      if (!path) return "/images/default-avatar.png";
      var full = path.indexOf("http") === 0 ? path : this.apiBase + "/" + path.replace(/^\/+/, "");
      return full + "?t=" + Date.now();
    },

    handleAvatarError(e) {
      e.target.src = "/images/default-avatar.png";
    },

    selectAvatar() {
      this.$refs.fileInput.click();
    },

    async uploadAvatar(event) {
      var file = event.target.files[0];
      if (!file) return;

      var formData = new FormData();
      formData.append("image", file);

      try {
        var res = await axios.put(
          this.apiBase + "/api/users/" + this.user.user_id,
          formData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );

        this.user.image_url = res.data.image_url;
        localStorage.setItem("user_info", JSON.stringify(this.user));
        alert("Cập nhật avatar thành công!");
      } catch (err) {
        alert("Cập nhật avatar thất bại!");
      }
    },

    async loadMembership() {
      this.loading = true;
      try {
        var res = await axios.get(this.apiBase + "/api/membership/" + this.user.user_id);
        // server trả về { membership: { booking_count: X, ... } } theo code cũ của bạn
        this.membership = (res && res.data && res.data.membership) ? res.data.membership : { booking_count: 0 };
      } catch (err) {
        this.membership = { booking_count: 0 };
        console.error("Lỗi tải membership:", err);
      } finally {
        this.loading = false;
      }
    }
  }
};
</script>

<style scoped>
/* nút quay lại */
.back-btn {
  margin: 20px 0 0 20px;
  background: none;
  border: none;
  font-size: 16px;
  cursor: pointer;
  color: #6366f1;
  font-weight: 600;
}

/* giữ toàn bộ css cũ + thêm spinner */
.detail-wrapper {
  max-width: 900px;
  margin: 20px auto;
  background: #fff;
  border-radius: 14px;
  padding: 20px 30px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.08);
  font-family: 'Segoe UI', sans-serif;
}
.user-header { display: flex; align-items: center; gap: 20px; }
.avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  overflow: hidden;
  cursor: pointer;
  background: #6366f1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  color: white;
}
.avatar img { width: 100%; height: 100%; object-fit: cover; }
.info h2 { margin: 0; font-size: 22px; font-weight: 700; }
.badges span { padding: 3px 8px; border-radius: 6px; font-size: 13px; margin-right: 6px; }
.vip-tag { background: #facc15; }
.bronze-tag { background: #d97706; color: white; }

/* NEXT TIER BOX */
.next-tier-box {
  margin-top: 20px;
  padding: 12px 16px;
  background: #eef6ff;
  border-left: 4px solid #3b82f6;
  border-radius: 8px;
  font-size: 15px;
}

/* Loading */
.loading-wrap {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  margin-top: 14px;
  color: #374151;
}

.spinner {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 4px solid #e5e7eb;
  border-top-color: #6366f1;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.stats { margin-top: 25px; display: flex; justify-content: space-between; text-align: center; }
.stat-item { flex: 1; }
.label { color: #6b7280; }
.stat-item h3 { margin-top: 6px; font-size: 20px; font-weight: bold; }

.progress-box { margin-top: 25px; }
.progress-title { font-size: 14px; color: #374151; margin-bottom: 15px; }
.progress-line { display: flex; justify-content: space-between; align-items: center; position: relative; }
.progress-line::before { content: ""; position: absolute; top: 20px; left: 0; right: 0; height: 4px; background: #e5e7eb; z-index: 0; }
.progress-step { text-align: center; z-index: 1; }
.icon { width: 26px; height: 26px; font-size: 18px; display: flex; align-items: center; justify-content: center; color: #d1d5db; }
.icon.active { color: #b45309; }
.lvl-title { font-size: 14px; font-weight: 600; margin-top: 4px; }
.lvl-sub { font-size: 12px; color: #6b7280; }
</style>
