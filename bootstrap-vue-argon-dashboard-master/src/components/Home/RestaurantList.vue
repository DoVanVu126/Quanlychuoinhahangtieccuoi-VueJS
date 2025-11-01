<template>
  <section class="restaurant-list">
    <h2 class="restaurant-list__title">Những nhà hàng nổi tiếng</h2>

    <div class="restaurant-list__slider">
      <!-- Nút trái -->
      <button 
        class="restaurant-list__slider-btn restaurant-list__slider-btn--left"
        @click="prevSlide"
        :disabled="currentIndex === 0"
      >
        <i class="fa fa-chevron-left"></i>
      </button>

      <!-- Danh sách có hiệu ứng -->
      <transition-group
        name="slide"
        tag="div"
        class="restaurant-list__grid"
        :class="slideDirection"
      >
        <div
          v-for="r in visibleRestaurants"
          :key="r.restaurant_id"
          class="restaurant-list__card"
        >
          <img :src="r.image_url" alt="" class="restaurant-list__image" />
          <div class="restaurant-list__info">
            <h3>{{ r.name }}</h3>
            <p>{{ r.city }}</p>
            <div class="restaurant-list__rating">
              <span
                v-for="i in 5"
                :key="i"
                :style="{ color: i <= Math.round(r.star_rating) ? '#facc15' : '#ccc' }"
              >★</span>
            </div>
          </div>
        </div>
      </transition-group>

      <!-- Nút phải -->
      <button 
        class="restaurant-list__slider-btn restaurant-list__slider-btn--right"
        @click="nextSlide"
        :disabled="currentIndex + 4 >= restaurants.length"
      >
        <i class="fa fa-chevron-right"></i>
      </button>
    </div>

    <div class="restaurant-list__footer">
      <button class="restaurant-list__btn" @click="goToAllRestaurants">Xem thêm</button>
    </div>
  </section>
</template>

<script>
import api from '@/axios';

export default {
  name: "RestaurantList",
  data() {
    return {
      restaurants: [],
      currentIndex: 0,
      slideDirection: "slide-next",
    };
  },
  computed: {
    visibleRestaurants() {
      return this.restaurants.slice(this.currentIndex, this.currentIndex + 4);
    },
  },
  mounted() {
    this.fetchRestaurants();
  },
  methods: {
    async fetchRestaurants() {
      try {
        const response = await api.get('/top-restaurants');
        this.restaurants = response.data;
      } catch (error) {
        console.error("Lỗi khi tải danh sách nhà hàng:", error);
      }
    },
    nextSlide() {
      if (this.currentIndex + 4 < this.restaurants.length) {
        this.slideDirection = "slide-next";
        this.currentIndex += 4;
      }
    },
    prevSlide() {
      if (this.currentIndex > 0) {
        this.slideDirection = "slide-prev";
        this.currentIndex -= 4;
      }
    },
    goToAllRestaurants() {
      this.$router.push('/restaurants');
    },
  },
};
</script>

<style src="../../assets/css/restaurant-list.css"></style>
