<template>
  <div class="container mt-5" style="max-width: 800px;">
    <h2 class="text-center mb-4 text-primary fw-bold">Thêm Dịch vụ mới</h2>

    <div class="card shadow-lg border-0">
      <div class="card-body p-4">
        <form @submit.prevent="addService">
          <!-- Tên dịch vụ -->
          <div class="mb-3">
            <label class="form-label fw-semibold">Tên dịch vụ</label>
            <input type="text" class="form-control form-control-lg" v-model="form.name" required />
            <small class="text-danger" v-if="errors.name">{{ errors.name[0] }}</small>
          </div>

          <!-- Mô tả -->
          <div class="mb-3">
            <label class="form-label fw-semibold">Mô tả</label>
            <textarea
              class="form-control form-control-lg"
              v-model="form.description"
              rows="4"
              placeholder="Nhập mô tả dịch vụ..."
            ></textarea>
            <small class="text-danger" v-if="errors.description">{{ errors.description[0] }}</small>
          </div>

          <!-- Giá và ID nhà hàng -->
          <div class="row">
            <div class="col-md-6 mb-3">
              <label class="form-label fw-semibold">Giá (VNĐ)</label>
              <input
                type="number"
                class="form-control form-control-lg"
                v-model="form.price"
                min="0"
                required
              />
              <small class="text-danger" v-if="errors.price">{{ errors.price[0] }}</small>
            </div>
            <div class="col-md-6 mb-3">
              <label class="form-label fw-semibold">ID Nhà hàng</label>
              <input
                type="number"
                class="form-control form-control-lg"
                v-model="form.restaurant_id"
                required
              />
              <small class="text-danger" v-if="errors.restaurant_id">{{ errors.restaurant_id[0] }}</small>
            </div>
          </div>

          <!-- Nút -->
          <div class="d-flex justify-content-between mt-4">
            <router-link to="/dich-vu" class="btn btn-secondary btn-lg px-4">
              <i class="fas fa-arrow-left me-2"></i> Hủy
            </router-link>
            <button type="submit" class="btn btn-primary btn-lg px-4">
              <i class="fas fa-plus-circle me-2"></i> Thêm mới
            </button>
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
      },
      errors: {},
    };
  },
  methods: {
    async addService() {
      this.errors = {};
      try {
        await api.post("/services", this.form);
        alert("Thêm dịch vụ thành công!");
        this.$router.push("/dich-vu");
      } catch (err) {
        alert("Thêm dịch vụ thất bại!");
        if (err.response && err.response.status === 422) {
          this.errors = err.response.data;
        } else {
          console.error("Lỗi thêm dịch vụ:", err);
        }
      }
    },
  },
};
</script>

<style scoped>
.card {
  border-radius: 12px;
}

input,
textarea {
  font-size: 1.05rem;
}

label {
  font-size: 1rem;
}

.btn {
  min-width: 130px;
}

h2 {
  font-size: 1.8rem;
}

.container {
  padding-top: 80px;
}
</style>
