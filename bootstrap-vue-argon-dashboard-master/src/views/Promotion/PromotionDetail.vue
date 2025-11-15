<template>
  <section class="promotion-detail">
    <div class="promotion-detail__container fade-in">

      <!-- Nút quay lại -->
      <button class="back-btn" @click="$router.push('/promotions')">
        ← Quay lại
      </button>

      <!-- Ảnh khuyến mãi -->
      <div class="image-wrapper">
        <img
          :src="promotion.image"
          class="promotion-detail__image"
          @error="handleImageError"
        />
      </div>

      <!-- Tiêu đề -->
      <h2 class="promotion-detail__title">{{ promotion.title }}</h2>

      <!-- Mã khuyến mãi + nút lưu -->
      <div class="promotion-code-wrapper">
        <span class="promotion-detail__code">{{ promotion.promotion_code }}</span>
        <button class="save-code-btn" @click="saveCode">💾 Lưu mã</button>
      </div>

      <!-- Mô tả -->
      <p class="promotion-detail__text">{{ promotion.description || 'Không có mô tả' }}</p>

      <!-- Giảm giá -->
      <p class="promotion-detail__discount">
        <strong>Giảm giá:</strong>
        <span v-if="promotion.discount_type === 'percent'">
          -{{ promotion.discount_value }}%
        </span>
        <span v-else>
          -{{ formatMoney(promotion.discount_value) }} VNĐ
        </span>
      </p>

      <!-- Thời gian -->
      <p class="promotion-detail__time">
        <strong>Thời gian:</strong>
        {{ formatDate(promotion.start_date) }} → {{ formatDate(promotion.end_date) }}
      </p>

      <!-- Trạng thái -->
      <p class="promotion-detail__status">
        <strong>Trạng thái:</strong>
        <span :class="statusClass">{{ promotion.status }}</span>
      </p>

    </div>
  </section>
</template>

<script>
import api from "@/api";

export default {
  name: "PromotionDetailUser",
  data() {
    return {
      promotion: {
        image: "/img/default.jpg"
      },
    };
  },

  mounted() {
    this.loadDetail();
  },

  computed: {
    statusClass() {
      return this.promotion.status === "active" ? "status-active" : "status-inactive";
    }
  },

  methods: {
    async loadDetail() {
      try {
        const id = this.$route.params.id;
        const res = await api.get(`/promotions/${id}`); // endpoint user
        this.promotion = {
          ...res.data,
          image: res.data.image
            ? res.data.image.startsWith("http")
              ? res.data.image
              : `http://127.0.0.1:8088/${res.data.image.replace(/^\/+/, "")}`
            : "/img/default.jpg",
        };
      } catch (error) {
        console.error("❌ Không tải được chi tiết:", error);
      }
    },

    handleImageError(e) {
      e.target.src = "/img/default.jpg";
      e.target.style.border = "1px solid #ddd";
    },

    formatMoney(num) {
      return new Intl.NumberFormat().format(num);
    },

    formatDate(date) {
      return date ? new Date(date).toLocaleDateString("vi-VN") : "";
    },

    saveCode() {
      if (!this.promotion.promotion_code) return;
      navigator.clipboard.writeText(this.promotion.promotion_code);
      alert(`Đã lưu mã: ${this.promotion.promotion_code}`);
    }
  }
};
</script>

<style scoped>
.promotion-detail__container {
  max-width: 720px;
  margin: 40px auto;
  padding: 25px;
  border-radius: 20px;
  background: linear-gradient(180deg, #ffffff, #f9fafb);
  box-shadow: 0 10px 30px rgba(0,0,0,0.12);
  text-align: center;
  animation: fadeInSlide 0.8s ease;
}

@keyframes fadeInSlide {
  from { opacity: 0; transform: translateY(20px) scale(0.98); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

/* Back button */
.back-btn {
  position: relative;
  left: 0;
  font-size: 18px;
  color: #3b82f6;
  background: none;
  border: none;
  cursor: pointer;
  margin-bottom: 20px;
  transition: 0.3s ease;
}
.back-btn:hover { color: #1d4ed8; }

/* Image */
.image-wrapper {
  overflow: hidden;
  border-radius: 16px;
  margin-bottom: 20px;
}
.promotion-detail__image {
  width: 100%;
  height: 360px;
  object-fit: cover;
  transition: transform 0.3s ease;
}
.promotion-detail__image:hover { transform: scale(1.05); }

/* Title */
.promotion-detail__title {
  font-size: 30px;
  font-weight: 700;
  margin-bottom: 15px;
}

/* Mã khuyến mãi */
.promotion-code-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
}

.promotion-detail__code {
  font-size: 20px;
  font-weight: 600;
  padding: 8px 14px;
  border-radius: 10px;
  background-color: #fef3c7;
  color: #b45309;
}

/* Nút lưu mã */
.save-code-btn {
  background-color: #f59e0b;
  color: #fff;
  border: none;
  padding: 8px 14px;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: 0.3s ease;
}
.save-code-btn:hover { background-color: #d97706; }

/* Text, discount, time */
.promotion-detail__text {
  font-size: 16px;
  color: #4b5563;
  margin-bottom: 15px;
}
.promotion-detail__discount {
  font-size: 17px;
  font-weight: 600;
  color: #ef4444;
  margin-bottom: 10px;
}
.promotion-detail__time {
  font-size: 15px;
  color: #374151;
  margin-bottom: 10px;
}

/* Status */
.status-active { color: #10b981; font-weight: 600; }
.status-inactive { color: #6b7280; font-weight: 600; }
</style>
