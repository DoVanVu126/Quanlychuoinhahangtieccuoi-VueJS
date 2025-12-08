<template>
  <div class="container mt-5">
    <h2 class="text-primary mb-4">Thêm Khuyến Mãi</h2>

    <!-- Lỗi tổng -->
    <div v-if="formError" class="alert alert-danger">{{ formError }}</div>

    <b-form @submit.prevent="addPromotion" enctype="multipart/form-data">
      <!-- Mã khuyến mãi -->
      <b-form-group label="Mã khuyến mãi">
        <b-form-input
          v-model.trim="form.promotion_code"
          :class="{ 'is-invalid': errors.promotion_code }"
          placeholder="Nhập mã khuyến mãi"
        />
        <div class="invalid-feedback" v-if="errors.promotion_code">
          {{ errors.promotion_code }}
        </div>
      </b-form-group>

      <!-- Tiêu đề -->
      <b-form-group label="Tiêu đề">
        <b-form-input
          v-model.trim="form.title"
          :class="{ 'is-invalid': errors.title }"
          placeholder="Nhập tiêu đề"
        />
        <div class="invalid-feedback" v-if="errors.title">
          {{ errors.title }}
        </div>
      </b-form-group>

      <!-- Mô tả -->
      <b-form-group label="Mô tả">
        <b-form-textarea
          v-model.trim="form.description"
          rows="3"
          placeholder="Nhập mô tả"
        />
      </b-form-group>

      <!-- Loại giảm -->
      <b-form-group label="Loại giảm giá">
        <b-form-select
          v-model="form.discount_type"
          :options="discountTypeOptions"
          :class="{ 'is-invalid': errors.discount_type }"
        />
        <div class="invalid-feedback" v-if="errors.discount_type">
          {{ errors.discount_type }}
        </div>
      </b-form-group>

      <!-- Giá trị -->
      <b-form-group label="Giá trị giảm">
        <b-form-input
          type="number"
          v-model.number="form.discount_value"
          :class="{ 'is-invalid': errors.discount_value }"
        />
        <div class="invalid-feedback" v-if="errors.discount_value">
          {{ errors.discount_value }}
        </div>
      </b-form-group>

      <!-- Ngày bắt đầu -->
      <b-form-group label="Ngày bắt đầu">
        <b-form-input
          type="date"
          v-model="form.start_date"
          :class="{ 'is-invalid': errors.start_date }"
        />
        <div class="invalid-feedback" v-if="errors.start_date">
          {{ errors.start_date }}
        </div>
      </b-form-group>

      <!-- Ngày kết thúc -->
      <b-form-group label="Ngày kết thúc">
        <b-form-input
          type="date"
          v-model="form.end_date"
          :class="{ 'is-invalid': errors.end_date }"
        />
        <div class="invalid-feedback" v-if="errors.end_date">
          {{ errors.end_date }}
        </div>
      </b-form-group>

      <!-- Nhà hàng -->
      <b-form-group label="Nhà hàng">
        <b-form-select
          v-model="form.restaurant_id"
          :options="restaurantOptions"
          :class="{ 'is-invalid': errors.restaurant_id }"
        >
          <template #first>
            <b-form-select-option :value="null" disabled>
              -- Chọn nhà hàng --
            </b-form-select-option>
          </template>
        </b-form-select>
        <div class="invalid-feedback" v-if="errors.restaurant_id">
          {{ errors.restaurant_id }}
        </div>
      </b-form-group>

      <!-- Trạng thái -->
      <b-form-group label="Trạng thái">
        <b-form-select v-model="form.status" :options="statusOptions" />
      </b-form-group>

      <!-- Ảnh -->
      <b-form-group label="Ảnh khuyến mãi">
        <b-form-file
          accept="image/*"
          placeholder="Chọn file ảnh..."
          @change="handleImageChange"
          :class="{ 'is-invalid': errors.image }"
        />
        <div class="invalid-feedback" v-if="errors.image">
          {{ errors.image }}
        </div>

        <div v-if="previewImage" class="mt-3 text-center">
          <img
            :src="previewImage"
            class="img-thumbnail"
            style="max-width: 200px"
          />
        </div>
      </b-form-group>

      <!-- Nút -->
      <div class="d-flex justify-content-between align-items-center">
        <b-button type="submit" variant="success" :disabled="loading">
          <span v-if="!loading">💾 Lưu</span>
          <span v-else class="d-flex align-items-center">
            <span class="spinner-border spinner-border-sm mr-2"></span>
            Đang lưu...
          </span>
        </b-button>

        <b-button variant="secondary" @click="$router.push('/khuyen-mai')">
          ⬅ Quay lại
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
      loading: false,
    };
  },

  computed: {
    restaurantOptions() {
      return this.restaurants.map((r) => ({
        value: r.restaurant_id,
        text: r.name,
      }));
    },
  },

  mounted() {
    this.fetchRestaurants();
  },

  methods: {
    // ---- Lấy danh sách nhà hàng ----
    async fetchRestaurants() {
      try {
        const res = await api.get("/restaurants");
        this.restaurants = Array.isArray(res.data)
          ? res.data
          : res.data.data || [];
      } catch (err) {
        console.error("Lỗi tải nhà hàng:", err);
      }
    },

    // ---- Xử lý ảnh ----
    handleImageChange(e) {
      const file = e.target.files[0];
      this.imageFile = file || null;
      this.previewImage = file ? URL.createObjectURL(file) : null;
    },

    // ---- Sanitize text (loại HTML + khoảng trắng) ----
    sanitizeText(text) {
      if (!text) return "";
      const tmp = document.createElement("div");
      tmp.innerHTML = text;
      let cleaned = tmp.textContent || tmp.innerText || "";
      cleaned = cleaned.replace(/\u3000/g, " "); // full-width space -> normal
      cleaned = cleaned.replace(/\s+/g, " ").trim(); // collapse space & trim
      return cleaned;
    },

    // ---- Validate form ----
    validateForm() {
      this.errors = {};
      let ok = true;

      // Làm sạch dữ liệu
      this.form.promotion_code = this.sanitizeText(this.form.promotion_code);
      this.form.title = this.sanitizeText(this.form.title);
      this.form.description = this.sanitizeText(this.form.description);

      if (!this.form.promotion_code) {
        this.errors.promotion_code = "Mã khuyến mãi bắt buộc";
        ok = false;
      }
      if (!this.form.title) {
        this.errors.title = "Tiêu đề bắt buộc";
        ok = false;
      }
      if (!this.form.discount_type) {
        this.errors.discount_type = "Loại giảm giá bắt buộc";
        ok = false;
      }
      if (!this.form.discount_value || this.form.discount_value <= 0) {
        this.errors.discount_value = "Giá trị giảm phải > 0";
        ok = false;
      }
      if (
        this.form.discount_type === "percent" &&
        this.form.discount_value > 100
      ) {
        this.errors.discount_value = "Không quá 100%";
        ok = false;
      }
      if (!this.form.start_date) {
        this.errors.start_date = "Chọn ngày bắt đầu";
        ok = false;
      }
      if (!this.form.end_date) {
        this.errors.end_date = "Chọn ngày kết thúc";
        ok = false;
      }
      if (this.form.end_date < this.form.start_date) {
        this.errors.end_date = "Ngày kết thúc phải sau ngày bắt đầu";
        ok = false;
      }
      if (!this.form.restaurant_id) {
        this.errors.restaurant_id = "Chọn nhà hàng";
        ok = false;
      }
      if (this.imageFile && !this.imageFile.type.startsWith("image/")) {
        this.errors.image = "File không phải ảnh";
        ok = false;
      }
      if (!this.statusOptions.some((o) => o.value === this.form.status)) {
        this.errors.status = "Trạng thái không hợp lệ";
        ok = false;
      }

      if (!ok) this.formError = "Vui lòng kiểm tra dữ liệu!";
      return ok;
    },

    // ---- Thêm khuyến mãi ----
    async addPromotion() {
      if (!this.validateForm()) return;

      this.loading = true;
      this.formError = "";

      try {
        const formData = new FormData();
        for (let key in this.form) {
          formData.append(key, this.form[key]);
        }

        if (this.imageFile) {
          formData.append("image", this.imageFile);
        }

        await api.post("/promotions", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        this.$bvToast.toast("Thêm khuyến mãi thành công ✅", {
          title: "Thành công",
          variant: "success",
          solid: true,
        });

        setTimeout(() => {
          this.$router.push("/promotions");
        }, 1000);
      } catch (err) {
        if (err.response && err.response.status === 422) {
          const backendErrors = err.response.data.errors || {};
          for (let k in backendErrors) {
            this.errors[k] = backendErrors[k][0];
          }
          this.formError = "Dữ liệu không hợp lệ!";
        } else if (err.response && err.response.status === 409) {
          this.formError = err.response.data.message;
        } else {
          this.formError = "Lỗi hệ thống!";
        }
      } finally {
        this.loading = false;
      }
    },
  },
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
.is-invalid {
  border-color: #dc3545;
}
</style>
