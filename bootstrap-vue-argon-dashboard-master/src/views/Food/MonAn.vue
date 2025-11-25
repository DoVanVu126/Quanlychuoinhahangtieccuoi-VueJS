<template>
  <div>
    <!-- Header -->
    <base-header class="pb-6 pb-8 pt-5 pt-md-8 bg-gradient-success">
      <div class="container-fluid">
        <div class="header-body text-white">
          <h2 class="text-white font-weight-bold">QUẢN LÝ MÓN ĂN</h2>
          <p class="text-light">Theo dõi, chỉnh sửa và quản lý danh sách món ăn nhà hàng</p>
        </div>
      </div>
    </base-header>

    <!-- Nội dung chính -->
    <div class="container-fluid mt--7">
      <div class="card shadow-lg border-0" style="border-radius: 20px; overflow: hidden;">
        <div class="card-body">
          <!-- Thanh công cụ -->
          <div class="d-flex justify-content-between align-items-center mb-3">
            <input
              v-model="searchQuery"
              class="form-control w-50"
              placeholder="🔍 Tìm kiếm món ăn theo tên, mô tả hoặc nhà hàng..."
            />

            <div class="d-flex gap-2">
              <router-link to="/mon-an/them" class="btn btn-primary">
                + Thêm Món ăn
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
                  <th>Tên món ăn</th>
                  <th>Loại món</th>
                  <th>Nhà hàng</th>
                  <th>Giá (VNĐ)</th>
                  <th>Đơn vị</th>
                  <th>Mô tả</th>
                  <th>Hình ảnh</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="food in filteredFoods" :key="food.food_id">
                  <td>{{ food.food_id }}</td>
                  <td>{{ food.name }}</td>
                  <td>{{ food.food_type && food.food_type.name ? food.food_type.name : "Không có" }}</td>
                  <td>{{ food.restaurant && food.restaurant.name ? food.restaurant.name : "Không có" }}</td>
                  <td>{{ formatPrice(food.price) }}</td>
                  <td>{{ food.unit ? food.unit : "Chưa có" }}</td>
                  <td>{{ food.description ? food.description : "" }}</td>
                  <td>
                    <img
                      v-if="food.image_url"
                      :src="fixFoodImageUrl(food.image_url)"
                      alt="Hình món ăn"
                      class="food-img fade-in"
                      @error="handleFoodImageError($event, food)"
                    />
                    <span v-else>Không có</span>
                  </td>
                  <td>
                    <b-button size="sm" variant="outline-primary" @click="editFood(food)">Sửa</b-button>
                    <b-button size="sm" variant="outline-danger" @click="deleteFood(food.food_id)">Xóa</b-button>
                  </td>
                </tr>

                <tr v-if="filteredFoods.length === 0">
                  <td colspan="9" class="text-center text-muted">Không có món ăn nào phù hợp</td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Phân trang -->
          <nav v-if="lastPage > 1" class="d-flex justify-content-center mt-3">
            <ul class="pagination">
              <li class="page-item" :class="{ disabled: currentPage === 1 }">
                <button class="page-link" @click="getFoods(currentPage - 1)">Trước</button>
              </li>

              <li
                v-for="page in lastPage"
                :key="page"
                class="page-item"
                :class="{ active: page === currentPage }"
              >
                <button class="page-link" @click="getFoods(page)">{{ page }}</button>
              </li>

              <li class="page-item" :class="{ disabled: currentPage === lastPage }">
                <button class="page-link" @click="getFoods(currentPage + 1)">Sau</button>
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

export default {
  data() {
    return {
      foods: [],
      currentPage: 1,
      lastPage: 1,
      searchQuery: "",
      baseURL: process.env.VUE_APP_BASE_URL || "http://localhost:8088", // URL backend
    };
  },
  computed: {
    filteredFoods() {
      if (!this.foods || !this.foods.data) return [];
      const query = this.searchQuery.trim().toLowerCase();
      return this.foods.data.filter(f => {
        const name = f.name ? f.name.toLowerCase() : '';
        const description = f.description ? f.description.toLowerCase() : '';
        const restaurantName = f.restaurant && f.restaurant.name ? f.restaurant.name.toLowerCase() : '';
        return name.includes(query) || description.includes(query) || restaurantName.includes(query);
      });
    },
  },
  methods: {
    async getFoods(page = 1) {
      try {
        const res = await api.get(`/foods?page=${page}`);
        // Thêm trường fixed_image_url để đảm bảo ảnh hiển thị
        this.foods = {
          ...res.data,
          data: res.data.data.map(f => ({
            ...f,
            fixed_image_url: this.fixFoodImageUrl(f.image_url),
          })),
        };
        this.currentPage = res.data.current_page;
        this.lastPage = res.data.last_page;
      } catch (err) {
        console.error("Lỗi tải danh sách món ăn:", err);
      }
    },

    // Định dạng giá
    formatPrice(value) {
      return new Intl.NumberFormat("vi-VN").format(value);
    },

    // Sửa món ăn
    editFood(food) {
      this.$router.push({ name: "SuaMonAn", params: { id: food.food_id } });
    },

    // Xóa món ăn
    async deleteFood(id) {
      if (confirm("Bạn có chắc muốn xóa món ăn này không?")) {
        try {
          await api.delete(`/foods/${id}`);
          this.getFoods(this.currentPage);
        } catch (err) {
          console.error("Lỗi xóa món ăn:", err);
        }
      }
    },

    refreshList() {
      this.searchQuery = "";
      this.getFoods();
    },

    // ✅ Chuẩn hóa URL ảnh món ăn
    fixFoodImageUrl(url) {
      if (!url) return null;
      if (url.startsWith("http")) return url;
      // loại bỏ dấu / đầu nếu có
      return `${this.baseURL}/${url.replace(/^\/+/, "")}`;
    },

    // Khi ảnh lỗi
    handleFoodImageError(e, food) {
      console.warn("Ảnh lỗi:", food.image_url);
      e.target.src = "https://via.placeholder.com/60x60?text=No+Image";
      e.target.style.border = "2px solid red";
    },
  },
  mounted() {
    this.getFoods();
  },
};
</script>

<style scoped>
.table {
  vertical-align: middle;
  font-size: 0.9rem;
}
.table th {
  font-weight: 600;
}
.btn {
  min-width: 90px;
}
.pagination .page-link {
  cursor: pointer;
}
.food-img {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 8px;
  border: 1px solid #ddd;
  transition: opacity 0.3s ease-in-out;
  opacity: 0;
}
.food-img.fade-in {
  opacity: 1;
}
</style>
