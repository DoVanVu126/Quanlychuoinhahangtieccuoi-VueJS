<template>
  <div class="container mt-5">
    <h2>Thêm Nguyên Liệu</h2>
    <b-form @submit.prevent="handleSubmit">
      <b-form-group label="ID Nhà hàng">
        <b-form-input type="number" v-model="hang.restaurant_id" required></b-form-input>
      </b-form-group>

      <b-form-group label="Tên nguyên liệu">
        <b-form-input v-model="hang.item_name" required></b-form-input>
      </b-form-group>

      <b-form-group label="Số lượng tồn">
        <b-form-input type="number" step="0.01" v-model="hang.quantity" required></b-form-input>
      </b-form-group>

      <b-form-group label="Đơn vị tính">
        <b-form-select v-model="hang.unit" :options="unitOptions" required></b-form-select>
      </b-form-group>

      <b-form-group label="Mức đặt lại">
        <b-form-input type="number" step="0.01" v-model="hang.reorder_level" required></b-form-input>
      </b-form-group>

      <b-form-group label="Hạn sử dụng">
        <b-form-input type="date" v-model="hang.expiry_date"></b-form-input>
      </b-form-group>

      <b-button type="submit" variant="success">Lưu</b-button>
      <b-button variant="secondary" @click="$router.push('/kho')">Quay lại</b-button>
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
  methods: {
    async handleSubmit() {
      try {
        // Lấy toàn bộ danh sách nguyên liệu để kiểm tra trùng lặp phía frontend
        const allRes = await api.get('/inventories');
        let allItems = [];
        if (allRes.data && Array.isArray(allRes.data.data)) {
          allItems = allRes.data.data;
        } else if (Array.isArray(allRes.data)) {
          allItems = allRes.data;
        }
        const isDuplicate = allItems.some(item =>
          String(item.restaurant_id) === String(this.hang.restaurant_id)
          && item.item_name.trim().toLowerCase() === this.hang.item_name.trim().toLowerCase()
        );
        if (isDuplicate) {
          alert('Tên nguyên liệu đã tồn tại trong kho!');
          return;
        }
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
        await api.post('/inventories', payload);
        alert("Đã thêm hàng: " + this.hang.item_name);
        this.$router.push("/kho");
      } catch (err) {
        console.error('Lỗi:', err);
        let msg = "Không thể thêm. Vui lòng thử lại.";
        if (err.response && err.response.data) {
          if (typeof err.response.data === 'string') {
            msg = err.response.data;
          } else if (err.response.data.message) {
            msg = err.response.data.message;
          } else if (err.response.data.errors) {
            // Laravel validation errors
            msg = Object.values(err.response.data.errors).map(e => Array.isArray(e) ? e.join(', ') : e).join('\n');
          }
        }
        alert(msg);
      }
    },
  },
};
</script>
