<template>
  <div class="container mt-5">
    <h2>Sửa Nguyên Liệu</h2>
    <b-form @submit.prevent="handleUpdate">
      <b-form-group label="ID Nhà hàng">
        <b-form-input type="number" v-model="hang.restaurant_id" required></b-form-input>
      </b-form-group>

      <b-form-group label="Tên nguyên liệu">
        <b-form-input v-model="hang.item_name" required></b-form-input>
      </b-form-group>

      <b-form-group label="Số lượng tồn">
        <b-form-input type="number" v-model="hang.quantity" required></b-form-input>
      </b-form-group>

      <b-form-group label="Đơn vị tính">
        <b-form-select v-model="hang.unit" :options="unitOptions" required></b-form-select>
      </b-form-group>

      <b-form-group label="Mức đặt lại">
        <b-form-input type="number" v-model="hang.reorder_level" required></b-form-input>
      </b-form-group>

      <b-form-group label="Hạn sử dụng">
        <b-form-input v-model="displayExpiryDate" readonly></b-form-input>
      </b-form-group>

      <b-button type="submit" variant="primary">Cập nhật</b-button>
      <b-button variant="secondary" @click="$router.push('/kho')">Hủy</b-button>
    </b-form>
  </div>
</template>

<script>
import api from '@/api';

export default {
  data() {
    return {
      hang: {
        restaurant_id: 1,
        item_name: "",
        quantity: 0,
        unit: "kg",
        reorder_level: 20,
        expiry_date: ""
      },
      originalExpiryDate: "", // Lưu ngày gốc
      unitOptions: [
        { value: 'kg', text: 'kg' },
        { value: 'lít', text: 'lít' },
        { value: 'gói', text: 'gói' },
        { value: 'thùng', text: 'thùng' },
        { value: 'chai', text: 'chai' },
        { value: 'cái', text: 'cái' },
        { value: 'vỉ', text: 'vỉ' },
        { value: 'bó', text: 'bó' }
      ],
    };
  },
  async mounted() {
    const id = this.$route.query.id;
    if (id) {
      await this.loadItem(id);
    }
  },
  computed: {
    displayExpiryDate() {
      if (!this.originalExpiryDate) return '-';
      const date = new Date(this.originalExpiryDate);
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    }
  },
  methods: {
    async loadItem(id) {
      try {
        const res = await api.get(`/inventories/${id}`);
        const item = res.data.data || res.data;
        
        const expiryDateValue = item.expiry_date ? item.expiry_date.split(' ')[0] : "";
        
        this.hang = {
          id: item.inventory_id,
          restaurant_id: item.restaurant_id,
          item_name: item.item_name,
          quantity: item.quantity,
          unit: item.unit,
          reorder_level: item.reorder_level || 20,
          expiry_date: expiryDateValue
        };
        
        this.originalExpiryDate = expiryDateValue;
      } catch (err) {
        console.error('Lỗi tải dữ liệu:', err);
        alert('Không thể tải dữ liệu. Vui lòng thử lại.');
      }
    },
    async handleUpdate() {
      try {
        const payload = {
          restaurant_id: parseInt(this.hang.restaurant_id),
          item_name: this.hang.item_name,
          quantity: parseFloat(this.hang.quantity),
          unit: this.hang.unit,
          reorder_level: parseFloat(this.hang.reorder_level)
        };

        if (this.hang.expiry_date) {
          payload.expiry_date = this.hang.expiry_date;
        }

        await api.put(`/inventories/${this.hang.id}`, payload);
        alert("Cập nhật thành công!");
        this.$router.push("/kho");
      } catch (err) {
        console.error('Lỗi cập nhật:', err);
        alert('Không thể cập nhật. Vui lòng thử lại.');
      }
    },
  },
};
</script>
