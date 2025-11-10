<template>
  <section class="searchpage-page">
    <HomeHeader />

    <!-- ✅ Thanh bộ lọc -->
    <div class="searchpage-filters">
      <button class="searchpage-compare-btn">So sánh</button>

      <select v-model="selectedPrice" class="searchpage-select">
        <option value="">Giá</option>
        <option value="low">Dưới 3.000.000đ</option>
        <option value="medium">3.000.000 - 5.000.000đ</option>
        <option value="high">Trên 5.000.000đ</option>
      </select>

      <select v-model="selectedStar" class="searchpage-select">
        <option value="">Đánh giá sao</option>
        <option v-for="i in 5" :key="i" :value="i">{{ i }} sao</option>
      </select>

      <!-- ✅ Thành phố -->
      <select v-model="selectedCity" class="searchpage-select" @change="fetchWardsByCity">
        <option value="">Thành phố</option>
        <option v-for="city in cities" :key="city">{{ city }}</option>
      </select>

      <!-- ✅ Phường/Xã -->
      <select v-model="selectedWard" class="searchpage-select">
        <option value="">Phường / Xã</option>
        <option v-for="ward in wards" :key="ward">{{ ward }}</option>
      </select>

      <button class="searchpage-clear-btn" @click="clearFilters">✕</button>
    </div>

    <!-- ✅ Kết quả tìm kiếm -->
    <div class="searchpage-header">
      <div v-if="loading" class="text-gray-600 mt-4">Đang tải...</div>
      <div v-else-if="filteredResults.length === 0" class="text-gray-600 mt-4">
        Không tìm thấy kết quả nào.
      </div>

      <div v-else class="searchpage-grid">
        <div v-for="r in filteredResults" :key="r.restaurant_id" class="searchpage-card">
          <img :src="r.image_url || '/img/default-restaurant.jpg'" alt="Restaurant" />
          <div class="searchpage-card-content">
            <h3>{{ r.name }}</h3>
            <p class="searchpage-address">{{ r.ward }}, {{ r.city }}</p>
            <p class="searchpage-price">
              từ ~ {{ formatPrice(r.price_table) }}đ / bàn
            </p>
            <div class="searchpage-stars">
              <i
                v-for="i in 5"
                :key="i"
                class="fa"
                :class="i <= Math.round(r.star_rating) ? 'fa-star text-yellow-400' : 'fa-star-o text-gray-300'"
              ></i>
            </div>
            <button class="searchpage-view-btn">Xem</button>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
import axios from "axios";
import HomeHeader from "@/components/Home/HomeHeader.vue";

export default {
  name: "SearchPage",
  components: { HomeHeader },
  data() {
    return {
      keyword: this.$route.query.keyword || "",
      results: [],
      loading: false,

      // Bộ lọc
      selectedPrice: "",
      selectedStar: "",
      selectedWard: "",
      selectedCity: "",

      // ✅ Danh sách động từ database
      cities: [],
      wards: [],
    };
  },
  computed: {
    filteredResults() {
      return this.results.filter((r) => {
        if (this.selectedPrice === "low" && r.price_table > 3000000) return false;
        if (this.selectedPrice === "medium" && (r.price_table < 3000000 || r.price_table > 5000000)) return false;
        if (this.selectedPrice === "high" && r.price_table < 5000000) return false;

        if (this.selectedStar && Math.round(r.star_rating) !== parseInt(this.selectedStar)) return false;
        if (this.selectedWard && r.ward !== this.selectedWard) return false;
        if (this.selectedCity && r.city !== this.selectedCity) return false;

        return true;
      });
    },
  },
  watch: {
    "$route.query.keyword"(newVal) {
      this.keyword = newVal;
      this.fetchResults();
    },
  },
  mounted() {
    this.fetchResults();
    this.fetchCities(); // ✅ Lấy danh sách thành phố khi load trang
  },
  methods: {
    async fetchResults() {
      if (!this.keyword) return;
      this.loading = true;
      try {
        const response = await axios.get("http://localhost:8088/api/restaurants/search", {
          params: { keyword: this.keyword },
        });
        this.results = response.data;
      } catch (error) {
        console.error("Lỗi khi tải kết quả:", error);
      } finally {
        this.loading = false;
      }
    },

    /** ✅ Lấy danh sách thành phố (distinct city) từ DB */
    async fetchCities() {
      try {
        const res = await axios.get("http://localhost:8088/api/restaurants/city");
        this.cities = res.data.cities;
      } catch (error) {
        console.error("Lỗi khi tải danh sách thành phố:", error);
      }
    },

    /** ✅ Lấy danh sách phường/xã theo thành phố đã chọn */
    async fetchWardsByCity() {
      if (!this.selectedCity) {
        this.wards = [];
        return;
      }
      try {
        const res = await axios.get("http://localhost:8088/api/restaurants/ward", {
          params: { city: this.selectedCity },
        });
        this.wards = res.data.wards;

      } catch (error) {
        console.error("Lỗi khi tải danh sách phường/xã:", error);
      }
    },

    clearFilters() {
      this.selectedPrice = "";
      this.selectedStar = "";
      this.selectedWard = "";
      this.selectedCity = "";
      this.wards = [];
    },

    formatPrice(value) {
      if (!value) return "0";
      return new Intl.NumberFormat("vi-VN").format(value);
    },
  },
};
</script>

<style src="../../assets/css/search.css"></style>
