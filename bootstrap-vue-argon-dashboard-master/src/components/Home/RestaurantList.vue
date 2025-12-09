<template>
  <section class="restaurant-wrapper">
    <h2 class="title">Những nhà hàng nổi tiếng</h2>

    <div class="restaurant-slider">
      <!-- Nút điều hướng -->
      <button class="nav-btn left" @click="scrollLeft">
        <i class="fas fa-chevron-left"></i>
      </button>

      <button class="nav-btn right" @click="scrollRight">
        <i class="fas fa-chevron-right"></i>
      </button>

      <!-- Track -->
      <div class="restaurant-track" ref="track">
        <div
          class="restaurant-card fade-in"
          v-for="(r, index) in restaurants"
          :key="r.restaurant_id"
          :style="{ 'animation-delay': `${index * 0.1}s` }"
        >
          <div class="restaurant-image-container">
            <img
              :src="r.image_url"
              alt="restaurant image"
              class="restaurant-image"
              @error="handleImageError"
            />
          </div>

          <div class="restaurant-info">
            <h3 class="restaurant-name">{{ r.name }}</h3>
            <p class="restaurant-city">{{ r.city }}</p>

            <div class="restaurant-rating">
              <span
                v-for="i in 5"
                :key="i"
                :style="{ color: i <= Math.round(r.star_rating) ? '#facc15' : '#d1d5db' }"
              >★</span>
            </div>

            <button class="btn-detail" @click="goToDetail(r.restaurant_id)">
              Xem chi tiết
              <i class="fas fa-arrow-right"></i>
            </button>
          </div>
        </div>

        <div class="empty-state" v-if="restaurants.length === 0">
          <i class="fas fa-store empty-icon"></i>
          <p>Không có nhà hàng nào!</p>
        </div>
      </div>
    </div>

    <!-- Pagination dots -->
    <div class="restaurant-dots">
      <span
        v-for="(_, index) in totalPages"
        :key="index"
        class="dot"
        :class="{ active: currentPage === index }"
        @click="goToPage(index)"
      ></span>
    </div>
  </section>
</template>

<script>
import api from "@/axios";

export default {
  name: "RestaurantList",

  data() {
    return {
      restaurants: [],
      currentPage: 0,
      autoSlideInterval: null,
    };
  },

  computed: {
    totalPages() {
      return Math.ceil(this.restaurants.length / 3);
    },
  },

  mounted() {
    this.fetchRestaurants();
    this.startAutoSlide();

    if (this.$refs.track) {
      this.$refs.track.addEventListener("scroll", this.handleScroll);
    }
  },

  beforeUnmount() {
    clearInterval(this.autoSlideInterval);
    if (this.$refs.track) {
      this.$refs.track.removeEventListener("scroll", this.handleScroll);
    }
  },

  methods: {
    async fetchRestaurants() {
      try {
        const res = await api.get("/top-restaurants");
        this.restaurants = res.data;
      } catch (err) {
        console.error("Lỗi tải danh sách nhà hàng:", err);
      }
    },

    handleImageError(e) {
      e.target.src = "/img/default.jpg";
    },

    scrollLeft() {
      this.currentPage = Math.max(0, this.currentPage - 1);
      this.scrollToPage();
    },

    scrollRight() {
      this.currentPage = Math.min(this.totalPages - 1, this.currentPage + 1);
      this.scrollToPage();
    },

    scrollToPage() {
      const cardWidth = 290;
      this.$refs.track.scrollTo({
        left: this.currentPage * cardWidth * 3,
        behavior: "smooth",
      });
    },

    handleScroll() {
      const cardWidth = 290;
      const scrollLeft = this.$refs.track.scrollLeft;
      const page = Math.round(scrollLeft / (cardWidth * 3));

      if (page !== this.currentPage) {
        this.currentPage = page;
      }
    },

    goToPage(index) {
      this.currentPage = index;
      this.scrollToPage();
    },

    goToDetail(id) {
      this.$router.push(`/restaurant/${id}`);
    },

    startAutoSlide() {
      this.autoSlideInterval = setInterval(() => {
        if (this.currentPage >= this.totalPages - 1) {
          this.currentPage = 0;
        } else {
          this.currentPage++;
        }
        this.scrollToPage();
      }, 5000);
    },
  },
};
</script>

<style scoped>
/* Giống hoàn toàn giao diện khuyến mãi nhưng tinh chỉnh cho nhà hàng */
.restaurant-wrapper {
  width: 90%;
  max-width: 1200px;
  margin: 60px auto;
  position: relative;
}

.title {
  font-size: 32px;
  font-weight: 800;
  margin-bottom: 30px;
  color: #2c3e50;
  position: relative;
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

.restaurant-slider {
  position: relative;
  padding: 10px;
  border-radius: 16px;
  overflow: hidden;
}

.restaurant-track {
  display: flex;
  overflow-x: auto;
  gap: 30px;
  padding: 20px 10px 30px;
  scroll-behavior: smooth;
  scroll-snap-type: x mandatory;
}

.restaurant-track::-webkit-scrollbar {
  display: none;
}

.restaurant-card {
  min-width: 260px;
  max-width: 260px;
  background: #fff;
  border-radius: 16px;
  overflow: hidden;
  cursor: pointer;
  scroll-snap-align: start;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.06);
  border: 1px solid #f0f0f0;
  transition: 0.4s;
}

.restaurant-card:hover {
  transform: translateY(-12px);
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.1);
  border-color: rgba(251, 191, 36, 0.4);
}

.restaurant-image-container {
  height: 180px;
  overflow: hidden;
}

.restaurant-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: 0.6s;
}

.restaurant-card:hover .restaurant-image {
  transform: scale(1.12);
}

.restaurant-info {
  padding: 18px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.restaurant-name {
  font-size: 18px;
  font-weight: 700;
  color: #2c3e50;
}

.restaurant-city {
  color: #64748b;
  font-size: 14px;
}

.restaurant-rating span {
  font-size: 18px;
}

.btn-detail {
  margin-top: auto;
  background: #fbbf24;
  color: white;
  border: none;
  padding: 10px 15px;
  font-weight: 600;
  border-radius: 8px;
  cursor: pointer;
  transition: 0.3s;
  display: flex;
  gap: 6px;
  justify-content: center;
  align-items: center;
}

.btn-detail:hover {
  background: #f59e0b;
  transform: translateY(-2px);
}

.nav-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 46px;
  height: 46px;
  border-radius: 50%;
  background: #fff;
  border: none;
  cursor: pointer;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  z-index: 10;
}

.left { left: -15px; }
.right { right: -15px; }

.restaurant-dots {
  margin-top: 18px;
  display: flex;
  justify-content: center;
  gap: 8px;
}

.dot {
  width: 10px;
  height: 10px;
  background: #e2e8f0;
  border-radius: 50%;
  cursor: pointer;
  transition: 0.3s;
}

.dot.active {
  background: #fbbf24;
  width: 24px;
  border-radius: 10px;
}
</style>
