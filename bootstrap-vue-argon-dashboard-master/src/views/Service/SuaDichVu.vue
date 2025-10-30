<template>
  <div class="container mt-5" style="max-width: 800px;">
    <h2 class="text-center mb-4 fw-bold">Sửa Dịch vụ</h2>

    <div class="card shadow-sm p-3">
      <div class="card-body">
        <form @submit.prevent="updateService">
          <!-- Tên dịch vụ -->
          <div class="mb-3">
            <label class="form-label fw-semibold">Tên dịch vụ</label>
            <input type="text" class="form-control form-control-lg" v-model="form.name" required />
            <small class="text-danger" v-if="errors.name">{{ errors.name[0] }}</small>
          </div>

          <!-- Mô tả -->
          <div class="mb-3">
            <label class="form-label fw-semibold">Mô tả</label>
            <textarea class="form-control form-control-lg" v-model="form.description" rows="4"></textarea>
            <small class="text-danger" v-if="errors.description">{{ errors.description[0] }}</small>
          </div>

          <!-- Giá và ID Nhà hàng -->
          <div class="row">
            <div class="col-md-6 mb-3">
              <label class="form-label fw-semibold">Giá (VNĐ)</label>
              <input type="number" class="form-control form-control-lg" v-model="form.price" min="0" required />
              <small class="text-danger" v-if="errors.price">{{ errors.price[0] }}</small>
            </div>
            <div class="col-md-6 mb-3">
              <label class="form-label fw-semibold">ID Nhà hàng</label>
              <input type="number" class="form-control form-control-lg" v-model="form.restaurant_id" required />
              <small class="text-danger" v-if="errors.restaurant_id">{{ errors.restaurant_id[0] }}</small>
            </div>
          </div>

          <!-- Trạng thái dịch vụ -->
          <div class="mb-4">
            <label class="form-label fw-semibold">Trạng thái</label>
            <select class="form-select form-select-lg" v-model="form.status">
              <option :value="true">Hoạt động</option>
              <option :value="false">Ngưng hoạt động</option>
            </select>
            <small class="text-danger" v-if="errors.status">{{ errors.status[0] }}</small>
          </div>

          <!-- Nút -->
          <div class="d-flex justify-content-between">
            <router-link to="/dich-vu" class="btn btn-secondary btn-lg">Hủy</router-link>
            <button type="submit" class="btn btn-warning btn-lg">Cập nhật</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import api from "@/api";

export default {
  data() {
    return {
      form: {
        name: "",
        description: "",
        price: 0,
        restaurant_id: null,
        status: true,
        image_url: "",
        created_at: null,
      },
      errors: {},
    };
  },
  mounted() {
    this.loadService();
  },
  methods: {
    async loadService() {
      try {
        const res = await api.get(`/services/${this.$route.params.id}`);
        this.form = {
          ...res.data,
          status: !!res.data.status,
        };
      } catch (err) {
        console.error("Không tải được dịch vụ:", err);
        alert("Không tải được dịch vụ!");
        this.$router.push("/dich-vu");
      }
    },
    async updateService() {
      this.errors = {};
      try {
        await api.put(`/services/${this.$route.params.id}`, this.form);
        alert("Cập nhật dịch vụ thành công!");
        this.$router.push("/dich-vu");
      } catch (err) {
        if (err.response && err.response.status === 422) {
          this.errors = err.response.data.errors || err.response.data;
          alert("Cập nhật thất bại: Kiểm tra dữ liệu nhập!");
        } else {
          console.error("Lỗi update dịch vụ:", err);
          alert("Cập nhật dịch vụ thất bại do lỗi server!");
        }
      }
    },
  },
};
</script>

<style scoped>
.card {
  border-radius: 15px;
}

h2 {
  font-size: 1.8rem;
}

.form-control-lg,
.form-select-lg {
  font-size: 1.1rem;
  padding: 0.75rem;
}
</style>
