<template>
  <div class="membership-page-wrapper">
    <!-- Header -->
    <HomeHeader />

    <!-- Nút Back -->
    <button class="back-btn" @click="$router.back()">← Quay lại</button>

    <!-- Main content -->
    <section class="membership-page">
      <h2>Thẻ hội viên của bạn</h2>

      <!-- Loading -->
      <div v-if="loading" class="loading-box">
        <div class="spinner"></div>
        <p>Đang tải thông tin...</p>
      </div>

      <!-- Card -->
      <div v-else-if="membership" class="membership-card-wrapper">
        <MembershipCard
          :membership="membership"
          :discount="discount"
        />
      </div>

      <p v-else class="loading-text">Không có dữ liệu...</p>
    </section>
  </div>
</template>

<script>
import HomeHeader from "@/components/Home/HomeHeader.vue";
import MembershipCard from "@/components/MembershipCard.vue";
import axios from "axios";

export default {
  name: "Membership",
  components: { HomeHeader, MembershipCard },
  data() {
    return {
      user: null,
      membership: null,
      discount: 0,
      loading: true, // ⭐ loading state
    };
  },
  mounted() {
    try {
      this.user = JSON.parse(localStorage.getItem("user"));
    } catch (e) {
      this.user = null;
    }

    if (!this.user) {
      this.$router.push("/login");
      return;
    }

    this.loadMembership();
  },
  methods: {
    async loadMembership() {
      this.loading = true;

      try {
        const res = await axios.get(
          `http://localhost:8088/api/membership/${this.user.user_id}`
        );

        this.membership = res.data.membership || {
          level: "Normal",
          booking_count: 0,
        };

        this.membership.booking_count = Number(this.membership.booking_count);

        this.discount =
          res.data.discount !== undefined ? res.data.discount : 2;
      } catch (err) {
        console.error("Lỗi tải membership:", err);

        this.membership = { level: "Normal", booking_count: 0 };
        this.discount = 2;
      } finally {
        this.loading = false; // ⭐ tắt loading sau khi load xong
      }
    },
  },
};
</script>

<style scoped>
.membership-page-wrapper {
  background: #f9fafb;
  min-height: 100vh;
}

/* Nút Back */
.back-btn {
  margin: 15px 20px;
  background: #e5e7eb;
  border: none;
  padding: 10px 15px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 15px;
  transition: 0.2s;
}
.back-btn:hover {
  background: #d1d5db;
}

.membership-page {
  max-width: 700px;
  margin: 20px auto;
  padding: 20px;
  text-align: center;
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
}

.membership-page h2 {
  margin-bottom: 30px;
  font-size: 26px;
  font-weight: 700;
  color: #1f2937;
}

.membership-card-wrapper {
  display: flex;
  justify-content: center;
}

/* Loading UI */
.loading-box {
  margin-top: 40px;
  text-align: center;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 5px solid #e5e7eb;
  border-top-color: #6366f1;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 10px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.loading-text {
  color: #6b7280;
  font-size: 16px;
}
</style>
