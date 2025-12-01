<template>
  <div class="booking-container">
    <HomeHeader />
    <!-- ✅ Thêm Navbar của trang Home -->
    <div class="booking-content">
      <SuggestionModal v-if="showSuggestionModal" :restaurant-id="restaurants && (restaurants.restaurant_id || restaurants.id)" @apply-package="applySuggestion" @close="showSuggestionModal = false" />
      <!-- Phần nội dung đặt tiệc -->
      <RestaurantHeader :restaurants="restaurants" />
      <BookingForm
        :user="user"
        :restaurant="restaurants"
        :startDate="startDate"
        :endDate="endDate"
        :selectedHall="selectedHall"
        :selectedFoods="selectedFoods"
        :selectedServices="selectedServices"
        :suggested-event-type="suggestedEventType"
        :suggested-number-of-tables="suggestedNumberOfTables"
        @apply-package="applySuggestion"
      />
      <BookingTabs
        :halls="halls"
        @hall-selected="selectedHall = $event"
        :foods="foods"
        :services="services"
        @food-selected="onFoodSelected"
        @service-selected="onServiceSelected"
      />

    </div>
  </div>
</template>

<script>
import HomeHeader from "@/components/Home/HomeHeader.vue";
import RestaurantHeader from "@/components/booking/RestaurantHeader.vue";
import BookingForm from "@/components/booking/BookingForm.vue";
import BookingTabs from "@/components/booking/BookingTabs.vue";
import axios from 'axios';

export default {
  name: "BookingPage",
  components: {
    HomeHeader,
    RestaurantHeader,
    BookingForm,
    BookingTabs,
  },
  data() {
    return {
      restaurants: null,
      halls: [],      // ✅ Thêm
      foods: [],      // ✅ Thêm
      services: [],   // ✅ Thêm
      startDate: "",
      endDate: "",
      user: null,
      // selections
      selectedHall: null,
      selectedFoods: [],
      selectedServices: [],
      // suggestion-driven form fields
      suggestedEventType: null,
      suggestedNumberOfTables: null,
    };
  },

  

  // Apply a suggestion package: set selected hall, foods, services
  methods: {
    onFoodSelected(item) {
      if (!item || !item.food_id && !item.id) return;
      const id = item.food_id || item.id;
      const idx = this.selectedFoods.findIndex(f => (f.food_id || f.id) == id);
      if (item.selected) {
        if (idx === -1) this.selectedFoods.push(item);
        else this.$set(this.selectedFoods, idx, item);
      } else {
        if (idx !== -1) this.selectedFoods.splice(idx, 1);
      }
    },
    onServiceSelected(item) {
      if (!item || !item.service_id && !item.id) return;
      const id = item.service_id || item.id;
      const idx = this.selectedServices.findIndex(s => (s.service_id || s.id) == id);
      if (item.selected) {
        if (idx === -1) this.selectedServices.push(item);
        else this.$set(this.selectedServices, idx, item);
      } else {
        if (idx !== -1) this.selectedServices.splice(idx, 1);
      }
    },
    applySuggestion(pkg) {
      if (!pkg) return;
      // close modal
      this.showSuggestionModal = false;

      // set suggested form fields so BookingForm updates type/tables
      this.suggestedEventType = pkg.event_type || null;
      this.suggestedNumberOfTables = pkg.number_of_tables || null;

      // Apply hall
      const packageHallId = pkg.hall_id || (pkg.hall && (pkg.hall.hall_id || pkg.hall.id));
      if (packageHallId) {
        const hallIdx = this.halls.findIndex(h => (h.hall_id || h.id) == packageHallId);
        if (hallIdx !== -1) {
          // mark only this hall as selected
          this.halls.forEach((h, i) => {
            if (i === hallIdx) this.$set(this.halls, i, Object.assign({}, h, { selected: true }));
            else this.$set(this.halls, i, Object.assign({}, h, { selected: false }));
          });
          this.selectedHall = this.halls[hallIdx];
        } else {
          // hall not in list; clear selection
          this.selectedHall = null;
        }
      }

      // Apply foods
      const pkgFoodIds = new Set((pkg.foods || []).map(f => f.food_id || f.id || f.menu_id));
      this.selectedFoods = [];
      this.foods.forEach((food, idx) => {
        const fid = food.food_id || food.id || food.menu_id;
        const shouldSelect = pkgFoodIds.has(fid);
        this.$set(this.foods, idx, Object.assign({}, food, { selected: shouldSelect }));
        if (shouldSelect) this.selectedFoods.push(this.foods[idx]);
      });

      // Apply services
      const pkgServiceIds = new Set((pkg.services || []).map(s => s.service_id || s.id));
      this.selectedServices = [];
      this.services.forEach((service, idx) => {
        const sid = service.service_id || service.id;
        const shouldSelect = pkgServiceIds.has(sid);
        this.$set(this.services, idx, Object.assign({}, service, { selected: shouldSelect }));
        if (shouldSelect) this.selectedServices.push(this.services[idx]);
      });
    },
    openSuggestion() {
      this.showSuggestionModal = true;
    }
  },


  async created() {
    const userData = localStorage.getItem("user_info");
    if (userData) {
      try {
        this.user = JSON.parse(userData);
      } catch (e) {
        this.user = null;
      }
    }

    const restaurant_id = this.$route.query.restaurant_id || this.$route.query.restaurantId;
    this.startDate = this.$route.query.startDate || "";
    this.endDate = this.$route.query.endDate || "";

    if (restaurant_id) {
      try {
        // Lấy thông tin nhà hàng
        const res = await axios.get(`http://localhost:8088/api/restaurants/${restaurant_id}`);
        // API may return either the object directly or an envelope { data: {...} }
        this.restaurants = res.data && res.data.data ? res.data.data : res.data;

        // Lấy danh sách sảnh
        const hallsRes = await axios.get(`http://localhost:8088/api/restaurants/${restaurant_id}/halls`);
        this.halls = hallsRes.data && hallsRes.data.data ? hallsRes.data.data : hallsRes.data;

        // Lấy danh sách món ăn
        const foodsRes = await axios.get(`http://localhost:8088/api/restaurants/${restaurant_id}/foods`);
        this.foods = foodsRes.data && foodsRes.data.data ? foodsRes.data.data : foodsRes.data;

        // Lấy danh sách dịch vụ
        const servicesRes = await axios.get(`http://localhost:8088/api/restaurants/${restaurant_id}/services`);
        this.services = servicesRes.data && servicesRes.data.data ? servicesRes.data.data : servicesRes.data;

      } catch (err) {
        console.error("Lỗi fetch dữ liệu nhà hàng:", err);
      }
    }
  }


};
</script>

<style scoped>
.booking-container {
  background-color: #fafafa;
  min-height: 100vh;
}

.booking-content {
  padding: 10px 70px;
}
</style>
