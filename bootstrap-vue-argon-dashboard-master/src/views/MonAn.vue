<template>
  <div class="container mt-5 pt-4">
    <h2 class="text-center mb-4">Quản lý Món ăn</h2>

    <!-- Nút thêm món ăn -->
    <div class="d-flex justify-content-end mb-3">
      <router-link to="/mon-an/them" class="btn btn-primary">
        <i class="fas fa-plus"></i> Thêm món ăn
      </router-link>
    </div>

    <!-- Bảng danh sách món ăn -->
    <div class="table-responsive">
      <table class="table table-bordered table-hover text-center align-middle">
        <thead class="table-dark">
          <tr>
            <th>ID</th>
            <th>Tên món ăn</th>
            <th>Loại món</th>
            <th>Giá (VNĐ)</th>
            <th>Mô tả</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="food in foods.data" :key="food.food_id">
            <td>{{ food.food_id }}</td>
            <td class="text-start">{{ food.name }}</td>
            <td>{{ food.food_type ? food.food_type.name : "Không có" }}</td>
            <td>{{ formatPrice(food.price) }} VNĐ</td>
            <td class="text-start">{{ food.description }}</td>
            <td>
              <button
                class="btn btn-warning btn-sm me-1"
                @click="openEditModal(food)"
              >
                <i class="fas fa-edit"></i>
              </button>
           <button class="btn btn-danger btn-sm me-1" @click="deleteFood(food.food_id)">  <i class="fas fa-trash"></i>
              </button>
            </td>
          </tr>
          <tr v-if="!foods || foods.length === 0">
            <td colspan="6" class="text-center text-muted">
              Chưa có món ăn nào
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Phân trang -->
    <nav v-if="lastPage > 1" class="d-flex justify-content-center mt-3">
      <ul class="pagination">
        <li class="page-item" :class="{ disabled: currentPage === 1 }">
          <button class="page-link" @click="getFoods(currentPage - 1)">
            Trước
          </button>
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
          <button class="page-link" @click="getFoods(currentPage + 1)">
            Sau
          </button>
        </li>
      </ul>
    </nav>

    <!-- Modal sửa món ăn -->
    <div class="modal fade" id="editFoodModal" tabindex="-1">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content rounded-3 shadow">
          <div class="modal-header bg-primary text-white">
            <h5 class="modal-title">Cập nhật Món ăn</h5>
            <button
              type="button"
              class="btn-close"
              data-bs-dismiss="modal"
            ></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="saveFood">
              <div class="mb-3">
                <label class="form-label fw-semibold">Tên món ăn</label>
                <input
                  type="text"
                  class="form-control form-control-sm"
                  v-model="form.name"
                  required
                />
              </div>
              <div class="mb-3">
                <label class="form-label fw-semibold">Mô tả</label>
                <textarea
                  class="form-control form-control-sm"
                  v-model="form.description"
                  rows="2"
                ></textarea>
              </div>
              <div class="row">
                <div class="col-6 mb-3">
                  <label class="form-label fw-semibold">Giá (VNĐ)</label>
                  <input
                    type="number"
                    class="form-control form-control-sm"
                    v-model="form.price"
                    min="0"
                    required
                  />
                </div>
                <div class="col-6 mb-3">
                  <label class="form-label fw-semibold">Loại món (ID)</label>
                  <input
                    type="number"
                    class="form-control form-control-sm"
                    v-model="form.food_type_id"
                  />
                </div>
              </div>
              <div class="text-end">
                <button type="submit" class="btn btn-success btn-sm">
                  Lưu thay đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import api from "@/api";
import "bootstrap/dist/js/bootstrap.bundle.min.js";

export default {
  data() {
    return {
      foods: [],
      form: {},
      modal: null,
      currentPage: 1,
      lastPage: 1,
    };
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
    openEditModal(food) {
      this.form = { ...food };
      this.modal = new bootstrap.Modal(
        document.getElementById("editFoodModal")
      );
      this.modal.show();
    },
    async saveFood() {
      try {
        await api.put(`/foods/${this.form.food_id}`, this.form);
        this.modal.hide();
        this.getFoods(this.currentPage);
      } catch (err) {
        console.error("Lỗi cập nhật món ăn:", err);
      }
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
  },
  mounted() {
    this.getFoods();
  },
};
</script>

<style scoped>
.container {
  padding-top: 80px;
}

.table {
  vertical-align: middle;
  font-size: 0.9rem;
}

.table th,
.table td {
  padding: 0.5rem 0.75rem;
}

.modal-content {
  border-radius: 10px;
}

.btn {
  min-width: 75px;
}

.pagination .page-link {
  cursor: pointer;
}
</style>
