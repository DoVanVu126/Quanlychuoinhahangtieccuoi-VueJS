<template>
  <div class="container mt-5">
    <h2>Thêm Khuyến Mãi</h2>

    <form @submit.prevent="addPromotion" enctype="multipart/form-data">

      <b-form-group label="ID Nhà hàng">
        <b-form-input type="number" v-model="form.restaurant_id" min="1" required></b-form-input>
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

  methods: {
    handleImageUpload(e) {
      const file = e.target.files[0];
      if (file) {
        this.imageFile = file;
        this.previewImage = URL.createObjectURL(file);
      }
    },

    async addPromotion() {
      try {
        const formData = new FormData();
        formData.append("restaurant_id", this.form.restaurant_id);
        formData.append("promotion_code", this.form.code);
        formData.append("title", this.form.title);
        formData.append("description", this.form.description);
        formData.append("discount_type", this.form.discount_type);
        formData.append("discount_value", this.form.discount_value);
        formData.append("start_date", this.form.start_date);
        formData.append("end_date", this.form.end_date);
        formData.append("status", this.form.status);

        if (this.imageFile) {
          formData.append("image", this.imageFile);
        }

        const res = await api.post("/promotions", formData);

        // Kiểm tra image_url tồn tại
        let fullImageUrl = null;
        if (res.data.image_url) {
          fullImageUrl = res.data.image_url.startsWith("http")
            ? res.data.image_url
            : `http://127.0.0.1:8088/${res.data.image_url.replace(/^\/+/, "")}`;
        }

        alert("✅ Đã thêm khuyến mãi: " + res.data.title);

        // Redirect về trang danh sách
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
