<template>
  <div class="container mt-5">
    <h2>Thêm Sảnh</h2>
    <b-form @submit.prevent="addHall">
      <!-- Tên sảnh -->
      <b-form-group label="Tên sảnh">
        <b-form-input v-model="form.name" required></b-form-input>
      </b-form-group>

      <!-- Chọn nhà hàng từ combobox -->
      <b-form-group label="Nhà hàng">
        <b-form-select v-model="form.restaurant_id" :options="restaurantOptions" required>
          <template #first>
            <b-form-select-option :value="''" disabled>-- Chọn nhà hàng --</b-form-select-option>
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

        <!-- Hiển thị ảnh xem trước -->
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
        restaurant_id: "", // lưu ID nhà hàng khi chọn
        capacity: "",
        price: "",
        status: "available",
      },
      imageFile: null,
      previewImage: null,
      restaurants: [], // dữ liệu danh sách nhà hàng
      statusOptions: [
        { value: "available", text: "Có sẵn" },
        { value: "unavailable", text: "Đã đặt" },
        { value: "maintenance", text: "Bảo trì" },
      ],
    };
  },
  computed: {
    restaurantOptions() {
      return this.restaurants.map(r => ({
        value: r.restaurant_id,
        text: r.name
      }));
    }
  },
  methods: {
    async fetchRestaurants() {
      try {
        const res = await api.get("/restaurants"); // API lấy danh sách nhà hàng
        this.restaurants = res.data;
      } catch (err) {
        console.error("Lỗi tải danh sách nhà hàng:", err);
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
      if (!this.form.restaurant_id) {
        alert("Vui lòng chọn nhà hàng!");
        return;
      }

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
    this.fetchRestaurants(); // tải danh sách nhà hàng khi mở trang
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
