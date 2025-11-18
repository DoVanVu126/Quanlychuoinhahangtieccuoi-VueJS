<template>
  <div class="hallcard-container">
    <div class="hallcard-img-wrapper">
      <img :src="hall.image" alt="Hall" class="hallcard-img" />

      <div
        v-if="hall.status === 'maintenance'"
        class="hallcard-overlay"
      >
        ĐANG BẢO TRÌ
      </div>
    </div>

    <div class="hallcard-info">
      <h4>{{ hall.name }}</h4>
      <p>{{ hall.description }}</p>
      <p>
        <strong>{{ hall.range }}</strong> &nbsp; {{ hall.price }}
      </p>

      <button
        :class="hall.selected ? 'hallcard-btn-selected' : 'hallcard-btn-select'"
        
        :disabled="hall.status === 'maintenance'" 
        @click="$emit('select', hall)"
      >
        {{ hall.selected ? 'ĐÃ CHỌN' : 'CHỌN' }}
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: "HallCard",
  props: ["hall"],
};
</script>
<style src="../../assets/css/hallcard.css"></style>