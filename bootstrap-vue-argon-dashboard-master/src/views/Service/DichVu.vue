<template>
  <div class="container mt-5 pt-4">
    <h2 class="text-center mb-4">Quản lý Dịch vụ</h2>

    <!-- Nút thêm dịch vụ -->
    <div class="d-flex justify-content-end mb-3">
      <router-link to="/dich-vu/them" class="btn btn-primary">
        <i class="fas fa-plus"></i> Thêm dịch vụ
      </router-link>
    </div>

    <!-- Bảng danh sách dịch vụ -->
    <div class="table-responsive">
      <table class="table table-bordered table-hover text-center align-middle">
        <thead class="table-dark">
          <tr>
            <th>ID</th>
            <th>Tên dịch vụ</th>
            <th>Mô tả</th>
            <th>Giá</th>
            <th>Nhà hàng</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="service in services" :key="service.service_id">
            <td>{{ service.service_id }}</td>
            <td class="text-start">{{ service.name }}</td>
            <td class="text-start">{{ service.description }}</td>
            <td>{{ formatPrice(service.price) }} VNĐ</td>
            <td>{{ service.restaurant && service.restaurant.name ? service.restaurant.name : "Không có" }}</td>
            <td>
              <router-link
                :to="`/dich-vu/sua/${service.service_id}`"
                class="btn btn-warning btn-sm me-1"
              >
                <i class="fas fa-edit"></i>
              </router-link>
              <button class="btn btn-danger btn-sm" @click="deleteService(service.service_id)">
                <i class="fas fa-trash"></i>
              </button>
            </td>
          </tr>
          <tr v-if="services.length === 0">
            <td colspan="6" class="text-center text-muted">Chưa có dịch vụ nào</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Phân trang -->
    <nav v-if="lastPage > 1" class="d-flex justify-content-center mt-3">
      <ul class="pagination">
        <li class="page-item" :class="{ disabled: currentPage === 1 }">
          <button class="page-link" @click="getServices(currentPage - 1)">Trước</button>
        </li>

        <li
          v-for="page in lastPage"
          :key="page"
          class="page-item"
          :class="{ active: page === currentPage }"
        >
          <button class="page-link" @click="getServices(page)">{{ page }}</button>
        </li>

        <li class="page-item" :class="{ disabled: currentPage === lastPage }">
          <button class="page-link" @click="getServices(currentPage + 1)">Sau</button>
        </li>
      </ul>
    </nav>

    <!-- Modal sửa dịch vụ -->
    <div class="modal fade" id="editServiceModal" tabindex="-1">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content rounded-3 shadow">
          <div class="modal-header bg-primary text-white">
            <h5 class="modal-title">Cập nhật Dịch vụ</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="saveService">
              <div class="mb-3">
                <label class="form-label fw-semibold">Tên dịch vụ</label>
                <input type="text" class="form-control form-control-sm" v-model="form.name" required />
              </div>
              <div class="mb-3">
                <label class="form-label fw-semibold">Mô tả</label>
                <textarea class="form-control form-control-sm" v-model="form.description" rows="2"></textarea>
              </div>
              <div class="row">
                <div class="col-6 mb-3">
                  <label class="form-label fw-semibold">Giá (VNĐ)</label>
                  <input type="number" class="form-control form-control-sm" v-model="form.price" min="0" required />
                </div>
                <div class="col-6 mb-3">
                  <label class="form-label fw-semibold">ID Nhà hàng</label>
                  <input type="number" class="form-control form-control-sm" v-model="form.restaurant_id" />
                </div>
              </div>
              <div class="text-end">
                <button type="submit" class="btn btn-success btn-sm">Lưu thay đổi</button>
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
      services: [],
      form: {},
      modal: null,
      currentPage: 1,
      lastPage: 1,
    };
  },
  methods: {
    async getServices(page = 1) {
      try {
        const res = await api.get(`/services?page=${page}`);
        this.services = res.data.data; // Dữ liệu trang hiện tại
        this.currentPage = res.data.current_page;
        this.lastPage = res.data.last_page;
      } catch (err) {
        console.error("Lỗi tải dịch vụ:", err);
      }
    },
    formatPrice(value) {
      return new Intl.NumberFormat("vi-VN").format(value);
    },
    openEditModal(service) {
      this.form = { ...service };
      this.modal = new bootstrap.Modal(document.getElementById("editServiceModal"));
      this.modal.show();
    },
    async saveService() {
      try {
        await api.put(`/services/${this.form.service_id}`, this.form);
        this.modal.hide();
        this.getServices(this.currentPage);
      } catch (err) {
        console.error("Lỗi cập nhật dịch vụ:", err);
      }
    },
    async deleteService(id) {
      if (confirm("Bạn có chắc muốn xóa dịch vụ này không?")) {
        try {
          await api.delete(`/services/${id}`);
          this.getServices(this.currentPage);
        } catch (err) {
          console.error("Lỗi xóa dịch vụ:", err);
        }
      }
    },
  },
  mounted() {
    this.getServices();
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
