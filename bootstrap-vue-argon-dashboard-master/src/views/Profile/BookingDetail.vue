<template>
  <div class="booking-detail-container">
    <b-card-header class="bg-white border-0">
      <b-row align-v="center">
        <b-col>
          <router-link 
            to="/profile/booking-history"
            class="d-inline-flex align-items-center text-sm font-weight-bold text-muted mb-3"
          >
            <i class="fas fa-chevron-left mr-1" style="font-size: 0.75rem;"></i>
            Trở lại danh sách
          </router-link>
          
          <div class="d-flex align-items-center justify-content-between">
            <h2 class="profile-title mb-0">Chi tiết đặt tiệc</h2>
            <div class="title-decoration"></div>
          </div>
          <hr class="my-4" />
        </b-col>
      </b-row>
    </b-card-header>

    <b-card-body>
      <div v-if="isLoading" class="text-center py-5">
        <b-spinner large variant="primary"></b-spinner>
        <p class="mt-2 text-muted">Đang tải dữ liệu...</p>
      </div>

      <div v-else-if="booking">
        
        <h6 class="heading-small text-muted mb-4 text-uppercase">
          Thông tin Khách hàng
        </h6>
        <div class="pl-lg-4 mb-4">
          <b-row>
            <b-col md="6" class="info-item">
              <i class="ni ni-single-02 text-muted"></i>
              <span>{{ booking.customer.name }}</span>
            </b-col>
            <b-col md="6" class="info-item">
              <i class="ni ni-email-83 text-muted"></i>
              <span>{{ booking.customer.email }}</span>
            </b-col>
            <b-col md="6" class="info-item mt-2">
              <i class="ni ni-mobile-button text-muted"></i>
              <span>{{ booking.customer.phone }}</span>
            </b-col>
          </b-row>
        </div>
        <hr class="my-4" />

        <h6 class="heading-small text-muted mb-4 text-uppercase">
          Thông tin Sự kiện
        </h6>
        <div class="pl-lg-4 mb-4">
          <b-row class="info-grid">
            <b-col md="6"><strong>Loại sự kiện:</strong> {{ booking.event.type }}</b-col>
            <b-col md="6"><strong>Địa điểm:</strong> {{ booking.event.location }}</b-col>
            <b-col md="6"><strong>Ngày tổ chức:</strong> {{ booking.event.date }}</b-col>
            <b-col md="6"><strong>Số lượng bàn:</strong> {{ booking.event.tables }}</b-col>
            <b-col md="6"><strong>Ngày đặt:</strong> {{ booking.event.booked_on }}</b-col>
            <b-col md="6"><strong>Trạng thái:</strong>
              <b-badge :variant="getStatusVariant(booking.status)" class="status-badge">
                {{ booking.status }}
              </b-badge>
            </b-col>
            <b-col cols="12"><strong>Ghi chú:</strong> {{ booking.event.notes || 'Không có' }}</b-col>
          </b-row>
        </div>
        <hr class="my-4" />

        <h6 class="heading-small text-muted mb-4 text-uppercase">
          Menu & Dịch vụ
        </h6>
        <div class="pl-lg-4 mb-4 info-grid">
          <p><strong>Dịch vụ:</strong> {{ booking.menu.services }}</p>
          <p><strong>Món ăn:</strong> {{ booking.menu.food }}</p>
        </div>
        
        <div class="text-center mt-4">
          <router-link 
            :to="`/profile/payment-history/${booking.id}`"
            class="text-primary font-weight-bold"
          >
            &lt;&lt; Xem chi tiết thanh toán &gt;&gt;
          </router-link>
        </div>

      </div>
      
      <div v-else>
        <b-alert show variant="danger">
          Không tìm thấy thông tin đặt tiệc này.
        </b-alert>
      </div>

    </b-card-body>

    <b-card-footer class="text-right bg-white border-top-0 pt-0">
      <b-link href="#" class="text-muted small">
        <i class="ni ni-mobile-button mr-1"></i>
        Liên hệ hỗ trợ
      </b-link>
    </b-card-footer>

  </div>
</template>

<script>
// Dịch từ <script setup> (Vue 3) sang Options API (Vue 2)
import axios from 'axios';

// Dữ liệu mẫu (chỉ để hiển thị trong khi bạn làm API)
const sampleBookingDetail = {
  id: 1,
  customer: {
    name: 'Đỗ Văn Vũ',
    email: 'dovanvu@gmail.com',
    phone: '0917862876'
  },
  event: {
    type: 'Tiệc cưới',
    location: 'Sảnh A',
    date: '12/03/2025',
    tables: 20,
    booked_on: '04/10/2024',
    notes: 'Không có'
  },
  menu: {
    services: 'Đèn sân khấu, âm thanh, loa',
    food: 'Combo 2 (6 món)'
  },
  status: 'Đã xác nhận'
};

export default {
  name: 'BookingDetail',
  // Nhận 'id' từ URL (ví dụ: /booking-history/1)
  // (Hãy chắc chắn route của bạn đã bật 'props: true')
  props: {
    id: {
      type: [String, Number],
      required: true
    }
  },
  data() {
    return {
      booking: null, // Ban đầu là null, sẽ được tải
      isLoading: true,
      backendUrl: process.env.VUE_APP_API_URL || 'http://localhost:8088'
    };
  },
  methods: {
    // Dịch hàm `getStatusClass` sang `getStatusVariant` (dùng cho BootstrapVue)
    getStatusVariant(status) {
      switch (status) {
        case 'Đã hoàn thành':
          return 'primary';
        case 'Đã xác nhận':
          return 'success';
        case 'Đã hủy':
          return 'danger';
        default:
          return 'secondary';
      }
    },

    // Hàm để tải dữ liệu (thay vì dùng dữ liệu mẫu)
    async fetchBookingDetail() {
      this.isLoading = true;
      try {
        // TODO: Thay thế bằng API thật của bạn
        // const response = await axios.get(`${this.backendUrl}/api/booking-history/${this.id}`);
        // this.booking = response.data;
        
        // ---- DÙNG DỮ LIỆU MẪU ĐỂ TEST (Xóa sau) ----
        // Giả lập 0.5 giây tải
        await new Promise(resolve => setTimeout(resolve, 500));
        this.booking = sampleBookingDetail;
        // --------------------------------
        
      } catch (error) {
        console.error("Lỗi khi tải chi tiết đặt tiệc:", error);
        this.$bvToast.toast('Không thể tải thông tin chi tiết.', {
          title: 'Lỗi', variant: 'danger', solid: true
        });
        this.booking = null; // Gán là null nếu lỗi
      } finally {
        this.isLoading = false;
      }
    }
  },
  created() {
    // Gọi hàm này khi component được tải
    this.fetchBookingDetail();
  }
};
</script>

<style scoped>
/* * KHỐI CSS TÙY CHỈNH
 * (Copy-paste toàn bộ từ file ChangePassword.vue để đồng bộ)
 */

/* Header */
.profile-title {
  font-family: 'Lora', serif;
  font-size: 2rem;
  font-weight: 600;
  color: #1f2937;
}

.title-decoration {
  height: 4px;
  width: 64px;
  background: linear-gradient(to right, #86efac, #60a5fa);
  border-radius: 9999px;
}

/* Các mục thông tin */
.info-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.95rem;
  color: #32325d; /* text-default */
}
.info-item i {
  color: #8898aa; /* text-muted */
  font-size: 1.1rem;
}

/* Lưới thông tin sự kiện */
.info-grid {
  font-size: 0.95rem;
  color: #525f7f; /* text-gray */
}
.info-grid strong {
  color: #32325d; /* text-default */
}

/* Badge (Phù hiệu) trạng thái */
.status-badge {
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.35rem 0.75rem;
  border-radius: 9999px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
</style>