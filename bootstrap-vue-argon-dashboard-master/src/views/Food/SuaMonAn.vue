<template>
  <div class="container mt-5">
    <h2 class="mb-4 text-primary">🍽 Sửa Món Ăn</h2>

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
        <b-form-select v-model.number="form.food_type_id" :options="foodTypes" required>
          <template #first>
            <b-form-select-option disabled value="">-- Chọn loại món --</b-form-select-option>
          </template>
        </b-form-select>
      </b-form-group>

      <!-- Nhà hàng -->
      <b-form-group label="Nhà hàng">
        <b-form-select v-model.number="form.restaurant_id" :options="restaurants" required>
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
        <b-button type="submit" variant="primary">💾 Cập nhật</b-button>
        <b-button variant="secondary" @click="$router.push('/mon-an')">Hủy</b-button>
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
        unit: "",
        price: 0,
        food_type_id: null,
        restaurant_id: null,
        image_url: null,
        newImage: null,
      },
      previewImage: null,
      foodTypes: [],
      restaurants: [],
    };
  },

  async mounted() {
    await Promise.all([
      this.fetchFoodTypes(),
      this.fetchRestaurants(),
      this.loadFood(),
    ]);
  },

  methods: {
    async fetchFoodTypes() {
      try {
        const res = await api.get("/food-types");
        this.foodTypes = res.data.map(t => ({
          value: Number(t.food_type_id || t.id),
          text: t.name,
        }));
      } catch (err) {
        console.error("Lỗi tải loại món:", err);
      }
    },

    async fetchRestaurants() {
      try {
        const res = await api.get("/restaurants");
        this.restaurants = res.data.map(r => ({
          value: Number(r.restaurant_id || r.id),
          text: r.name,
        }));
      } catch (err) {
        console.error("Lỗi tải nhà hàng:", err);
      }
    },

    async loadFood() {
      try {
        const id = this.$route.params.id;
        const res = await api.get(`/foods/${id}`);
        const data = res.data;

        this.form.name = data.name;
        this.form.description = data.description;
        this.form.unit = data.unit || "";
        this.form.price = Number(data.price);
        this.form.food_type_id = Number(data.food_type_id);
        this.form.restaurant_id = Number(data.restaurant_id);
        this.form.image_url = data.image_url;

        this.previewImage = null;
      } catch (err) {
        console.error("Lỗi tải món ăn:", err);
        alert("Không thể tải món ăn!");
        this.$router.push("/mon-an");
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

    async updateFood() {
      try {
        const id = this.$route.params.id;
        const formData = new FormData();

        formData.append("name", this.form.name);
        formData.append("description", this.form.description);
        formData.append("unit", this.form.unit);
        formData.append("price", this.form.price);
        formData.append("food_type_id", this.form.food_type_id);
        formData.append("restaurant_id", this.form.restaurant_id);

        if (this.form.newImage) {
          formData.append("image", this.form.newImage);
        }

        await api.post(`/foods/${id}?_method=PUT`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        alert("✔ Cập nhật món ăn thành công!");
        this.$router.push("/mon-an");

      } catch (err) {
         console.error("Lỗi cập nhật:", (err.response && err.response.data) ? err.response.data : err);
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

.preview-img {
  width: 160px;
  height: 160px;
  border-radius: 10px;
  object-fit: cover;
  border: 2px solid #ddd;
  margin-bottom: 10px;
  transition: 0.3s;
}

.preview-img:hover {
  transform: scale(1.05);
}

h2 {
  font-weight: 600;
}
</style>
