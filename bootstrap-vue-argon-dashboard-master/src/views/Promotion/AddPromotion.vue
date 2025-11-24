<template>
  <div class="container mt-5">
    <h2>Thêm Khuyến Mãi</h2>

    <form @submit.prevent="addPromotion" enctype="multipart/form-data">

      <!-- Chọn nhà hàng từ combobox -->
      <b-form-group label="Nhà hàng">
        <b-form-select v-model="form.restaurant_id" :options="restaurantOptions" required>
          <template #first>
            <b-form-select-option :value="''" disabled>-- Chọn nhà hàng --</b-form-select-option>
          </template>
        </b-form-select>
      </b-form-group>

      <b-form-group label="Mã khuyến mãi">
        <b-form-input v-model="form.code" required></b-form-input>
      </b-form-group>

      <b-form-group label="Tiêu đề">
        <b-form-input v-model="form.title" required></b-form-input>
      </b-form-group>

      <b-form-group label="Mô tả">
        <b-form-textarea rows="3" v-model="form.description"></b-form-textarea>
      </b-form-group>

      <b-form-group label="Loại ưu đãi">
        <b-form-select v-model="form.discount_type" :options="discountTypeOptions"></b-form-select>
      </b-form-group>

      <b-form-group label="Giá trị ưu đãi">
        <b-form-input type="number" v-model="form.discount_value" min="0" required></b-form-input>
      </b-form-group>

      <b-form-group label="Ngày bắt đầu">
        <b-form-input type="date" v-model="form.start_date" required></b-form-input>
      </b-form-group>

      <b-form-group label="Ngày kết thúc">
        <b-form-input type="date" v-model="form.end_date" required></b-form-input>
      </b-form-group>

      <b-form-group label="Trạng thái">
        <b-form-select v-model="form.status" :options="statusOptions"></b-form-select>
      </b-form-group>

      <b-form-group label="Ảnh khuyến mãi">
        <b-form-file
          @change="handleImageUpload"
          accept="image/*"
          browse-text="Chọn ảnh"
          placeholder="Chưa chọn ảnh nào"
        ></b-form-file>

        <div v-if="previewImage" class="mt-3 text-center">
          <img :src="previewImage" class="img-thumbnail" style="max-width: 200px" />
        </div>
      </b-form-group>

      <div class="d-flex justify-content-between">
        <b-button type="submit" variant="success">💾 Lưu</b-button>
        <b-button variant="secondary" @click="$router.push({ name: 'Promotions' })">⬅ Quay lại</b-button>
      </div>

    </form>
  </div>
</template>

<script>
import api from "@/api";

export default {
  data() {
    return {
      form: {
        restaurant_id: null,
        code: "",
        title: "",
        description: "",
        discount_type: "amount",
        discount_value: 0,
        start_date: "",
        end_date: "",
        status: "upcoming",
      },
      imageFile: null,
      previewImage: null,

      restaurants: [], // danh sách nhà hàng

      discountTypeOptions: [
        { value: "amount", text: "Giảm theo số tiền" },
        { value: "percent", text: "Giảm theo phần trăm" },
      ],

      statusOptions: [
        { value: "upcoming", text: "Sắp diễn ra" },
        { value: "active", text: "Đang diễn ra" },
        { value: "expired", text: "Đã kết thúc" },
      ],
    };
  },

  computed: {
    restaurantOptions() {
      return this.restaurants.map(r => ({
        value: r.restaurant_id,
        text: r.name
      }));
    }
  },

  methods: {
    async fetchRestaurants() {
      try {
        const res = await api.get("/restaurants"); // API lấy danh sách nhà hàng
        this.restaurants = res.data;
      } catch (err) {
        console.error("Lỗi tải danh sách nhà hàng:", err);
      }
    },

    handleImageUpload(e) {
      const file = e.target.files[0];
      if (file) {
        this.imageFile = file;
        this.previewImage = URL.createObjectURL(file);
      }
    },

    async addPromotion() {
      if (!this.form.restaurant_id) {
        alert("Vui lòng chọn nhà hàng!");
        return;
      }

      try {
        const formData = new FormData();
        for (const key in this.form) {
          formData.append(key, this.form[key]);
        }
        if (this.imageFile) {
          formData.append("image", this.imageFile);
        }

        const res = await api.post("/promotions", formData);

        alert("✅ Đã thêm khuyến mãi: " + res.data.title);

        this.$router.push({ name: "Promotions" });

      } catch (e) {
        if (e.response && e.response.data.errors) {
          const messages = Object.values(e.response.data.errors)
            .flat()
            .join("\n");
          alert("❌ Lỗi validation:\n" + messages);
        } else {
          console.error(e);
          alert("❌ Lỗi thêm khuyến mãi!");
        }
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
