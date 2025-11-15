<template>
  <div class="booking-tabs-container">
    <div class="booking-tabs-header">
      <button :class="{ active: activeTab === 'sanh' }" @click="activeTab = 'sanh'">SẢNH</button>
      <button :class="{ active: activeTab === 'monan' }" @click="activeTab = 'monan'">MÓN ĂN</button>
      <button :class="{ active: activeTab === 'dichvu' }" @click="activeTab = 'dichvu'">DỊCH VỤ</button>
    </div>

    <div class="booking-tab-content">
      <div v-if="activeTab === 'sanh'" class="hall-card-list">
        <HallCard
          v-for="hall in halls"
          :key="hall.hall_id"
          :hall="hall"
          @select="selectHall"
        />
        <div v-if="halls.length === 0">Chưa có sảnh nào.</div>
      </div>

      <div v-if="activeTab === 'monan'">
        <div v-if="foods.length === 0">Chưa có món ăn nào.</div>
        <div v-else class="food-list">
          <div v-for="food in foods" :key="food.food_id" class="food-card">
            <img :src="food.image_url" alt="" />
            <h4>{{ food.name }}</h4>
            <p>{{ food.description }}</p>
            <p>Đơn vị: {{ food.unit }}</p>
          </div>
        </div>
      </div>

      <div v-if="activeTab === 'dichvu'">
        <div v-if="services.length === 0">Chưa có dịch vụ nào.</div>
        <div v-else class="service-list">
          <div v-for="service in services" :key="service.service_id" class="service-card">
            <img :src="service.image_url" alt="" />
            <h4>{{ service.name }}</h4>
            <p>{{ service.description }}</p>
            <p>Giá: {{ service.price }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import HallCard from "./HallCard.vue";

export default {
  name: "BookingTabs",
  components: { HallCard },
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
  },
};
</script>

<style scoped>
.booking-tabs-container {
    margin: 20px auto;            /* căn giữa */
    width: 60%;                   /* chiếm 60% màn hình */
    height: 500px;                /* chiều cao cố định */
    display: flex;
    flex-direction: column;
    gap: 15px;
    border: 2px solid #000;       /* viền màu đen */
    border-radius: 12px;          /* bo góc container */
    padding: 15px;
    background-color: #fff;       /* nền trắng */
    overflow: hidden;
}

/* Header Tabs */
.booking-tabs-header {
    display: flex;
    justify-content: flex-start;
    gap: 0;
}

.booking-tabs-header button {
    padding: 10px 30px;
    border: none;
    background-color: transparent;
    cursor: pointer;
    font-weight: 500;
    color: #333;
    font-size: 16px;
    text-transform: uppercase;
}

/* Tab active */
.booking-tabs-header button.active {
    background-color: #3b82f6;
    color: white;
    font-weight: bold;
    border-radius: 8px;
}

/* Nội dung Tab */
.booking-tab-content {
    display: flex;
    flex-direction: column;
    gap: 15px;
    padding-top: 15px;
    overflow-y: auto;
}

/* Hall Card List */
.hall-card-list {
    display: flex;
    flex-direction: column;
    gap: 20px;
}

/* Food & Service List */
.food-list, .service-list {
    display: flex;
    flex-wrap: wrap;
    gap: 15px;
}

.food-card, .service-card {
    border: 2px solid #000;   /* viền màu đen */
    border-radius: 8px;       /* bo góc */
    padding: 10px;
    width: 200px;
    background-color: #fff;
}

.food-card img, .service-card img {
    width: 100%;
    height: 120px;
    object-fit: cover;
    border-radius: 8px;
    margin-bottom: 5px;
}
</style>
