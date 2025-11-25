<template>
  <div class="container mt-5">
    <h2>Sửa Nguyên Liệu</h2>
    <b-form @submit.prevent="handleUpdate">
      <b-form-group label="ID Nhà hàng">
        <b-form-input type="text" v-model="hang.restaurant_id" required></b-form-input>
      </b-form-group>

      <b-form-group label="Tên nguyên liệu">
        <b-form-input v-model="hang.item_name" required></b-form-input>
      </b-form-group>

      <b-form-group label="Số lượng tồn">
        <b-form-input type="text" v-model="hang.quantity" required></b-form-input>
      </b-form-group>

      <b-form-group label="Đơn vị tính">
        <b-form-select v-model="hang.unit" :options="unitOptions" required></b-form-select>
      </b-form-group>

      <b-form-group label="Mức đặt lại">
        <b-form-input type="text" v-model="hang.reorder_level" required></b-form-input>
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
  watch: {
    '$route.query.id': {
      immediate: false,
      handler(newId) {
        if (newId) {
          this.loadItem(newId);
        }
      }
    }
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
      // Kiểm tra id hợp lệ (số dương)
      if (!id || isNaN(id) || Number(id) <= 0) {
        alert('Không tìm thấy trang');
        this.$router.push('/kho');
        return;
      }
      try {
        const res = await api.get(`/inventories/${id}`);
        const item = res.data.data || res.data;
        if (!item || !item.inventory_id) {
          alert('Không tìm thấy trang');
          this.$router.push('/kho');
          return;
        }
        const expiryDateValue = item.expiry_date ? item.expiry_date.split(' ')[0] : "";
        this.hang = {
          id: item.inventory_id,
          restaurant_id: item.restaurant_id,
          item_name: item.item_name,
          quantity: item.quantity,
          unit: item.unit,
          reorder_level: item.reorder_level || 20,
          expiry_date: expiryDateValue,
          updated_at: item.updated_at // Lưu version
        };
        this.originalExpiryDate = expiryDateValue;
        // Lưu version vào sessionStorage để kiểm tra trùng lặp
        sessionStorage.setItem('kho_version_' + id, item.updated_at || '');
      } catch (err) {
        // Nếu lỗi 404 hoặc lỗi trả về không tìm thấy
        if (err.response && err.response.status === 404) {
          alert('Không tìm thấy trang');
        } else {
          alert('Không thể tải dữ liệu. Vui lòng thử lại.');
        }
        this.$router.push('/kho');
      }
    },
    async handleUpdate() {
      // Validate form
      const errors = [];
      // Kiểm tra item_name
      const name = this.hang.item_name || '';
      // Regex kiểm tra khoảng trắng (kể cả 2 bytes)
      const onlySpaces = /^([ \u00A0\u2000-\u200B\u3000\t\r\n]*)$/;
      if (!name || onlySpaces.test(name)) {
        errors.push('Tên nguyên liệu không được để trống hoặc chỉ chứa khoảng trắng!');
      } else if (name.length > 255) {
        errors.push('Tên nguyên liệu vượt quá 255 ký tự!');
      }
      // Regex kiểm tra số full-width và ký tự không phải số half-width
      const fullWidthNumber = /[\uFF10-\uFF19]/;
      const notHalfWidthDigit = /[^0-9]/;
      // Kiểm tra restaurant_id (giá trị gốc)
      const restaurantIdStr = String(this.hang.restaurant_id);
      if (
        !restaurantIdStr ||
        fullWidthNumber.test(restaurantIdStr) ||
        notHalfWidthDigit.test(restaurantIdStr) ||
        Number(restaurantIdStr) < 0
      ) {
        errors.push('ID Nhà hàng phải là số half-width (0-9)!');
      }
      // Kiểm tra số lượng (giá trị gốc)
      const quantityStr = String(this.hang.quantity);
      if (
        !quantityStr ||
        fullWidthNumber.test(quantityStr) ||
        notHalfWidthDigit.test(quantityStr) ||
        Number(quantityStr) < 0
      ) {
        errors.push('Số lượng tồn phải là số half-width (0-9) và không âm!');
      }
      // Kiểm tra mức đặt lại (giá trị gốc)
      const reorderLevelStr = String(this.hang.reorder_level);
      if (
        !reorderLevelStr ||
        fullWidthNumber.test(reorderLevelStr) ||
        notHalfWidthDigit.test(reorderLevelStr) ||
        Number(reorderLevelStr) < 0
      ) {
        errors.push('Mức đặt lại phải là số half-width (0-9) và không âm!');
      }
      // Kiểm tra đơn vị (chỉ cho phép giá trị hợp lệ trong unitOptions)
      const validUnits = this.unitOptions.map(opt => opt.value);
      if (!this.hang.unit || onlySpaces.test(this.hang.unit) || !validUnits.includes(this.hang.unit)) {
        errors.push('Đơn vị tính không hợp lệ!');
      }
      // Kiểm tra mức đặt lại
      if (isNaN(this.hang.reorder_level) || Number(this.hang.reorder_level) < 0) {
        errors.push('Mức đặt lại phải là số không âm!');
      }
      // Nếu có lỗi thì báo lỗi cụ thể
      if (errors.length > 0) {
        alert(errors.join('\n'));
        return;
      }
      try {
        // Kiểm tra version trước khi update
        const id = this.hang.id;
        const res = await api.get(`/inventories/${id}`);
        const latest = res.data.data || res.data;
        const latestVersion = latest.updated_at || '';
        const currentVersion = sessionStorage.getItem('kho_version_' + id) || '';
        if (latestVersion !== currentVersion) {
          alert('Vui lòng tải lại trang trước khi cập nhật!');
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
