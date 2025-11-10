<template>
  <div class="booking-container">
    <!-- ✅ Thêm Navbar của trang Home -->
    <HomeHeader />

    <!-- Phần nội dung đặt tiệc -->
    <RestaurantHeader :restaurant="restaurant" />
    <BookingForm />
    <BookingTabs />
  </div>
</template>

<script>
import HomeHeader from '@/components/Home/HomeHeader.vue';
import RestaurantHeader from "@/components/booking/RestaurantHeader.vue";
import BookingForm from "@/components/booking/BookingForm.vue";
import BookingTabs from "@/components/booking/BookingTabs.vue";

export default {
  name: "BookingPage",
  props: ["restaurant", "startDate", "endDate"],
  components: {
    HomeHeader,       // ✅ thêm vào components
    RestaurantHeader,
    BookingForm,
    BookingTabs,
  },
};
</script>

<style scoped>
.booking-container {
  background-color: #fafafa;
  min-height: 100vh;
}
</style>
