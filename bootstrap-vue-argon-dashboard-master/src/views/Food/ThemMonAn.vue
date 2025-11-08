<template>
  <div class="container mt-5">
    <h2>Thêm Món Ăn</h2>
    <b-form @submit.prevent="addFood">
      <b-form-group label="Tên món ăn">
        <b-form-input v-model="form.name" required></b-form-input>
      </b-form-group>

      <b-form-group label="Mô tả">
        <b-form-textarea
          v-model="form.description"
          rows="3"
          required
        ></b-form-textarea>
      </b-form-group>

      <b-form-group label="Giá (VNĐ)">
        <b-form-input
          type="number"
          v-model="form.price"
          required
        ></b-form-input>
      </b-form-group>

      <b-form-group label="Loại món ăn (ID)">
        <b-form-input
          type="number"
          v-model="form.food_type_id"
          required
        ></b-form-input>
      </b-form-group>

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
        price: 0,
        food_type_id: null,
      },
    };
  },
  methods: {
    async addFood() {
      try {
        await api.post("/foods", this.form);
        alert("✅ Đã thêm món ăn: " + this.form.name);
        this.$router.push("/mon-an");
      } catch (err) {
        console.error("Lỗi thêm món ăn:", err);
        alert("❌ Thêm món ăn thất bại!");
      }
    },
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
