<template>
  <div class="booking-container">
    <HomeHeader />
    <!-- ✅ Thêm Navbar của trang Home -->
    <div class="booking-content">
      <!-- Phần nội dung đặt tiệc -->
      <RestaurantHeader :restaurants="restaurants" />
      <BookingForm :user="user" :restaurant="restaurants" :startDate="startDate" :endDate="endDate" />
      <BookingTabs :halls="halls" :foods="foods" :services="services" />

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
    };
  },

  async created() {
    const userData = localStorage.getItem("user");
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
        this.restaurants = res.data;

        // Lấy danh sách sảnh
        const hallsRes = await axios.get(`http://localhost:8088/api/restaurants/${restaurant_id}/halls`);
        this.halls = hallsRes.data;

        // Lấy danh sách món ăn
        const foodsRes = await axios.get(`http://localhost:8088/api/restaurants/${restaurant_id}/foods`);
        this.foods = foodsRes.data;

        // Lấy danh sách dịch vụ
        const servicesRes = await axios.get(`http://localhost:8088/api/restaurants/${restaurant_id}/services`);
        this.services = servicesRes.data;

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
