<template>
  <div class="payment-detail-container p-4 p-md-5">
    
    <div class="mb-4">
      <router-link 
        to="/profileUser/payment-history"
        class="d-inline-flex align-items-center text-sm font-weight-bold text-muted"
      >
        <i class="fas fa-chevron-left mr-1" style="font-size: 0.75rem;"></i>
        Trở lại danh sách
      </router-link>
    </div>

    <div class="d-flex align-items-center justify-content-between mb-4">
      <h2 class="profile-title mb-0">Chi tiết thanh toán</h2>
      <div class="title-decoration"></div>
    </div>
    <hr class="my-4" />

    <div v-if="isLoading" class="text-center py-5">
      <b-spinner large variant="primary"></b-spinner>
      <p class="mt-2 text-muted">Đang tải chi tiết...</p>
    </div>

    <div v-else-if="payment">

      <b-row class="justify-content-between text-sm text-muted border-bottom pb-4 mb-4">
        <b-col cols="auto">
          <strong>Mã giao dịch:</strong> {{ payment.id }}
        </b-col>
        <b-col cols="auto">
          <strong>Trạng thái: </strong> 
          <span class="text-success font-weight-bold">{{ payment.status }}</span>
        </b-col>
        <b-col cols="auto">
          <strong>Ngày & Giờ:</strong> {{ payment.time }}
        </b-col>
      </b-row>

      <b-row>
        <b-col md="7">
          <h6 class="heading-small text-muted mb-3 text-uppercase">
            Chi tiết Dịch vụ
          </h6>
          <div class="pl-lg-4 mb-4 info-grid">
            <p><strong>Dịch vụ:</strong> {{ payment.service.name }}</p>
            <p><strong>Mô tả:</strong> {{ payment.service.description }}</p>
            <p><strong>Ngày tổ chức:</strong> {{ payment.service.date }}</p>
          </div>

          <hr class="my-4" />
          
          <h6 class="heading-small text-muted mb-3 text-uppercase">
            Phương thức Thanh toán
          </h6>
          <div class="pl-lg-4 mb-4 d-flex align-items-center">
            <i class="fab fa-cc-visa fa-2x text-primary mr-3"></i>
            <span class="font-weight-bold">{{ payment.method.name }}</span>
          </div>
        </b-col>

        <b-col md="5">
          <h6 class="heading-small text-muted mb-3 text-uppercase">
            Chi tiết Thanh toán
          </h6>
          <ul class="payment-summary-list">
            <li>
              <span>Tổng tiền dịch vụ:</span>
              <span class="font-weight-bold">{{ payment.summary.subtotal }}</span>
            </li>
            <li>
              <span>Voucher giảm giá:</span>
              <span class="font-weight-bold text-danger">{{ payment.summary.voucher }}</span>
            </li>
            <li>
              <span>Thuế VAT (10%):</span>
              <span class="font-weight-bold">{{ payment.summary.vat }}</span>
            </li>
            <li class="total-row">
              <span>Tổng cộng:</span>
              <span class="h4 mb-0">{{ payment.summary.total }}</span>
            </li>
          </ul>
          
          <hr class="my-4" />

          <h6 class="heading-small text-muted mb-3 text-uppercase">
            Ghi chú
          </h6>
          <p class="text-muted small font-italic">
            {{ payment.notes || 'Không có ghi chú nào.' }}
          </p>
        </b-col>
      </b-row>
    </div>

    <div v-else>
      <b-alert show variant="danger">
        Không tìm thấy thông tin thanh toán này.
      </b-alert>
    </div>

    <div class="text-right mt-5 text-sm">
      <b-link href="#" class="text-muted">
        <i class="ni ni-mobile-button mr-1"></i>
        Liên hệ hỗ trợ
      </b-link>
    </div>

  </div>
</template>

<script>
// Dịch từ <script setup> (Vue 3) sang Options API (Vue 2)
import axios from 'axios';

// Dữ liệu mẫu (chỉ để hiển thị trong khi bạn làm API)
const samplePaymentDetail = {
  id: '09298xx',
  status: 'Hoàn thành',
  time: '10:07 4/10/2025',
  service: {
    name: 'Đặt tiệc cưới Sảnh A',
    description: 'Cưới hỏi',
    date: '12/03/2025'
  },
  summary: {
    subtotal: '8,800,000 VND',
    voucher: '-800,000 VND',
    vat: '500,000 VND',
    total: '8,500,000 VND'
  },
  method: {
    name: 'Thanh toán qua ví MoMo'
  },
  notes: 'Không có ghi chú nào.'
};

export default {
  name: 'PaymentDetail',
  // Nhận 'id' từ URL (ví dụ: /payment-history/1)
  props: {
    id: {
      type: [String, Number],
      required: true
    }
  },
  data() {
    return {
      payment: null, // Ban đầu là null, sẽ được tải
      isLoading: true,
      backendUrl: process.env.VUE_APP_API_URL || 'http://localhost:8088'
    };
  },
  methods: {
    async fetchPaymentDetail() {
      this.isLoading = true;
      try {
        // TODO: Thay thế bằng API thật của bạn
        // const response = await axios.get(`${this.backendUrl}/api/payment-history/${this.id}`);
        // this.payment = response.data;
        
        // ---- DÙNG DỮ LIỆU MẪU ĐỂ TEST (Xóa sau) ----
        await new Promise(resolve => setTimeout(resolve, 500));
        this.payment = samplePaymentDetail;
        // --------------------------------
        
      } catch (error) {
        console.error("Lỗi khi tải chi tiết thanh toán:", error);
        this.$bvToast.toast('Không thể tải thông tin chi tiết.', {
          title: 'Lỗi', variant: 'danger', solid: true
        });
        this.payment = null; // Gán là null nếu lỗi
      } finally {
        this.isLoading = false;
      }
    }
  },
  created() {
    // Gọi hàm này khi component được tải
    this.fetchPaymentDetail();
  }
};
</script>

<style scoped>
/* * KHỐI CSS TÙY CHỈNH
 * (Dùng chung style với các trang profile khác)
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

/* Lưới thông tin sự kiện (copy từ BookingDetail) */
.info-grid {
  font-size: 0.95rem;
  color: #525f7f; /* text-gray */
}
.info-grid strong {
  color: #32325d; /* text-default */
}

/* Tóm tắt thanh toán (Dịch từ "flex justify-between")
*/
.payment-summary-list {
  list-style: none;
  padding-left: 0;
  max-width: 400px; /* Giống max-w-sm */
  font-size: 0.95rem;
  color: #525f7f; /* text-gray */
}
.payment-summary-list li {
  display: flex;
  justify-content: space-between;
  padding-top: 0.5rem; /* space-y-2 */
  padding-bottom: 0.5rem;
}

/* Dòng Tổng cộng */
.payment-summary-list li.total-row {
  font-size: 1.15rem;
  font-weight: 600;
  color: #1f2937; /* text-black */
  border-top: 1px solid #e5e7eb; /* border-t */
  margin-top: 0.5rem;
  padding-top: 0.75rem;
}
</style>