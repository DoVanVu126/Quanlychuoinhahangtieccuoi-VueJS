<template>
  <div class="restaurant-header">
    <img :src="restaurant.image || '/images/default-restaurant.jpg'" alt="Restaurant" class="restaurant-img" />
    <div class="restaurant-info">
      <h2>{{ restaurant.name }}</h2>
      <p>Điện thoại / liên hệ: {{ restaurant.phone || '1900 998 890' }}</p>
      <p>Địa chỉ: {{ restaurant.address }}</p>
    </div>
  </div>
</template>

<script>
export default {
  name: "RestaurantHeader",
  props: ["restaurant"],
};
</script>
