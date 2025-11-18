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
      hallsData: [...this.halls],
      activeTab: "sanh",
      activeFoodTypeId: 1
    };
  }
  ,
  methods: {
    selectHall(clickedHall) {
      const selectedHall = this.hallsData.find(h => h.selected);

      // Nếu click lại hall đang chọn -> bỏ chọn
      if (selectedHall && selectedHall.hall_id === clickedHall.hall_id) {
        clickedHall.selected = false;
        this.$emit("hall-selected", null);
        return;
      }

      // Nếu đã có hall khác đang chọn -> cảnh báo
      if (selectedHall && selectedHall.hall_id !== clickedHall.hall_id) {
        alert("Bạn đã chọn sảnh rồi!");
        return;
      }

      // Chưa chọn hall nào -> chọn hall
      clickedHall.selected = true;
      this.$emit("hall-selected", clickedHall);
    }
    ,
    selectFood(selectedFood) {
      this.foods.forEach(f => f.selected = false);
      selectedFood.selected = true;
      this.$emit("food-selected", selectedFood);
    },

    selectService(selectedService) {
      this.services.forEach(s => s.selected = false);
      selectedService.selected = true;
      this.$emit("service-selected", selectedService);
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