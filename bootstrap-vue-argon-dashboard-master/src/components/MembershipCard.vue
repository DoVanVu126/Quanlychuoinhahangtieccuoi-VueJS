<!-- Redesigned MembershipCard.vue with UI giống hình mẫu -->
<template>
  <div class="vip-card shadow-lg">
    <div class="left-section" :style="{ background: gradientColor }">
      <div class="vip-label">★ {{ displayLevel }}</div>
      <div class="expire-text">Hạng hiện tại: {{ displayLevel }}</div>
      <div class="booking-info">
        Tổng lượt đặt phòng của bạn<br />
        <strong>{{ bookingCount }} đơn đặt phòng</strong>
      </div>
    </div>

    <div class="right-section">
      <p class="desc">Mỗi khi quý khách nhìn thấy huy hiệu VIP, điều này có nghĩa là quý khách đang nhận được các ưu đãi hoặc giảm giá đặc biệt chỉ dành cho người dùng VIP.</p>

      <ul class="benefits">
        <li>✔ Đảm Bảo Giá Tốt Nhất</li>
        <li>✔ Ưu đãi nội bộ</li>
        <li>✔ Ưu đãi VIP giảm giá tới {{ discount }}%</li>
      </ul>

      <router-link to="/membership/detail" class="detail-btn">
  Chi tiết thêm
</router-link>

      <div class="level-progress">
        <div class="level" v-for="(lv,i) in uiLevels" :key="i">
          <span :class="{ active: i <= currentIndex }">★</span>
          <p>{{ lv }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "MembershipCard",
  props: { membership: Object, discount: Number },
  computed: {
    bookingCount() { return Number(this.membership.booking_count) || 0; },
    displayLevel() {
      const c = this.bookingCount;
      if (c >= 20) return "Diamond";
      if (c >= 15) return "VIP";
      if (c >= 10) return "Gold";
      if (c >= 5) return "Silver";
      return "VIP Bronze";
    },
    currentIndex() {
      return this.uiLevels.indexOf(this.displayLevel);
    },
    uiLevels() {
      return ["VIP Bronze", "Silver", "Gold", "Platinum", "Diamond"];
    },
    gradientColor() {
      switch (this.displayLevel) {
        case "Silver": return "linear-gradient(135deg, #c0c0c0, #9e9e9e)";
        case "Gold": return "linear-gradient(135deg, #ffdd44, #f4c430)";
        case "VIP": return "linear-gradient(135deg, #3b82f6, #1e40af)";
        case "Diamond": return "linear-gradient(135deg, #9b6ef3, #6d28d9)";
        default: return "linear-gradient(135deg, #f3f4f6, #d1d5db)";
      }
    }
  }
};
</script>

<style scoped>
.vip-card {
  display: flex;
  width: 100%;
  max-width: 900px;
  background: white;
  border-radius: 12px;
  overflow: hidden;
}

.left-section {
  width: 35%;
  color: white;
  padding: 20px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.vip-label {
  font-size: 20px;
  font-weight: bold;
}

.expire-text { font-size: 14px; opacity: 0.8; }

.booking-info { font-size: 14px; margin-top: 20px; }

.right-section {
  width: 65%;
  padding: 20px 25px;
}

.desc {
  font-size: 14px;
  color: #374151;
  text-align: left;
}

.benefits {
  list-style: none;
  padding: 0;
  text-align: left;
  margin: 10px 0;
}
.benefits li { margin: 5px 0; }

.detail-btn {
  background: #2563eb;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  margin-top: 10px;
}

.level-progress {
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
}

.level span {
  font-size: 20px;
  color: #d1d5db;
}
.level span.active {
  color: #f59e0b;
}

.level p {
  font-size: 12px;
  margin-top: 4px;
  text-align: center;
}
</style>
