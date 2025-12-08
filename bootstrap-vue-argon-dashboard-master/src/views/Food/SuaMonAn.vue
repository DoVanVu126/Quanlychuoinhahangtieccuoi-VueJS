<template>
  <div class="container mt-5">
    <h2 class="mb-4 text-primary">🍽 Sửa Món Ăn</h2>

    <!-- Spinner -->
    <div v-if="loading" class="form-loading">
      <div class="custom-spinner"></div>
      <span class="loading-text">Đang xử lý...</span>
    </div>

    <b-form @submit.prevent="updateFood">

      <!-- Tên món -->
      <b-form-group label="Tên món ăn">
        <b-form-input v-model="form.name" required></b-form-input>
      </b-form-group>

      <!-- Mô tả -->
      <b-form-group label="Mô tả">
        <b-form-textarea v-model="form.description" rows="3"></b-form-textarea>
      </b-form-group>

      <!-- Đơn vị -->
      <b-form-group label="Đơn vị">
        <b-form-input v-model="form.unit" placeholder="VD: phần, cái, suất" required></b-form-input>
      </b-form-group>

      <!-- Giá -->
      <b-form-group label="Giá (VNĐ)">
        <b-form-input type="number" min="0" v-model.number="form.price" required></b-form-input>
      </b-form-group>

      <!-- Loại món -->
      <b-form-group label="Loại món ăn">
        <b-form-select v-model="form.food_type_id" :options="foodTypes" required>
          <template #first>
            <b-form-select-option disabled value="">-- Chọn loại món --</b-form-select-option>
          </template>
        </b-form-select>
      </b-form-group>

      <!-- Nhà hàng -->
      <b-form-group label="Nhà hàng">
        <b-form-select v-model="form.restaurant_id" :options="restaurants" required>
          <template #first>
            <b-form-select-option disabled value="">-- Chọn nhà hàng --</b-form-select-option>
          </template>
        </b-form-select>
      </b-form-group>

      <!-- Ảnh -->
      <b-form-group label="Ảnh món ăn">
        <div v-if="previewImage">
          <p>Ảnh mới:</p>
          <img :src="previewImage" class="preview-img" />
        </div>
        <div v-else-if="form.image_url">
          <p>Ảnh hiện tại:</p>
          <img :src="getImageUrl(form.image_url)" class="preview-img" />
        </div>
        <p v-else class="text-muted">Không có ảnh</p>

        <b-form-file
          @change="handleImageUpload"
          accept="image/*"
          placeholder="Chọn ảnh mới nếu muốn thay"
        ></b-form-file>
      </b-form-group>

      <!-- Nút -->
      <div class="d-flex gap-2 mt-3">
        <b-button type="submit" variant="success" :disabled="loading">
          {{ loading ? 'Đang lưu...' : 'Lưu' }}
        </b-button>
        <b-button variant="secondary" @click="$router.push('/mon-an')">
          Hủy
        </b-button>
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
      Cập nhật món ăn thành công!
    </b-toast>
  </div>
</template>

<script>
import api from "@/api";

export default {
  data() {
    return {
      loading: false,
      form: {
        name: "",
        description: "",
        unit: "",
        price: 0,
        food_type_id: null,
        restaurant_id: null,
        image_url: null,
        newImage: null,
        version: 0
      },
      previewImage: null,
      foodTypes: [],
      restaurants: []
    };
  },

  mounted() {
    Promise.all([
      this.fetchFoodTypes(),
      this.fetchRestaurants(),
      this.loadFood()
    ]).catch(function(err) { console.error(err); });
  },

  methods: {
    getImageUrl(url) {
      if (!url) return "/images/default.png"; // fallback image
      if (typeof url === "string" && url.indexOf("http") === 0) return url;
      return "http://127.0.0.1:8088/" + String(url).replace(/^\/+/, "");
    },

    handleImageUpload(e) {
      var file = e.target.files[0];
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

    fetchFoodTypes: async function() {
      try {
        var res = await api.get("/food-types");
        var list = [];
        if (Array.isArray(res.data)) list = res.data;
        else if (res.data && res.data.data) list = res.data.data;

        this.foodTypes = list.map(function(t) {
          var val = t.food_type_id ? String(t.food_type_id) : (t.id ? String(t.id) : "");
          return { value: val, text: t.name };
        });
      } catch (err) {
        console.error("Lỗi tải loại món:", err);
      }
    },

    fetchRestaurants: async function() {
      try {
        var res = await api.get("/restaurants");
        var list = [];
        if (Array.isArray(res.data)) list = res.data;
        else if (res.data && res.data.data) list = res.data.data;

        this.restaurants = list.map(function(r) {
          var val = r.restaurant_id ? String(r.restaurant_id) : (r.id ? String(r.id) : "");
          return { value: val, text: r.name };
        });
      } catch (err) {
        console.error("Lỗi tải nhà hàng:", err);
      }
    },

    loadFood: async function() {
      try {
        var id = Number(this.$route.params.id);
        if (!Number.isInteger(id) || id <= 0) throw new Error("ID không hợp lệ");

        var res = await api.get("/foods/" + id);
        var data = res.data && res.data.data ? res.data.data : res.data;

        if (!data || !data.name) throw new Error("Không tìm thấy món ăn");

        this.form.name = data.name || "";
        this.form.description = data.description || "";
        this.form.unit = data.unit || "";
        this.form.price = Number(data.price) || 0;
        this.form.food_type_id = data.food_type_id != null ? String(data.food_type_id) : null;
        this.form.restaurant_id = data.restaurant_id != null ? String(data.restaurant_id) : null;
        this.form.image_url = data.image_url || null;
        this.form.version = data.version || 0;
      } catch (err) {
        console.error(err);
        alert(err.message || "Không thể tải món ăn!");
        this.$router.push("/mon-an");
      }
    },

    validateForm() {
  const errors = [];
  const f = this.form;

  // Lấy giá trị hiện tại
  const name = f.name || '';
  const description = f.description || '';
  const unit = f.unit || '';

  // Chuẩn hóa khoảng trắng + loại bỏ HTML
  f.name = name.replace(/\s+/g, ' ').trim();
  f.description = description.replace(/<[^>]*>/g, '').trim();
  f.unit = unit.replace(/\s+/g, ' ').trim();

  // Kiểm tra
  if (!f.name) errors.push("Tên món ăn không được để trống.");
  if (f.name.length > 100) errors.push("Tên món ăn không quá 100 ký tự.");
  if (f.description.length > 255) errors.push("Mô tả không quá 250 ký tự.");
  if (!f.unit) errors.push("Đơn vị không được để trống.");
  if (f.unit.length > 50) errors.push("Đơn vị không quá 50 ký tự.");

  // Giá
  if (f.price == null || isNaN(f.price)) errors.push("Giá không hợp lệ.");
  if (/[０-９]/.test(String(f.price))) errors.push("Giá không được dùng số full-width.");
  if (f.price < 0) errors.push("Giá phải >= 0");

  // Loại món & nhà hàng
  if (!f.food_type_id || !this.foodTypes.some(t => t.value === f.food_type_id))
    errors.push("Loại món không hợp lệ.");
  if (!f.restaurant_id || !this.restaurants.some(r => r.value === f.restaurant_id))
    errors.push("Nhà hàng không hợp lệ.");

  // Ảnh
  if (f.newImage && !f.newImage.type.startsWith("image/"))
    errors.push("File tải lên phải là ảnh.");

  return errors;
},

    updateFood: async function() {
      var errors = this.validateForm();
      if (errors.length) { alert(errors.join("\n")); return; }

      this.loading = true;
      try {
        var id = this.$route.params.id;
        var formData = new FormData();
        formData.append("name", this.form.name);
        formData.append("description", this.form.description);
        formData.append("unit", this.form.unit);
        formData.append("price", this.form.price);
        formData.append("food_type_id", this.form.food_type_id);
        formData.append("restaurant_id", this.form.restaurant_id);
        formData.append("version", this.form.version);
        if (this.form.newImage) formData.append("image", this.form.newImage);

        await api.post("/foods/" + id + "?_method=PUT", formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });

        if (this.$bvToast && this.$bvToast.show) this.$bvToast.show("toast-success");
        setTimeout(() => this.$router.push("/mon-an"), 900);
      } catch (err) {
        console.error(err);
        alert((err.response && err.response.data && err.response.data.message) || "Cập nhật thất bại!");
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
.form-loading { display: flex; align-items: center; gap: 12px; padding: 12px 16px; background: #f8f9fa; border-radius: 12px; margin-bottom: 15px; font-weight: 500; }
.custom-spinner { width: 32px; height: 32px; border: 4px solid #e0e0e0; border-top: 4px solid #007bff; border-radius: 50%; animation: spin 0.6s linear infinite; }
.loading-text { font-size: 16px; font-weight: 600; }
@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
h2 { font-weight: 600; }
</style>
