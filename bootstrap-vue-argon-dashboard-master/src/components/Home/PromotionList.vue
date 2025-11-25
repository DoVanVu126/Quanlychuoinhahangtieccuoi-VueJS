<template>
  <section class="promotion-wrapper">
    <h2 class="title">Sự kiện & Khuyến mãi</h2>

    <div class="promotion-slider">
      <!-- Nút điều hướng -->
      <button class="nav-btn left" @click="scrollLeft">‹</button>
      <button class="nav-btn right" @click="scrollRight">›</button>

      <div class="promotion-track" ref="track">
        <div
          class="promotion-card fade-in"
          v-for="promo in promotions"
          :key="promo.promotion_id"
        >
          <img
            :src="promo.image || '/img/default.jpg'"
            class="promotion-image"
            alt="promotion image"
            @error="handleImageError"
          />

          <div class="promotion-info">
            <h3 class="promotion-title">{{ promo.title }}</h3>
            <p class="promotion-desc">{{ promo.description || 'Không có mô tả' }}</p>
            <p class="promotion-discount">
              Giảm:
              {{ promo.discount_type === 'percent' ? promo.discount_value + '%' : promo.discount_value + '₫' }}
            </p>
            <button class="btn-detail" @click="goToDetail(promo.promotion_id)">Xem chi tiết</button>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
import api from "@/api";

export default {
  name: "PromotionList",

  data() {
    return {
      promotions: [],
      autoSlideInterval: null,
    };
  },

  mounted() {
    this.loadPromotions();
    this.startAutoSlide();
  },

  beforeUnmount() {
    clearInterval(this.autoSlideInterval);
  },

  methods: {
    async loadPromotions() {
      try {
        const res = await api.get("/promotions/all");
        this.promotions = res.data.data.map((p) => ({
          ...p,
          image: p.image
            ? p.image.startsWith("http")
              ? p.image
              : `http://127.0.0.1:8088/${p.image.replace(/^\/+/, "")}`
            : "/img/default.jpg",
        }));
      } catch (err) {
        console.error("Lỗi tải khuyến mãi:", err);
      }
    },

    scrollLeft() {
      this.$refs.track.scrollBy({ left: -300, behavior: "smooth" });
    },

    scrollRight() {
      this.$refs.track.scrollBy({ left: 300, behavior: "smooth" });
    },

    goToDetail(id) {
      this.$router.push(`/promotion/${id}`);
    },

    handleImageError(e) {
      e.target.src = "/img/default.jpg";
      e.target.style.border = "1px solid #ddd";
    },

    startAutoSlide() {
      this.autoSlideInterval = setInterval(() => {
        if (this.$refs.track) {
          const track = this.$refs.track;
          const scrollLeft = track.scrollLeft + 300;
          if (scrollLeft >= track.scrollWidth - track.clientWidth) {
            track.scrollTo({ left: 0, behavior: "smooth" });
          } else {
            track.scrollBy({ left: 300, behavior: "smooth" });
          }
        }
      }, 4000); // 4 giây tự chạy
    },
  },
};
</script>

<style scoped>
/* Wrapper */
.promotion-wrapper {
  width: 90%;
  margin: 40px auto;
  animation: fadeStart 0.6s ease;
}

@keyframes fadeStart {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.title {
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 20px;
  letter-spacing: 0.5px;
}

/* Slider */
.promotion-slider {
  position: relative;
  display: flex;
  align-items: center;
}

.promotion-track {
  display: flex;
  overflow-x: auto;
  gap: 18px;
  scroll-behavior: smooth;
  padding-bottom: 8px;
}

.promotion-track::-webkit-scrollbar {
  display: none;
}

/* Animation */
.fade-in {
  animation: fadeInSlide 0.7s ease forwards;
  opacity: 0;
}

@keyframes fadeInSlide {
  from { opacity: 0; transform: translateY(20px) scale(0.97); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

/* Card */
.promotion-card {
  min-width: 260px;
  max-width: 260px;
  background: linear-gradient(180deg, #ffffff, #f7f7f7);
  border-radius: 14px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  cursor: pointer;
  transition: 0.3s ease;
  display: flex;
  flex-direction: column;
}

.promotion-card:hover {
  transform: translateY(-8px) scale(1.05);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
}

/* Image */
.promotion-image {
  width: 100%;
  height: 160px;
  object-fit: cover;
  border-radius: 8px;
  transition: transform 0.4s ease;
}

.promotion-card:hover .promotion-image {
  transform: scale(1.08);
}

/* Info */
.promotion-info {
  padding: 12px 14px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.promotion-title {
  font-size: 16px;
  font-weight: 700;
}

.promotion-desc {
  font-size: 14px;
  color: #555;
  height: 36px;
  overflow: hidden;
  text-overflow: ellipsis;
}

.promotion-discount {
  font-size: 14px;
  color: #ff3b3b;
  font-weight: 600;
}

.btn-detail {
  margin-top: 6px;
  background-color: #fbbf24;
  border: none;
  color: #fff;
  font-weight: 600;
  padding: 6px 10px;
  border-radius: 6px;
  cursor: pointer;
  transition: 0.3s ease;
}

.btn-detail:hover {
  background-color: #f59e0b;
}

/* Nav buttons */
.nav-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: #ffffff;
  border: none;
  font-size: 32px;
  width: 42px;
  height: 42px;
  border-radius: 50%;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.18);
  transition: 0.25s ease;
  z-index: 10;
}

.nav-btn:hover {
  background: #f1f1f1;
  transform: translateY(-50%) scale(1.1);
}

.left {
  left: -10px;
}

.right {
  right: -10px;
}
</style>
