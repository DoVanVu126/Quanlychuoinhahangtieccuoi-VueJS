<template>
  <div class="checkout-page">
    <div class="checkout-header">
      <img src="/logo.png" alt="Logo" class="logo" />
      <button class="back-btn" @click="$router.back()">← Quay lại</button>
    </div>
    <div class="checkout-content">
      <div class="checkout-methods">
        <h3>Phương thức thanh toán</h3>
        <ul class="payment-list">
          <li v-for="(method, idx) in paymentMethods" :key="method.value" :class="{selected: selectedMethod === method.value}" @click="selectMethod(method.value)">
            <img :src="method.icon" :alt="method.label" />{{ method.label }}
          </li>
        </ul>
      </div>
      <div class="checkout-main">
        <div class="cart-card">
          <h3 class="cart-title"><i class="fas fa-shopping-cart"></i> Chi tiết giỏ hàng</h3>
          <ul class="cart-detail-list">
            <li v-for="(item, idx) in cart" :key="idx">
              <div class="cart-item-row">
                <div class="cart-item-info">
                  <b>{{ item.name }}</b>
                  <span v-if="item.restaurant_name" class="cart-restaurant">({{ item.restaurant_name }})</span>
                </div>
                <div class="cart-item-price">{{ formatMoney(item.price) }} đ</div>
              </div>
            </li>
          </ul>
          <div class="cart-summary">
            <div class="summary-row">
              <span>Tạm tính</span>
              <span>{{ formatMoney(total) }} đ</span>
            </div>
            <div class="summary-row">
              <span>Phụ thu dịch vụ (10%)</span>
              <span>{{ formatMoney(serviceFee) }} đ</span>
            </div>
            <div class="summary-row" v-if="discountAmount > 0">
              <span>Giảm giá</span>
              <span class="text-success">-{{ formatMoney(discountAmount) }} đ</span>
            </div>
            <div class="summary-row total-row">
              <span>Tổng thanh toán</span>
              <span class="total-amount">{{ formatMoney(finalTotal) }} đ</span>
            </div>
          </div>
        </div>
        <div class="pay-section">
          <div class="change" v-if="selectedMethod !== 'cash'">Vui lòng chuyển khoản đúng nội dung bên dưới</div>
          <div class="qr" v-if="selectedMethod !== 'cash'">
            <img :src="qrCodeUrl" alt="QR Code" />
          </div>
          <div class="note" v-if="selectedMethod !== 'cash'">
            Nội dung chuyển khoản: <b>{{ transferNote }}</b><br>
            STK: <b>{{ adminBank.stk }}</b> ({{ adminBank.bank }})<br>
            Chủ TK: <b>{{ adminBank.name }}</b>
          </div>
          <div class="note" v-else>
            Thanh toán trực tiếp tại quầy.
          </div>
          <button class="print-btn" @click="printBill" :disabled="isLoading || paymentStatus==='paid'">
            <span v-if="isLoading">Đang xử lý...</span>
            <span v-else-if="paymentStatus==='paid'">Đã thanh toán</span>
            <span v-else>Xác nhận thanh toán</span>
          </button>
          <div v-if="paymentStatus==='paid'" class="alert alert-success mt-3">Bạn đã thanh toán thành công!</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
export default {
  data() {
    return {
      paymentMethods: [
        { value: 'cash', label: 'CASH', icon: 'https://img.icons8.com/ios-filled/50/1976d2/cash-in-hand.png' },
        { value: 'momo', label: 'MOMO QR', icon: 'https://upload.wikimedia.org/wikipedia/vi/f/fe/MoMo_Logo.png' },
        { value: 'vnpay', label: 'VNPAY QR', icon: 'VNPAY.png' },
        { value: 'zalo', label: 'Zalo Pay QR', icon: 'Zalo.png' },
        { value: 'bank', label: 'Ngân hàng', icon: 'nganhang.png' },
      ],
      selectedMethod: 'momo',
      cart: [],
      total: 0,
      serviceFee: 0,
      discountAmount: 0,
      finalTotal: 0,
      adminBank: {
        stk: '123456789',
        bank: 'Vietcombank',
        name: 'Nguyen Van Admin',
      },
      transferNote: '', // sẽ lấy từ payment
      paymentId: null, // ID đơn hàng/thanh toán
      paymentStatus: '', // Trạng thái thanh toán
      isLoading: false,
    };
  },
  async created() {
    // Lấy payment_id từ query string hoặc localStorage
    const urlParams = new URLSearchParams(window.location.search);
    const paymentIdFromUrl = urlParams.get('payment_id');
    this.paymentId = paymentIdFromUrl || localStorage.getItem('payment_id') || null;
    if (this.paymentId) {
      try {
        const res = await axios.get(`/api/payments/${this.paymentId}`);
        if (res.data) {
          // Hiển thị chi tiết đơn hàng từ backend
          // If backend returns items use them; otherwise fall back to localStorage cart
          const items = res.data.items || res.data.data && res.data.data.items || [];
          if (Array.isArray(items) && items.length > 0) {
            this.cart = items;
            this.total = res.data.total_amount || res.data.data && res.data.data.total_amount || this.cart.reduce((s,i)=>s+Number(i.price||0),0);
            this.serviceFee = res.data.service_fee || res.data.data && res.data.data.service_fee || Math.round(this.total * 0.1);
            this.discountAmount = res.data.discount || res.data.data && res.data.data.discount || 0;
            this.finalTotal = res.data.final_total || res.data.data && res.data.data.final_total || Math.max(0,this.total+this.serviceFee-this.discountAmount);
          } else {
            // fallback: load cart saved in browser
            const localCart = JSON.parse(localStorage.getItem('cart')) || [];
            this.cart = localCart.map(i => ({
              name: i.name || (i.hall_name || (i.hall_id ? `Sảnh #${i.hall_id}` : 'Sảnh')),
              restaurant_name: i.restaurant_name || i.restaurant || null,
              price: Number(i.price || 0)
            }));
            this.total = this.cart.reduce((s,i)=>s+Number(i.price||0),0);
            this.serviceFee = Math.round(this.total * 0.1);
            this.discountAmount = 0;
            this.finalTotal = Math.max(0,this.total+this.serviceFee-this.discountAmount);
          }

          this.transferNote = res.data.transaction_code || (res.data.data && res.data.data.transaction_code) || `PAY${this.paymentId}`;
          this.paymentStatus = res.data.payment_status || (res.data.data && res.data.data.payment_status) || '';
          localStorage.setItem('payment_id', this.paymentId);
          localStorage.setItem('payment_status', this.paymentStatus);
        }
      } catch (err) {
        // if backend fails, fallback to local cart so user still sees items
        const localCart = JSON.parse(localStorage.getItem('cart')) || [];
        this.cart = localCart.map(i => ({
          name: i.name || (i.hall_name || (i.hall_id ? `Sảnh #${i.hall_id}` : 'Sảnh')),
          restaurant_name: i.restaurant_name || i.restaurant || null,
          price: Number(i.price || 0)
        }));
        this.total = this.cart.reduce((s,i)=>s+Number(i.price||0),0);
        this.serviceFee = Math.round(this.total * 0.1);
        this.discountAmount = 0;
        this.finalTotal = Math.max(0,this.total+this.serviceFee-this.discountAmount);
        this.paymentStatus = '';
      }
    } else {
      // no payment id: show local cart
      const localCart = JSON.parse(localStorage.getItem('cart')) || [];
      this.cart = localCart.map(i => ({
        name: i.name || (i.hall_name || (i.hall_id ? `Sảnh #${i.hall_id}` : 'Sảnh')),
        restaurant_name: i.restaurant_name || i.restaurant || null,
        price: Number(i.price || 0)
      }));
      this.total = this.cart.reduce((s,i)=>s+Number(i.price||0),0);
      this.serviceFee = Math.round(this.total * 0.1);
      this.discountAmount = 0;
      this.finalTotal = Math.max(0,this.total+this.serviceFee-this.discountAmount);
      this.paymentStatus = '';
    }
  },
  computed: {
    qrCodeUrl() {
      // QR code chứa link thanh toán có payment_id
      const base = window.location.origin + '/thanh-toan?payment_id=' + (this.paymentId || '');
      return `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(base)}`;
    },
  },
  methods: {
    selectMethod(val) {
      this.selectedMethod = val;
    },
    async printBill() {
      if (!this.paymentId) {
        alert('Không tìm thấy mã đơn hàng/thanh toán!');
        return;
      }
      this.isLoading = true;
      try {
        const res = await axios.post(`/api/payments/${this.paymentId}/status`, { payment_status: 'paid' });
        this.paymentStatus = 'paid';
        localStorage.setItem('payment_status', 'paid');
        alert('Thanh toán thành công!');
      } catch (err) {
        alert('Có lỗi khi cập nhật trạng thái thanh toán!');
      } finally {
        this.isLoading = false;
      }
    },
    formatMoney(v) {
      return Number(v).toLocaleString('vi-VN');
    },
  },
};
</script>

<style scoped>
.checkout-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #e0e7ff 0%, #f5f7fa 100%);
  padding-bottom: 40px;
}
.checkout-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px 40px 0 40px;
  background: #fff;
  border-bottom: 1px solid #e3e3e3;
}
.logo {
  height: 38px;
}
.back-btn {
  background: #1976d2;
  color: #fff;
  border: none;
  padding: 8px 20px;
  font-size: 16px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
}
.checkout-content {
  display: flex;
  flex-wrap: wrap;
  max-width: 1100px;
  margin: 40px auto;
  gap: 32px;
  justify-content: center;
}
.checkout-methods {
  min-width: 260px;
  background: #f7f7f7;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(25, 118, 210, 0.06);
  padding: 32px 24px;
  height: fit-content;
}
.checkout-methods h3 {
  color: #1976d2;
  font-size: 17px;
  font-weight: bold;
  margin-bottom: 18px;
}
.payment-list {
  list-style: none;
  padding: 0;
  margin: 0;
}
.payment-list li {
  display: flex;
  align-items: center;
  padding: 14px 0;
  cursor: pointer;
  border-left: 4px solid transparent;
  transition: background 0.2s, border-color 0.2s;
  font-size: 16px;
  color: #333;
  font-weight: 500;
  padding-left: 12px;
}
.payment-list li.selected {
  background: #e6f0ff;
  border-left: 4px solid #1976d2;
  color: #1976d2;
}
.payment-list li img {
  width: 32px;
  height: 32px;
  margin-right: 14px;
}
.checkout-main {
  flex: 1;
  min-width: 320px;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.cart-card {
  width: 100%;
  max-width: 480px;
  background: #f8fafc;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(25, 118, 210, 0.06);
  padding: 28px 32px 18px 32px;
  margin-bottom: 32px;
}
.cart-title {
  font-size: 20px;
  font-weight: bold;
  color: #1976d2;
  margin-bottom: 18px;
  display: flex;
  align-items: center;
  gap: 8px;
}
.cart-detail-list {
  list-style: none;
  padding: 0;
  margin-bottom: 18px;
}
.cart-detail-list li {
  border-bottom: 1px solid #e3e3e3;
  padding: 10px 0 6px 0;
}
.cart-item-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.cart-item-info {
  font-size: 16px;
}
.cart-restaurant {
  color: #888;
  font-size: 13px;
  margin-left: 4px;
}
.cart-item-price {
  font-size: 16px;
  font-weight: 500;
  color: #1976d2;
}
.cart-summary {
  margin-top: 18px;
  border-top: 1px solid #e3e3e3;
  padding-top: 14px;
}
.summary-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 15px;
}
.total-row {
  font-size: 18px;
  font-weight: bold;
  color: #1976d2;
  margin-top: 10px;
}
.total-amount {
  color: #e53935;
  font-size: 20px;
  font-weight: bold;
}
.pay-section {
  width: 100%;
  max-width: 480px;
  background: #f8fafc;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(25, 118, 210, 0.06);
  padding: 28px 32px 18px 32px;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.qr {
  margin-bottom: 16px;
}
.qr img {
  width: 220px;
  height: 220px;
  border: 1px solid #eee;
  border-radius: 8px;
}
.note {
  font-size: 14px;
  color: #888;
  margin-bottom: 18px;
  text-align: center;
}
.print-btn {
  background: #e53935;
  color: #fff;
  border: none;
  padding: 12px 36px;
  font-size: 17px;
  border-radius: 5px;
  cursor: pointer;
  font-weight: bold;
  margin-top: 10px;
  box-shadow: 0 2px 8px rgba(229, 57, 53, 0.08);
  transition: background 0.2s;
}
.print-btn:hover {
  background: #c62828;
}
@media (max-width: 900px) {
  .checkout-content {
    flex-direction: column;
    max-width: 98vw;
  }
  .checkout-methods {
    width: 100%;
    border-right: none;
    border-bottom: 1px solid #eee;
    padding: 18px 0;
    text-align: center;
  }
  .checkout-main {
    padding: 24px 8vw;
  }
}
</style>
