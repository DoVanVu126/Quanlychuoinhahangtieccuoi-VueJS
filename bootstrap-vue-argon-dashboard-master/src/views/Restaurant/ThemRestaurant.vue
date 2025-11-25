<template>
  <div class="container mt-5">
    <h2>Thêm Nhà Hàng</h2>
    <b-form @submit.prevent="addRestaurant">
      <!-- Tên nhà hàng -->
      <b-form-group label="Tên nhà hàng">
        <b-form-input v-model="form.name" required></b-form-input>
      </b-form-group>

      <!-- Thành phố -->
      <b-form-group label="Thành phố">
        <b-form-input v-model="form.city" required></b-form-input>
      </b-form-group>

      <!-- Giá bàn -->
      <b-form-group label="Giá bàn (VNĐ)">
        <b-form-input type="number" v-model="form.price_table" min="0" required></b-form-input>
      </b-form-group>

      <!-- Xếp hạng -->
      <b-form-group label="Xếp hạng (★)">
        <b-form-input type="number" step="0.1" v-model="form.star_rating" min="0" max="5" required></b-form-input>
      </b-form-group>

      <!-- Upload ảnh -->
      <b-form-group label="Ảnh nhà hàng">
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
        <b-button variant="secondary" @click="$router.push('/restaurants')">⬅ Quay lại</b-button>
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
        city: "",
        price_table: 0,
        star_rating: 0,
      },
      imageFile: null,
      previewImage: null,
    };
  },
  methods: {
    handleImageUpload(e) {
      const file = e.target.files[0];
      if (file) {
        this.imageFile = file;
        this.previewImage = URL.createObjectURL(file);
      }
    },

    async addRestaurant() {
      try {
        const formData = new FormData();
        formData.append("name", this.form.name);
        formData.append("city", this.form.city);
        formData.append("price_table", this.form.price_table);
        formData.append("star_rating", this.form.star_rating);
        if (this.imageFile) {
          formData.append("image", this.imageFile);
        }

        await api.post("/restaurants", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  alert("✅ Đã thêm nhà hàng: " + this.form.name);
  // Dùng name route an toàn hơn
  this.$router.push({ name: "Restaurant" });
} catch (err) {
  console.error("❌ Lỗi thêm nhà hàng:", err.response || err);
  alert("Thêm nhà hàng thất bại!");
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
