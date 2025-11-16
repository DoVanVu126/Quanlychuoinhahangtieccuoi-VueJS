<template>
  <div class="booking-tabs-container">
    <div class="booking-tabs-header">
      <button :class="{ active: activeTab === 'sanh' }" @click="activeTab = 'sanh'">SẢNH</button>
      <button :class="{ active: activeTab === 'monan' }" @click="activeTab = 'monan'">MÓN ĂN</button>
      <button :class="{ active: activeTab === 'dichvu' }" @click="activeTab = 'dichvu'">DỊCH VỤ</button>
    </div>

    <div class="booking-tab-content">
      <div v-if="activeTab === 'sanh'" class="hall-card-list">
        <HallCard v-for="hall in halls" :key="hall.hall_id" :hall="hall" @select="selectHall" />
        <div v-if="halls.length === 0">Chưa có sảnh nào.</div>
      </div>

      <div v-if="activeTab === 'monan'" class="food-list">
        <FoodCard v-for="food in foods" :key="food.food_id" :food="food" @select="selectFood" />
        <div v-if="foods.length === 0">Chưa có món ăn nào.</div>
      </div>


      <div v-if="activeTab === 'dichvu'" class="service-list">
        <ServiceCard v-for="service in services" :key="service.service_id" :service="service" @select="selectService" />
        <div v-if="services.length === 0">Chưa có dịch vụ nào.</div>
      </div>

    </div>
  </div>
</template>

<script>
import HallCard from "./HallCard.vue";
import FoodCard from "./FoodCard.vue";
import ServiceCard from "./ServiceCard.vue";


export default {
  name: "BookingTabs",
  components: { HallCard, FoodCard, ServiceCard },
  props: {
    halls: { type: Array, default: () => [] },
    foods: { type: Array, default: () => [] },
    services: { type: Array, default: () => [] },
  },
  data() {
    return {
      activeTab: "sanh",
    };
  },
  methods: {
    selectHall(selectedHall) {
      this.halls.forEach((h) => (h.selected = false));
      selectedHall.selected = true;
      this.$emit("hall-selected", selectedHall);
    },
    selectFood(selectedFood) {
      this.foods.forEach((f) => (f.selected = false));
      selectedFood.selected = true;
      this.$emit("food-selected", selectedFood);
    },
    selectService(selectedService) {
      this.services.forEach((s) => (s.selected = false));
      selectedService.selected = true;
      this.$emit("service-selected", selectedService);
    },

  },
};
</script>
<style src="../../assets/css/booking-tabs.css"></style>