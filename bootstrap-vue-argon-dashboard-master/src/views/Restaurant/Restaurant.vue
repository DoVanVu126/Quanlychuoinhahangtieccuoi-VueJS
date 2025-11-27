<template>
  <div>
    <!-- Header -->
    <base-header class="pb-6 pb-8 pt-5 pt-md-8 bg-gradient-success">
      <div class="container-fluid">
        <div class="header-body text-white">
          <h2 class="text-white font-weight-bold">QUẢN LÝ NHÀ HÀNG</h2>
          <p class="text-light">Theo dõi, chỉnh sửa và quản lý nhà hàng</p>
        </div>
      </div>
    </base-header>

    <div class="container-fluid mt--7">
      <div class="card shadow-lg border-0" style="border-radius: 20px; overflow: hidden">
        <div class="card-body">
          <!-- Thanh công cụ -->
          <div class="d-flex justify-content-between align-items-center mb-3">
            <input
              v-model="searchQuery"
              class="form-control w-50"
              placeholder="🔍 Tìm kiếm nhà hàng theo tên hoặc thành phố..."
              @input="debouncedSearch"
            />
            <div class="d-flex gap-2">
              <router-link :to="{ name: 'ThemRestaurant' }" class="btn btn-primary">
                + Thêm Nhà hàng
              </router-link>
              <b-button variant="success" @click="refreshList">↻ Làm mới</b-button>
            </div>
          </div>

          <!-- Bảng danh sách -->
          <div class="table-responsive">
            <table class="table table-hover align-items-center">
              <thead class="thead-light">
                <tr>
                  <th>ID</th>
                  <th>Ảnh</th>
                  <th>Tên nhà hàng</th>
                  <th>Thành phố</th>
                  <th>Giá bàn (VNĐ)</th>
                  <th>Xếp hạng</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="r in restaurants" :key="r.restaurant_id">
                  <td>{{ r.restaurant_id }}</td>
                  <td>
                    <img
                      v-if="r.fixed_image_url"
                      :src="r.fixed_image_url"
                      alt="Ảnh nhà hàng"
                      class="restaurant-img fade-in"
                      @error="handleImageError"
                    />
                    <span v-else class="text-muted">Không có</span>
                  </td>
                  <td>{{ r.name }}</td>
                  <td>{{ r.city }}</td>
                  <td>{{ formatPrice(r.price_table) }}</td>
                  <td>{{ r.star_rating }} ★</td>
                  <td>
                    <b-button size="sm" variant="outline-primary" @click="editRestaurant(r)">Sửa</b-button>
                    <b-button size="sm" variant="outline-danger" @click="deleteRestaurant(r.restaurant_id)">Xóa</b-button>
                  </td>
                </tr>
                <tr v-if="restaurants.length === 0">
                  <td colspan="7" class="text-center text-muted">Không có nhà hàng nào phù hợp</td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Phân trang -->
          <nav v-if="lastPage > 1" class="d-flex justify-content-center mt-3">
            <ul class="pagination">
              <li class="page-item" :class="{ disabled: currentPage === 1 }">
                <button class="page-link" @click="changePage(currentPage - 1)">Trước</button>
              </li>

              <li
                v-for="page in lastPage"
                :key="page"
                class="page-item"
                :class="{ active: page === currentPage }"
              >
                <button class="page-link" @click="changePage(page)">{{ page }}</button>
              </li>

              <li class="page-item" :class="{ disabled: currentPage === lastPage }">
                <button class="page-link" @click="changePage(currentPage + 1)">Sau</button>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import api from "@/api";
import _ from "lodash";

export default {
  data() {
    return {
      restaurants: [],
      currentPage: 1,
      lastPage: 1,
      searchQuery: "",
    };
  },
  methods: {
    async getRestaurants(page = 1, query = "") {
      try {
        const res = await api.get("/restaurants/paginated", {
          params: { page, per_page: 10, keyword: query },
        });

        const data = res.data.data || []; // Tránh lỗi undefined
        this.restaurants = data.map((r) => ({
          ...r,
          fixed_image_url: this.fixImageUrl(r.image_url),
        }));

        this.currentPage = res.data.current_page || page;
        this.lastPage = res.data.last_page || 1;
      } catch (err) {
        console.error("❌ Lỗi tải nhà hàng:", err);
        this.restaurants = [];
        this.currentPage = 1;
        this.lastPage = 1;
      }
    },
    changePage(page) {
      if (page < 1 || page > this.lastPage) return;
      this.getRestaurants(page, this.searchQuery);
    },
    formatPrice(value) {
      return value ? new Intl.NumberFormat("vi-VN").format(value) : "0";
    },
    fixImageUrl(url) {
      if (!url) return null;
      if (url.startsWith("http")) return url;
      return `http://127.0.0.1:8088/${url.replace(/^\/+/, "")}`;
    },
    handleImageError(e) {
      e.target.src = "https://via.placeholder.com/60x60?text=No+Image";
      e.target.style.border = "2px solid red";
    },
    editRestaurant(r) {
      this.$router.push({ name: "SuaRestaurant", params: { id: r.restaurant_id } });
    },
    async deleteRestaurant(id) {
      if (!confirm("Bạn có chắc muốn xóa nhà hàng này không?")) return;

      try {
        await api.delete(`/restaurants/${id}`);
        this.getRestaurants(this.currentPage, this.searchQuery);
      } catch (err) {
        console.error("❌ Lỗi xóa nhà hàng:", err);
      }
    },
    refreshList() {
      this.searchQuery = "";
      this.getRestaurants(1);
    },
    debouncedSearch: _.debounce(function () {
      this.getRestaurants(1, this.searchQuery);
    }, 500),
  },
  mounted() {
    this.getRestaurants();
  },
};
</script>

<style scoped>
.restaurant-img {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 8px;
  border: 1px solid #ddd;
  transition: opacity 0.3s ease-in-out;
  opacity: 0;
}
.restaurant-img.fade-in {
  opacity: 1;
}
</style>
