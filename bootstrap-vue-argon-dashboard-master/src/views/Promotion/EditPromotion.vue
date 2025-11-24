<template>
  <div class="container mt-5">
    <h2 class="mb-4 text-warning">✏️ Sửa Khuyến Mãi</h2>

    <b-form @submit.prevent="updatePromotion" enctype="multipart/form-data">
      <!-- Chọn Nhà hàng -->
      <b-form-group label="Nhà hàng">
        <b-form-select v-model="form.restaurant_id" :options="restaurantOptions" required>
          <template #first>
            <b-form-select-option :value="''" disabled>-- Chọn nhà hàng --</b-form-select-option>
          </template>
        </b-form-select>
      </b-form-group>

      <!-- Mã Khuyến Mãi -->
      <b-form-group label="Mã Khuyến Mãi">
        <b-form-input v-model="form.promotion_code" required></b-form-input>
      </b-form-group>

      <!-- Tiêu đề -->
      <b-form-group label="Tiêu đề">
        <b-form-input v-model="form.title" required></b-form-input>
      </b-form-group>

      <!-- Mô tả -->
      <b-form-group label="Mô tả">
        <b-form-textarea v-model="form.description" rows="3"></b-form-textarea>
      </b-form-group>

      <!-- Loại giảm -->
      <b-form-group label="Loại giảm">
        <b-form-select v-model="form.discount_type">
          <option value="percent">Phần trăm (%)</option>
          <option value="amount">Số tiền giảm (VNĐ)</option>
        </b-form-select>
      </b-form-group>

      <!-- Giá trị giảm -->
      <b-form-group label="Giá trị giảm">
        <b-form-input type="number" v-model.number="form.discount_value" required></b-form-input>
      </b-form-group>

      <!-- Ngày bắt đầu -->
      <b-form-group label="Ngày bắt đầu">
        <b-form-input type="date" v-model="form.start_date" required></b-form-input>
      </b-form-group>

      <!-- Ngày kết thúc -->
      <b-form-group label="Ngày kết thúc">
        <b-form-input type="date" v-model="form.end_date" required></b-form-input>
      </b-form-group>

      <!-- Trạng thái -->
      <b-form-group label="Trạng thái">
        <b-form-select v-model="form.status">
          <option value="active">Đang hoạt động</option>
          <option value="expired">Hết hạn</option>
          <option value="upcoming">Sắp diễn ra</option>
        </b-form-select>
      </b-form-group>

      <!-- Ảnh hiện tại & chọn ảnh mới -->
      <b-form-group label="Ảnh khuyến mãi">
        <div v-if="!previewImage && form.currentImage">
          <p>Ảnh hiện tại:</p>
          <img
            :src="form.currentImage"
            alt="Ảnh khuyến mãi"
            class="img-thumbnail mb-2"
            style="max-width: 200px;"
          />
        </div>

        <div v-if="previewImage" class="mb-2">
          <p>Ảnh mới:</p>
          <img :src="previewImage" alt="Preview" class="img-thumbnail" style="max-width: 200px;" />
        </div>

        <b-form-file
          @change="handleImageUpload"
          accept="image/*"
          placeholder="Chọn ảnh mới nếu muốn thay"
          browse-text="Chọn ảnh"
        ></b-form-file>
      </b-form-group>

      <!-- Nút thao tác -->
      <div class="d-flex gap-2 mt-3">
        <b-button type="submit" variant="warning">💾 Cập nhật</b-button>
        <b-button variant="secondary" @click="$router.push('/promotions')">Hủy</b-button>
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
      restaurants: [], // danh sách nhà hàng
    };
  },

  computed: {
    restaurantOptions() {
      return this.restaurants.map(r => ({ value: r.restaurant_id, text: r.name }));
    }
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

        this.form = {
          ...this.form,
          promotion_code: res.data.promotion_code,
          title: res.data.title,
          description: res.data.description,
          restaurant_id: res.data.restaurant_id,
          discount_type: res.data.discount_type,
          discount_value: res.data.discount_value,
          start_date: res.data.start_date ? res.data.start_date.slice(0, 10) : "",
          end_date: res.data.end_date ? res.data.end_date.slice(0, 10) : "",
          status: res.data.status,
          currentImage: res.data.image_url || null,
          newImage: null,
        };
      } catch (err) {
        console.error("❌ Lỗi tải khuyến mãi:", err);
        alert("Không tải được dữ liệu!");
        this.$router.push("/promotions");
      }
    },

    handleImageUpload(e) {
      const file = e.target.files[0];
      if (file) {
        this.form.newImage = file;
        this.previewImage = URL.createObjectURL(file);
      }
    },

    async updatePromotion() {
      try {
        const id = this.$route.params.id;
        const formData = new FormData();

        for (const key of ["promotion_code", "title", "description", "restaurant_id", "discount_type", "discount_value", "start_date", "end_date", "status"]) {
          formData.append(key, this.form[key]);
        }

        if (this.form.newImage) {
          formData.append("image", this.form.newImage);
        }

        await api.post(`/promotions/${id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        alert("✅ Cập nhật khuyến mãi thành công!");
        this.$router.push("/promotions");
      } catch (err) {
        console.error("❌ Lỗi cập nhật:", err);
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
}
.b-form-group {
  margin-bottom: 1.2rem;
}
.img-thumbnail {
  border-radius: 12px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.2);
}
</style>
