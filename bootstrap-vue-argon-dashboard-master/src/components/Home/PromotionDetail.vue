<template>
  <section class="promotion-detail-card">
    <!-- Loading -->
    <div v-if="loading" class="loading-box">
      <div class="spinner"></div>
      <p>Đang tải chi tiết khuyến mãi...</p>
    </div>

    <!-- Card chi tiết -->
    <div v-else class="card">
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

    <!-- Toast Manager -->
    <b-toast
      v-model="toast.show"
      :title="toast.title"
      :variant="toast.variant"
      solid
      auto-hide-delay="3000"
      class="position-fixed top-0 end-0 m-3"
    >
      {{ toast.message }}
    </b-toast>
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
      loading: true, // loading khi chờ dữ liệu
      toast: {
        show: false,
        title: "",
        message: "",
        variant: "success"
      }
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
      this.loading = true;
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
        this.showToast("Lỗi", "Không tải được chi tiết khuyến mãi!", "danger");
      } finally {
        this.loading = false;
      }
    },

    handleImageError(e) {
      e.target.src = "/img/default.jpg";
    },

    formatDate(date) {
      return date ? new Date(date).toLocaleDateString("vi-VN") : "";
    },

    formatMoney(num) {
      return new Intl.NumberFormat("vi-VN").format(num);
    },

    copyCode() {
      if (this.promotion.promotion_code) {
        navigator.clipboard.writeText(this.promotion.promotion_code);
        this.showToast("Thành công", "Đã copy mã: " + this.promotion.promotion_code, "success");
      }
    },

    async saveCode() {
      if (!this.user) return this.showToast("Thất bại", "Bạn cần đăng nhập để lưu mã!", "danger");
      if (!this.promotion.promotion_code) return;

      const today = new Date();
      const endDate = new Date(this.promotion.end_date);
      if (endDate < today) {
        this.showToast("Thất bại", "⚠ Mã khuyến mãi đã hết hạn!", "warning");
        return;
      }

      try {
        const resCheck = await api.get(`/user-promotions?user_id=${this.user.user_id}`);
        const savedPromos = resCheck.data || [];
        const exists = savedPromos.some(p => p.promotion_id === this.promotion.promotion_id);

        if (exists) {
          this.showToast("Thất bại", "⚠ Bạn đã lưu mã này trước đó!", "warning");
          return;
        }

        const payload = {
          user_id: this.user.user_id,
          promotion_id: this.promotion.promotion_id,
          restaurant_id: this.promotion.restaurant_id
        };

        const res = await api.post("/user-promotions", payload);
        this.showToast("Thành công", res.data.message || "Đã lưu mã khuyến mãi!", "success");
      } catch (err) {
        console.error(err);
        this.showToast("Thất bại", "Lưu mã thất bại!", "danger");
      }
    },

    showToast(title, message, variant = "success") {
  this.toast.title = title;
  this.toast.message = message;
  this.toast.variant = variant;
  this.toast.show = true;
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
  z-index: 10;
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

/* Loading spinner */
.loading-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin: 50px 0;
}
.spinner {
  width: 50px;
  height: 50px;
  border: 6px solid #e5e7eb;
  border-top-color: #6366f1;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 15px;
}
@keyframes spin { to { transform: rotate(360deg); } }
.loading-box p {
  font-size: 16px;
  color: #6b7280;
  font-weight: 600;
}
</style>
