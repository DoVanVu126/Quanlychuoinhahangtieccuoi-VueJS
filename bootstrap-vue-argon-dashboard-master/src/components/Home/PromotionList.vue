<template>
  <section class="promotion-wrapper">
    <h2 class="title">Sự kiện & Khuyến mãi</h2>

    <div class="promotion-slider">
      <!-- Nút điều hướng -->
      <button class="nav-btn left" @click="scrollLeft">
        <i class="fas fa-chevron-left"></i>
      </button>
      <button class="nav-btn right" @click="scrollRight">
        <i class="fas fa-chevron-right"></i>
      </button>

      <div class="promotion-track" ref="track">
        <div
          class="promotion-card fade-in"
          v-for="(promo, index) in promotions"
          :key="promo.promotion_id"
          :style="{ 'animation-delay': `${index * 0.1}s` }"
        >
          <div class="promotion-image-container">
            <img
              :src="promo.image || '/img/default.jpg'"
              class="promotion-image"
              alt="promotion image"
              @error="handleImageError"
            />
            <div class="discount-badge" v-if="promo.discount_value">
              <span>{{ promo.discount_type === 'percent' ? `-${promo.discount_value}%` : `-${promo.discount_value}₫` }}</span>
            </div>
          </div>

          <div class="promotion-info">
            <h3 class="promotion-title">{{ promo.title }}</h3>
            <p class="promotion-desc">{{ promo.description || 'Không có mô tả' }}</p>

            <div class="promotion-dates">
              <div v-if="promo.start_date && promo.end_date">
                <span class="date-label">Từ:</span> {{ formatDate(promo.start_date) }}
                <span class="date-separator">→</span>
                <span class="date-label">Đến:</span> {{ formatDate(promo.end_date) }}
              </div>
            </div>

            <button class="btn-detail" @click="goToDetail(promo.promotion_id)">
              Xem chi tiết
              <i class="fas fa-arrow-right"></i>
            </button>
          </div>
        </div>

        <div class="empty-state" v-if="promotions.length === 0">
          <i class="fas fa-gift empty-icon"></i>
          <p>Hiện không có khuyến mãi nào!</p>
        </div>
      </div>
    </div>

    <div class="promotion-dots">
      <span
        v-for="(_, index) in Math.ceil(promotions.length / 3)"
        :key="index"
        class="dot"
        :class="{ active: currentPage === index }"
        @click="goToPage(index)"
      ></span>
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
      currentPage: 0,
    };
  },

  mounted() {
    this.loadPromotions();
    this.startAutoSlide();

    // Listen for track scroll events to update current page
    if (this.$refs.track) {
      this.$refs.track.addEventListener('scroll', this.handleScroll);
    }
  },

  beforeUnmount() {
    clearInterval(this.autoSlideInterval);
    if (this.$refs.track) {
      this.$refs.track.removeEventListener('scroll', this.handleScroll);
    }
  },

  methods: {
    async loadPromotions() {
      try {
        const res = await api.get("/promotions/all");
        const today = new Date();

        this.promotions = res.data.data
          .map((p) => ({
            ...p,
            image: p.image
              ? p.image.startsWith("http")
                ? p.image
                : `http://127.0.0.1:8088/${p.image.replace(/^\/+/, "")}`
              : "/img/default.jpg",
            start_date: p.start_date ? new Date(p.start_date) : null,
            end_date: p.end_date ? new Date(p.end_date) : null
          }))
          // Lọc các mã khuyến mãi đã bắt đầu hoặc sắp diễn ra, chưa hết hạn
          .filter(promo => {
            if (!promo.end_date) return false; // không có ngày kết thúc → bỏ
            return promo.end_date >= today; // còn hiệu lực
          })
          // Optional: sắp xếp theo ngày bắt đầu để mã sắp diễn ra đứng sau mã đang diễn ra
          .sort((a, b) => a.start_date - b.start_date);
      } catch (err) {
        console.error("Lỗi tải khuyến mãi:", err);
      }
    },

    formatDate(date) {
      if (!date) return '';
      return new Date(date).toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    },

    scrollLeft() {
      this.currentPage = Math.max(0, this.currentPage - 1);
      const cardWidth = 290; // card width + gap
      this.$refs.track.scrollTo({
        left: this.currentPage * cardWidth * 3,
        behavior: "smooth"
      });
    },

    scrollRight() {
      const maxPages = Math.ceil(this.promotions.length / 3) - 1;
      this.currentPage = Math.min(maxPages, this.currentPage + 1);
      const cardWidth = 290; // card width + gap
      this.$refs.track.scrollTo({
        left: this.currentPage * cardWidth * 3,
        behavior: "smooth"
      });
    },

    goToPage(pageIndex) {
      this.currentPage = pageIndex;
      const cardWidth = 290; // card width + gap
      this.$refs.track.scrollTo({
        left: pageIndex * cardWidth * 3,
        behavior: "smooth"
      });
    },

    handleScroll() {
      if (!this.$refs.track) return;

      const cardWidth = 290; // card width + gap
      const scrollPosition = this.$refs.track.scrollLeft;
      const newPage = Math.round(scrollPosition / (cardWidth * 3));

      if (newPage !== this.currentPage) {
        this.currentPage = newPage;
      }
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
          const maxPages = Math.ceil(this.promotions.length / 3) - 1;
          if (this.currentPage >= maxPages) {
            this.currentPage = 0;
            this.$refs.track.scrollTo({ left: 0, behavior: "smooth" });
          } else {
            this.currentPage++;
            const cardWidth = 290; // card width + gap
            this.$refs.track.scrollTo({
              left: this.currentPage * cardWidth * 3,
              behavior: "smooth"
            });
          }
        }
      }, 5000); // 5 giây tự chạy
    },
  },
};
</script>

<style scoped>
/* Wrapper */
.promotion-wrapper {
  width: 90%;
  max-width: 1200px;
  margin: 60px auto;
  animation: fadeStart 0.8s ease;
  position: relative;
}

@keyframes fadeStart {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.title {
  font-size: 32px;
  font-weight: 800;
  margin-bottom: 30px;
  position: relative;
  color: #2c3e50;
  display: inline-block;
}

.title::after {
  content: '';
  position: absolute;
  bottom: -10px;
  left: 0;
  width: 60px;
  height: 4px;
  background: linear-gradient(90deg, #fbbf24, #f59e0b);
  border-radius: 2px;
}

/* Slider */
.promotion-slider {
  position: relative;
  padding: 10px;
  border-radius: 16px;
  overflow: hidden;
}

.promotion-track {
  display: flex;
  overflow-x: auto;
  gap: 30px;
  scroll-behavior: smooth;
  padding: 20px 10px 30px;
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE and Edge */
  scroll-snap-type: x mandatory;
}

.promotion-track::-webkit-scrollbar {
  display: none; /* Chrome, Safari and Opera */
}

/* Animation */
.fade-in {
  animation: fadeInSlide 0.8s ease forwards;
  opacity: 0;
}

@keyframes fadeInSlide {
  from { opacity: 0; transform: translateY(30px) scale(0.95); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

/* Card */
.promotion-card {
  min-width: 260px;
  max-width: 260px;
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.06);
  overflow: hidden;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  display: flex;
  flex-direction: column;
  border: 1px solid #f0f0f0;
  scroll-snap-align: start;
}

.promotion-card:hover {
  transform: translateY(-12px);
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.1);
  border-color: rgba(251, 191, 36, 0.4);
}

/* Image */
.promotion-image-container {
  position: relative;
  overflow: hidden;
  height: 180px;
}

.promotion-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.6s ease;
}

.promotion-card:hover .promotion-image {
  transform: scale(1.12);
}

/* Discount badge */
.discount-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  background: linear-gradient(135deg, #ff4e50, #f9d423);
  color: white;
  padding: 5px 10px;
  border-radius: 20px;
  font-weight: bold;
  font-size: 14px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  z-index: 2;
}

.discount-badge span {
  display: block;
  transform: translateY(0);
  transition: transform 0.3s ease;
}

.promotion-card:hover .discount-badge span {
  transform: translateY(-3px) scale(1.05);
}

/* Info */
.promotion-info {
  padding: 18px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  flex: 1;
}

.promotion-title {
  font-size: 18px;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 4px;
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.promotion-desc {
  font-size: 14px;
  color: #64748b;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.promotion-dates {
  font-size: 13px;
  color: #94a3b8;
  margin-top: 5px;
  padding-top: 10px;
  border-top: 1px dashed #e2e8f0;
}

.date-label {
  font-weight: 600;
  color: #64748b;
}

.date-separator {
  margin: 0 3px;
  color: #cbd5e1;
}

.btn-detail {
  margin-top: auto;
  background-color: #fbbf24;
  border: none;
  color: #fff;
  font-weight: 600;
  padding: 10px 15px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.btn-detail:hover {
  background-color: #f59e0b;
  transform: translateY(-2px);
  box-shadow: 0 5px 10px rgba(251, 191, 36, 0.3);
}

.btn-detail i {
  font-size: 14px;
  transition: transform 0.3s ease;
}

.btn-detail:hover i {
  transform: translateX(3px);
}

/* Nav buttons */
.nav-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(255, 255, 255, 0.9);
  border: none;
  width: 46px;
  height: 46px;
  border-radius: 50%;
  cursor: pointer;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
}

.nav-btn i {
  color: #2c3e50;
  font-size: 18px;
}

.nav-btn:hover {
  background: #ffffff;
  transform: translateY(-50%) scale(1.1);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
}

.left {
  left: -15px;
}

.right {
  right: -15px;
}

/* Pagination dots */
.promotion-dots {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-top: 15px;
}

.dot {
  width: 10px;
  height: 10px;
  background: #e2e8f0;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.3s ease;
}

.dot.active {
  background: #fbbf24;
  width: 24px;
  border-radius: 10px;
}

.dot:hover {
  background: #f59e0b;
  transform: scale(1.2);
}

/* Empty state */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 60px 0;
  color: #94a3b8;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 15px;
  color: #cbd5e1;
}

/* Responsive */
@media (max-width: 768px) {
  .promotion-wrapper {
    width: 95%;
    margin: 40px auto;
  }

  .title {
    font-size: 24px;
  }

  .promotion-track {
    gap: 20px;
  }

  .nav-btn {
    width: 40px;
    height: 40px;
  }

  .left {
    left: -10px;
  }

  .right {
    right: -10px;
  }
}
</style>
