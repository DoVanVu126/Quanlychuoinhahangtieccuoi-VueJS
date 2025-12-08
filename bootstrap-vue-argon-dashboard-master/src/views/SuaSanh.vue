<template>
  <div class="container mt-5">
    <h2 class="mb-4 text-primary">🛠 Sửa Sảnh</h2>

    <!-- Spinner -->
    <div v-if="loading" class="form-loading">
      <div class="custom-spinner"></div>
      <span class="loading-text">Đang xử lý...</span>
    </div>

    <b-form @submit.prevent="updateHall">

      <!-- Tên sảnh -->
      <b-form-group label="Tên sảnh">
        <b-form-input v-model="form.name" required></b-form-input>
        <small v-if="errors.name" class="text-danger">{{ errors.name[0] }}</small>
      </b-form-group>

      <!-- Mô tả -->
      <b-form-group label="Mô tả">
        <b-form-textarea v-model="form.description" rows="3"></b-form-textarea>
        <small v-if="errors.description" class="text-danger">{{ errors.description[0] }}</small>
      </b-form-group>

      <!-- Sức chứa -->
      <b-form-group label="Sức chứa">
        <b-form-input type="number" v-model.number="form.capacity"></b-form-input>
        <small v-if="errors.capacity" class="text-danger">{{ errors.capacity[0] }}</small>
      </b-form-group>

      <!-- Giá -->
      <b-form-group label="Giá (VNĐ)">
        <b-form-input type="number" v-model.number="form.price"></b-form-input>
        <small v-if="errors.price" class="text-danger">{{ errors.price[0] }}</small>
      </b-form-group>

      <!-- Nhà hàng -->
      <b-form-group label="Nhà hàng">
        <b-form-select v-model="form.restaurant_id" :options="restaurantOptions" disabled></b-form-select>
      </b-form-group>

      <!-- Trạng thái -->
      <b-form-group label="Trạng thái">
        <b-form-select v-model="form.status">
          <b-form-select-option value="available">Có sẵn</b-form-select-option>
          <b-form-select-option value="unavailable">Đã đặt</b-form-select-option>
          <b-form-select-option value="maintenance">Bảo trì</b-form-select-option>
        </b-form-select>
      </b-form-group>

      <!-- Ảnh -->
      <b-form-group label="Ảnh sảnh">
        <div v-if="previewImage">
          <p>Ảnh mới:</p>
          <img :src="previewImage" class="preview-img" />
        </div>
        <div v-else-if="form.image_url">
          <p>Ảnh hiện tại:</p>
          <img :src="getImageUrl(form.image_url)" class="preview-img" />
        </div>
        <p v-else class="text-muted">Không có ảnh</p>

        <b-form-file @change="handleImageUpload" accept="image/*"></b-form-file>
      </b-form-group>

      <!-- Nút -->
      <div class="d-flex gap-2 mt-3">
        <b-button type="submit" variant="primary" :disabled="loading">
          {{ loading ? "Đang lưu..." : "💾 Cập nhật" }}
        </b-button>
        <b-button variant="secondary" @click="$router.push('/sanh')">Hủy</b-button>
      </div>
    </b-form>

    <!-- TOAST -->
    <b-toast
      id="toast-success"
      title="✅ Thành công"
      variant="success"
      solid
      auto-hide-delay="3000"
    >
      Cập nhật sảnh thành công!
    </b-toast>
  </div>
</template>

<script>
import api from "@/api";

export default {
  data() {
    return {
      form: {
        hall_id: null,
        name: "",
        description: "",
        capacity: null,
        price: null,
        restaurant_id: null,
        status: "available",
        image_url: null,
        newImage: null,
        version: 0
      },
      previewImage: null,
      restaurants: [],
      errors: {},
      loading: false
    };
  },

  computed: {
    restaurantOptions() {
      return this.restaurants.map(r => ({ value: r.restaurant_id, text: r.name }));
    }
  },

  mounted() {
    Promise.all([this.fetchRestaurants(), this.loadHall()]).catch(err => console.error(err));
  },

  methods: {
    getImageUrl(url) {
      if (!url) return "/images/default.png";
      return url.startsWith("http") ? url : `http://127.0.0.1:8088/${url.replace(/^\/+/, "")}`;
    },

    handleImageUpload(e) {
      const file = e.target.files[0];
      if (file) {
        if (!file.type.startsWith("image/")) {
          alert("File phải là ảnh (jpg, png, webp...)");
          e.target.value = null;
          return;
        }
        this.form.newImage = file;
        this.previewImage = URL.createObjectURL(file);
      }
    },

    async fetchRestaurants() {
      try {
        const res = await api.get("/restaurants");
        this.restaurants = Array.isArray(res.data) ? res.data : res.data.data || [];
      } catch (err) {
        console.error("Lỗi tải nhà hàng", err);
      }
    },

    async loadHall() {
      try {
        const res = await api.get(`/halls/${this.$route.params.id}`);
        this.form = { ...res.data, newImage: null };
        this.previewImage = null;
      } catch {
        alert("Không tải được sảnh");
        this.$router.push("/sanh");
      }
    },

    validateForm() {
  const errors = {};
  const f = this.form;

  // Chuẩn hóa khoảng trắng
  f.name = (f.name || '').replace(/\s+/g, ' ').trim();
  f.description = (f.description || '').replace(/<[^>]*>/g, '').trim();

  // Tên sảnh
  if (!f.name) errors.name = ["Tên sảnh không được để trống."];
  else if (f.name.length > 150) errors.name = ["Tên sảnh không quá 150 ký tự."];

  // Mô tả
  if (f.description.length > 500) errors.description = ["Mô tả không quá 500 ký tự."];

  // Sức chứa
  if (!f.capacity || f.capacity <= 0) errors.capacity = ["Sức chứa phải lớn hơn 0"];

  // Giá
  if (f.price == null || isNaN(f.price)) errors.price = ["Giá không hợp lệ."];
  if (/[０-９]/.test(String(f.price))) errors.price = ["Giá không được dùng số full-width."];
  if (f.price < 0) errors.price = ["Giá phải >= 0"];

  // Ảnh
  if (f.newImage && !f.newImage.type.startsWith("image/")) errors.image = ["File tải lên phải là ảnh."];

  this.errors = errors;
  return Object.keys(errors).length === 0;
},

    async updateHall() {
      if (!this.validateForm()) return;
      this.loading = true;

      try {
        const formData = new FormData();
        formData.append("name", this.form.name);
        formData.append("description", this.form.description || "");
        formData.append("capacity", this.form.capacity);
        formData.append("price", this.form.price);
        formData.append("restaurant_id", this.form.restaurant_id);
        formData.append("status", this.form.status);
        formData.append("version", this.form.version);
        if (this.form.newImage) formData.append("image", this.form.newImage);

        await api.post(`/halls/${this.form.hall_id}?_method=PUT`, formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });

        this.$bvToast.toast("Cập nhật sảnh thành công ✅", {
          title: "Thành công",
          variant: "success",
          solid: true,
          autoHideDelay: 3000
        });

        setTimeout(() => this.$router.push("/sanh"), 900);

      } catch (err) {
        if (err.response && err.response.status === 422) {
          this.errors = err.response.data.errors || {};
        } else {
          this.$bvToast.toast("Lỗi hệ thống ❌", { title: "Lỗi", variant: "danger", solid: true });
        }
      } finally {
        this.loading = false;
      }
    }
  }
};
</script>

<style scoped>
.container { max-width: 700px; }
.preview-img { width: 160px; height: 160px; border-radius: 10px; object-fit: cover; border: 2px solid #ddd; margin-bottom: 10px; transition: 0.3s; }
.preview-img:hover { transform: scale(1.05); }
.form-loading { display:flex; align-items:center; gap:12px; padding:12px 16px; background:#f8f9fa; border-radius:12px; margin-bottom:15px; font-weight:500; }
.custom-spinner { width:32px; height:32px; border:4px solid #e0e0e0; border-top:4px solid #007bff; border-radius:50%; animation:spin 0.6s linear infinite; }
.loading-text { font-size:16px; font-weight:600; }
@keyframes spin { 0% { transform: rotate(0deg);} 100% { transform: rotate(360deg);} }
</style>
