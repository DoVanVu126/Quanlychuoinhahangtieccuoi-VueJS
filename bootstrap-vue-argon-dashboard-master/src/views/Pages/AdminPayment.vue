<template>
  <div class="admin-payment-status">
    <div :class="['status-box', status]">
      <h1 v-if="status === 'success'">✅ {{ $t('payment_success_title') }}</h1>
      <h1 v-else>⚠️ {{ $t('payment_failed_msg') }}</h1>

      <p class="summary-text">
        {{ $t('order_label') }} <strong>{{ orderId }}</strong>
      </p>

      <div class="details">
        <div class="detail-row">
          <span>{{ $t('payment_methods') }}:</span>
          <span>{{ paymentMethod }}</span>
        </div>
        <div class="detail-row">
          <span>{{ $t('total_label') }}</span>
          <span>{{ formatMoney(finalTotal) }}</span>
        </div>

        <div v-if="status === 'failed' || status === 'error'" class="error-message">
          <h3>{{ $t('payment_failed_msg') }}</h3>
          <p>{{ errorMessage || $t('payment_failed_msg') }}</p>
        </div>
      </div>
    </div>

    <div class="actions">
      <button @click="goToOrderList" class="btn-primary">
        {{ $t('admin_payment_back') }}
      </button>

      <button v-if="status !== 'success'" @click="reviewOrder" class="btn-secondary">
        {{ $t('admin_payment_review') }}
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AdminPayment',
  data() {
    return {
      // Đọc dữ liệu từ route params
      orderId: this.$route.params.orderId || 'N/A',
      status: this.$route.params.status || 'error',
      paymentMethod: this.$route.params.paymentMethod || 'Chưa xác định',
      errorMessage: this.$route.params.errorMessage || null,
      finalTotal: Number(localStorage.getItem('payment_total')) || 0,
    };
  },
  methods: {
    formatMoney(v) {
      return Number(v).toLocaleString('vi-VN') + ' VNĐ';
    },
    goToOrderList() {
      // Thay thế 'AdminOrders' bằng tên route thực tế của trang quản lý đơn hàng
      this.$router.push({ name: 'AdminOrders' });
    },
    reviewOrder() {
      // Chuyển đến trang chi tiết đơn hàng (giả định)
      this.$router.push({ name: 'AdminOrderDetail', params: { id: this.orderId } });
    }
  }
};
</script>

<style scoped>
/* Định nghĩa màu sắc cơ bản cho component này */
.admin-payment-status {
    max-width: 600px;
    margin: 50px auto;
    padding: 30px;
    background: #fff;
    border-radius: 10px;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
    text-align: center;
    font-family: 'Poppins', sans-serif;
}
.status-box {
    padding: 25px;
    border-radius: 8px;
    margin-bottom: 30px;
}
/* Style cho trạng thái thành công */
.status-box.success {
    background-color: #e6ffe6;
    border: 1px solid #4CAF50;
    color: #38763a;
}
/* Style cho trạng thái thất bại/lỗi */
.status-box.failed, .status-box.error {
    background-color: #ffe6e6;
    border: 1px solid #dc3545;
    color: #c0392b;
}
.status-box h1 {
    font-size: 2em;
    margin-top: 0;
    margin-bottom: 10px;
}
.summary-text {
    font-size: 1.1em;
    margin-bottom: 20px;
}
.details {
    text-align: left;
    max-width: 300px;
    margin: 0 auto 20px auto;
}
.detail-row {
    display: flex;
    justify-content: space-between;
    padding: 5px 0;
    border-bottom: 1px dashed #eee;
}
.detail-row span:last-child {
    font-weight: 600;
}
.error-message {
    margin-top: 15px;
    padding: 10px;
    background: #f7f7f7;
    border-radius: 5px;
    border-left: 5px solid #ff7043;
}
.error-message h3 {
    margin-top: 0;
    font-size: 1em;
}

.actions button {
    padding: 10px 20px;
    margin: 5px;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    font-weight: 600;
    transition: background-color 0.2s;
}
.btn-primary {
    background-color: #A0522D; /* Primary color */
    color: white;
}
.btn-primary:hover {
    background-color: #C07C4A;
}
.btn-secondary {
    background-color: #f0f0f0;
    color: #333;
    border: 1px solid #ccc;
}
.btn-secondary:hover {
    background-color: #e0e0e0;
}
</style>
