<template>
  <div class="container mt-5">
    <h2 class="mb-4 text-primary">🛠 Sửa Sảnh</h2>

    <b-form @submit.prevent="updateHall">
      <!-- Tên sảnh -->
      <b-form-group label="Tên sảnh">
        <b-form-input v-model="form.name" required></b-form-input>
      </b-form-group>

      <!-- Sức chứa -->
      <b-form-group label="Sức chứa">
        <b-form-input type="number" v-model="form.capacity"></b-form-input>
      </b-form-group>

      <!-- Giá -->
      <b-form-group label="Giá (VNĐ)">
        <b-form-input type="number" v-model="form.price"></b-form-input>
      </b-form-group>

      <!-- Nhà hàng (bắt buộc) -->
      <b-form-group label="ID Nhà hàng">
        <b-form-input type="number" v-model="form.restaurant_id" required></b-form-input>
      </b-form-group>

      <!-- Mô tả -->
      <b-form-group label="Mô tả">
        <b-form-textarea v-model="form.description" rows="3"></b-form-textarea>
      </b-form-group>

      <!-- Trạng thái -->
      <b-form-group label="Trạng thái">
        <b-form-select v-model="form.status">
          <b-form-select-option value="available">available</b-form-select-option>
          <b-form-select-option value="unavailable">unavailable</b-form-select-option>
          <b-form-select-option value="maintenance">maintenance</b-form-select-option>
        </b-form-select>
      </b-form-group>

      <!-- Ảnh hiện tại -->
      <b-form-group label="Ảnh hiện tại">
        <div v-if="form.image_url">
          <img
            :src="getImageUrl(form.image_url)"
            alt="Ảnh sảnh"
            class="rounded shadow-sm border mb-2"
            style="width: 150px; height: 150px; object-fit: cover"
          />
        </div>
        <p v-else class="text-muted">Không có ảnh</p>

        <!-- Chọn ảnh mới -->
        <b-form-file
          v-model="form.newImage"
          accept="image/*"
          placeholder="Chọn ảnh mới nếu muốn thay"
        ></b-form-file>
      </b-form-group>

      <!-- Nút thao tác -->
      <div class="d-flex gap-2 mt-3">
        <b-button type="submit" variant="primary">💾 Cập nhật</b-button>
        <b-button variant="secondary" @click="$router.push('/sanh')">Hủy</b-button>
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
        capacity: 0,
        price: 0,
        restaurant_id: null,
        description: "",
        status: "available",
        image_url: null,
        newImage: null, // ảnh mới nếu chọn thay
      },
    };
  },
  mounted() {
    this.loadHall();
  },
  methods: {
    // ✅ Lấy dữ liệu sảnh cần sửa
    async loadHall() {
      try {
        const res = await api.get(`/halls/${this.$route.params.id}`);
        this.form = {
          ...res.data,
          newImage: null,
          description: res.data.description || "",
          restaurant_id: res.data.restaurant_id || 1,
        };
      } catch (err) {
        console.error("❌ Không tải được sảnh:", err);
        alert("Không tải được sảnh!");
        this.$router.push("/sanh");
      }
    },

    // ✅ Hiển thị đúng URL ảnh
    getImageUrl(url) {
      if (!url) return "/images/no-image.png"; // placeholder local
      if (url.startsWith("http")) return url;
      return `http://127.0.0.1:8088/${url.replace(/^\/+/, "")}`;
    },

    // ✅ Gửi dữ liệu cập nhật (kể cả ảnh mới)
    async updateHall() {
      try {
        const formData = new FormData();
        formData.append("name", this.form.name);
        formData.append("capacity", this.form.capacity || 0);
        formData.append("price", this.form.price || 0);
        formData.append("status", this.form.status);
        formData.append("restaurant_id", this.form.restaurant_id || 1);
        formData.append("description", this.form.description || "");

        if (this.form.newImage) {
          formData.append("image", this.form.newImage);
        }

        await api.post(
          `/halls/${this.$route.params.id}?_method=PUT`,
          formData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );

        alert("✅ Cập nhật sảnh thành công!");
        this.$router.push("/sanh");
      } catch (err) {
        console.error("❌ Lỗi cập nhật:", err.response && err.response.data ? err.response.data : err);

        alert("Cập nhật thất bại! Kiểm tra console để biết chi tiết.");
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
  color: #0069d9;
}

.b-form-group {
  margin-bottom: 1.2rem;
}

img {
  transition: 0.3s;
}
img:hover {
  transform: scale(1.05);
}
</style>
