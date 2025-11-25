<template>
  <div class="container mt-5">
    <h2>Thêm Khuyến Mãi</h2>

    <b-form @submit.prevent="addPromotion" enctype="multipart/form-data">

      <!-- Mã khuyến mãi -->
      <b-form-group label="Mã khuyến mãi" label-for="promotion_code">
        <b-form-input
          id="promotion_code"
          v-model="form.promotion_code"
          required
          placeholder="Nhập mã khuyến mãi"
        ></b-form-input>
      </b-form-group>

      <!-- Tiêu đề -->
      <b-form-group label="Tiêu đề" label-for="title">
        <b-form-input
          id="title"
          v-model="form.title"
          required
          placeholder="Nhập tiêu đề"
        ></b-form-input>
      </b-form-group>

      <!-- Mô tả -->
      <b-form-group label="Mô tả" label-for="description">
        <b-form-textarea
          id="description"
          v-model="form.description"
          placeholder="Mô tả khuyến mãi"
          rows="3"
        ></b-form-textarea>
      </b-form-group>

      <!-- Loại giảm giá -->
      <b-form-group label="Loại giảm giá" label-for="discount_type">
        <b-form-select
          id="discount_type"
          v-model="form.discount_type"
          :options="discountTypeOptions"
          required
        ></b-form-select>
      </b-form-group>

      <!-- Giá trị giảm -->
      <b-form-group label="Giá trị giảm" label-for="discount_value">
        <b-form-input
          id="discount_value"
          type="number"
          v-model.number="form.discount_value"
          min="0"
          required
        ></b-form-input>
      </b-form-group>

      <!-- Ngày bắt đầu -->
      <b-form-group label="Ngày bắt đầu" label-for="start_date">
        <b-form-input
          id="start_date"
          type="date"
          v-model="form.start_date"
          required
        ></b-form-input>
      </b-form-group>

      <!-- Ngày kết thúc -->
      <b-form-group label="Ngày kết thúc" label-for="end_date">
        <b-form-input
          id="end_date"
          type="date"
          v-model="form.end_date"
          required
        ></b-form-input>
      </b-form-group>

      <!-- Nhà hàng -->
      <b-form-group label="Nhà hàng" label-for="restaurant_id">
        <b-form-select
          id="restaurant_id"
          v-model="form.restaurant_id"
          :options="restaurantOptions"
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

      <!-- Ảnh khuyến mãi -->
      <b-form-group label="Ảnh khuyến mãi" label-for="image">
        <b-form-file
          id="image"
          :state="Boolean(imageFile)"
          accept="image/*"
          placeholder="Chọn file ảnh..."
          @change="handleImageChange"
        ></b-form-file>

        <div v-if="previewImage" class="mt-3 text-center">
          <img :src="previewImage" class="img-thumbnail" style="max-width: 200px;" />
        </div>
      </b-form-group>

      <!-- Nút lưu -->
      <div class="d-flex justify-content-between">
        <b-button type="submit" variant="success">💾 Lưu</b-button>
        <b-button variant="secondary" @click="$router.push('/khuyen-mai')">⬅ Quay lại</b-button>
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
        promotion_code: "",
        title: "",
        description: "",
        discount_type: "percent",
        discount_value: 0,
        start_date: "",
        end_date: "",
        restaurant_id: null,
        status: "upcoming",
      },
      restaurants: [],
      discountTypeOptions: [
        { value: "percent", text: "Phần trăm (%)" },
        { value: "amount", text: "Số tiền (VNĐ)" },
      ],
      statusOptions: [
        { value: "active", text: "Đang diễn ra" },
        { value: "expired", text: "Đã kết thúc" },
        { value: "upcoming", text: "Sắp diễn ra" },
      ],
      imageFile: null,
      previewImage: null,
    };
  },
  computed: {
    restaurantOptions() {
      return this.restaurants.map(r => ({ value: r.restaurant_id, text: r.name }));
    }
  },
  methods: {
    async fetchRestaurants() {
      try {
        const res = await api.get("/restaurants");
        const arr = Array.isArray(res.data) ? res.data : res.data.data || [];
        this.restaurants = arr;
      } catch (err) {
        console.error("Lỗi tải nhà hàng:", err);
      }
    },

    handleImageChange(event) {
      const file = event.target.files[0];
      this.imageFile = file || null;
      this.previewImage = file ? window.URL.createObjectURL(file) : null;
    },

    async addPromotion() {
      if (!this.form.restaurant_id) {
        alert("Vui lòng chọn nhà hàng!");
        return;
      }

      try {
        const formData = new FormData();
        for (let key in this.form) {
          formData.append(key, this.form[key]);
        }

        if (this.imageFile) {
          formData.append("image", this.imageFile);
        }

        const res = await api.post("/promotions", formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });

        alert("✅ Đã thêm khuyến mãi: " + res.data.title);
        this.$router.push("/promotions");
      } catch (err) {
        console.error("Lỗi thêm khuyến mãi:", err.response && err.response.data ? err.response.data : err);
        alert("❌ Thêm khuyến mãi thất bại! Kiểm tra console.");
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
  box-shadow: 0 2px 6px rgba(0,0,0,0.2);
}
</style>
