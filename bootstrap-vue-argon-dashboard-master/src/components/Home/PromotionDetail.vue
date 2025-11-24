<template>
  <section class="promotion-detail">
    <!-- Nút quay lại -->
    <button class="back-btn" @click="$router.push('/home')">
      ← Quay lại
    </button>

    <!-- Container chính -->
    <div class="promotion-container">
      <!-- Ảnh khuyến mãi -->
      <div class="image-wrapper">
        <img :src="promotion.image" @error="handleImageError" class="promotion-image"/>
      </div>

      <!-- Tiêu đề -->
      <h2 class="promotion-title">
        Tiêu đề: {{ promotion.title || 'Không có tiêu đề' }}
      </h2>

      <!-- Mã khuyến mãi -->
      <div class="promotion-code-wrapper" v-if="promotion.promotion_code">
        <span class="promotion-code">Mã KH: {{ promotion.promotion_code }}</span>
        <div class="code-buttons">
          <button class="btn-copy" @click="copyCode" title="Copy mã">📋</button>
          <button class="btn-save" @click="saveCode" title="Lưu mã">💾</button>
        </div>
      </div>

      <!-- Mô tả -->
      <p class="promotion-description">
        Mô tả: {{ promotion.description || 'Không có mô tả' }}
      </p>

      <!-- Giảm giá -->
      <p class="promotion-discount">
        <strong>Giảm giá:</strong>
        <span v-if="promotion.discount_type === 'percent'">
          -{{ promotion.discount_value }}%
        </span>
        <span v-else>
          -{{ formatMoney(promotion.discount_value) }}₫
        </span>
      </p>

      <!-- Thời gian -->
      <p class="promotion-time">
        <strong>Thời gian:</strong> {{ formatDate(promotion.start_date) }} → {{ formatDate(promotion.end_date) }}
      </p>

      <!-- Trạng thái -->
      <p class="promotion-status">
        <strong>Trạng thái:</strong>
        <span :class="statusClass">{{ promotion.status }}</span>
      </p>
    </div>

    <!-- Tooltip thông báo -->
    <div v-if="showTooltipFlag" class="tooltip-msg">{{ tooltipMsg }}</div>
  </section>
</template>

<script>
import api from "@/api";

export default {
  name: "PromotionDetail",
  data() {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    return {
      user: storedUser && storedUser.user_id ? storedUser : null,
      promotion: {
        image: "/img/default.jpg",
        title: "",
        description: "",
        promotion_code: "",
        discount_type: "",
        discount_value: 0,
        start_date: "",
        end_date: "",
        status: ""
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
        this.promotion = {
          ...res.data,
          image: res.data.image
            ? res.data.image.startsWith("http")
              ? res.data.image
              : `http://127.0.0.1:8088/${res.data.image.replace(/^\/+/, "")}`
            : "/img/default.jpg",
          title: res.data.title || "",
          description: res.data.description || "",
          promotion_code: res.data.promotion_code || "",
          discount_type: res.data.discount_type || "",
          discount_value: res.data.discount_value || 0,
          start_date: res.data.start_date || "",
          end_date: res.data.end_date || "",
          status: res.data.status || ""
        };
      } catch (err) {
        console.error("Lỗi tải chi tiết:", err);
      }
    },
    handleImageError(e) {
      e.target.src = "/img/default.jpg";
    },
    formatDate(date) {
      return date ? new Date(date).toLocaleDateString("vi-VN") : "";
    },
    formatMoney(num) {
      return new Intl.NumberFormat().format(num);
    },
    copyCode() {
      if (this.promotion.promotion_code) {
        navigator.clipboard.writeText(this.promotion.promotion_code);
        this.showTooltip(`Đã copy mã: ${this.promotion.promotion_code}`);
      }
    },
    saveCode() {
      if (!this.user) return alert("Bạn cần đăng nhập để lưu mã!");
      if (this.promotion.promotion_code) {
        const key = `savedCodes_${this.user.user_id}`;
        let saved = JSON.parse(localStorage.getItem(key) || "[]");
        if (!saved.includes(this.promotion.promotion_code)) {
          saved.push(this.promotion.promotion_code);
          localStorage.setItem(key, JSON.stringify(saved));
        }
        this.showTooltip(`Đã lưu mã: ${this.promotion.promotion_code}`);
      }
    },
    showTooltip(msg) {
      this.tooltipMsg = msg;
      this.showTooltipFlag = true;
      setTimeout(() => this.showTooltipFlag = false, 1500);
    }
  }
};
</script>

<style scoped>
.promotion-detail {
  max-width: 800px;
  margin: 50px auto;
  padding: 30px;
  border-radius: 25px;
  background: linear-gradient(to bottom right, #ffffff, #f3f4f6);
  box-shadow: 0 15px 40px rgba(0,0,0,0.15);
  position: relative;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.back-btn {
  position: absolute;
  top: 25px;
  left: 25px;
  font-size: 16px;
  font-weight: 600;
  background: #f59e0b;
  color: #fff;
  border: none;
  padding: 10px 18px;
  border-radius: 12px;
  cursor: pointer;
  transition: 0.3s ease;
  box-shadow: 0 5px 15px rgba(0,0,0,0.2);
}
.back-btn:hover {
  background: #d97706;
}

.image-wrapper {
  overflow: hidden;
  border-radius: 20px;
  margin-bottom: 25px;
  margin-top: 60px; /* tạo khoảng cách với nút quay lại */
}

.promotion-image {
  width: 100%;
  height: 250px; /* ảnh nhỏ hơn */
  object-fit: cover;
  transition: transform 0.4s ease;
  border-radius: 20px;
}
.promotion-image:hover {
  transform: scale(1.05) rotate(1deg);
}

.promotion-title {
  font-size: 32px;
  font-weight: 800;
  margin-bottom: 20px;
  color: #1f2937;
}

.promotion-code-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 12px;
  margin-bottom: 25px;
  flex-wrap: wrap;
}

.promotion-code {
  font-size: 20px;
  font-weight: 700;
  padding: 10px 20px;
  border-radius: 12px;
  background-color: #fef3c7;
  color: #b45309;
  box-shadow: 0 5px 15px rgba(0,0,0,0.1);
}

.code-buttons {
  display: flex;
  gap: 10px;
}
.btn-copy, .btn-save {
  padding: 10px 16px;
  border-radius: 12px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: 0.3s ease;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  font-size: 16px;
}
.btn-copy { background-color: #3b82f6; color: #fff; }
.btn-copy:hover { background-color: #2563eb; transform: scale(1.1); }
.btn-save { background-color: #10b981; color: #fff; }
.btn-save:hover { background-color: #059669; transform: scale(1.1); }

.promotion-description {
  font-size: 18px;
  color: #4b5563;
  margin-bottom: 20px;
  line-height: 1.6;
}

.promotion-discount, .promotion-time, .promotion-status {
  font-size: 17px;
  margin-bottom: 12px;
}

.status-active { color: #10b981; font-weight: 700; }
.status-inactive { color: #6b7280; font-weight: 700; }

/* Tooltip thông báo copy/lưu */
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
  opacity: 0.95;
  z-index: 9999;
  animation: fadeInOut 1.5s forwards;
}

@keyframes fadeInOut {
  0% { opacity: 0; transform: translateY(-10px); }
  10% { opacity: 0.95; transform: translateY(0); }
  90% { opacity: 0.95; transform: translateY(0); }
  100% { opacity: 0; transform: translateY(-10px); }
}
</style>
