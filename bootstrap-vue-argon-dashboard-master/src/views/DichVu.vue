<template>
  <div class="container mt-5">
    <h2 class="text-center mb-4">Quản lý Dịch vụ</h2>

    <!-- ✅ Nút thêm -->
    <div class="d-flex justify-content-end mb-3">
      <button class="btn btn-primary" @click="openAddModal">
        <i class="fas fa-plus"></i> Thêm dịch vụ
      </button>
    </div>

    <!-- ✅ Bảng danh sách -->
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
        <tr v-for="service in services" :key="service.id">
          <td>{{ service.id }}</td>
          <td>{{ service.name }}</td>
          <td>{{ service.description }}</td>
          <td>{{ formatPrice(service.price) }}</td>
          <td>{{ service.restaurant && service.restaurant.name ? service.restaurant.name : "Không có" }}</td>

          <td>
            <button class="btn btn-warning btn-sm me-2" @click="openEditModal(service)">
              <i class="fas fa-edit"></i>
            </button>
            <button class="btn btn-danger btn-sm" @click="deleteService(service.id)">
              <i class="fas fa-trash"></i>
            </button>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- ✅ Modal Thêm / Sửa -->
    <div class="modal fade" id="serviceModal" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content rounded-3 shadow-lg">
          <div class="modal-header bg-primary text-white">
            <h5 class="modal-title">{{ isEdit ? "Cập nhật Dịch vụ" : "Thêm Dịch vụ" }}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="saveService">
              <div class="mb-3">
                <label class="form-label">Tên dịch vụ</label>
                <input type="text" class="form-control" v-model="form.name" required />
              </div>
              <div class="mb-3">
                <label class="form-label">Mô tả</label>
                <textarea class="form-control" v-model="form.description"></textarea>
              </div>
              <div class="mb-3">
                <label class="form-label">Giá (VNĐ)</label>
                <input type="number" class="form-control" v-model="form.price" min="0" required />
              </div>
              <div class="mb-3">
                <label class="form-label">ID Nhà hàng</label>
                <input type="number" class="form-control" v-model="form.restaurant_id" />
              </div>
              <div class="text-end">
                <button type="submit" class="btn btn-success">
                  {{ isEdit ? "Lưu thay đổi" : "Thêm mới" }}
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
  name: "DichVu",
  data() {
    return {
      services: [],
      form: { id: null, name: "", description: "", price: "", restaurant_id: "" },
      isEdit: false,
      modal: null,
    };
  },
  methods: {
    async getServices() {
      try {
        const res = await api.get("/services");
        this.services = res.data;
      } catch (err) {
        console.error("❌ Lỗi tải danh sách dịch vụ:", err);
      }
    },
    formatPrice(value) {
      return new Intl.NumberFormat("vi-VN").format(value);
    },
    openAddModal() {
      this.isEdit = false;
      this.form = { name: "", description: "", price: "", restaurant_id: "" };
      this.modal = new bootstrap.Modal(document.getElementById("serviceModal"));
      this.modal.show();
    },
    openEditModal(service) {
      this.isEdit = true;
      this.form = { ...service };
      this.modal = new bootstrap.Modal(document.getElementById("serviceModal"));
      this.modal.show();
    },
    async saveService() {
      try {
        if (this.isEdit) {
          await api.put(`/services/${this.form.id}`, this.form);
        } else {
          await api.post("/services", this.form);
        }
        this.modal.hide();
        this.getServices();
      } catch (err) {
        console.error("❌ Lỗi lưu dịch vụ:", err);
      }
    },
    async deleteService(id) {
      if (confirm("Bạn có chắc muốn xóa dịch vụ này không?")) {
        try {
          await api.delete(`/services/${id}`);
          this.getServices();
        } catch (err) {
          console.error("❌ Lỗi xóa dịch vụ:", err);
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
.table {
  vertical-align: middle;
}
.modal-content {
  border-radius: 12px;
}
.btn {
  min-width: 90px;
}
</style>
