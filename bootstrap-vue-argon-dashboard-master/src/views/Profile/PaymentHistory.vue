<template>
  <div class="payment-history-container">
    <b-card-header class="bg-white border-0">
      <b-row align-v="center">
        <b-col>
          <div class="d-flex align-items-center justify-content-between">
            <h2 class="profile-title mb-0">Lịch sử thanh toán</h2>
            <div class="title-decoration"></div>
          </div>
          <hr class="my-4" />
        </b-col>
      </b-row>
    </b-card-header>

    <b-card-body>
      <b-table
        :items="payments"
        :fields="tableFields"
        :current-page="currentPage"
        :per-page="perPage"
        responsive
        hover
        show-empty
        empty-text="Bạn chưa có lịch sử thanh toán nào."
        class="payment-table"
      >
        <template #cell(amount)="data">
          <span class="text-dark font-weight-bold">{{ data.value }}</span>
        </template>
        
        <template #cell(actions)="data">
          <b-button
            variant="primary"
            size="sm"
            class="action-button"
            :to="`/profileUser/payment-history/${data.item.id}`" 
            >
            Chi tiết
          </b-button>
        </template>

      </b-table>
      
      <b-pagination
        v-if="totalRows > perPage"
        v-model="currentPage"
        :total-rows="totalRows"
        :per-page="perPage"
        align="center"
        class="mt-4"
      ></b-pagination>

    </b-card-body>
  </div>
</template>

<script>
// Dịch từ <script setup> (Vue 3) sang Options API (Vue 2)
import axios from 'axios';

// Dữ liệu mẫu (từ code của bạn)
const samplePayments = [
  { id: 1, time: '10:07 4/10/2025', amount: '750,000 VND', service: 'Thực đơn cho trẻ em' },
  { id: 2, time: '09:15 3/10/2025', amount: '8,500,000 VND', service: 'Đặt tiệc cưới Sảnh A' },
  { id: 3, time: '14:30 1/10/2025', amount: '1,200,000 VND', service: 'Dịch vụ trang trí' },
  { id: 4, time: '18:00 28/09/2025', amount: '450,000 VND', service: 'Phụ thu âm thanh' },
  { id: 5, time: '11:20 25/09/2025', amount: '12,000,000 VND', service: 'Đặt tiệc hội nghị' },
  { id: 6, time: '11:20 24/09/2025', amount: '5,000,000 VND', service: 'Đặt cọc Sảnh B' },
];

export default {
  name: 'PaymentHistory',
  data() {
    return {
      // Dữ liệu cho <b-table>
      payments: [], // Sẽ được tải từ API
      
      // Cấu hình cột cho <b-table>
      tableFields: [
        { key: 'id', label: 'STT', sortable: true, class: 'text-dark font-weight-bold' },
        { key: 'time', label: 'Thời gian', sortable: true },
        { key: 'amount', label: 'Giá', sortable: true },
        { key: 'service', label: 'Dịch vụ', sortable: true },
        { key: 'actions', label: 'Thao tác', class: 'text-center' }
      ],

      // Dữ liệu cho <b-pagination>
      currentPage: 1,
      perPage: 5, // Hiển thị 5 mục mỗi trang
      totalRows: 0,
      
      backendUrl: process.env.VUE_APP_API_URL || 'http://localhost:8088'
    };
  },
  methods: {
    // Hàm để tải dữ liệu (thay vì dùng dữ liệu mẫu)
    async fetchPaymentHistory() {
      try {
        // TODO: Thay thế bằng API thật của bạn
        // const response = await axios.get(`${this.backendUrl}/api/payment-history?page=${this.currentPage}`);
        // this.payments = response.data.data;
        // this.totalRows = response.data.total;
        // this.perPage = response.data.per_page;
        
        // ---- DÙNG DỮ LIỆU MẪU ĐỂ TEST ----
        this.payments = samplePayments;
        this.totalRows = samplePayments.length;
        // --------------------------------
        
      } catch (error) {
        console.error("Lỗi khi tải lịch sử thanh toán:", error);
        this.$bvToast.toast('Không thể tải lịch sử thanh toán.', {
          title: 'Lỗi', variant: 'danger', solid: true
        });
      }
    }
  },
  created() {
    // Gọi hàm này khi component được tải
    this.fetchPaymentHistory();
  },
  watch: {
    // Tự động tải lại trang khi người dùng nhấn chuyển trang
    currentPage() {
      this.fetchPaymentHistory();
    }
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

/* Style cho nút "Chi tiết" */
.action-button {
  font-weight: 600;
  font-size: 0.75rem;
  padding: 0.4rem 0.8rem;
  border-radius: 0.5rem;
  background-color: #60a5fa; /* Bắt chước bg-blue-500 */
  border-color: #60a5fa;
}
.action-button:hover {
  background-color: #3b82f6; /* Bắt chước hover:bg-blue-600 */
  border-color: #3b82f6;
}
</style>

<style>
/* GHI ĐÈ STYLE CỦA B-TABLE ĐỂ HỢP VỚI GIAO DIỆN "MINIMALIST"
  (Đây là CSS toàn cục, không "scoped")
*/
.payment-table thead th {
  background-color: #f9fafb !important; /* bg-gray-50 */
  border-bottom: 2px solid #e5e7eb !important; /* border-b-2 */
  color: #4b5563 !important; /* text-gray-600 */
  font-size: 0.8rem !important;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.payment-table td {
  border-bottom: 1px solid #f3f4f6 !important; /* border-gray-100 */
  padding-top: 1rem !important;
  padding-bottom: 1rem !important;
  vertical-align: middle;
}
.payment-table tr:hover td {
  background-color: #f9fafb !important; /* hover:bg-gray-50 */
}

/* GHI ĐÈ STYLE CỦA B-PAGINATION ĐỂ HỢP VỚI GIAO DIỆN
*/
.pagination .page-item .page-link {
  border-radius: 0.375rem !important;
  margin: 0 0.2rem;
  border: none !important;
  color: #4b5563; /* text-gray-600 */
  font-weight: 600;
}
.pagination .page-item:hover .page-link {
  background-color: #f3f4f6; /* bg-gray-100 */
}
.pagination .page-item.active .page-link {
  background-color: #60a5fa !important; /* bg-blue-500 */
  color: white;
  box-shadow: 0 4px 12px rgba(96, 165, 250, 0.3);
}
</style>