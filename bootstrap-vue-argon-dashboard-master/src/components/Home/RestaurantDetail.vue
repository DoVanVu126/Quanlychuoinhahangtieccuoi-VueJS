<template>
  <section class="restaurant-detail-page">
    <HomeHeader />

    <div class="container detail-container" v-if="!loading">
      <div v-if="error" class="text-red-600">{{ error }}</div>

      <div v-else>
        <div class="detail-header">
          <img :src="getImageUrl(restaurant.image_url)" alt="restaurant" @error="onImgError($event)" class="detail-image" />
          <div class="detail-meta">
            <h1>{{ restaurant.name }}</h1>
            <p class="muted">{{ restaurant.ward }}, {{ restaurant.city }}</p>
            <p>Giá trung bình / bàn: từ ~ {{ formatPrice(restaurant.price_table) }}đ</p>
            <p>Sức chứa: {{ restaurant.capacity || '—' }}</p>
            <p>Số sảnh: {{ getHalls(restaurant) }}</p>
            <p>Khuyến mãi: {{ getHasPromo(restaurant) ? 'Có' : 'Không' }}</p>
            <div class="detail-actions">
              <button @click="goToBooking" class="btn btn-primary">Đặt tiệc</button>
              <button @click="goBack" class="btn btn-secondary">Quay lại</button>
            </div>
          </div>
        </div>

        <div class="detail-body">
          <h3>Mô tả</h3>
          <p v-html="restaurant.description || 'Chưa có mô tả.'"></p>

          <!-- Optionally show halls list if present -->
          <div v-if="restaurant.halls && restaurant.halls.length">
            <h3>Danh sách sảnh</h3>
            <ul>
              <li v-for="(h, idx) in restaurant.halls" :key="idx">
                <strong>{{ h.name || ('Sảnh ' + (idx+1)) }}</strong> — Sức chứa: {{ h.capacity || '—' }}
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <div v-if="loading" class="text-gray-600 mt-4">Đang tải chi tiết nhà hàng...</div>
  </section>
</template>

<script>
import axios from 'axios';
import HomeHeader from '@/components/Home/HomeHeader.vue';

export default {
  name: 'RestaurantDetail',
  components: { HomeHeader },
  props: {
    id: {
      type: [String, Number],
      required: true,
    },
  },
  data() {
    return {
      restaurant: {},
      loading: true,
      error: null,
    };
  },
  mounted() {
    this.fetchRestaurant();
  },
  methods: {
    async fetchRestaurant() {
      this.loading = true;
      try {
        const res = await axios.get(`http://localhost:8088/api/restaurants/${this.id}`);
        // API may return data nested or as object; adapt accordingly
        this.restaurant = res.data.data ? res.data.data : res.data;
      } catch (err) {
        console.error('Lỗi khi tải chi tiết nhà hàng', err);
        this.error = 'Không thể tải thông tin nhà hàng. Vui lòng thử lại.';
      } finally {
        this.loading = false;
      }
    },
    goToBooking() {
      // navigate to booking page with restaurant id in query
      // BookingPage expects `restaurant_id` or `restaurantId` in the query
      this.$router.push({ name: 'DatTiec', query: { restaurant_id: this.id } });
    },
    goBack() {
      this.$router.go(-1);
    },
    formatPrice(value) {
      if (!value) return '0';
      return new Intl.NumberFormat('vi-VN').format(value);
    },
    // copy of helpers used in Search.vue
    getHalls(rest) {
      if (!rest) return '—';
      if (rest.halls_count != null) return rest.halls_count;
      if (rest.halls != null && typeof rest.halls === 'number') return rest.halls;
      if (rest.sanh != null && Array.isArray(rest.sanh)) return rest.sanh.length;
      if (rest.halls_list && Array.isArray(rest.halls_list)) return rest.halls_list.length;
      if (rest.sanhList && Array.isArray(rest.sanhList)) return rest.sanhList.length;
      if (rest.sanh_count != null) return rest.sanh_count;
      if (rest.hall_count != null) return rest.hall_count;
      if (rest.number_of_halls != null) return rest.number_of_halls;
      if (rest.count_halls != null) return rest.count_halls;
      return '—';
    },
    getHasPromo(rest) {
      if (!rest) return false;
      if (typeof rest.has_promo === 'boolean') return rest.has_promo;
      if (typeof rest.has_promotion === 'boolean') return rest.has_promotion;
      if (typeof rest.hasPromotion === 'boolean') return rest.hasPromotion;
      if (rest.active_promotions_count != null) return Number(rest.active_promotions_count) > 0;
      if (rest.active_promos_count != null) return Number(rest.active_promos_count) > 0;
      if (rest.promotion) return true;
      if (rest.promotions && Array.isArray(rest.promotions) && rest.promotions.length > 0) return true;
      if (rest.promos && Array.isArray(rest.promos) && rest.promos.length > 0) return true;
      if (rest.promo && (typeof rest.promo === 'object' || rest.promo === true)) return true;
      if (rest.discount && Number(rest.discount) > 0) return true;
      return false;
    },
    getImageUrl(url) {
      const DEFAULT = '/img/default-restaurant.jpg';
      if (!url) return DEFAULT;
      if (typeof url === 'string' && url.startsWith('http')) return url;
      if (typeof url === 'string' && url.startsWith('/')) {
        return `http://127.0.0.1:8088${url}`;
      }
      const m = String(url).match(/^([0-9a-fA-F]{3,6})\?text=(.*)$/);
      if (m) {
        const color = m[1];
        const text = m[2];
        return `https://via.placeholder.com/600x400/${color}/ffffff?text=${text}`;
      }
      if (typeof url === 'string') return `http://127.0.0.1:8088/${url.replace(/^\/+/, '')}`;
      return DEFAULT;
    },
    onImgError(e) {
      e.target.src = '/img/default-restaurant.jpg';
    },
  },
};
</script>

<style scoped>
.detail-container {
  max-width: 1000px;
  margin: 24px auto;
}
.detail-header {
  display: flex;
  gap: 20px;
}
.detail-image {
  width: 360px;
  height: 240px;
  object-fit: cover;
  border-radius: 8px;
}
.detail-meta h1 {
  margin: 0 0 8px 0;
}
.detail-actions { margin-top: 12px; }
.btn { padding: 8px 14px; border-radius: 6px; cursor: pointer; }
.btn-primary { background: #4f46e5; color: #fff; border: none; }
.btn-secondary { background: #f3f4f6; color: #111827; border: none; margin-left: 8px; }
.muted { color: #6b7280; }
</style>