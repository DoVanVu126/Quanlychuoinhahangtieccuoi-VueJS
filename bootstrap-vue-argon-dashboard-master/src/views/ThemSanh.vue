<template>
  <div class="container mt-5">
    <h2>Thêm Sảnh</h2>
    <b-form @submit.prevent="addHall">
      <!-- Tên sảnh -->
      <b-form-group label="Tên sảnh">
        <b-form-input v-model="form.name" required></b-form-input>
      </b-form-group>

      <!-- Chọn Nhà hàng -->
      <b-form-group label="Nhà hàng">
        <b-form-select v-model="form.restaurant_id" :options="restaurants">
          <template #first>
            <b-form-select-option :value="null" disabled>-- Chọn nhà hàng --</b-form-select-option>
          </template>
        </b-form-select>
      </b-form-group>

      <!-- Sức chứa -->
      <b-form-group label="Sức chứa (người)">
        <b-form-input type="number" v-model="form.capacity" min="1" required></b-form-input>
      </b-form-group>

      <!-- Giá thuê -->
      <b-form-group label="Giá thuê (VNĐ)">
        <b-form-input type="number" v-model="form.price" min="0" required></b-form-input>
      </b-form-group>

      <!-- Mô tả -->
      <b-form-group label="Mô tả">
        <b-form-textarea v-model="form.description" rows="3" placeholder="Nhập mô tả sảnh (tùy chọn)"></b-form-textarea>
      </b-form-group>

      <!-- Trạng thái -->
      <b-form-group label="Trạng thái">
        <b-form-select v-model="form.status" :options="statusOptions"></b-form-select>
      </b-form-group>

      <!-- Upload ảnh -->
      <b-form-group label="Ảnh sảnh">
        <b-form-file
          @change="handleImageUpload"
          accept="image/*"
          browse-text="Chọn ảnh"
          placeholder="Chưa chọn ảnh nào"
        ></b-form-file>

        <div v-if="previewImage" class="mt-3 text-center">
          <img :src="previewImage" alt="Preview" class="img-thumbnail" style="max-width: 200px;" />
        </div>
      </b-form-group>

      <!-- Nút hành động -->
      <div class="d-flex justify-content-between">
        <b-button type="submit" variant="success">💾 Lưu</b-button>
        <b-button variant="secondary" @click="$router.push('/sanh')">⬅ Quay lại</b-button>
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
        restaurant_id: null,
        capacity: "",
        price: "",
        description: "",   // <-- thêm mô tả
        status: "available",
      },
      imageFile: null,
      previewImage: null,
      restaurants: [],
      statusOptions: [
        { value: "available", text: "Có sẵn" },
        { value: "unavailable", text: "Đã đặt" },
        { value: "maintenance", text: "Bảo trì" },
      ],
    };
  },
  methods: {
    async fetchRestaurants() {
      try {
        const res = await api.get("/restaurants");
        const dataArray = Array.isArray(res.data) ? res.data : res.data.data || [];
        this.restaurants = dataArray.map(r => ({
          value: r.restaurant_id,
          text: r.name,
        }));
      } catch (err) {
        console.error("❌ Lỗi tải danh sách nhà hàng:", err);
      }
    },

    handleImageUpload(e) {
      const file = e.target.files[0];
      if (file) {
        this.imageFile = file;
        this.previewImage = URL.createObjectURL(file);
      }
    },

    async addHall() {
      try {
        const formData = new FormData();
        for (const key in this.form) {
          formData.append(key, this.form[key]);
        }
        if (this.imageFile) {
          formData.append("image", this.imageFile);
        }

        await api.post("/halls", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        alert("✅ Đã thêm sảnh: " + this.form.name);
        this.$router.push("/sanh");
      } catch (err) {
        console.error("❌ Lỗi thêm sảnh:", err);
        alert("Thêm sảnh thất bại!");
      }
    },
  },
  mounted() {
    this.fetchRestaurants();
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
