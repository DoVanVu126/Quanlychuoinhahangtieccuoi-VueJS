<template>
  <div class="booking-history-container">
    <b-card-header class="bg-white border-0">
      <b-row align-v="center">
        <b-col>
          <div class="d-flex align-items-center justify-content-between">
            <h2 class="profile-title mb-0">Lịch sử đặt tiệc</h2>
            <div class="title-decoration"></div>
          </div>
          <hr class="my-4" />
        </b-col>
      </b-row>
    </b-card-header>

    <b-card-body>
      <b-table
        :items="bookings"
        :fields="tableFields"
        :current-page="currentPage"
        :per-page="perPage"
        responsive
        hover
        show-empty
        empty-text="Bạn chưa có lịch sử đặt tiệc nào."
        class="booking-table"
      >
        <template #cell(status)="data">
          <b-badge 
            :variant="getStatusVariant(data.value)" 
            class="status-badge"
          >
            {{ data.value }}
          </b-badge>
        </template>
        
        <template #cell(actions)="data">
          <b-button
            variant="primary"
            size="sm"
            class="action-button"
            :to="`/profileUser/booking-history/${data.item.id}`" >
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
const sampleBookings = [
  { id: 1, time: '10:07 4/10/2025', type: 'Tiệc cưới', status: 'Đã xác nhận' },
  { id: 2, time: '10:07 4/10/2025', type: 'Tiệc sinh nhật', status: 'Đã hoàn thành' },
  { id: 3, time: '10:07 4/10/2025', type: 'Hội nghị', status: 'Đã hủy' },
  { id: 4, time: '10:07 4/10/2025', type: 'Tiệc cưới', status: 'Đã xác nhận' },
  { id: 5, time: '10:07 4/10/2025', type: 'Tiệc sinh nhật', status: 'Đã hoàn thành' },
];

export default {
  name: 'BookingHistory',
  data() {
    return {
      // Dữ liệu cho <b-table>
      bookings: [], // Sẽ được tải từ API
      
      // Cấu hình cột cho <b-table>
      tableFields: [
        { key: 'id', label: 'STT', sortable: true, class: 'text-dark font-weight-bold' },
        { key: 'time', label: 'Thời gian', sortable: true },
        { key: 'type', label: 'Loại sự kiện', sortable: true, class: 'text-dark' },
        { key: 'status', label: 'Trạng thái', sortable: true },
        { key: 'actions', label: 'Thao tác', class: 'text-center' }
      ],

      // Dữ liệu cho <b-pagination>
      currentPage: 1,
      perPage: 5, // Hiển thị 5 mục mỗi trang
      totalRows: 0,
      
      backendUrl: process.env.VUE_APP_API_URL || 'http://localhost:8088'
    };
  },
  computed: {
    // (Không cần thiết nếu dùng <b-pagination>, nhưng hữu ích)
    // totalRows() {
    //   return this.bookings.length;
    // }
  },
  methods: {
    // Dịch hàm `getStatusClass` sang `getStatusVariant` (dùng cho BootstrapVue)
    getStatusVariant(status) {
      switch (status) {
        case 'Đã hoàn thành':
          return 'primary'; // Màu xanh dương
        case 'Đã xác nhận':
          return 'success'; // Màu xanh lá
        case 'Đã hủy':
          return 'danger';  // Màu đỏ
        default:
          return 'secondary'; // Màu xám
      }
    },

    // Hàm để tải dữ liệu (thay vì dùng dữ liệu mẫu)
    async fetchBookingHistory() {
      try {
        // TODO: Thay thế bằng API thật của bạn
        // const response = await axios.get(`${this.backendUrl}/api/booking-history?page=${this.currentPage}`);
        // this.bookings = response.data.data;
        // this.totalRows = response.data.total;
        // this.perPage = response.data.per_page;
        
        // ---- DÙNG DỮ LIỆU MẪU ĐỂ TEST ----
        this.bookings = sampleBookings;
        this.totalRows = sampleBookings.length;
        // --------------------------------
        
      } catch (error) {
        console.error("Lỗi khi tải lịch sử đặt tiệc:", error);
        this.$bvToast.toast('Không thể tải lịch sử đặt tiệc.', {
          title: 'Lỗi', variant: 'danger', solid: true
        });
      }
    }
  },
  created() {
    // Gọi hàm này khi component được tải
    this.fetchBookingHistory();
  },
  watch: {
    // Tự động tải lại trang khi người dùng nhấn chuyển trang
    currentPage() {
      this.fetchBookingHistory();
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

/* Style cho table */
.booking-table {
  border-radius: 0.5rem;
  overflow: hidden; /* Giúp bo góc */
}

/* Style cho status badge */
.status-badge {
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.35rem 0.75rem;
  border-radius: 9999px;
}

/* Style cho nút "Chi tiết" */
.action-button {
  font-weight: 600;
  font-size: 0.75rem;
  padding: 0.4rem 0.8rem;
  border-radius: 0.5rem;
}
</style>

<style>
/* GHI ĐÈ STYLE CỦA B-TABLE ĐỂ HỢP VỚI GIAO DIỆN "MINIMALIST"
  (Đây là CSS toàn cục, không "scoped")
*/
.booking-table thead th {
  background-color: #f9fafb !important; /* bg-gray-50 */
  border-bottom: 2px solid #e5e7eb !important; /* border-b-2 */
  color: #4b5563 !important; /* text-gray-600 */
  font-size: 0.8rem !important;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.booking-table td {
  border-bottom: 1px solid #f3f4f6 !important; /* border-gray-100 */
  padding-top: 1rem !important;
  padding-bottom: 1rem !important;
  vertical-align: middle;
}
.booking-table tr:hover td {
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
  background-color: #60a5fa !important; /* bg-blue-400 (giống nút submit) */
  color: white;
  box-shadow: 0 4px 12px rgba(96, 165, 250, 0.3);
}
</style>