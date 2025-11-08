<template>
  <div class="container mt-5">
    <h2 class="mb-4 text-primary">🛠 Sửa Dịch Vụ</h2>

    <b-form @submit.prevent="updateService">
      <!-- Tên dịch vụ -->
      <b-form-group label="Tên dịch vụ">
        <b-form-input v-model="form.name" required></b-form-input>
      </b-form-group>

      <!-- Mô tả -->
      <b-form-group label="Mô tả">
        <b-form-textarea v-model="form.description" rows="3"></b-form-textarea>
      </b-form-group>

      <!-- Giá -->
      <b-form-group label="Giá (VNĐ)">
        <b-form-input type="number" v-model="form.price" required></b-form-input>
      </b-form-group>

      <!-- Nhà hàng -->
      <b-form-group label="ID Nhà hàng">
        <b-form-input
          type="number"
          v-model="form.restaurant_id"
          required
        ></b-form-input>
      </b-form-group>

      <!-- Trạng thái -->
      <b-form-group label="Trạng thái">
        <b-form-select v-model="form.status">
          <b-form-select-option value="available">Hoạt động</b-form-select-option>
          <b-form-select-option value="unavailable">Ngưng hoạt động</b-form-select-option>
          <b-form-select-option value="maintenance">Bảo trì</b-form-select-option>
        </b-form-select>
      </b-form-group>

      <!-- Ảnh hiện tại -->
      <b-form-group label="Ảnh hiện tại">
        <div v-if="form.image_url">
          <img
            :src="getImageUrl(form.image_url)"
            alt="Ảnh dịch vụ"
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
        <b-button variant="secondary" @click="$router.push('/dich-vu')">
          Hủy
        </b-button>
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
        status: "available",
        image_url: null,
        newImage: null, // ảnh mới nếu chọn thay
      },
    };
  },
  mounted() {
    this.loadService();
  },
  methods: {
    // ✅ Lấy dữ liệu dịch vụ cần sửa
    async loadService() {
      try {
        const res = await api.get(`/services/${this.$route.params.id}`);
        this.form = {
          ...res.data,
          newImage: null, // reset ảnh mới
        };
      } catch (err) {
        console.error("❌ Không tải được dịch vụ:", err);
        alert("Không tải được dịch vụ!");
        this.$router.push("/dich-vu");
      }
    },

    // ✅ Hiển thị đúng URL ảnh
    getImageUrl(url) {
      if (!url) return null;
      if (url.startsWith("http")) return url;
      return `http://127.0.0.1:8088/${url.replace(/^\/+/, "")}`;
    },

    // ✅ Gửi dữ liệu cập nhật (kể cả ảnh mới)
    async updateService() {
      try {
        const formData = new FormData();
        formData.append("name", this.form.name);
        formData.append("description", this.form.description);
        formData.append("price", this.form.price);
        formData.append("restaurant_id", this.form.restaurant_id);
        formData.append("status", this.form.status);

        if (this.form.newImage) {
          formData.append("image", this.form.newImage);
        }

        await api.post(
          `/services/${this.$route.params.id}?_method=PUT`,
          formData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );

        alert("✅ Cập nhật dịch vụ thành công!");
        this.$router.push("/dich-vu");
      } catch (err) {
        console.error("❌ Lỗi cập nhật:", err);
        alert("Cập nhật thất bại!");
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
