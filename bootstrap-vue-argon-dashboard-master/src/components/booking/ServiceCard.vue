<template>
  <div class="servicecard-container">
    <div class="servicecard-img-wrapper">
      <img :src="service.image_url" alt="Service" class="servicecard-img" />
    </div>

    <div class="servicecard-info">
      <h4>{{ service.name }}</h4>
      <p>{{ service.description }}</p>
      <p class="servicecard-price">Giá: {{ service.price }} VNĐ</p>

      <button
        :class="service.selected ? 'servicecard-btn-selected' : 'servicecard-btn-select'"
        @click="$emit('select', service)"
      >
        {{ service.selected ? "ĐÃ CHỌN" : "CHỌN" }}
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: "ServiceCard",
  props: { service: Object },
};
</script>

<style src="../../assets/css/servicecard.css"></style>
