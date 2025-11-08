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
              placeholder="🔍 Tìm kiếm món ăn theo tên hoặc mô tả..."
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
                  <th>Giá (VNĐ)</th>
                  <th>Mô tả</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="food in filteredFoods" :key="food.food_id">
                  <td>{{ food.food_id }}</td>
                  <td>{{ food.name }}</td>
                  <td>{{ food.food_type ? food.food_type.name : "Không có" }}</td>
                  <td>{{ formatPrice(food.price) }}</td>
                  <td>{{ food.description }}</td>
                  <td>
                    <b-button
                      size="sm"
                      variant="outline-primary"
                      @click="editFood(food)"
                    >
                      Sửa
                    </b-button>
                    <b-button
                      size="sm"
                      variant="outline-danger"
                      @click="deleteFood(food.food_id)"
                    >
                      Xóa
                    </b-button>
                  </td>
                </tr>

                <tr v-if="filteredFoods.length === 0">
                  <td colspan="6" class="text-center text-muted">
                    Không có món ăn nào phù hợp
                  </td>
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
    };
  },
  computed: {
    filteredFoods() {
      if (!this.foods || !this.foods.data) return [];
      return this.foods.data.filter(
        (f) =>
          f.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
          f.description.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    },
  },
  methods: {
    async getFoods(page = 1) {
      try {
        const res = await api.get(`/foods?page=${page}`);
        this.foods = res.data;
        this.currentPage = res.data.current_page;
        this.lastPage = res.data.last_page;
      } catch (err) {
        console.error("Lỗi tải danh sách món ăn:", err);
      }
    },
    formatPrice(value) {
      return new Intl.NumberFormat("vi-VN").format(value);
    },
    editFood(food) {
      // 👉 Khi bấm "Sửa", chuyển sang trang sửa món ăn
      this.$router.push({ name: "SuaMonAn", params: { id: food.food_id } });
    },
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
</style>
