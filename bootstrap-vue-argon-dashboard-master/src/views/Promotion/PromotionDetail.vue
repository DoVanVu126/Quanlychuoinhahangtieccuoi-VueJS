<template>
  <section class="promotion-detail">

    <div class="card">

      <!-- Back -->
      <button class="back-btn" @click="$router.push('/promotions')">
        ← Quay lại danh sách
      </button>

      <!-- Image -->
      <div class="image-box">
        <img
          :src="promotion.image"
          @error="handleImageError"
          class="promo-img"
        />
      </div>

      <!-- Info block -->
      <div class="info-box">

        <h2 class="title">{{ promotion.title }}</h2>

        <!-- Code -->
        <div class="code-row">
          <div class="promo-code">{{ promotion.promotion_code }}</div>
          <button class="btn-save" @click="saveCode">📋 Copy mã</button>
        </div>

        <p class="desc">{{ promotion.description || "Không có mô tả" }}</p>

        <div class="detail-list">

          <p>
            <span class="label">💸 Giảm giá:</span>
            <span class="value highlight">
              <template v-if="promotion.discount_type === 'percent'">
                -{{ promotion.discount_value }}%
              </template>
              <template v-else>
                -{{ formatMoney(promotion.discount_value) }}₫
              </template>
            </span>
          </p>

          <p>
            <span class="label">📅 Thời gian:</span>
            <span class="value">
              {{ formatDate(promotion.start_date) }} → {{ formatDate(promotion.end_date) }}
            </span>
          </p>

          <p>
            <span class="label">📌 Trạng thái:</span>
            <span :class="['status', promotion.status]">
              {{ promotion.status }}
            </span>
          </p>

        </div>

      </div>
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
        image: "/img/default.jpg",
      },
    };
  },

  mounted() {
    this.loadDetail();
  },

  methods: {
    async loadDetail() {
      try {
        const id = this.$route.params.id;
        const res = await api.get(`/promotions/${id}`);

        this.promotion = {
          ...res.data,
          image: res.data.image
            ? res.data.image.startsWith("http")
              ? res.data.image
              : `http://127.0.0.1:8088/${res.data.image.replace(/^\/+/, "")}`
            : "/img/default.jpg",
        };
      } catch (err) {
        console.error("Lỗi tải chi tiết:", err);
      }
    },

    handleImageError(e) {
      e.target.src = "/img/default.jpg";
    },

    formatMoney(num) {
      return new Intl.NumberFormat("vi-VN").format(num);
    },

    formatDate(date) {
      return date ? new Date(date).toLocaleDateString("vi-VN") : "";
    },

    saveCode() {
      navigator.clipboard.writeText(this.promotion.promotion_code);
      alert("Đã copy mã!");
    },
  },
};
</script>


<style scoped>
.promotion-detail {
  display: flex;
  justify-content: center;
  padding: 30px 12px;
  background: #f3f4f6;
  min-height: 100vh;
}

.card {
  width: 100%;
  max-width: 760px;
  background: white;
  border-radius: 18px;
  box-shadow: 0 8px 28px rgba(0, 0, 0, 0.12);
  padding: 24px;
  animation: fadeIn 0.4s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* Back button */
.back-btn {
  background: none;
  border: none;
  color: #3b82f6;
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 18px;
  cursor: pointer;
}
.back-btn:hover {
  color: #1d4ed8;
}

/* Image */
.image-box {
  width: 100%;
  height: 260px;
  overflow: hidden;
  border-radius: 14px;
  margin-bottom: 20px;
}
.promo-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: .3s ease;
}
.promo-img:hover {
  transform: scale(1.05);
}

/* Title */
.title {
  font-size: 26px;
  font-weight: 700;
  margin-bottom: 12px;
  color: #111827;
}

/* Code Row */
.code-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
}

.promo-code {
  padding: 8px 12px;
  background: #fef3c7;
  color: #b45309;
  font-weight: 700;
  border-radius: 8px;
}

.btn-save {
  background: #3b82f6;
  color: white;
  padding: 8px 14px;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: .25s ease;
}
.btn-save:hover {
  background: #1d4ed8;
}

/* Description */
.desc {
  color: #4b5563;
  margin-bottom: 20px;
  line-height: 1.5;
}

/* Details List */
.detail-list p {
  margin: 8px 0;
}

.label {
  font-weight: 600;
  color: #374151;
}

.value {
  margin-left: 6px;
  color: #111;
}

.highlight {
  color: #dc2626;
  font-weight: 700;
}

/* Status */
.status.active {
  color: #10b981;
  font-weight: 700;
}
.status.inactive {
  color: #9ca3af;
  font-weight: 700;
}
</style>
