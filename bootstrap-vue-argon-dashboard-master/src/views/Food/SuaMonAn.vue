<template>
  <div class="container mt-5">
    <h2>Sửa Món Ăn</h2>
    <b-form @submit.prevent="updateFood">
      <b-form-group label="Tên món ăn">
        <b-form-input v-model="form.name" required></b-form-input>
      </b-form-group>

      <b-form-group label="Mô tả">
        <b-form-textarea v-model="form.description" rows="3"></b-form-textarea>
      </b-form-group>

      <b-form-group label="Giá (VNĐ)">
        <b-form-input type="number" v-model="form.price" required></b-form-input>
      </b-form-group>

      <b-form-group label="Loại món ăn (ID)">
        <b-form-input type="number" v-model="form.food_type_id" required></b-form-input>
      </b-form-group>

      <b-form-group label="Trạng thái">
        <b-form-select v-model="form.status">
          <b-form-select-option :value="true">Đang bán</b-form-select-option>
          <b-form-select-option :value="false">Ngừng bán</b-form-select-option>
        </b-form-select>
      </b-form-group>

      <b-button type="submit" variant="primary">Cập nhật</b-button>
      <b-button variant="secondary" @click="$router.push('/mon-an')">Hủy</b-button>
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
        status: true,
      },
    };
  },
  mounted() {
    this.loadFood();
  },
  methods: {
    async loadFood() {
      try {
        const res = await api.get(`/foods/${this.$route.params.id}`);
        this.form = {
          ...res.data,
          status: !!res.data.status,
        };
      } catch (err) {
        console.error("Không tải được món ăn:", err);
        alert("Không tải được món ăn!");
        this.$router.push("/mon-an");
      }
    },
    async updateFood() {
      try {
        await api.put(`/foods/${this.$route.params.id}`, this.form);
        alert("Cập nhật món ăn thành công!");
        this.$router.push("/mon-an");
      } catch (err) {
        console.error("Lỗi cập nhật món ăn:", err);
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

h2 {
  font-weight: 600;
  margin-bottom: 20px;
}

.b-form-group {
  margin-bottom: 1.2rem;
}
</style>
