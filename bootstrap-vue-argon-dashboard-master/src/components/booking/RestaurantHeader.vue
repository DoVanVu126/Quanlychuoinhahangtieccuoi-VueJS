<template>
  <div v-if="restaurants" class="booking-restaurantpage-header">
    <img
      :src="restaurants.image_url || '/images/default-restaurant.jpg'"
      alt="Restaurant"
      class="booking-restaurantpage-img"
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
};
</script>

<style src="../../assets/css/booking-restaurant-header.css"></style>
