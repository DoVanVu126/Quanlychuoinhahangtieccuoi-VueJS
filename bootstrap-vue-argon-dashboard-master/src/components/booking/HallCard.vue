<template>
  <div class="hall-card">
    <img :src="hall.image" alt="Hall" />
    <div class="hall-info">
      <h4>{{ hall.name }}</h4>
      <p>{{ hall.description }}</p>
      <p><strong>{{ hall.range }}</strong> | {{ hall.price }}</p>
      <button
        :class="hall.selected ? 'btn-selected' : 'btn-select'"
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
