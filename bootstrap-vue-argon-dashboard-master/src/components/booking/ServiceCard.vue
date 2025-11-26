<template>
  <div class="service-checkbox-container" @click="$emit('select', service)">
    <div class="checkbox-square" :class="{ checked: service.selected }"></div>
    <span class="service-label">{{ service.name }}</span>
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
