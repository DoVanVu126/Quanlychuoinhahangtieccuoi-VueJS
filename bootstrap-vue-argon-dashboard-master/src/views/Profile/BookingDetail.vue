<template>
  <div class="booking-detail-container">
    <div v-if="isBusy" class="text-center py-5">
      <b-spinner variant="primary" label="Loading..."></b-spinner>
      <p class="mt-2 text-muted">Đang tải thông tin đơn hàng...</p>
    </div>

    <div v-else-if="!booking && !isBusy" class="text-center py-5">
      <h4 class="text-danger">Không tìm thấy đơn hàng</h4>
      <b-button variant="secondary" @click="$router.go(-1)">Quay lại</b-button>
    </div>

    <div v-else>
      <div class="d-flex align-items-center justify-content-between mb-4">
        <div>
          <b-button variant="link" class="p-0 text-decoration-none text-muted mb-2" @click="$router.go(-1)">
            <i class="fas fa-arrow-left"></i> Quay lại danh sách
          </b-button>
          <h2 class="detail-title">
            Chi tiết đơn #{{ booking.booking_id }}
          </h2>
        </div>
        <div>
          <b-badge :variant="getStatusVariant(booking.status)" class="status-badge-lg">
            {{ mapStatusText(booking.status) }}
          </b-badge>
        </div>
      </div>

      <b-row>
        <b-col md="8">
          <b-card class="shadow-sm border-0 mb-4">
            <h5 class="card-title text-primary mb-3">Thông tin sự kiện</h5>
            <b-row class="g-3">
              <b-col cols="6">
                <label class="text-muted small">Loại sự kiện</label>
                <div class="fw-bold">{{ booking.event_type }}</div>
              </b-col>
              <b-col cols="6">
                <label class="text-muted small">Số lượng bàn</label>
                <div class="fw-bold">{{ booking.number_of_tables }} bàn</div>
              </b-col>
              <b-col cols="6">
                <label class="text-muted small">Ngày tổ chức</label>
                <div class="fw-bold fs-5">{{ formatDate(booking.event_date) }}</div>
              </b-col>
              <b-col cols="6">
                <label class="text-muted small">Giờ bắt đầu</label>
                <div class="fw-bold fs-5">{{ booking.event_time }}</div>
              </b-col>
            </b-row>
          </b-card>

          <b-card class="shadow-sm border-0 mb-4">
            <h5 class="card-title text-primary mb-3">Địa điểm tổ chức</h5>
            <b-row>
              <b-col cols="12">
                <label class="text-muted small">Sảnh tiệc</label>
                <div class="fw-bold fs-4 text-dark">{{ booking.hall_name || 'Chưa cập nhật' }}</div>
              </b-col>
              </b-row>
          </b-card>
          
          <b-card class="shadow-sm border-0">
             <h5 class="card-title text-primary mb-3">Ghi chú</h5>
             <p class="mb-0 bg-light p-3 rounded" v-if="booking.notes">{{ booking.notes }}</p>
             <p class="text-muted fst-italic" v-else>Không có ghi chú nào cho đơn hàng này.</p>
          </b-card>
        </b-col>

        <b-col md="4">
          <b-card class="shadow-sm border-0 h-100 bg-primary text-white">
            <h5 class="mb-4">Tổng quan thanh toán</h5>
            
            <div class="d-flex justify-content-between mb-3">
              <span>Ngày tạo đơn:</span>
              <span class="fw-bold">{{ formatDate(booking.created_at) }}</span>
            </div>
            
            <hr class="bg-white opacity-50">

            <div class="mt-4">
              <label class="small text-white-50">TỔNG THÀNH TIỀN</label>
              <div class="display-6 fw-bold">
                {{ formatCurrency(booking.price) }}
              </div>
            </div>

            <div class="mt-4">
                <small class="fst-italic text-white-50">
                    * Đã bao gồm phí dịch vụ và món ăn (nếu có).
                </small>
            </div>
          </b-card>
        </b-col>
      </b-row>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'BookingDetail',
  data() {
    return {
      booking: null,
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
      const date = new Date(dateString);
      return date.toLocaleDateString('vi-VN'); 
    },
    mapStatusText(status) {
        const map = {
            'pending': 'Chờ duyệt',
            'confirmed': 'Đã xác nhận',
            'completed': 'Hoàn thành',
            'cancelled': 'Đã hủy',
            'deposit_paid': 'Đã cọc'
        };
        return map[status] || status;
    },
    getStatusVariant(status) {
      const s = status ? status.toLowerCase() : '';
      if (s === 'completed') return 'primary';
      if (s === 'confirmed' || s === 'deposit_paid') return 'success';
      if (s === 'cancelled') return 'danger';
      if (s === 'pending') return 'warning';
      return 'secondary';
    },
    async fetchBookingDetail() {
        this.isBusy = true;
        // Lấy ID từ URL (ví dụ: /booking-history/101)
        const bookingId = this.$route.params.id;
        
        try {
            const response = await axios.get(`${this.backendUrl}/api/bookings/${bookingId}`);
            this.booking = response.data;
        } catch (error) {
            console.error("Lỗi tải chi tiết:", error);
            this.$bvToast.toast('Không tìm thấy thông tin đơn hàng.', { title: 'Lỗi', variant: 'danger' });
        } finally {
            this.isBusy = false;
        }
    }
  },
  created() {
    this.fetchBookingDetail();
  }
};
</script>

<style scoped>
.detail-title {
    font-family: 'Lora', serif;
    font-weight: 700;
    color: #1f2937;
}
.status-badge-lg {
    font-size: 1rem;
    padding: 0.5em 1em;
    border-radius: 30px;
}
</style>