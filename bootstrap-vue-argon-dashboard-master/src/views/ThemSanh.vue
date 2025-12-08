<template>
  <div class="container mt-5">
    <h2 class="text-primary mb-4">🏛 Thêm Sảnh</h2>

    <!-- Spinner trong form -->
    <div v-if="loading" class="form-loading">
      <div class="custom-spinner"></div>
      <span class="loading-text">Đang xử lý...</span>
    </div>

    <!-- Lỗi tổng -->
    <div v-if="formError" class="alert alert-danger">
      {{ formError }}
    </div>

    <b-form @submit.prevent="validateBeforeSubmit">

      <!-- Tên sảnh -->
      <b-form-group label="Tên sảnh">
        <b-form-input v-model="form.name" placeholder="Nhập tên sảnh"></b-form-input>
        <small v-if="errors.name" class="text-danger">{{ errors.name }}</small>
      </b-form-group>

      <!-- Chọn Nhà hàng -->
      <b-form-group label="Nhà hàng">
        <b-form-select v-model="form.restaurant_id" :options="restaurants">
          <template #first>
            <b-form-select-option :value="null" disabled>-- Chọn nhà hàng --</b-form-select-option>
          </template>
        </b-form-select>
        <small v-if="errors.restaurant_id" class="text-danger">{{ errors.restaurant_id }}</small>
      </b-form-group>

      <!-- Sức chứa -->
      <b-form-group label="Sức chứa (người)">
        <b-form-input type="text" v-model="capacityDisplay" @input="onCapacityInput" placeholder="Nhập sức chứa"></b-form-input>
        <small v-if="errors.capacity" class="text-danger">{{ errors.capacity }}</small>
      </b-form-group>

      <!-- Giá thuê -->
      <b-form-group label="Giá thuê (VNĐ)">
        <b-form-input type="text" v-model="priceDisplay" @input="onPriceInput" placeholder="Nhập giá thuê"></b-form-input>
        <small v-if="errors.price" class="text-danger">{{ errors.price }}</small>
      </b-form-group>

      <!-- Mô tả -->
      <b-form-group label="Mô tả">
        <b-form-textarea v-model="form.description" rows="3" placeholder="Nhập mô tả sảnh"></b-form-textarea>
        <small v-if="errors.description" class="text-danger">{{ errors.description }}</small>
      </b-form-group>

      <!-- Trạng thái -->
      <b-form-group label="Trạng thái">
        <b-form-input value="Có sẵn" disabled></b-form-input>
      </b-form-group>

      <!-- Upload ảnh -->
      <b-form-group label="Ảnh sảnh">
        <b-form-file @change="handleImageUpload" accept="image/*" placeholder="Chưa chọn ảnh"></b-form-file>
        <small v-if="errors.image" class="text-danger">{{ errors.image }}</small>
        <div v-if="previewImage" class="mt-3 text-center">
          <img :src="previewImage" class="img-thumbnail preview-img" />
        </div>
      </b-form-group>

      <!-- Nút -->
      <div class="d-flex gap-2 mt-3">
        <b-button type="submit" variant="success" :disabled="loading">
          {{ loading ? "Đang lưu..." : "💾 Lưu" }}
        </b-button>
        <b-button variant="secondary" @click="$router.push('/sanh')">
          ⬅ Quay lại
        </b-button>
      </div>

    </b-form>

    <!-- Toast thành công -->
    <b-toast id="toast-success" title="✅ Thành công" variant="success" solid auto-hide-delay="3000">
      Thêm sảnh thành công!
    </b-toast>
  </div>
</template>

<script>
import api from "@/api";

export default {
  data() {
    return {
      loading: false,
      formError: "",
      errors: {},

      form: {
        name: "",
        restaurant_id: null,
        capacity: null,
        price: null,
        description: "",
        status: "available"
      },

      // Hiển thị string cho input number
      capacityDisplay: "",
      priceDisplay: "",
      imageFile: null,
      previewImage: null,
      restaurants: []
    };
  },

  mounted() {
    this.fetchRestaurants();
  },

  methods: {
    /* ---------- Helpers ---------- */
    normalizeFullWidthDigits(str) {
      if (typeof str !== "string") return String(str || "");
      return str.replace(/[０-９]/g, ch => String.fromCharCode(ch.charCodeAt(0) - 0xfee0))
                .replace(/\u3000/g, " ");
    },
    containsHtml(text) {
      if (!text) return false;
      var tmp = document.createElement("div");
      tmp.innerHTML = text;
      return (tmp.textContent || tmp.innerText || "").trim() !== text.trim();
    },
    sanitizeText(text) {
      if (!text) return "";
      var tmp = document.createElement("div");
      tmp.innerHTML = text;
      return (tmp.textContent || tmp.innerText || "").replace(/\s+/g, " ").trim();
    },

    /* ---------- Fetch ---------- */
    async fetchRestaurants() {
      try {
        const res = await api.get("/restaurants");
        let list = Array.isArray(res.data) ? res.data : res.data.data || [];
        this.restaurants = list.map(r => ({ value: r.restaurant_id, text: r.name }));
      } catch (err) {
        console.error("Lỗi tải nhà hàng:", err);
      }
    },

    /* ---------- Input xử lý số ---------- */
    onCapacityInput(val) {
      let raw = this.normalizeFullWidthDigits(val || "");
      let filtered = raw.replace(/\D+/g, "");
      this.capacityDisplay = filtered;
      this.form.capacity = filtered ? parseInt(filtered, 10) : null;
    },
    onPriceInput(val) {
      let raw = this.normalizeFullWidthDigits(val || "");
      let filtered = raw.replace(/\D+/g, "");
      this.priceDisplay = filtered;
      this.form.price = filtered ? parseInt(filtered, 10) : null;
    },

    /* ---------- File upload ---------- */
   handleImageUpload: function(e) {
  var file = null;
  if (e && e.target && e.target.files && e.target.files[0]) {
    file = e.target.files[0];
  }

  if (!file) {
    this.imageFile = null;
    this.previewImage = null;
    return;
  }

  // Kiểm tra loại file
  if (!file.type || !file.type.startsWith("image/")) {
    this.errors.image = "Chỉ chấp nhận file ảnh.";
    this.imageFile = null;
    this.previewImage = null;
    return;
  }

  // Kiểm tra kích thước
  var maxBytes = 10 * 1024 * 1024; // 10MB
  if (file.size > maxBytes) {
    this.errors.image = "Kích thước ảnh tối đa 10MB.";
    this.imageFile = null;
    this.previewImage = null;
    return;
  }

  // Thành công
  this.errors.image = null;
  this.imageFile = file;
  this.previewImage = URL.createObjectURL(file);
},

    /* ---------- Validate ---------- */
    validateForm() {
      this.errors = {};

      const isBlank = s => !s || s.toString().replace(/\s+/g,"").length===0;

      // NAME
      if (isBlank(this.form.name)) this.errors.name = "Tên sảnh không được để trống.";
      else if (this.containsHtml(this.form.name)) this.errors.name = "Tên sảnh không được chứa HTML.";
      else if (this.sanitizeText(this.form.name).length > 150) this.errors.name = "Tên sảnh quá dài (150 ký tự).";

      // RESTAURANT
      if (!this.form.restaurant_id) this.errors.restaurant_id = "Vui lòng chọn nhà hàng.";

      // CAPACITY
      if (this.form.capacity===null || !Number.isFinite(this.form.capacity) || this.form.capacity<=0)
        this.errors.capacity = "Sức chứa phải là số > 0.";

      // PRICE
      if (this.form.price===null || !Number.isFinite(this.form.price) || this.form.price<0)
        this.errors.price = "Giá thuê phải >= 0.";

      // DESCRIPTION
      if (this.form.description && this.containsHtml(this.form.description))
        this.errors.description = "Mô tả không được chứa HTML.";
      else if (this.sanitizeText(this.form.description).length>255)
        this.errors.description = "Mô tả quá dài (255 ký tự).";

      // IMAGE
      if (this.imageFile && !this.imageFile.type.startsWith("image/"))
        this.errors.image = "File phải là ảnh.";

      return Object.keys(this.errors).length === 0;
    },

    validateBeforeSubmit() {
      if (this.loading) return;
      if (!this.validateForm()) return;
      this.addHall();
    },

    /* ---------- Submit ---------- */
   async addHall() {
  var _this = this; // để dùng trong function bình thường
  this.loading = true;
  this.formError = "";

  try {
    var fd = new FormData();
    fd.append("name", this.sanitizeText(this.form.name));
    fd.append("restaurant_id", this.form.restaurant_id);
    fd.append("capacity", this.form.capacity);
    fd.append("price", this.form.price);
    fd.append("description", this.sanitizeText(this.form.description));
    fd.append("status", this.form.status);
    if (this.imageFile) fd.append("image", this.imageFile);

    await api.post("/halls", fd, { headers: { "Content-Type": "multipart/form-data" } });

    // Show toast an toàn
    if (this.$bvToast && typeof this.$bvToast.show === "function") {
      this.$bvToast.show("toast-success");
    }

    // Chuyển trang sau 0.7s
    setTimeout(function() {
      _this.$router.push("/sanh");
    }, 700);

  } catch (err) {
    console.error("Lỗi thêm sảnh:", err);
    if (err.response && err.response.status === 422) {
      this.errors = err.response.data.errors || {};
      this.formError = "⚠️ Dữ liệu không hợp lệ!";
    } else if (err.response && err.response.data && err.response.data.message) {
      this.formError = err.response.data.message;
    } else {
      this.formError = "❌ Lỗi hệ thống!";
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
.form-loading { display:flex; align-items:center; gap:12px; padding:12px 16px; background:#f1f3f5; border-radius:12px; margin-bottom:15px; }
.custom-spinner { width:30px; height:30px; border:4px solid #ddd; border-top:4px solid #28a745; border-radius:50%; animation:spin 0.6s linear infinite; }
.loading-text { font-size:16px; font-weight:600; }
.preview-img { max-width:200px; border-radius:12px; box-shadow:0 2px 6px rgba(0,0,0,0.2); }
@keyframes spin { 0% { transform: rotate(0deg);} 100% { transform: rotate(360deg);} }
h2 { font-weight:600; margin-bottom:20px; }
.b-form-group { margin-bottom:1.2rem; }
</style>
