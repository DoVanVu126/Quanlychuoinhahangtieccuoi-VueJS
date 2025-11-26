<template>
  <section class="promotion-detail-card">
    <div class="card">
      <!-- Nút Quay lại nằm bên trong card -->
      <button class="back-btn" @click="$router.push('/home')">← Quay lại</button>

      <div class="image-wrapper">
        <img :src="promotion.image" @error="handleImageError" class="card-image"/>
      </div>

      <div class="card-content">
        <h2 class="card-title">{{ promotion.title || 'Không có tiêu đề' }}</h2>
        <p class="card-restaurant"><strong>Nhà hàng:</strong> {{ promotion.restaurant_name }}</p>

        <div class="card-code" v-if="promotion.promotion_code">
          <span class="code-text">Mã: {{ promotion.promotion_code }}</span>
          <div class="code-buttons">
            <button class="btn-copy" @click="copyCode" title="Copy mã">📋</button>
            <button class="btn-save" @click="saveCode" title="Lưu mã">💾</button>
          </div>
        </div>

        <p class="card-discount">
          <strong>Giảm giá:</strong>
          <span v-if="promotion.discount_type === 'percent'">-{{ promotion.discount_value }}%</span>
          <span v-else>-{{ formatMoney(promotion.discount_value) }}₫</span>
        </p>

        <p class="card-time">
          <strong>Thời gian:</strong> {{ formatDate(promotion.start_date) }} → {{ formatDate(promotion.end_date) }}
        </p>

        <p class="card-status">
          <strong>Trạng thái:</strong>
          <span :class="statusClass">{{ promotion.status }}</span>
        </p>

        <p class="card-description"><strong>Mô tả:</strong> {{ promotion.description || 'Không có mô tả' }}</p>
      </div>
    </div>

    <div v-if="showTooltipFlag" class="tooltip-msg">{{ tooltipMsg }}</div>
  </section>
</template>

<script>
import api from "@/api";

export default {
  name: "PromotionDetailCard",
  data() {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    return {
      user: storedUser && storedUser.user_id ? storedUser : null,
      promotion: {
        promotion_id: null,
        image: "/img/default.jpg",
        title: "",
        description: "",
        promotion_code: "",
        discount_type: "",
        discount_value: 0,
        start_date: "",
        end_date: "",
        status: "",
        restaurant_id: null,
        restaurant_name: "Không rõ"
      },
      tooltipMsg: "",
      showTooltipFlag: false
    };
  },
  computed: {
    statusClass() {
      return this.promotion.status === "active" ? "status-active" : "status-inactive";
    }
  },
  mounted() {
    this.loadDetail();
  },
  methods: {
    async loadDetail() {
      const id = this.$route.params.id;
      try {
        const res = await api.get(`/promotions/${id}`);
        const data = res.data;
        this.promotion = {
          promotion_id: data.promotion_id,
          image: data.image
            ? data.image.startsWith("http")
              ? data.image
              : "http://127.0.0.1:8088/" + data.image.replace(/^\/+/, "")
            : "/img/default.jpg",
          title: data.title || "",
          description: data.description || "",
          promotion_code: data.promotion_code || "",
          discount_type: data.discount_type || "",
          discount_value: data.discount_value || 0,
          start_date: data.start_date || "",
          end_date: data.end_date || "",
          status: data.status || "",
          restaurant_id: data.restaurant_id || (data.restaurant && data.restaurant.restaurant_id) || null,
          restaurant_name: data.restaurant && data.restaurant.name ? data.restaurant.name : "Không rõ"
        };
      } catch (err) {
        console.error("Lỗi tải chi tiết:", err);
        this.showTooltip("Không tải được chi tiết khuyến mãi!");
      }
    },
    handleImageError(e) { e.target.src = "/img/default.jpg"; },
    formatDate(date) { return date ? new Date(date).toLocaleDateString("vi-VN") : ""; },
    formatMoney(num) { return new Intl.NumberFormat("vi-VN").format(num); },
    copyCode() {
      if (this.promotion.promotion_code) {
        navigator.clipboard.writeText(this.promotion.promotion_code);
        this.showTooltip("Đã copy mã: " + this.promotion.promotion_code);
      }
    },
    async saveCode() {
      if (!this.user) return alert("Bạn cần đăng nhập để lưu mã!");
      if (!this.promotion.promotion_code) return;

      const today = new Date();
      const endDate = new Date(this.promotion.end_date);
      if (endDate < today) {
        this.showTooltip("⚠ Mã khuyến mãi đã hết hạn!");
        return;
      }

      try {
        const resCheck = await api.get(`/user-promotions?user_id=${this.user.user_id}`);
        const savedPromos = resCheck.data || [];
        const exists = savedPromos.some(p => p.promotion_id === this.promotion.promotion_id);

        if (exists) {
          this.showTooltip("⚠ Bạn đã lưu mã này trước đó!");
          return;
        }

        const payload = {
          user_id: this.user.user_id,
          promotion_id: this.promotion.promotion_id,
          restaurant_id: this.promotion.restaurant_id
        };

        const res = await api.post("/user-promotions", payload);
        this.showTooltip(res.data.message || "Đã lưu mã khuyến mãi!");
      } catch (err) {
        console.error(err);
        this.showTooltip("Lưu mã thất bại!");
      }
    },
    showTooltip(msg) {
      this.tooltipMsg = msg;
      this.showTooltipFlag = true;
      setTimeout(() => (this.showTooltipFlag = false), 1500);
    }
  }
};
</script>

<style scoped>
.promotion-detail-card {
  max-width: 800px;
  margin: 50px auto;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  position: relative;
}

.card {
  background: #fff;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.15);
  overflow: hidden;
  padding-top: 60px; /* tạo khoảng cho nút quay lại */
  position: relative;
}

.back-btn {
  position: absolute;
  top: 15px;
  left: 15px;
  font-size: 16px;
  font-weight: 600;
  background: #f59e0b;
  color: #fff;
  border: none;
  padding: 8px 16px;
  border-radius: 12px;
  cursor: pointer;
  box-shadow: 0 5px 15px rgba(0,0,0,0.2);
  transition: 0.3s ease;
  z-index: 10; /* luôn hiển thị trên card */
}
.back-btn:hover { background: #d97706; }

.image-wrapper {
  width: 100%;
  height: 250px;
  overflow: hidden;
}

.card-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s ease;
}
.card-image:hover { transform: scale(1.05); }

.card-content {
  padding: 20px 25px;
}

.card-title { font-size: 28px; font-weight: 800; margin-bottom: 10px; color: #1f2937; }
.card-restaurant { font-size: 18px; font-weight: 600; margin-bottom: 15px; color: #374151; }

.card-code { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
.code-text { font-size: 18px; font-weight: 600; background: #fef3c7; padding: 6px 12px; border-radius: 8px; color: #b45309; }
.code-buttons button { margin-left: 8px; padding: 6px 12px; border-radius: 8px; border: none; cursor: pointer; font-weight: 600; }
.btn-copy { background: #3b82f6; color: #fff; }
.btn-copy:hover { background: #2563eb; transform: scale(1.1); }
.btn-save { background: #10b981; color: #fff; }
.btn-save:hover { background: #059669; transform: scale(1.1); }

.card-discount, .card-time, .card-status, .card-description {
  font-size: 17px;
  margin-bottom: 10px;
}

.status-active { color: #10b981; font-weight: 700; }
.status-inactive { color: #6b7280; font-weight: 700; }

.tooltip-msg {
  position: fixed;
  top: 20px;
  right: 20px;
  background: #111827;
  color: #fff;
  padding: 10px 18px;
  border-radius: 12px;
  font-weight: 600;
  box-shadow: 0 5px 15px rgba(0,0,0,0.2);
  z-index: 9999;
  opacity: 0.95;
  animation: fadeInOut 1.5s forwards;
}

@keyframes fadeInOut {
  0% { opacity: 0; transform: translateY(-10px); }
  10% { opacity: 0.95; transform: translateY(0); }
  90% { opacity: 0.95; transform: translateY(0); }
  100% { opacity: 0; transform: translateY(-10px); }
}
</style>
