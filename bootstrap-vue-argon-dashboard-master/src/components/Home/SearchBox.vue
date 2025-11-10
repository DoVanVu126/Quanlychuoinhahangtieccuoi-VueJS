<template>
  <div class="wedding-search-box">
    <div class="wedding-search-tab">Nhà hàng</div>

    <div class="wedding-search-content">
      <!-- Ô tìm kiếm -->
      <div class="wedding-search-input-group relative">
        <i class="fa fa-search wedding-search-icon"></i>
        <input v-model="keyword" type="text" placeholder="Nhập tên nhà hàng" @input="debouncedSearch"
          @focus="showSuggestions = true" @blur="hideSuggestions" />

        <!-- Danh sách gợi ý -->
        <ul v-if="showSuggestions && results.length > 0"
          class="suggestion-list absolute left-0 top-full w-full bg-white border border-gray-300 rounded-lg shadow-lg z-50">
          <li v-for="(item, index) in results" :key="index" class="wedding-suggestion-item"
            @mousedown.prevent="selectSuggestion(item)">
            <img :src="item.image || '/images/default-restaurant.jpg'" alt="Restaurant" />
            <span class="font-medium text-gray-800">{{ item.name }}</span>
          </li>
        </ul>
      </div>

      <!-- Nhà hàng được chọn -->
      <div v-if="selectedRestaurant" class="wedding-selected-restaurant">
        <img :src="selectedRestaurant.image || '/images/default-restaurant.jpg'" alt="Restaurant"
          class="wedding-selected-img" />
        <div class="wedding-selected-info">
          <h3 class="wedding-selected-name font-semibold text-lg">{{ selectedRestaurant.name }}</h3>
        </div>
      </div>

      <!-- Ngày đặt / trả -->
      <div class="wedding-date-row">
        <div class="wedding-date-group">
          <label>Ngày đặt</label>
          <input type="date" v-model="startDate" />
        </div>
        <div class="wedding-date-group">
          <label>Ngày trả</label>
          <input type="date" v-model="endDate" />
        </div>
      </div>

      <!-- Thông báo lỗi -->
      <p v-if="errorMessage" class="wedding-error-message">
        {{ errorMessage }}
      </p>


      <button class="wedding-search-btn" @click="goToBookingPage">TÌM</button>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import _ from "lodash";

export default {
  data() {
    return {
      keyword: "",
      startDate: "",
      endDate: "",
      results: [],
      showSuggestions: false,
      selectedRestaurant: null,
      errorMessage: "", // ✅ Biến hiển thị lỗi
    };
  },
  methods: {
    async searchRestaurants() {
      if (!this.keyword.trim()) {
        this.results = [];
        return;
      }

      try {
        const res = await axios.get("http://localhost:8088/api/restaurants/search", {
          params: { keyword: this.keyword },
        });
        this.results = res.data;
      } catch (error) {
        console.error("Lỗi tìm kiếm:", error);
      }
    },

    debouncedSearch: _.debounce(function () {
      this.searchRestaurants();
    }, 400),

    selectSuggestion(item) {
      this.keyword = item.name;
      this.selectedRestaurant = item;
      this.showSuggestions = false;
    },

    hideSuggestions() {
      setTimeout(() => {
        this.showSuggestions = false;
      }, 150);
    },

    // ✅ Khi nhấn "TÌM"
    goToBookingPage() {
      this.errorMessage = "";

      if (!this.selectedRestaurant) {
        this.showError("⚠️ Vui lòng chọn nhà hàng!");
        return;
      }
      if (!this.startDate) {
        this.showError("⚠️ Vui lòng chọn ngày đặt!");
        return;
      }
      if (!this.endDate) {
        this.showError("⚠️ Vui lòng chọn ngày trả!");
        return;
      }

      // Nếu hợp lệ thì chuyển trang
      this.$router.push({
        name: "DatTiec",
        query: {
          restaurant: this.selectedRestaurant.name,
          startDate: this.startDate,
          endDate: this.endDate,
        },
      });
    },

    // ✅ Hàm hiển thị lỗi trong 3 giây
    showError(message) {
      this.errorMessage = message;
      setTimeout(() => {
        this.errorMessage = "";
      }, 3000);
    },
  },
};
</script>


<style src="../../assets/css/search-box.css"></style>
