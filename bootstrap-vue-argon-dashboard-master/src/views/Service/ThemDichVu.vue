<template>
  <div class="container mt-5">
    <h2>Thêm Dịch Vụ</h2>
    <b-form @submit.prevent="addService">

      <!-- Tên dịch vụ -->
      <b-form-group label="Tên dịch vụ" label-for="name">
        <b-form-input
          id="name"
          v-model="form.name"
          required
          placeholder="Nhập tên dịch vụ"
        ></b-form-input>
      </b-form-group>

      <!-- Mô tả -->
      <b-form-group label="Mô tả" label-for="description">
        <b-form-textarea
          id="description"
          v-model="form.description"
          rows="3"
          placeholder="Nhập mô tả dịch vụ"
        ></b-form-textarea>
      </b-form-group>

      <!-- Giá -->
      <b-form-group label="Giá (VNĐ)" label-for="price">
        <b-form-input
          id="price"
          type="number"
          v-model.number="form.price"
          required
          min="0"
          placeholder="Nhập giá dịch vụ"
        ></b-form-input>
      </b-form-group>

      <!-- Nhà hàng -->
      <b-form-group label="Nhà hàng" label-for="restaurant_id">
        <b-form-select
          id="restaurant_id"
          v-model="form.restaurant_id"
          :options="restaurants"
          required
        >
          <template #first>
            <b-form-select-option :value="null" disabled>-- Chọn nhà hàng --</b-form-select-option>
          </template>
        </b-form-select>
      </b-form-group>

      <!-- Trạng thái -->
      <b-form-group label="Trạng thái" label-for="status">
        <b-form-select
          id="status"
          v-model="form.status"
          :options="statusOptions"
        ></b-form-select>
      </b-form-group>

      <!-- Upload ảnh -->
      <b-form-group label="Ảnh dịch vụ" label-for="image">
        <b-form-file
          id="image"
          @change="handleImageUpload"
          accept="image/*"
          placeholder="Chọn file ảnh..."
        ></b-form-file>

        <div v-if="previewImage" class="mt-3 text-center">
          <img :src="previewImage" alt="Preview" class="img-thumbnail" style="max-width: 200px;">
        </div>
      </b-form-group>

      <!-- Nút hành động -->
      <div class="d-flex justify-content-between">
        <b-button type="submit" variant="success">💾 Lưu</b-button>
        <b-button variant="secondary" @click="$router.push('/dich-vu')">⬅ Quay lại</b-button>
      </div>
    </b-form>
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
        status: "available", // mặc định
      },
      imageFile: null,
      previewImage: null,
      statusOptions: [
        { value: "available", text: "Có sẵn" },
        { value: "unavailable", text: "Không khả dụng" },
        { value: "maintenance", text: "Bảo trì" },
      ],
      restaurants: [], // combobox nhà hàng
    };
  },
  mounted() {
    this.fetchRestaurants();
  },
  methods: {
    // Lấy danh sách nhà hàng từ API
    async fetchRestaurants() {
      try {
        const res = await api.get("/restaurants");
        const dataArray = Array.isArray(res.data) ? res.data : res.data.data || [];
        this.restaurants = dataArray.map(r => ({
          value: r.restaurant_id,
          text: r.name
        }));
      } catch (err) {
        console.error("❌ Lỗi tải nhà hàng:", err);
        alert("Không thể tải danh sách nhà hàng");
      }
    },

    // Xử lý upload ảnh và xem trước
    handleImageUpload(e) {
      const file = e.target.files[0];
      if (file) {
        this.imageFile = file;
        this.previewImage = URL.createObjectURL(file);
      }
    },

    // Gửi form lên server
    async addService() {
      if (!this.form.restaurant_id) {
        alert("Vui lòng chọn nhà hàng");
        return;
      }

      try {
        const formData = new FormData();
        formData.append("name", this.form.name);
        formData.append("description", this.form.description);
        formData.append("price", this.form.price);
        formData.append("restaurant_id", Number(this.form.restaurant_id)); // ép kiểu số
        formData.append("status", this.form.status);
        if (this.imageFile) {
          formData.append("image", this.imageFile);
        }

        await api.post("/services", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        alert("✅ Đã thêm dịch vụ: " + this.form.name);
        this.$router.push("/dich-vu");
      } catch (err) {
        console.error(
  "❌ Lỗi thêm dịch vụ:",
  err && err.response && err.response.data ? err.response.data : err
);
        alert("Thêm dịch vụ thất bại! Kiểm tra console để biết chi tiết.");
      }
    },
  },
};
</script>

<style scoped>
.container {
  max-width: 700px;
}

h2 {
  font-weight: 600;
  margin-bottom: 20px;
}

.b-form-group {
  margin-bottom: 1.2rem;
}

.img-thumbnail {
  border-radius: 12px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
}
</style>
