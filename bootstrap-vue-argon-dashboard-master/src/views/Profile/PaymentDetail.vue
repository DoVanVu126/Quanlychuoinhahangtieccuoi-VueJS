<template>
  <div class="payment-detail-container">
    <div v-if="isBusy" class="text-center py-5">
      <b-spinner variant="primary"></b-spinner>
    </div>

    <div v-else-if="!payment" class="text-center py-5">
      <h4 class="text-danger">Không tìm thấy giao dịch</h4>
      <b-button @click="$router.go(-1)">Quay lại</b-button>
    </div>

    <div v-else>
      <div class="d-flex align-items-center justify-content-between mb-4">
        <b-button variant="link" class="text-decoration-none text-muted p-0" @click="$router.go(-1)">
           <i class="fas fa-arrow-left"></i> Quay lại
        </b-button>
        <h2 class="profile-title mb-0">Chi tiết hóa đơn</h2>
      </div>

      <b-card no-body class="shadow-sm border-0 overflow-hidden">
        <div class="bg-light p-4 border-bottom">
            <b-row align-v="center">
                <b-col md="6">
                    <h5 class="text-muted mb-1">Mã hóa đơn</h5>
                    <h3 class="fw-bold text-primary">#{{ payment.booking_id }}</h3>
                </b-col>
                <b-col md="6" class="text-md-end mt-3 mt-md-0">
                    <b-badge :variant="getStatusVariant(payment.status)" class="px-3 py-2 fs-6">
                        {{ mapStatusText(payment.status) }}
                    </b-badge>
                </b-col>
            </b-row>
        </div>

        <b-card-body class="p-4">
            <b-row class="mb-4">
                <b-col md="6">
                    <p class="text-muted small mb-1">KHÁCH HÀNG</p>
                    <div class="fw-bold">Mã KH: {{ payment.customer_id }}</div>
                    <div class="text-muted small">User ID: {{ payment.created_by_user_id }}</div>
                </b-col>
                <b-col md="6" class="text-md-end">
                    <p class="text-muted small mb-1">NGÀY TẠO</p>
                    <div class="fw-bold">{{ formatDate(payment.created_at) }}</div>
                    <div class="text-muted small">{{ formatTime(payment.created_at) }}</div>
                </b-col>
            </b-row>

            <hr class="my-4">

            <div class="mb-2">
                <p class="text-muted small mb-3">NỘI DUNG THANH TOÁN</p>
                <div class="d-flex justify-content-between align-items-center mb-2">
                    <div>
                        <span class="fw-bold d-block">Dịch vụ tiệc: {{ payment.event_type }}</span>
                        <span class="text-muted small">Tại: {{ payment.hall_name || 'Đang cập nhật' }} - Ngày: {{ formatDate(payment.event_date) }}</span>
                    </div>
                    <div class="fw-bold">{{ formatCurrency(payment.price) }}</div>
                </div>
            </div>

            <hr class="my-4">

            <b-row>
                <b-col md="6" offset-md="6">
                    <div class="d-flex justify-content-between mb-2">
                        <span class="text-muted">Tạm tính:</span>
                        <span>{{ formatCurrency(payment.price) }}</span>
                    </div>
                    <div class="d-flex justify-content-between mb-3">
                        <span class="text-muted">Thuế (VAT):</span>
                        <span>0 đ</span> </div>
                    <div class="d-flex justify-content-between align-items-center bg-primary text-white p-3 rounded">
                        <span class="fw-bold">TỔNG CỘNG</span>
                        <span class="fs-4 fw-bold">{{ formatCurrency(payment.price) }}</span>
                    </div>
                </b-col>
            </b-row>
        </b-card-body>
      </b-card>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'PaymentDetail',
  data() {
    return {
      payment: null,
      isBusy: false,
      backendUrl: 'http://localhost:8088'
    };
  },
  methods: {
    formatCurrency(value) {
        if (!value) return '0 đ';
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
    },
    formatDate(dateString) {
      if (!dateString) return '';
      return new Date(dateString).toLocaleDateString('vi-VN'); 
    },
    formatTime(dateString) {
      if (!dateString) return '';
      return new Date(dateString).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'}); 
    },
    mapStatusText(status) {
        const map = {
            'pending': 'Chờ thanh toán',
            'confirmed': 'Đã đặt cọc',
            'completed': 'Đã thanh toán',
            'cancelled': 'Đã hủy',
        };
        return map[status] || status;
    },
    getStatusVariant(status) {
        const s = status ? status.toLowerCase() : '';
        if (s === 'completed') return 'success';
        if (s === 'confirmed') return 'info';
        if (s === 'cancelled') return 'danger';
        return 'warning';
    },
    async fetchPaymentDetail() {
        this.isBusy = true;
        const id = this.$route.params.id;
        try {
            // Tái sử dụng API lấy chi tiết Booking
            const response = await axios.get(`${this.backendUrl}/api/bookings/${id}`);
            this.payment = response.data;
        } catch (error) {
            console.error(error);
        } finally {
            this.isBusy = false;
        }
    }
  },
  created() {
    this.fetchPaymentDetail();
  }
};
</script>

<style scoped>
.profile-title {
    font-family: 'Lora', serif;
    font-weight: 700;
}
</style>