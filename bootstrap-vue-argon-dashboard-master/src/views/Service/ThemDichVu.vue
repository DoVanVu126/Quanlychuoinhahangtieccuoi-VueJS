<template>
  <div class="container mt-5">
    <h2>Thêm Dịch Vụ</h2>
    <b-form @submit.prevent="addService">
      <!-- Tên dịch vụ -->
      <b-form-group label="Tên dịch vụ">
        <b-form-input v-model="form.name" required></b-form-input>
      </b-form-group>

      <!-- Mô tả -->
      <b-form-group label="Mô tả">
        <b-form-textarea v-model="form.description" rows="3" required></b-form-textarea>
      </b-form-group>

      <!-- Giá -->
      <b-form-group label="Giá (VNĐ)">
        <b-form-input type="number" v-model="form.price" min="0" required></b-form-input>
      </b-form-group>

      <!-- ID Nhà hàng -->
      <b-form-group label="ID Nhà hàng">
        <b-form-input type="number" v-model="form.restaurant_id" min="1" required></b-form-input>
      </b-form-group>

      <!-- Trạng thái -->
      <b-form-group label="Trạng thái">
        <b-form-select v-model="form.status" :options="statusOptions"></b-form-select>
      </b-form-group>

      <!-- Upload ảnh -->
      <b-form-group label="Ảnh dịch vụ">
        <b-form-file
          @change="handleImageUpload"
          accept="image/*"
          browse-text="Chọn ảnh"
          placeholder="Chưa chọn ảnh nào"
        ></b-form-file>

        <!-- Hiển thị ảnh xem trước -->
        <div v-if="previewImage" class="mt-3 text-center">
          <img :src="previewImage" alt="Preview" class="img-thumbnail" style="max-width: 200px;" />
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
    };
  },
  methods: {
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
      try {
        const formData = new FormData();
        formData.append("name", this.form.name);
        formData.append("description", this.form.description);
        formData.append("price", this.form.price);
        formData.append("restaurant_id", this.form.restaurant_id);
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
        console.error("❌ Lỗi thêm dịch vụ:", err);
        alert("Thêm dịch vụ thất bại!");
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
