<template>
  <div class="container mt-5">
    <h2>Thêm Nguyên Liệu</h2>
    <b-form @submit.prevent="handleSubmit">
      <b-form-group label="ID Nhà hàng">
        <b-form-input type="text" v-model="hang.restaurant_id" required></b-form-input>
        <div class="text-danger small mt-1" v-if="errors.restaurant_id">{{ errors.restaurant_id }}</div>
      </b-form-group>

      <b-form-group label="Tên nguyên liệu">
        <b-form-input v-model="hang.item_name" required></b-form-input>
        <div class="text-danger small mt-1" v-if="errors.item_name">{{ errors.item_name }}</div>
      </b-form-group>

      <b-form-group label="Số lượng tồn">
        <b-form-input type="text" step="0.01" v-model="hang.quantity" required></b-form-input>

        <div class="text-danger small mt-1" v-if="errors.quantity">{{ errors.quantity }}</div>
      </b-form-group>

      <b-form-group label="Đơn vị tính">
        <b-form-select v-model="hang.unit" :options="unitOptions" required></b-form-select>
        <div class="text-danger small mt-1" v-if="errors.unit">{{ errors.unit }}</div>
      </b-form-group>

      <b-form-group label="Mức đặt lại">
        <b-form-input type="text" step="0.01" v-model="hang.reorder_level" required></b-form-input>
        <div class="text-danger small mt-1" v-if="errors.reorder_level">{{ errors.reorder_level }}</div>
      </b-form-group>

      <b-form-group label="Hạn sử dụng">
        <b-form-input type="date" v-model="hang.expiry_date"></b-form-input>
        <div class="text-danger small mt-1" v-if="errors.expiry_date">{{ errors.expiry_date }}</div>
      </b-form-group>

      <b-button type="submit" variant="success" :disabled="isSaving">{{ isSaving ? 'Đang lưu...' : 'Lưu' }}</b-button>
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
      isSaving: false,
      errors: {
        restaurant_id: '',
        item_name: '',
        quantity: '',
        unit: '',
        reorder_level: '',
        expiry_date: ''
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
    clearErrors() {
      Object.keys(this.errors).forEach(k => this.errors[k] = '');
    },

    normalizeNumberString(s) {
      if (s === null || s === undefined) return s;
      const str = String(s);
      const map = {'０':'0','１':'1','２':'2','３':'3','４':'4','５':'5','６':'6','７':'7','８':'8','９':'9','．':'.','，':'.','－':'-','ｰ':'-','﹣':'-'};
      return str.replace(/[０-９．，－ｰ﹣]/g, ch => map[ch] || ch).trim();
    },

    normalizeNumericFields() {
      try {
        this.hang.restaurant_id = this.normalizeNumberString(this.hang.restaurant_id);
        this.hang.quantity = this.normalizeNumberString(this.hang.quantity);
        this.hang.reorder_level = this.normalizeNumberString(this.hang.reorder_level);
      } catch (e) {}
    },

    isBlankText(s) {
      if (s === null || s === undefined) return true;
      return String(s).replace(/\s|\u3000/g, '').length === 0;
    },

    containsHtml(s) {
      if (!s) return false;
      return /<[^>]+>/.test(s);
    },

    validateForm() {
      this.normalizeNumericFields();
      this.clearErrors();
      let ok = true;

      if (this.isBlankText(this.hang.restaurant_id)) { this.errors.restaurant_id = 'Vui lòng nhập ID nhà hàng.'; ok = false; }
      else if (!/^-?\d+$/.test(String(this.hang.restaurant_id))) { this.errors.restaurant_id = 'ID nhà hàng phải là số nguyên.'; ok = false; }

      if (this.isBlankText(this.hang.item_name)) { this.errors.item_name = 'Vui lòng nhập tên nguyên liệu.'; ok = false; }
      else if (this.containsHtml(this.hang.item_name)) { this.errors.item_name = 'Nội dung không được chứa HTML.'; ok = false; }
      else if (String(this.hang.item_name).length > 2000) { this.errors.item_name = 'Tên quá dài (tối đa 2000 ký tự).'; ok = false; }

      if (this.isBlankText(this.hang.quantity)) { this.errors.quantity = 'Vui lòng nhập số lượng.'; ok = false; }
      else if (isNaN(Number(this.hang.quantity))) { this.errors.quantity = 'Số lượng phải là số.'; ok = false; }
      else if (Number(this.hang.quantity) < 0) { this.errors.quantity = 'Số lượng phải >= 0.'; ok = false; }

      if (!this.unitOptions.find(u => u.value === this.hang.unit)) { this.errors.unit = 'Đơn vị tính không hợp lệ.'; ok = false; }

      if (this.isBlankText(this.hang.reorder_level)) { this.errors.reorder_level = 'Vui lòng nhập mức đặt lại.'; ok = false; }
      else if (isNaN(Number(this.hang.reorder_level))) { this.errors.reorder_level = 'Mức đặt lại phải là số.'; ok = false; }
      else if (Number(this.hang.reorder_level) < 0) { this.errors.reorder_level = 'Mức đặt lại phải >= 0.'; ok = false; }

      if (this.hang.expiry_date) {
        const d = new Date(this.hang.expiry_date);
        if (isNaN(d.getTime())) { this.errors.expiry_date = 'Hạn sử dụng không hợp lệ.'; ok = false; }
      }

      return ok;
    },

    async handleSubmit() {
      if (this.isSaving) return;

      const errors = [];

      const name = this.hang.item_name || '';
      const onlySpaces = /^([ \u00A0\u2000-\u200B\u3000\t\r\n]*)$/;

      if (!name || onlySpaces.test(name)) {
        errors.push('Tên nguyên liệu không được để trống hoặc chỉ chứa khoảng trắng!');
      } else if (name.length > 255) {
        errors.push('Tên nguyên liệu vượt quá 255 ký tự!');
      }

      const fullWidthNumber = /[\uFF10-\uFF19]/;
      const notHalfWidthDigit = /[^0-9]/;

      const restaurantIdStr = String(this.hang.restaurant_id);
      if (!restaurantIdStr || fullWidthNumber.test(restaurantIdStr) || notHalfWidthDigit.test(restaurantIdStr) || Number(restaurantIdStr) < 0) {
        errors.push('ID Nhà hàng phải là số half-width (0-9)!');
      }

      const quantityStr = String(this.hang.quantity);
      if (!quantityStr || fullWidthNumber.test(quantityStr) || notHalfWidthDigit.test(quantityStr) || Number(quantityStr) < 0) {
        errors.push('Số lượng tồn phải là số half-width (0-9) và không âm!');
      }

      const reorderLevelStr = String(this.hang.reorder_level);
      if (!reorderLevelStr || fullWidthNumber.test(reorderLevelStr) || notHalfWidthDigit.test(reorderLevelStr) || Number(reorderLevelStr) < 0) {
        errors.push('Mức đặt lại phải là số half-width (0-9) và không âm!');
      }

      const validUnits = this.unitOptions.map(opt => opt.value);
      if (!this.hang.unit || onlySpaces.test(this.hang.unit) || !validUnits.includes(this.hang.unit)) {
        errors.push('Đơn vị tính không hợp lệ!');
      }

      if (errors.length > 0) {
        alert(errors.join('\n'));
        return;
      }

      this.isSaving = true;
      try {
        // check duplicate
        const allRes = await api.get('/inventories');
        let allItems = [];
        if (allRes.data && Array.isArray(allRes.data.data)) allItems = allRes.data.data;
        else if (Array.isArray(allRes.data)) allItems = allRes.data;

        const isDuplicate = allItems.some(item =>
          String(item.restaurant_id) === String(this.hang.restaurant_id) &&
          item.item_name.trim().toLowerCase() === this.hang.item_name.trim().toLowerCase()
        );
        if (isDuplicate) {
          alert('Tên nguyên liệu đã tồn tại trong kho!');
          return;
        }

        const payload = {
          restaurant_id: parseInt(this.hang.restaurant_id),
          item_name: this.hang.item_name,
          quantity: parseInt(this.hang.quantity),
          unit: this.hang.unit,
          reorder_level: parseInt(this.hang.reorder_level)
        };
        if (this.hang.expiry_date) {
          // If user provided date only (YYYY-MM-DD), append time to avoid timezone shifts on backend
          if (/^\d{4}-\d{2}-\d{2}$/.test(this.hang.expiry_date)) {
            payload.expiry_date = this.hang.expiry_date + 'T00:00:00';
          } else {
            payload.expiry_date = this.hang.expiry_date;
          }
        }

        await api.post('/inventories', payload);
        alert('Đã thêm hàng: ' + this.hang.item_name);
        this.$router.push('/kho');
      } catch (err) {
        console.error('Lỗi:', err);
        let msg = 'Không thể thêm. Vui lòng thử lại.';
        if (err.response && err.response.data) {
          if (typeof err.response.data === 'string') msg = err.response.data;
          else if (err.response.data.message) msg = err.response.data.message;
          else if (err.response.data.errors) msg = Object.values(err.response.data.errors).map(e => Array.isArray(e) ? e.join(', ') : e).join('\n');
        }
        alert(msg);
      } finally {
        this.isSaving = false;
      }
    },
  },
};
</script>
