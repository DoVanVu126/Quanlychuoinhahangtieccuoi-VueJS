<template>
  <div class="container mt-5">
    <h2>Sửa Nhà Hàng</h2>

    <b-form @submit.prevent="updateRestaurant">
      <b-form-group label="Tên nhà hàng">
        <b-form-input v-model="form.name" required></b-form-input>
      </b-form-group>

      <b-form-group label="Thành phố">
        <b-form-input v-model="form.city"></b-form-input>
      </b-form-group>

      <b-form-group label="Giá bàn (VNĐ)">
        <b-form-input type="number" v-model.number="form.price_table" min="0"></b-form-input>
      </b-form-group>

      <b-form-group label="Xếp hạng (★)">
        <b-form-input type="number" step="0.1" v-model.number="form.star_rating" min="0" max="5"></b-form-input>
      </b-form-group>

      <b-form-group label="Ảnh nhà hàng">
        <b-form-file
          @change="handleImageUpload"
          accept="image/*"
          browse-text="Chọn ảnh"
          placeholder="Chưa chọn ảnh"
        ></b-form-file>

        <div v-if="previewImage" class="mt-3">
          <img :src="previewImage" alt="Preview" class="img-thumbnail" style="max-width:200px;" />
        </div>
        <div v-else-if="form.image_url" class="mt-3">
          <img :src="form.image_url" alt="Current" class="img-thumbnail" style="max-width:200px;" />
        </div>
      </b-form-group>

      <div class="d-flex gap-2">
        <b-button type="submit" variant="success">Lưu thay đổi</b-button>
        <b-button variant="secondary" @click="$router.push({ name: 'Restaurant' })">Hủy</b-button>
      </div>
    </b-form>
  </div>
</template>

<script>
import api from '@/api';

export default {
  data() {
    return {
      form: {
        restaurant_id: null,
        name: '',
        city: '',
        price_table: 0,
        star_rating: 0,
        image_url: null,
      },
      previewImage: null,
      imageFile: null,
    };
  },
  methods: {
    async loadRestaurant() {
      const id = this.$route.params.id;
      if (!id) return this.$router.push({ name: 'Restaurant' });
      try {
        const res = await api.get(`/restaurants/${id}`);
        const data = res.data || {};
        this.form = {
          restaurant_id: data.restaurant_id || id,
          name: data.name || '',
          city: data.city || '',
          price_table: data.price_table || 0,
          star_rating: data.star_rating || 0,
          image_url: data.image_url && data.image_url.startsWith('http') ? data.image_url : (data.image_url ? `http://127.0.0.1:8088/${data.image_url.replace(/^\/+/, '')}` : null)
        };
      } catch (err) {
        console.error('Lỗi tải nhà hàng:', err);
        this.$router.push({ name: 'Restaurant' });
      }
    },
    handleImageUpload(e) {
      const f = e.target.files[0];
      if (f) {
        this.imageFile = f;
        this.previewImage = URL.createObjectURL(f);
      }
    },
    async updateRestaurant() {
      try {
        const formData = new FormData();
        formData.append('name', this.form.name);
        formData.append('city', this.form.city || '');
        formData.append('price_table', this.form.price_table || 0);
        formData.append('star_rating', this.form.star_rating || 0);
        if (this.imageFile) formData.append('image', this.imageFile);

        // Some backends accept POST with _method=PUT for multipart forms
        await api.post(`/restaurants/${this.form.restaurant_id}?_method=PUT`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });

        this.$router.push({ name: 'Restaurant' });
      } catch (err) {
        console.error('Lỗi cập nhật nhà hàng:', err);
        alert('Cập nhật thất bại!');
      }
    }
  },
  mounted() {
    this.loadRestaurant();
  }
};
</script>

<style scoped>
.img-thumbnail { border-radius: 10px; box-shadow: 0 2px 6px rgba(0,0,0,0.12); }
</style>
