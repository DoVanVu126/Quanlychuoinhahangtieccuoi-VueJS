<template>
  <div class="tab-container">
    <div class="tabs">
      <button :class="{ active: activeTab === 'sanh' }" @click="activeTab = 'sanh'">SẢNH</button>
      <button :class="{ active: activeTab === 'monan' }" @click="activeTab = 'monan'">MÓN ĂN</button>
      <button :class="{ active: activeTab === 'dichvu' }" @click="activeTab = 'dichvu'">DỊCH VỤ</button>
    </div>

    <div class="tab-content">
      <div v-if="activeTab === 'sanh'">
        <HallCard
          v-for="hall in halls"
          :key="hall.id"
          :hall="hall"
          @select="selectHall"
        />
      </div>

      <div v-if="activeTab === 'monan'">
        <p>Danh sách món ăn sẽ được thêm ở đây...</p>
      </div>

      <div v-if="activeTab === 'dichvu'">
        <p>Các dịch vụ phụ trợ sẽ được hiển thị tại đây...</p>
      </div>
    </div>
  </div>
</template>

<script>
import HallCard from "./HallCard.vue";

export default {
  name: "BookingTabs",
  components: { HallCard },
  data() {
    return {
      activeTab: "sanh",
      halls: [
        {
          id: 1,
          name: "Pollux",
          description: "Sảnh Pollux được thiết kế sang trọng, trần cao 9m.",
          range: "50 – 100 bàn",
          price: "30 triệu VND/buổi",
          image: "/images/hall1.jpg",
          selected: true,
        },
        {
          id: 2,
          name: "Castor",
          description: "Sảnh chính tầng 5 GEM Center, ấm cúng và tinh tế.",
          range: "20 – 50 bàn",
          price: "20 triệu VND/buổi",
          image: "/images/hall2.jpg",
          selected: false,
        },
      ],
    };
  },
  methods: {
    selectHall(selectedHall) {
      this.halls.forEach((h) => (h.selected = false));
      selectedHall.selected = true;
    },
  },
};
</script>
