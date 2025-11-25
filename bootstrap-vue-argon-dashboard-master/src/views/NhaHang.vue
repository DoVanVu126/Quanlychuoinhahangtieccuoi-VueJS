<template>
  <div class="container mt-5">
    <h2 class="text-center mb-4 text-primary">🍴 Quản lý Nhà hàng</h2>

    <!-- Nút thêm -->
    <div class="d-flex justify-content-end mb-3">
      <b-button variant="primary" @click="openAddModal">
        <i class="fas fa-plus"></i> Thêm nhà hàng
      </b-button>
    </div>

    <!-- Bảng danh sách -->
    <b-table :items="restaurants" :fields="fields" responsive hover bordered>
      <template #cell(image_url)="data">
        <b-img
          v-if="data.item.image_url"
          :src="data.item.image_url"
          thumbnail
          fluid
          width="80"
          height="80"
        ></b-img>
        <span v-else class="text-muted">Không có</span>
      </template>
      <template #cell(price_table)="data">
        {{ formatPrice(data.item.price_table) }} VNĐ
      </template>
      <template #cell(actions)="data">
        <b-button size="sm" variant="warning" @click="openEditModal(data.item)">
          <i class="fas fa-edit"></i>
        </b-button>
        <b-button size="sm" variant="danger" @click="deleteRestaurant(data.item.restaurant_id)">
          <i class="fas fa-trash"></i>
        </b-button>
      </template>
    </b-table>

    <!-- Modal thêm/sửa -->
    <b-modal :title="isEditing ? 'Cập nhật nhà hàng' : 'Thêm nhà hàng'" v-model="showModal">
      <b-form @submit.prevent="saveRestaurant">
        <b-form-group label="Tên nhà hàng">
          <b-form-input v-model="form.name" required></b-form-input>
        </b-form-group>

        <b-form-group label="Thành phố">
          <b-form-input v-model="form.city"></b-form-input>
        </b-form-group>

        <b-form-group label="Giá bàn (VNĐ)">
          <b-form-input type="number" min="0" v-model.number="form.price_table"></b-form-input>
        </b-form-group>

        <b-form-group label="Xếp hạng (★)">
          <b-form-input type="number" step="0.1" min="0" max="5" v-model.number="form.star_rating"></b-form-input>
        </b-form-group>

        <b-form-group label="Ảnh nhà hàng">
          <b-form-file
            @change="handleImageUpload"
            accept="image/*"
            placeholder="Chọn ảnh..."
          ></b-form-file>
          <div class="mt-2" v-if="previewImage">
            <b-img :src="previewImage" thumbnail fluid width="120" height="120"></b-img>
          </div>
          <div class="mt-2" v-else-if="form.image_url">
            <b-img :src="form.image_url" thumbnail fluid width="120" height="120"></b-img>
          </div>
        </b-form-group>

        <b-button type="submit" variant="success" class="mt-2">
          {{ isEditing ? 'Lưu thay đổi' : 'Thêm mới' }}
        </b-button>
      </b-form>
    </b-modal>
  </div>
</template>

<script>
import api from "@/api";

export default {
  data() {
    return {
      restaurants: [],
      form: {},
      showModal: false,
      isEditing: false,
      previewImage: null,
      fields: [
        { key: 'restaurant_id', label: 'ID', sortable: true },
        { key: 'image_url', label: 'Ảnh' },
        { key: 'name', label: 'Tên nhà hàng', sortable: true },
        { key: 'city', label: 'Thành phố' },
        { key: 'price_table', label: 'Giá bàn', sortable: true },
        { key: 'star_rating', label: 'Xếp hạng', sortable: true },
        { key: 'actions', label: 'Hành động' },
      ],
    };
  },
  methods: {
    async getRestaurants() {
      try {
        const res = await api.get("/restaurants");
        this.restaurants = res.data;
      } catch (err) {
        console.error("Lỗi tải danh sách nhà hàng:", err);
      }
    },
    formatPrice(value) {
      return value ? new Intl.NumberFormat("vi-VN").format(value) : "0";
    },
    openAddModal() {
      this.isEditing = false;
      this.form = {};
      this.previewImage = null;
      this.showModal = true;
    },
    openEditModal(r) {
      this.isEditing = true;
      this.form = { ...r };
      this.previewImage = null;
      this.showModal = true;
    },
    handleImageUpload(e) {
      const file = e.target.files[0];
      if (file) {
        this.form.newImage = file;
        this.previewImage = URL.createObjectURL(file);
      }
    },
    async saveRestaurant() {
      try {
        const formData = new FormData();
        formData.append("name", this.form.name);
        formData.append("city", this.form.city || "");
        formData.append("price_table", this.form.price_table || 0);
        formData.append("star_rating", this.form.star_rating || 0);
        if (this.form.newImage) {
          formData.append("image", this.form.newImage);
        }

        if (this.isEditing) {
          await api.post(`/restaurants/${this.form.restaurant_id}?_method=PUT`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });
        } else {
          await api.post("/restaurants", formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });
        }

        this.showModal = false;
        this.getRestaurants();
      } catch (err) {
        console.error("Lỗi lưu nhà hàng:", err);
      }
    },
    async deleteRestaurant(id) {
      if (confirm("Bạn có chắc muốn xóa nhà hàng này không?")) {
        try {
          await api.delete(`/restaurants/${id}`);
          this.getRestaurants();
        } catch (err) {
          console.error("Lỗi xóa nhà hàng:", err);
        }
      }
    },
  },
  mounted() {
    this.getRestaurants();
  },
};
</script>

<style scoped>
.container {
  max-width: 900px;
}
</style>
