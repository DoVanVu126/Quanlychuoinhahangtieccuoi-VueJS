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
            <p class="muted"><i class="fa fa-map-marker detail-icon" aria-hidden="true"></i>{{ restaurant.ward }}, {{ restaurant.city }}</p>
            <p><i class="fa fa-tag detail-icon" aria-hidden="true"></i><span class="price-label">Giá trung bình / bàn:</span> từ ~ {{ formatPrice(restaurant.price_table) }}đ</p>
            <p><i class="fa fa-users detail-icon" aria-hidden="true"></i>Sức chứa: {{ restaurant.capacity || '—' }}</p>
            <p><i class="fa fa-building detail-icon" aria-hidden="true"></i>Số sảnh: {{ getHalls(restaurant) }}</p>
            <p><i class="fa fa-gift detail-icon" aria-hidden="true"></i>Khuyến mãi: {{ getHasPromo(restaurant) ? 'Có' : 'Không' }}</p>
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

    <div v-if="loading" class="detail-loading">
      <div class="detail-spinner" aria-hidden="true"></div>
      <div class="detail-loading-text">Đang tải chi tiết nhà hàng...</div>
    </div>
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
/* Luxurious, elegant styling for Restaurant detail page */
.detail-container {
  max-width: 1100px;
  margin: 36px auto;
  padding: 28px;
  background: linear-gradient(180deg, rgba(255,255,255,0.92), rgba(250,250,250,0.86));
  border-radius: 14px;
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.12);
  border: 1px solid rgba(16,24,40,0.04);
}

.detail-header {
  display: flex;
  gap: 28px;
  align-items: flex-start;
}

.detail-image {
  width: 420px;
  height: 280px;
  object-fit: cover;
  border-radius: 12px;
  box-shadow: 0 14px 40px rgba(17,24,39,0.18);
  border: 1px solid rgba(255, 215, 0, 0.06); /* subtle gold edge */
  transition: transform 240ms ease, box-shadow 240ms ease;
}
.detail-image:hover {
  transform: translateY(-4px) scale(1.01);
  box-shadow: 0 20px 50px rgba(17,24,39,0.22);
}

.detail-meta {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.detail-meta h1 {
  margin: 0 0 6px 0;
  font-size: 28px;
  letter-spacing: 0.6px;
  color: #0f172a; /* deep slate */
  font-weight: 700;
}

.detail-meta p { margin: 2px 0; color: #374151; }
.detail-meta p.muted { color: #6b7280; font-style: italic; }

.price-label { color: #b08b3b; font-weight: 700; } /* warm gold */

.detail-actions { margin-top: 18px; display:flex; gap:10px; align-items:center; }
.btn { padding: 10px 18px; border-radius: 10px; cursor: pointer; font-weight:600; transition: all 180ms ease; border: 1px solid transparent; }
.btn-primary {
  background: linear-gradient(90deg,#2b2b7a,#5a50ff);
  color: #fff;
  border-color: rgba(255,215,0,0.08);
  box-shadow: 0 8px 20px rgba(79,70,229,0.18);
}
.btn-primary:hover { transform: translateY(-2px); box-shadow: 0 12px 30px rgba(79,70,229,0.22); }
.btn-secondary {
  background: transparent;
  color: #0f172a;
  border: 1px solid rgba(15,23,42,0.06);
  margin-left: 0;
}
.btn-secondary:hover { background: rgba(15,23,42,0.02); transform: translateY(-2px); }

.muted { color: #6b7280; }

.detail-body {
  margin-top: 26px;
  padding-top: 22px;
  border-top: 1px solid rgba(15,23,42,0.04);
}
.detail-body h3 {
  margin: 0 0 10px 0;
  font-size: 18px;
  letter-spacing: 1px;
  color: #111827;
  text-transform: uppercase;
  font-weight: 700;
}
.detail-body p {
  color: #374151;
  line-height: 1.75;
}

.detail-body ul { padding-left: 18px; margin-top: 8px; }
.detail-body li { margin-bottom: 8px; color: #374151; }

/* Responsive tweaks */
@media (max-width: 880px) {
  .detail-header { flex-direction: column; align-items: center; }
  .detail-image { width: 100%; height: 220px; }
  .detail-container { padding: 20px; }
  .detail-meta h1 { text-align: center; }
  .detail-actions { justify-content: center; }
}

/* Loading spinner for detail page */
.detail-loading { display:flex; flex-direction:column; align-items:center; justify-content:center; padding:48px 12px; }
.detail-loading-text { margin-top:12px; color:#374151; font-weight:600; }
.detail-spinner {
  width: 44px;
  height: 44px;
  border: 4px solid rgba(0,0,0,0.08);
  border-top-color: rgba(176,139,59,0.95); /* warm gold */
  border-radius: 50%;
  animation: detail-spin 0.85s linear infinite;
}
@keyframes detail-spin { to { transform: rotate(360deg); } }

/* Icons near data labels */
.detail-icon { color: #b08b3b; margin-right: 8px; font-size: 16px; width: 18px; text-align:center; }

</style>