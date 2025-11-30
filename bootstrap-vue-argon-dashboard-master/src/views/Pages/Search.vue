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
      <div v-if="loading" class="loading-overlay" aria-hidden="false">
        <div class="loading-spinner" role="status" aria-label="Đang tải"></div>
      </div>
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
        <div class="compare-selects">
          <div class="compare-item">
            <span>1</span>
            <div class="compare-slot">
              <div v-if="selectedCompareRestaurants[0]" class="compare-selected">
                <img :src="getImageUrl(selectedCompareRestaurants[0].image_url)" alt="thumb" @error="onImgError($event)" />
                <div class="compare-name">{{ selectedCompareRestaurants[0].name }}</div>
                <button class="btn-delete" @click="clearSlot(0)">x</button>
              </div>
              <div v-else class="compare-empty">Chưa chọn — nhấn 'Chọn' trên thẻ</div>
            </div>
          </div>
          <div class="compare-item">
            <span>2</span>
            <div class="compare-slot">
              <div v-if="selectedCompareRestaurants[1]" class="compare-selected">
                <img :src="getImageUrl(selectedCompareRestaurants[1].image_url)" alt="thumb" @error="onImgError($event)" />
                <div class="compare-name">{{ selectedCompareRestaurants[1].name }}</div>
                <button class="btn-delete" @click="clearSlot(1)">x</button>
              </div>
              <div v-else class="compare-empty">Chưa chọn — nhấn 'Chọn' trên thẻ</div>
            </div>
          </div>
        </div>
        <div class="compare-actions">
          <h3 class="compare-title">Chỉ so sánh 2 nhà hàng</h3>
          <button class="btn-cancel" @click="cancelCompare">Hủy</button>
          <button class="btn-start" @click="startCompare" :disabled="!canCompare">Bắt đầu</button>
        </div>
      </div>
    </transition>

    <!-- Detailed compare modal -->
    <transition name="fade">
      <div v-if="showCompareResult" class="compare-result-overlay">
        <div class="compare-result-modal">
          <button class="compare-close" @click="closeCompareResult">✕</button>
          <div class="compare-result-header">
            <div class="col">{{ selectedCompareRestaurants[0] ? selectedCompareRestaurants[0].name : '' }}</div>
            <div class="col">{{ selectedCompareRestaurants[1] ? selectedCompareRestaurants[1].name : '' }}</div>
          </div>
          <div class="compare-result-body">
            <div class="compare-row">
              <div class="compare-label">Địa chỉ</div>
              <div class="compare-value">{{ selectedCompareRestaurants[0] ? (selectedCompareRestaurants[0].ward + ', ' + selectedCompareRestaurants[0].city) : '' }}</div>
              <div class="compare-value">{{ selectedCompareRestaurants[1] ? (selectedCompareRestaurants[1].ward + ', ' + selectedCompareRestaurants[1].city) : '' }}</div>
            </div>
            <div class="compare-row">
              <div class="compare-label">Sức chứa</div>
              <div class="compare-value">{{ selectedCompareRestaurants[0] ? (selectedCompareRestaurants[0].capacity || '—') : '' }}</div>
              <div class="compare-value">{{ selectedCompareRestaurants[1] ? (selectedCompareRestaurants[1].capacity || '—') : '' }}</div>
            </div>
            <div class="compare-row">
              <div class="compare-label">Giá trung bình / bàn</div>
              <div class="compare-value">{{ selectedCompareRestaurants[0] ? 'từ ~ ' + formatPrice(selectedCompareRestaurants[0].price_table) + 'đ / bàn' : '' }}</div>
              <div class="compare-value">{{ selectedCompareRestaurants[1] ? 'từ ~ ' + formatPrice(selectedCompareRestaurants[1].price_table) + 'đ / bàn' : '' }}</div>
            </div>
            <div class="compare-row">
              <div class="compare-label">Số sảnh</div>
              <div class="compare-value">{{ getHalls(selectedCompareRestaurants[0]) }}</div>
              <div class="compare-value">{{ getHalls(selectedCompareRestaurants[1]) }}</div>
            </div>
            <div class="compare-row">
              <div class="compare-label">Đánh giá</div>
              <div class="compare-value">
                <i v-for="i in 5" :key="i+ '_a'" class="fa" :class="i <= Math.round((selectedCompareRestaurants[0] && selectedCompareRestaurants[0].star_rating) || 0) ? 'fa-star text-yellow-400' : 'fa-star-o text-gray-300'"></i>
              </div>
              <div class="compare-value">
                <i v-for="i in 5" :key="i+ '_b'" class="fa" :class="i <= Math.round((selectedCompareRestaurants[1] && selectedCompareRestaurants[1].star_rating) || 0) ? 'fa-star text-yellow-400' : 'fa-star-o text-gray-300'"></i>
              </div>
            </div>
            <div class="compare-row">
              <div class="compare-label">Có khuyến mãi</div>
              <div class="compare-value">{{ getHasPromo(selectedCompareRestaurants[0]) ? 'Có' : 'Không' }}</div>
              <div class="compare-value">{{ getHasPromo(selectedCompareRestaurants[1]) ? 'Có' : 'Không' }}</div>
            </div>
          </div>
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
      // show detailed comparison modal
      showCompareResult: false,
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
    selectedPrice() {
      this.onFilterChange();
    },
    selectedStar() {
      this.onFilterChange();
    },
    selectedCity() {
      this.onFilterChange();
    },
    selectedWard() {
      this.onFilterChange();
    },
  },
  mounted() {
    this.fetchResults();
    this.fetchCities(); // ✅ Lấy danh sách thành phố khi load trang
  },
  methods: {
    async fetchResults(filters = {}) {
      // Fetch results from backend. `filters` may contain keys like { city, ward, price, star }
      // If a keyword is present it will be sent as well unless explicitly cleared.
      this.loading = true;
      try {
        const params = Object.assign({}, filters || {});
        if (this.keyword) params.keyword = this.keyword;

        const response = await axios.get("http://localhost:8088/api/restaurants/search", { params });
        this.results = response.data || [];
      } catch (error) {
        console.error("Lỗi khi tải kết quả:", error);
        this.results = [];
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
        // clear any previously selected ward when city is cleared
        this.selectedWard = "";
        return;
      }
      try {
        const res = await axios.get("http://localhost:8088/api/restaurants/ward", {
          params: { city: this.selectedCity },
        });
        this.wards = res.data.wards;
        // If the previously selected ward is not in the newly loaded wards,
        // clear it to avoid stale selection (e.g., switching from Q.3 to another city).
        if (this.selectedWard && !this.wards.includes(this.selectedWard)) {
          this.selectedWard = "";
        }
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
      // When filters are cleared we should also remove any preserved keyword
      // from the route so the page shows unfiltered results.
      if (this.$route.query && this.$route.query.keyword) {
        const q = Object.assign({}, this.$route.query);
        delete q.keyword;
        this.$router.replace({ path: this.$route.path, query: q }).catch(() => {});
      }
      this.fetchResults();
    },

    // Called whenever a filter value changes. Remove keyword from route
    // (so a prior search term doesn't interfere) then re-fetch results with
    // the currently-selected filter values so the backend returns restaurants
    // matching the selected city/ward/price/star.
    onFilterChange() {
      // build filters to send to backend
      const filters = {};
      if (this.selectedCity) filters.city = this.selectedCity;
      if (this.selectedWard) filters.ward = this.selectedWard;
      if (this.selectedPrice) filters.price = this.selectedPrice;
      if (this.selectedStar) filters.star = this.selectedStar;

      // remove keyword from URL and client state
      if (this.$route.query && this.$route.query.keyword) {
        const q = Object.assign({}, this.$route.query);
        delete q.keyword;
        this.$router.replace({ path: this.$route.path, query: q }).catch(() => {});
        this.keyword = "";
      }

      // fetch results using filter params (this will show restaurants for the selected city)
      this.fetchResults(filters);
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
      if (a && b) this.showCompareResult = true;
    },

    closeCompareResult() {
      this.showCompareResult = false;
    },
    // Try multiple possible fields to get number of halls
    getHalls(rest) {
      if (!rest) return '—';
      // numeric count provided directly
      if (rest.halls_count != null) return rest.halls_count;
      if (rest.halls != null && typeof rest.halls === 'number') return rest.halls;
      // arrays
      if (rest.sanh != null && Array.isArray(rest.sanh)) return rest.sanh.length;
      if (rest.halls_list && Array.isArray(rest.halls_list)) return rest.halls_list.length;
      if (rest.sanhList && Array.isArray(rest.sanhList)) return rest.sanhList.length;
      // various possible count fields
      if (rest.sanh_count != null) return rest.sanh_count;
      if (rest.hall_count != null) return rest.hall_count;
      if (rest.number_of_halls != null) return rest.number_of_halls;
      if (rest.count_halls != null) return rest.count_halls;
      // some APIs embed halls in an array named 'halls_list' or 'sanhList'
      if (rest.halls_list && Array.isArray(rest.halls_list)) return rest.halls_list.length;
      if (rest.sanhList && Array.isArray(rest.sanhList)) return rest.sanhList.length;
      return '—';
    },

    // Detect if restaurant has promotions
    getHasPromo(rest) {
      if (!rest) return false;
      // direct boolean flags
      if (typeof rest.has_promo === 'boolean') return rest.has_promo;
      if (typeof rest.has_promotion === 'boolean') return rest.has_promotion;
      if (typeof rest.hasPromotion === 'boolean') return rest.hasPromotion;
      // backend may include counts for active promotions
      if (rest.active_promotions_count != null) return Number(rest.active_promotions_count) > 0;
      if (rest.active_promos_count != null) return Number(rest.active_promos_count) > 0;
      // arrays / objects
      if (rest.promotion) return true;
      if (rest.promotions && Array.isArray(rest.promotions) && rest.promotions.length > 0) return true;
      if (rest.promos && Array.isArray(rest.promos) && rest.promos.length > 0) return true;
      if (rest.promo && (typeof rest.promo === 'object' || rest.promo === true)) return true;
      // discount as fallback
      if (rest.discount && Number(rest.discount) > 0) return true;
      return false;
    },
    viewRestaurant(r) {
      // Navigate to the public restaurant detail page. Use restaurant_id or id field.
      const id = (r && (r.restaurant_id || r.id));
      if (!id) {
        console.warn('Không có id nhà hàng để xem', r);
        return;
      }
      this.$router.push({ name: 'RestaurantDetail', params: { id } });
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
    /**
     * Normalize image URL values from backend and provide placeholder when needed.
     * Accepts:
     * - Absolute URLs (http/https) -> returned as-is
     * - Protocol-relative URLs (//...)
     * - Paths like '/uploads/...' or 'uploads/...' or 'public/uploads/...'
     * - Bare filenames like 'hinh1.jpg' -> assumed under 'uploads/restaurants/'
     * Uses `VUE_APP_BACKEND_URL` when available, falling back to http://127.0.0.1:8088
     */
    getImageUrl(url) {
      const DEFAULT = "/images/default.png";
      try {
        if (!url) return DEFAULT;
        const str = String(url).trim();

        // already an absolute URL (http/https) or data: URI
        if (/^(data:|https?:)\/\//i.test(str)) return str;
        // protocol-relative
        if (/^\/\//.test(str)) return str;

        // handle placeholder shorthand like "009900?text=..."
        const m = str.match(/^([0-9a-fA-F]{3,6})\?text=(.*)$/);
        if (m) {
          const color = m[1];
          const text = m[2];
          return `https://via.placeholder.com/300x200/${color}/ffffff?text=${text}`;
        }

        // clean leading 'public/' and leading slashes
        let clean = str.replace(/^public\//i, '').replace(/^\/+/, '');

        // if bare filename, assume uploads/restaurants
        if (!clean.includes('/')) clean = 'uploads/restaurants/' + clean;

        // backend base URL (set VUE_APP_BACKEND_URL in your .env if frontend runs separately)
        const backend = (process.env.VUE_APP_BACKEND_URL || 'http://127.0.0.1:8088').replace(/\/+$/, '');
        return backend + '/' + clean.replace(/^\/+/, '');
      } catch (e) {
        console.error('getImageUrl error', e, url);
        return "/images/default.png";
      }
    },

    onImgError(e) {
      e.target.src = '/images/default.png';
    },
  },
};
</script>


<style src="../../assets/css/search.css"></style>

<style scoped>
/* Simple spinner */
/* Full-screen loading overlay */
.loading-overlay {
  position: fixed;
  inset: 0; /* top:0; right:0; bottom:0; left:0; */
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1100; /* above most UI elements */
}
.loading-spinner {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  border: 6px solid rgba(0,0,0,0.08);
  border-top-color: #2563eb; /* blue-600 */
  animation: spin 0.9s linear infinite;
  box-shadow: 0 4px 20px rgba(0,0,0,0.08);
}
@keyframes spin { to { transform: rotate(360deg); } }

</style>
