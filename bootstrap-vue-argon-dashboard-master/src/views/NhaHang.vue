<template>
  <div class="container mt-5 pt-4">
    <h2 class="text-center mb-4">Quản lý Nhà hàng</h2>

    <!-- Nút thêm nhà hàng -->
    <div class="d-flex justify-content-end mb-3">
      <button class="btn btn-primary" @click="openAddModal">
        <i class="fas fa-plus"></i> Thêm nhà hàng
      </button>
    </div>

    <!-- Bảng danh sách -->
    <div class="table-responsive">
      <table class="table table-bordered table-hover text-center align-middle">
        <thead class="table-dark">
          <tr>
            <th>ID</th>
            <th>Tên nhà hàng</th>
            <th>Thành phố</th>
            <th>Giá bàn</th>
            <th>Xếp hạng</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="r in restaurants" :key="r.restaurant_id">
            <td>{{ r.restaurant_id }}</td>
            <td class="text-start">{{ r.name }}</td>
            <td>{{ r.city }}</td>
            <td>{{ formatPrice(r.price_table) }} VNĐ</td>
            <td>{{ r.star_rating }} ★</td>
            <td>
              <button
                class="btn btn-warning btn-sm me-1"
                @click="openEditModal(r)"
              >
                <i class="fas fa-edit"></i>
              </button>
              <button
                class="btn btn-danger btn-sm"
                @click="deleteRestaurant(r.restaurant_id)"
              >
                <i class="fas fa-trash"></i>
              </button>
            </td>
          </tr>
          <tr v-if="!restaurants || restaurants.length === 0">
            <td colspan="6" class="text-center text-muted">
              Chưa có nhà hàng nào
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal thêm/sửa -->
    <div class="modal fade" id="restaurantModal" tabindex="-1">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content rounded-3 shadow">
          <div class="modal-header bg-primary text-white">
            <h5 class="modal-title">
              {{ isEditing ? "Cập nhật" : "Thêm" }} Nhà hàng
            </h5>
            <button
              type="button"
              class="btn-close"
              data-bs-dismiss="modal"
            ></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="saveRestaurant">
              <div class="mb-3">
                <label class="form-label fw-semibold">Tên nhà hàng</label>
                <input
                  type="text"
                  class="form-control"
                  v-model="form.name"
                  required
                />
              </div>
              <div class="mb-3">
                <label class="form-label fw-semibold">Thành phố</label>
                <input type="text" class="form-control" v-model="form.city" />
              </div>
              <div class="mb-3">
                <label class="form-label fw-semibold">Giá bàn (VNĐ)</label>
                <input
                  type="number"
                  class="form-control"
                  v-model="form.price_table"
                />
              </div>
              <div class="mb-3">
                <label class="form-label fw-semibold">Xếp hạng (★)</label>
                <input
                  type="number"
                  step="0.1"
                  class="form-control"
                  v-model="form.star_rating"
                />
              </div>
              <div class="text-end">
                <button type="submit" class="btn btn-success">
                  {{ isEditing ? "Lưu thay đổi" : "Thêm mới" }}
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
      restaurants: [],
      form: {},
      modal: null,
      isEditing: false,
    };
  },
  methods: {
    async getRestaurants() {
      try {
        const res = await api.get("/restaurants");
        this.restaurants = res.data; // ✅ sửa ở đây
      } catch (err) {
        console.error("Lỗi tải danh sách nhà hàng:", err);
      }
    },
    formatPrice(value) {
      if (!value) return "0";
      return new Intl.NumberFormat("vi-VN").format(value);
    },
    openAddModal() {
      this.isEditing = false;
      this.form = {};
      this.modal = new bootstrap.Modal(
        document.getElementById("restaurantModal")
      );
      this.modal.show();
    },
    openEditModal(r) {
      this.isEditing = true;
      this.form = { ...r };
      this.modal = new bootstrap.Modal(
        document.getElementById("restaurantModal")
      );
      this.modal.show();
    },
    async saveRestaurant() {
      try {
        if (this.isEditing) {
          await api.put(`/restaurants/${this.form.restaurant_id}`, this.form);
        } else {
          await api.post("/restaurants", this.form);
        }
        this.modal.hide();
        this.getRestaurants();
      } catch (err) {
        console.error("Lỗi lưu nhà hàng:", err);
      }
    },
    async deleteRestaurant(id) {
      if (confirm("Bạn có chắc muốn xóa nhà hàng này không?")) {
        try {
          await api.delete(`/restaurants/${id}`);
          this.getRestaurants();
        } catch (err) {
          console.error("Lỗi xóa nhà hàng:", err);
        }
      }
    },
  },
  mounted() {
    this.getRestaurants();
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
</style>
