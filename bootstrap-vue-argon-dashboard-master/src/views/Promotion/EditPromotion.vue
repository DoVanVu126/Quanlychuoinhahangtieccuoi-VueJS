<template>
  <div class="container mt-5">
    <h2 class="mb-4 text-warning">✏️ Sửa Khuyến Mãi</h2>

    <!-- Loading -->
    <div v-if="loading" class="form-loading">
      <b-spinner
        style="width: 2.5rem; height: 2.5rem;"
        variant="warning"
      ></b-spinner>
      <span class="ml-2 loading-text">Đang xử lý...</span>
    </div>

    <!-- Error -->
    <div v-if="formError" class="alert alert-danger">{{ formError }}</div>

    <b-form @submit.prevent="updatePromotion" enctype="multipart/form-data">
      <!-- Chọn Nhà hàng -->
      <b-form-group label="Nhà hàng" label-for="restaurant_id">
        <b-form-select
          id="restaurant_id"
          v-model="form.restaurant_id"
          :options="restaurantOptions"
          required
        >
          <template #first>
            <b-form-select-option :value="''" disabled
              >-- Chọn nhà hàng --</b-form-select-option
            >
          </template>
        </b-form-select>
      </b-form-group>

      <!-- Mã Khuyến Mãi -->
      <b-form-group label="Mã Khuyến Mãi" label-for="promotion_code">
        <b-form-input
          id="promotion_code"
          v-model="form.promotion_code"
          required
        ></b-form-input>
      </b-form-group>

      <!-- Tiêu đề -->
      <b-form-group label="Tiêu đề" label-for="title">
        <b-form-input id="title" v-model="form.title" required></b-form-input>
      </b-form-group>

      <!-- Mô tả -->
      <b-form-group label="Mô tả" label-for="description">
        <b-form-textarea
          id="description"
          v-model="form.description"
          rows="3"
        ></b-form-textarea>
      </b-form-group>

      <!-- Loại giảm -->
      <b-form-group label="Loại giảm" label-for="discount_type">
        <b-form-select id="discount_type" v-model="form.discount_type">
          <option value="percent">Phần trăm (%)</option>
          <option value="amount">Số tiền giảm (VNĐ)</option>
        </b-form-select>
      </b-form-group>

      <!-- Giá trị giảm -->
      <b-form-group label="Giá trị giảm" label-for="discount_value">
        <b-form-input
          id="discount_value"
          type="number"
          v-model.number="form.discount_value"
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

      <!-- Trạng thái -->
      <b-form-group label="Trạng thái" label-for="status">
        <b-form-select id="status" v-model="form.status">
          <option value="active">Đang hoạt động</option>
          <option value="expired">Hết hạn</option>
          <option value="upcoming">Sắp diễn ra</option>
        </b-form-select>
      </b-form-group>

      <!-- Ảnh hiện tại & chọn ảnh mới -->
      <b-form-group label="Ảnh khuyến mãi">
        <div v-if="!previewImage && form.currentImage" class="mb-2">
          <p>Ảnh hiện tại:</p>
          <img
            :src="fixImageUrl(form.currentImage)"
            alt="Ảnh khuyến mãi"
            class="img-thumbnail"
            style="max-width: 200px"
          />
        </div>

        <div v-if="previewImage" class="mb-2">
          <p>Ảnh mới:</p>
          <img
            :src="previewImage"
            alt="Preview"
            class="img-thumbnail"
            style="max-width: 200px"
          />
        </div>

        <b-form-file
          accept="image/*"
          placeholder="Chọn ảnh mới nếu muốn thay"
          browse-text="Chọn ảnh"
          @change="handleImageUpload"
        ></b-form-file>
      </b-form-group>

      <!-- Nút thao tác -->
      <div class="d-flex gap-2 mt-3">
        <b-button type="submit" variant="warning" :disabled="loading">
          {{ loading ? 'Đang lưu...' : '💾 Cập nhật' }}
        </b-button>
        <b-button variant="secondary" @click="$router.push('/promotions')">
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
      loading: false,
      form: {
        promotion_code: "",
        title: "",
        description: "",
        restaurant_id: null,
        discount_type: "percent",
        discount_value: 0,
        start_date: "",
        end_date: "",
        status: "active",
        currentImage: null,
        newImage: null,
      },
      previewImage: null,
      restaurants: [],
      formError: "",
      errors: {},
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
    this.loadPromotion();
  },
  methods: {
    async fetchRestaurants() {
      try {
        const res = await api.get("/restaurants");
        this.restaurants = res.data;
      } catch (err) {
        console.error("Lỗi tải danh sách nhà hàng:", err);
      }
    },

    async loadPromotion() {
      try {
        const id = this.$route.params.id;
        const res = await api.get(`/promotions/${id}`);
        const data = res.data;

        this.form = {
          ...this.form,
          promotion_code: data.promotion_code,
          title: data.title,
          description: data.description,
          restaurant_id: data.restaurant_id || null,
          discount_type: data.discount_type || "percent",
          discount_value: data.discount_value || 0,
          start_date: data.start_date ? data.start_date.slice(0, 10) : "",
          end_date: data.end_date ? data.end_date.slice(0, 10) : "",
          status: ["active","expired","upcoming"].includes(data.status) ? data.status : "active",
          currentImage: data.image_url || data.image || null,
          newImage: null,
        };
      } catch (err) {
        console.error("Lỗi tải khuyến mãi:", err);
        alert("Không tải được dữ liệu!");
        this.$router.push("/promotions");
      }
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
      } else {
        this.form.newImage = null;
        this.previewImage = null;
      }
    },

    fixImageUrl(url) {
      if (!url) return null;
      if (url.startsWith("http")) return url;
      return `http://127.0.0.1:8088/${url.replace(/^\/+/, "")}`;
    },

    validateForm() {
      const f = this.form;
      const errors = [];

      // Chuẩn hóa khoảng trắng + loại bỏ HTML
      f.promotion_code = (f.promotion_code || "").replace(/\s+/g, " ").trim();
      f.title = (f.title || "").replace(/\s+/g, " ").trim();
      f.description = (f.description || "").replace(/<[^>]*>/g, "").trim();

      // Kiểm tra các trường bắt buộc
      if (!f.restaurant_id) errors.push("Nhà hàng không được để trống.");
      if (!f.promotion_code) errors.push("Mã khuyến mãi không được để trống.");
      if (!f.title) errors.push("Tiêu đề không được để trống.");
      if (f.promotion_code.length > 50) errors.push("Mã khuyến mãi không quá 50 ký tự.");
      if (f.title.length > 100) errors.push("Tiêu đề không quá 100 ký tự.");
      if (f.description.length > 255) errors.push("Mô tả không quá 500 ký tự.");

      // Giá trị giảm
      if (f.discount_value == null || isNaN(f.discount_value)) errors.push("Giá trị giảm không hợp lệ.");
      if (f.discount_value < 0) errors.push("Giá trị giảm phải >= 0");

      // Status hợp lệ
      if (!["active","expired","upcoming"].includes(f.status)) errors.push("Trạng thái không hợp lệ.");

      // Ảnh
      if (f.newImage && !f.newImage.type.startsWith("image/")) errors.push("File tải lên phải là ảnh.");

      return errors;
    },

    async updatePromotion() {
      this.errors = {};
      this.formError = "";
      const errors = this.validateForm();
      if (errors.length) {
        this.formError = "❌ " + errors.join("\n");
        this.$bvToast.toast(this.formError, {
          title: "❌ Lỗi",
          variant: "danger",
          solid: true,
          autoHideDelay: 4000,
        });
        return;
      }

      this.loading = true;
      try {
        const id = this.$route.params.id;
        const formData = new FormData();

        [
          "promotion_code",
          "title",
          "description",
          "restaurant_id",
          "discount_type",
          "discount_value",
          "start_date",
          "end_date",
          "status",
        ].forEach((key) => formData.append(key, this.form[key]));

        if (this.form.newImage) formData.append("image", this.form.newImage);

        const res = await api.post(`/promotions/${id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        this.$bvToast.toast(res.data.message || "Cập nhật thành công!", {
          title: "✅ Thành công",
          variant: "success",
          solid: true,
          autoHideDelay: 3000,
        });

        setTimeout(() => this.$router.push("/promotions"), 1000);
      } catch (err) {
        let msg = "Lỗi hệ thống";
        if (err.response && err.response.data) {
          if (err.response.status === 422) {
            const backendErrors = err.response.data.errors || {};
            for (let key in backendErrors) this.errors[key] = backendErrors[key][0];
            msg = "Dữ liệu không hợp lệ, vui lòng kiểm tra lại!";
          } else if (err.response.status === 409 && err.response.data.message) {
            msg = err.response.data.message;
          } else if (err.response.data.message) {
            msg = err.response.data.message;
          }
        }
        this.formError = "❌ " + msg;
        this.$bvToast.toast(this.formError, {
          title: "❌ Thất bại",
          variant: "danger",
          solid: true,
          autoHideDelay: 4000,
        });
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>

<style scoped>
.container { max-width: 700px; }
h2 { font-weight: 600; }
.b-form-group { margin-bottom: 1.2rem; }
.img-thumbnail { border-radius: 12px; box-shadow: 0 2px 6px rgba(0,0,0,0.2); }

/* Loading spinner */
.form-loading {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: #fff3cd;
  border-radius: 12px;
  margin-bottom: 15px;
}
.loading-text { font-size: 15px; font-weight: 600; }
</style>
