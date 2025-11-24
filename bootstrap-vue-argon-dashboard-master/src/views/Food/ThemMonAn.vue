<template>
  <div class="container mt-5">
    <h2>Thêm Món Ăn</h2>
    <b-form @submit.prevent="addFood">

      <!-- Tên món ăn -->
      <b-form-group label="Tên món ăn" label-for="name">
        <b-form-input
          id="name"
          v-model="form.name"
          required
          placeholder="Nhập tên món ăn"
        ></b-form-input>
      </b-form-group>

      <!-- Mô tả -->
      <b-form-group label="Mô tả" label-for="description">
        <b-form-textarea
          id="description"
          v-model="form.description"
          rows="3"
          placeholder="Nhập mô tả món ăn"
        ></b-form-textarea>
      </b-form-group>

      <!-- Đơn vị -->
      <b-form-group label="Đơn vị" label-for="unit">
        <b-form-input
          id="unit"
          v-model="form.unit"
          required
          placeholder="Nhập đơn vị món ăn (ví dụ: phần, suất)"
        ></b-form-input>
      </b-form-group>

      <!-- Giá -->
      <b-form-group label="Giá (VNĐ)" label-for="price">
        <b-form-input
          id="price"
          type="number"
          v-model.number="form.price"
          required
          min="0"
          placeholder="Nhập giá món ăn"
        ></b-form-input>
      </b-form-group>

      <!-- Loại món ăn -->
      <b-form-group label="Loại món ăn" label-for="food_type_id">
        <b-form-select
          id="food_type_id"
          v-model="form.food_type_id"
          :options="foodTypes"
          required
        >
          <template #first>
            <b-form-select-option :value="null" disabled>-- Chọn loại --</b-form-select-option>
          </template>
        </b-form-select>
      </b-form-group>

      <!-- Nhà hàng -->
      <b-form-group label="Nhà hàng" label-for="restaurant_id">
        <b-form-select
          id="restaurant_id"
          v-model="form.restaurant_id"
          :options="restaurants"
          required
        >
          <template #first>
            <b-form-select-option :value="null" disabled>-- Chọn nhà hàng --</b-form-select-option>
          </template>
        </b-form-select>
      </b-form-group>

      <!-- Upload ảnh -->
      <b-form-group label="Ảnh món ăn" label-for="image">
        <b-form-file
          id="image"
          v-model="form.image"
          accept="image/*"
          placeholder="Chọn file ảnh..."
        ></b-form-file>
      </b-form-group>

      <!-- Nút lưu -->
      <b-button type="submit" variant="success">Lưu</b-button>
      <b-button variant="secondary" @click="$router.push('/mon-an')">Quay lại</b-button>
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
        image: null, // file upload
      },
      foodTypes: [],      // Loại món ăn
      restaurants: [],    // Nhà hàng
    };
  },
  methods: {
    async fetchFoodTypes() {
      try {
        const res = await api.get("/food-types");
        this.foodTypes = res.data.map(ft => ({
          value: ft.food_type_id,
          text: ft.name,
        }));
      } catch (err) {
        console.error("Lỗi tải loại món ăn:", err);
      }
    },
   async fetchRestaurants() {
  try {
    const res = await api.get("/restaurants");

    // lấy mảng thực sự từ API
    const restaurantsArray = Array.isArray(res.data) ? res.data : res.data.data || [];

    this.restaurants = restaurantsArray.map(r => ({
      value: r.restaurant_id,
      text: r.name,
    }));
  } catch (err) {
    console.error("Lỗi tải nhà hàng:", err);
  }
},
    async addFood() {
  try {
    const formData = new FormData();
    formData.append("name", this.form.name);
    formData.append("description", this.form.description);
    formData.append("unit", this.form.unit);
    formData.append("price", this.form.price);
    formData.append("food_type_id", this.form.food_type_id);
    formData.append("restaurant_id", this.form.restaurant_id);
    if (this.form.image) {
      formData.append("image", this.form.image);
    }

    await api.post("/foods", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    alert("✅ Đã thêm món ăn: " + this.form.name);
    this.$router.push("/mon-an");
  } catch (err) {
    console.error("Lỗi thêm món ăn:", err.response && err.response.data ? err.response.data : err);
    alert("❌ Thêm món ăn thất bại! Kiểm tra console để biết chi tiết.");
  }
},
  },
  mounted() {
    this.fetchFoodTypes();
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
</style>
