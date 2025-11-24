<template>
  <section class="searchpage-page">
    <HomeHeader />
    <!-- ✅ Kết quả tìm kiếm -->
    <div class="searchpage-header">
      <!-- ✅ Thanh bộ lọc -->
      <div class="searchpage-filters">
        <!-- Nút so sánh bên trái -->
        <button class="searchpage-compare-btn" @click="toggleCompare">So sánh</button>

        <!-- Nhóm bộ lọc bên phải -->
        <div class="searchpage-filter-group">
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

          <select v-model="selectedCity" class="searchpage-select" @change="fetchWardsByCity">
            <option value="">Thành phố</option>
            <option v-for="city in cities" :key="city">{{ city }}</option>
          </select>

          <select v-model="selectedWard" class="searchpage-select">
            <option value="">Phường / Xã</option>
            <option v-for="ward in wards" :key="ward">{{ ward }}</option>
          </select>

          <button class="searchpage-clear-btn" @click="clearFilters">✕</button>
        </div>
      </div>
      <div v-if="loading" class="text-gray-600 mt-4">Đang tải...</div>
      <div v-else-if="filteredResults.length === 0" class="text-gray-600 mt-4">
        Không tìm thấy kết quả nào.
      </div>

      <div v-else class="searchpage-grid">
        <div v-for="r in filteredResults" :key="r.restaurant_id" class="searchpage-card">
          <img :src="getImageUrl(r.image_url)" alt="Restaurant" @error="onImgError($event)" />
          <div class="searchpage-card-content">
            <h3>{{ r.name }}</h3>
            <p class="searchpage-address">{{ r.ward }}, {{ r.city }}</p>
            <p class="searchpage-price">
              từ ~ {{ formatPrice(r.price_table) }}đ / bàn
            </p>
            <div class="searchpage-stars">
              <i v-for="i in 5" :key="i" class="fa"
                :class="i <= Math.round(r.star_rating) ? 'fa-star text-yellow-400' : 'fa-star-o text-gray-300'"></i>
            </div>
            <button class="searchpage-view-btn" @click="showCompare ? selectRestaurant(r) : viewRestaurant(r)">
              {{ showCompare ? 'Chọn' : 'Xem' }}
            </button>

          </div>
        </div>
      </div>
    </div>
    <!-- ✅ Hộp thoại so sánh trượt từ bên phải -->
    <transition name="slide-compare">
      <div v-if="showCompare" class="compare-panel">
        <h3 class="compare-title">Chỉ so sánh 2 nhà hàng</h3>
        <div class="compare-selects">
          <div class="compare-item">
            <span>1</span>
            <div class="compare-slot">
              <div v-if="selectedCompareRestaurants[0]" class="compare-selected">
                <div class="compare-name">{{ selectedCompareRestaurants[0].name }}</div>
                <button class="btn-delete" @click="clearSlot(0)">Xóa</button>
              </div>
              <div v-else class="compare-empty">Chưa chọn — nhấn 'Chọn' trên thẻ</div>
            </div>

            
          </div>
          <div class="compare-item">
            <span>2</span>
            <div class="compare-slot">
              <div v-if="selectedCompareRestaurants[1]" class="compare-selected">
                <div class="compare-name">{{ selectedCompareRestaurants[1].name }}</div>
                <button class="btn-delete" @click="clearSlot(1)">Xóa</button>
              </div>
              <div v-else class="compare-empty">Chưa chọn — nhấn 'Chọn' trên thẻ</div>
            </div>

            
          </div>
        </div>
        <div class="compare-actions">
          <button class="btn-cancel" @click="cancelCompare">Hủy</button>
          <button class="btn-start" @click="startCompare" :disabled="!canCompare">Bắt đầu</button>
        </div>
      </div>
    </transition>

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

      // ✅ Thêm cho chức năng So sánh
      showCompare: false,
      compareSelection: [null, null],
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

    /** Kiểm tra đủ 2 nhà hàng mới bật nút "Bắt đầu" */
    canCompare() {
      return (
        this.compareSelection[0] != null &&
        this.compareSelection[1] != null &&
        this.compareSelection[0] !== this.compareSelection[1]
      );
    },

    /** Map selected ids -> restaurant objects for easy rendering (loose equality to tolerate string/number ids) */
    selectedCompareRestaurants() {
      return this.compareSelection.map((id) => this.results.find((r) => r.restaurant_id == id) || null);
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

    // ================================
    // ✅ CÁC HÀM MỚI THÊM CHO SO SÁNH
    // ================================
    toggleCompare() {
      this.showCompare = !this.showCompare;
      this.compareSelection = [null, null];
    },
    cancelCompare() {
      this.showCompare = false;
      this.compareSelection = [null, null];
    },
    startCompare() {
      const [a, b] = this.selectedCompareRestaurants;
      console.log("So sánh giữa:", a, b);
      if (a && b) alert(`So sánh ${a.name} và ${b.name}`);
    },
    viewRestaurant(r) {
      console.log("Xem nhà hàng:", r);
    },
    selectRestaurant(r) {
      // Debug info
      console.log("selectRestaurant called", r && r.restaurant_id, "current slots", this.compareSelection, "results count", this.results.length);

      // select by id and use $set to ensure reactivity
      const id = r && r.restaurant_id;
      if (!id) return;

      if (this.compareSelection[0] == null) {
        this.$set(this.compareSelection, 0, id);
        return;
      }

      if (this.compareSelection[1] == null && this.compareSelection[0] != id) {
        this.$set(this.compareSelection, 1, id);
        return;
      }

      if (this.compareSelection[0] == id || this.compareSelection[1] == id) {
        alert("Đã chọn nhà hàng này rồi.");
        return;
      }

      alert("Chỉ có thể chọn tối đa 2 nhà hàng để so sánh!");
    },
    clearSlot(index) {
      if (index === 0 || index === 1) this.$set(this.compareSelection, index, null);
    },
    /** Normalize image URL values from backend and provide placeholder when needed */
    getImageUrl(url) {
      const DEFAULT = "/img/default-restaurant.jpg";
      if (!url) return DEFAULT;
      // already full URL
      if (typeof url === "string" && url.startsWith("http")) return url;

      // relative path from backend (e.g. "uploads/...")
      if (typeof url === "string" && url.startsWith("/")) {
        return `http://127.0.0.1:8088${url}`;
      }

      // handle cases like "009900?text=restaurant+Nh%C3%A0+h%C3%A0ng+illo"
      // expect color?text=... where color is hex without leading #
      const m = String(url).match(/^([0-9a-fA-F]{3,6})\?text=(.*)$/);
      if (m) {
        const color = m[1];
        const text = m[2];
        // via.placeholder.com requires size; use 300x200 and white text color
        return `https://via.placeholder.com/300x200/${color}/ffffff?text=${text}`;
      }

      // fallback: if looks like a path without leading slash, assume backend host
      if (typeof url === "string") return `http://127.0.0.1:8088/${url.replace(/^\/+/, "")}`;

      return DEFAULT;
    },

    onImgError(e) {
      e.target.src = '/img/default-restaurant.jpg';
    },
  },
};
</script>


<style src="../../assets/css/search.css"></style>
