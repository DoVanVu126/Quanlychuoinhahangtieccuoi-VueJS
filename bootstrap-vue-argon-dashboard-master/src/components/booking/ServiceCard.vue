<template>
  <div class="servicecard-container">
    <div class="servicecard-img-wrapper">
      <img :src="service.image_url || '/images/default-service.jpg'" alt="Service" class="servicecard-img" />

      <!-- Khi bị khoá / không khả dụng -->
      <div v-if="service.status === 'locked' || service.status === 'maintenance'" class="servicecard-overlay">
        {{ service.status === 'locked' ? 'ĐÃ ĐƯỢC CHỌN' : 'ĐANG BẢO TRÌ' }}
      </div>
    </div>

    <div class="servicecard-info">
      <h4>{{ service.name }}</h4>
      <p>{{ service.description }}</p>
      <p class="servicecard-price">Giá: {{ service.price }} VNĐ</p>

      <button
        :class="service.selected ? 'servicecard-btn-selected' : 'servicecard-btn-select'"
        :disabled="service.status === 'locked' || service.status === 'maintenance'"
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
  props: {
    service: { type: Object, required: true },
  },
};
</script>

<style src="../../assets/css/servicecard.css"></style>
