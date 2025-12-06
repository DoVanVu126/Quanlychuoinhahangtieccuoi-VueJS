<template>
  <div class="container mt-5">
    <h2 class="mb-4 text-primary">🛠 Sửa Sảnh</h2>

    <b-form @submit.prevent="updateHall">
      <!-- Tên sảnh -->
      <b-form-group label="Tên sảnh">
        <b-form-input v-model="form.name" required></b-form-input>
        <small v-if="errors.name" class="text-danger">{{ errors.name[0] }}</small>
      </b-form-group>

      <!-- Mô tả -->
      <b-form-group label="Mô tả">
        <b-form-textarea v-model="form.description" rows="3"></b-form-textarea>
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
        <b-form-select
          v-model="form.restaurant_id"
          :options="restaurantOptions"
          disabled>
        </b-form-select>
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
          <img :src="previewImage" class="img-thumbnail mb-2" style="width:150px;height:150px;object-fit:cover" />
        </div>

        <div v-else-if="form.image_url">
          <img :src="getImageUrl(form.image_url)" class="img-thumbnail mb-2" style="width:150px;height:150px;object-fit:cover" />
        </div>

        <b-form-file
          @change="handleImageUpload"
          accept="image/*"
          placeholder="Chọn ảnh mới nếu muốn thay">
        </b-form-file>
      </b-form-group>

      <!-- Nút -->
      <div class="d-flex align-items-center gap-2 mt-3">
        <b-button type="submit" variant="primary" :disabled="loading">
          <span v-if="!loading">💾 Cập nhật</span>

          <span v-if="loading" class="d-flex align-items-center">
            <span class="spinner-border spinner-border-sm mr-2"></span>
            Đang lưu...
          </span>
        </b-button>

        <b-button variant="secondary" @click="$router.push('/sanh')">
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
        hall_id: null,
        name: "",
        description: "",
        capacity: null,
        price: null,
        restaurant_id: null,
        status: "available",
        image_url: null,
        newImage: null,
      },
      previewImage: null,
      restaurants: [],
      errors: {},
      loading: false
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

  mounted() {
    this.fetchRestaurants();
    this.loadHall();
  },

  methods: {
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

    getImageUrl(url) {
      if (!url) return null;
      if (url.startsWith("http")) return url;
      return `http://127.0.0.1:8088/${url.replace(/^\/+/, "")}`;
    },

    handleImageUpload(e) {
      const file = e.target.files[0];
      if (file) {
        this.form.newImage = file;
        this.previewImage = URL.createObjectURL(file);
      }
    },

    validateForm() {
      this.errors = {};

      if (!this.form.name || this.form.name.trim() === "") {
        this.errors.name = ["Tên sảnh không được để trống"];
      }

      if (!this.form.capacity || this.form.capacity <= 0) {
        this.errors.capacity = ["Sức chứa phải lớn hơn 0"];
      }

      if (!this.form.price || this.form.price <= 0) {
        this.errors.price = ["Giá phải lớn hơn 0"];
      }

      return Object.keys(this.errors).length === 0;
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

        if (this.form.newImage) {
          formData.append("image", this.form.newImage);
        }

        await api.post(`/halls/${this.form.hall_id}?_method=PUT`, formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });

        // ✅ Toast thành công
        this.$bvToast.toast("Cập nhật sảnh thành công ✅", {
          title: "Thành công",
          variant: "success",
          solid: true,
          autoHideDelay: 3000
        });

        // ✅ Quay lại sau 1s
        setTimeout(() => {
          this.$router.push("/sanh");
        }, 1000);

      } catch (err) {
        if (err.response && err.response.status === 422) {
          this.errors = err.response.data.errors || {};
        } else {
          this.$bvToast.toast("Lỗi hệ thống ❌", {
            title: "Lỗi",
            variant: "danger",
            solid: true
          });
        }
      } finally {
        this.loading = false;
      }
    }
  }
};
</script>

<style scoped>
.container {
  max-width: 700px;
}

.img-thumbnail {
  border-radius: 12px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
}
</style>
