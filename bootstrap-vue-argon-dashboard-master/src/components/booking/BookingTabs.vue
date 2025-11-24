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

      <div v-if="activeTab === 'monan'" class="food-list-container">

        <!-- ⬇ 5 tab con -->
        <div class="food-type-tabs">
          <button :class="{ active: activeFoodTypeId === 1 }" @click="activeFoodTypeId = 1">Khai vị</button>
          <button :class="{ active: activeFoodTypeId === 2 }" @click="activeFoodTypeId = 2">Món chính</button>
          <button :class="{ active: activeFoodTypeId === 5 }" @click="activeFoodTypeId = 5">Lẩu</button>
          <button :class="{ active: activeFoodTypeId === 3 }" @click="activeFoodTypeId = 3">Tráng miệng</button>
          <button :class="{ active: activeFoodTypeId === 4 }" @click="activeFoodTypeId = 4">Đồ uống</button>
        </div>

        <!-- ⬇ danh sách món ăn theo loại đã chọn -->
        <div class="food-list">
          <FoodCard v-for="food in filteredFoods" :key="food.food_id" :food="food" @select="selectFood" />
          <div v-if="filteredFoods.length === 0">Chưa có món ăn nào.</div>
        </div>
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
      activeFoodTypeId: 1,
    };
  }
  ,
  methods: {
    selectHall(clickedHall) {
      const idx = this.halls.findIndex((h) => h.hall_id === clickedHall.hall_id);
      if (idx === -1) return;

      const currentlySelectedIdx = this.halls.findIndex((h) => h.selected);

      // If clicking the currently selected hall -> deselect
      if (currentlySelectedIdx === idx) {
        const newObj = Object.assign({}, this.halls[idx], { selected: false });
        this.$set(this.halls, idx, newObj);
        this.$emit('hall-selected', null);
        return;
      }

      // If another hall already selected -> warn
      if (currentlySelectedIdx !== -1 && currentlySelectedIdx !== idx) {
        alert('Bạn đã chọn sảnh rồi!');
        return;
      }

      // Select this hall and ensure others are unselected
      this.halls.forEach((h, i) => {
        if (i === idx) this.$set(this.halls, i, Object.assign({}, h, { selected: true }));
        else this.$set(this.halls, i, Object.assign({}, h, { selected: false }));
      });
      this.$emit('hall-selected', this.halls[idx]);
    }
    ,
    selectFood(selectedFood) {
      // toggle selection for foods (allow multiple) — update the array so reactivity is guaranteed
      const idx = this.foods.findIndex((f) => f.food_id === selectedFood.food_id);
      if (idx === -1) return;
      const newObj = Object.assign({}, this.foods[idx], { selected: !Boolean(this.foods[idx].selected) });
      this.$set(this.foods, idx, newObj);
      this.$emit('food-selected', newObj);
    },

    selectService(selectedService) {
      // toggle selection for services (allow multiple) — update the array so reactivity is guaranteed
      const idx = this.services.findIndex((s) => s.service_id === selectedService.service_id);
      if (idx === -1) return;
      const newObj = Object.assign({}, this.services[idx], { selected: !Boolean(this.services[idx].selected) });
      this.$set(this.services, idx, newObj);
      this.$emit('service-selected', newObj);
    }
  }

  ,
  computed: {
    filteredFoods() {
      return this.foods.filter(food => food.food_type_id === this.activeFoodTypeId);
    }
  }

};
</script>
<style src="../../assets/css/booking-tabs.css"></style>