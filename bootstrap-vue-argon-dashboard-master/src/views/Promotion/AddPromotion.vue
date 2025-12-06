<template>
  <div class="container mt-5">
    <h2>Thêm Khuyến Mãi</h2>

    <!-- Thông báo lỗi tổng -->
    <div v-if="formError" class="alert alert-danger">{{ formError }}</div>

    <b-form @submit.prevent="addPromotion" enctype="multipart/form-data">

      <!-- Mã khuyến mãi -->
      <b-form-group label="Mã khuyến mãi" label-for="promotion_code">
        <b-form-input
          id="promotion_code"
          v-model.trim="form.promotion_code"
          :class="{'is-invalid': errors.promotion_code}"
          required
          placeholder="Nhập mã khuyến mãi"
        ></b-form-input>
        <div class="invalid-feedback" v-if="errors.promotion_code">{{ errors.promotion_code }}</div>
      </b-form-group>

      <!-- Tiêu đề -->
      <b-form-group label="Tiêu đề" label-for="title">
        <b-form-input
          id="title"
          v-model.trim="form.title"
          :class="{'is-invalid': errors.title}"
          required
          placeholder="Nhập tiêu đề"
        ></b-form-input>
        <div class="invalid-feedback" v-if="errors.title">{{ errors.title }}</div>
      </b-form-group>

      <!-- Mô tả -->
      <b-form-group label="Mô tả" label-for="description">
        <b-form-textarea
          id="description"
          v-model.trim="form.description"
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
          :class="{'is-invalid': errors.discount_type}"
          required
        ></b-form-select>
        <div class="invalid-feedback" v-if="errors.discount_type">{{ errors.discount_type }}</div>
      </b-form-group>

      <!-- Giá trị giảm -->
      <b-form-group label="Giá trị giảm" label-for="discount_value">
        <b-form-input
          id="discount_value"
          type="number"
          v-model.number="form.discount_value"
          min="0"
          :class="{'is-invalid': errors.discount_value}"
          required
        ></b-form-input>
        <div class="invalid-feedback" v-if="errors.discount_value">{{ errors.discount_value }}</div>
      </b-form-group>

      <!-- Ngày bắt đầu -->
      <b-form-group label="Ngày bắt đầu" label-for="start_date">
        <b-form-input
          id="start_date"
          type="date"
          v-model="form.start_date"
          :class="{'is-invalid': errors.start_date}"
          required
        ></b-form-input>
        <div class="invalid-feedback" v-if="errors.start_date">{{ errors.start_date }}</div>
      </b-form-group>

      <!-- Ngày kết thúc -->
      <b-form-group label="Ngày kết thúc" label-for="end_date">
        <b-form-input
          id="end_date"
          type="date"
          v-model="form.end_date"
          :class="{'is-invalid': errors.end_date}"
          required
        ></b-form-input>
        <div class="invalid-feedback" v-if="errors.end_date">{{ errors.end_date }}</div>
      </b-form-group>

      <!-- Nhà hàng -->
      <b-form-group label="Nhà hàng" label-for="restaurant_id">
        <b-form-select
          id="restaurant_id"
          v-model="form.restaurant_id"
          :options="restaurantOptions"
          :class="{'is-invalid': errors.restaurant_id}"
          required
        >
          <template #first>
            <b-form-select-option :value="null" disabled>-- Chọn nhà hàng --</b-form-select-option>
          </template>
        </b-form-select>
        <div class="invalid-feedback" v-if="errors.restaurant_id">{{ errors.restaurant_id }}</div>
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
          :class="{'is-invalid': errors.image}"
        ></b-form-file>
        <div class="invalid-feedback" v-if="errors.image">{{ errors.image }}</div>

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
      errors: {},
      formError: "",
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
        this.restaurants = Array.isArray(res.data) ? res.data : res.data.data || [];
      } catch (err) {
        console.error("Lỗi tải nhà hàng:", err);
      }
    },

    handleImageChange(event) {
      const file = event.target.files[0];
      this.imageFile = file || null;
      this.previewImage = file ? window.URL.createObjectURL(file) : null;
    },

    validateForm() {
      this.errors = {};
      let isValid = true;

      // Bắt buộc
      if (!this.form.promotion_code) {
        this.errors.promotion_code = "Mã khuyến mãi bắt buộc";
        isValid = false;
      }
      if (!this.form.title) {
        this.errors.title = "Tiêu đề bắt buộc";
        isValid = false;
      }
      if (!this.form.discount_type) {
        this.errors.discount_type = "Loại giảm giá bắt buộc";
        isValid = false;
      }
      if (this.form.discount_value === null || this.form.discount_value <= 0) {
        this.errors.discount_value = "Giá trị giảm phải lớn hơn 0";
        isValid = false;
      }
      if (this.form.discount_type === "percent" && this.form.discount_value > 100) {
        this.errors.discount_value = "Phần trăm giảm không được vượt quá 100%";
        isValid = false;
      }
      if (!this.form.start_date) {
        this.errors.start_date = "Ngày bắt đầu bắt buộc";
        isValid = false;
      }
      if (!this.form.end_date) {
        this.errors.end_date = "Ngày kết thúc bắt buộc";
        isValid = false;
      } else if (this.form.start_date && this.form.end_date < this.form.start_date) {
        this.errors.end_date = "Ngày kết thúc phải sau hoặc bằng ngày bắt đầu";
        isValid = false;
      }
      if (!this.form.restaurant_id) {
        this.errors.restaurant_id = "Vui lòng chọn nhà hàng";
        isValid = false;
      }
      if (this.imageFile && !this.imageFile.type.startsWith("image/")) {
        this.errors.image = "Chỉ được chọn file ảnh";
        isValid = false;
      }

      if (!isValid) this.formError = "Vui lòng sửa các lỗi trước khi lưu";
      return isValid;
    },

    async addPromotion() {
      if (!this.validateForm()) return;

      this.formError = "";

      try {
        const formData = new FormData();
        for (let key in this.form) {
          formData.append(key, this.form[key]);
        }
        if (this.imageFile) formData.append("image", this.imageFile);

        const res = await api.post("/promotions", formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });

        alert("✅ Đã thêm khuyến mãi: " + res.data.title);
        this.$router.push("/promotions");
      } catch (err) {
        console.error(
  "Lỗi thêm khuyến mãi:",
  err.response && err.response.data ? err.response.data : err
);
        this.formError = "❌ Thêm khuyến mãi thất bại! Kiểm tra console.";
      }
    },
  },
  mounted() {
    this.fetchRestaurants();
  },
};
</script>

<style scoped>
.container { max-width: 700px; }
h2 { font-weight: 600; margin-bottom: 20px; }
.b-form-group { margin-bottom: 1.2rem; }
.img-thumbnail { border-radius: 12px; box-shadow: 0 2px 6px rgba(0,0,0,0.2); }
.is-invalid { border-color: #dc3545; }
</style>
