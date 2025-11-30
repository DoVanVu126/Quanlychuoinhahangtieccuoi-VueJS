<template>
  <div v-if="restaurants" class="booking-restaurantpage-header">
    <img
      :src="restaurantImageUrl(restaurants)"
      alt="Restaurant"
      class="booking-restaurantpage-img"
      @error="onImgError($event)"
    />

    <div class="booking-restaurantpage-info">
      <h2 class="booking-restaurantpage-name">{{ restaurants.name }}</h2>

      <p class="booking-restaurantpage-contact">
        Điện thoại / liên hệ: {{ restaurants.phone || '1900 998 890' }}
      </p>

      <p class="booking-restaurantpage-address">
        Địa chỉ:
        {{
          restaurants.ward && restaurants.city
            ? restaurants.ward + ', ' + restaurants.city
            : restaurants.city || 'Đang cập nhật'
        }}
      </p>
    </div>
  </div>

  <div v-else>
    Đang tải thông tin nhà hàng...
  </div>
</template>

<script>
export default {
  name: "RestaurantHeader",
  props: ["restaurants"],
  methods: {
    restaurantImageUrl(rest) {
      const DEFAULT = '/images/default.png';
      if (!rest) return DEFAULT;
      const val = String(rest.image_url || rest.image || '').trim();
      if (!val) return DEFAULT;

      // absolute URL or data URI
      if (/^(data:|https?:)\/\//i.test(val)) return val;
      if (/^\/\//.test(val)) return val; // protocol-relative

      // clean up stored path
      let clean = val.replace(/^public\//i, '').replace(/^\/+/, '');
      if (!clean.includes('/')) clean = 'uploads/restaurants/' + clean;

      // prefer configured backend URL (useful during dev when frontend runs on different port)
      // fallback to the backend host used elsewhere in the app (127.0.0.1:8088) to match Search.vue behaviour
      const backend = (process.env.VUE_APP_BACKEND_URL || 'http://127.0.0.1:8088').replace(/\/+$/, '');
      return backend + '/' + clean.replace(/^\/+/, '');
    },
    onImgError(e) {
      e.target.src = '/images/default.png';
    }
  }
};
</script>

<style src="../../assets/css/booking-restaurant-header.css"></style>
