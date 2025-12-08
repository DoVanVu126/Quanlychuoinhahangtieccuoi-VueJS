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
        id="booking-table"
        :items="bookings"
        :fields="tableFields"
        :busy="isBusy"
        responsive="sm"
        hover
        show-empty
        empty-text="Bạn chưa có lịch sử đặt tiệc nào."
        class="booking-table custom-table-layout"
      >
        <template #table-busy>
          <div class="text-center text-primary my-2">
            <b-spinner class="align-middle"></b-spinner>
            <strong class="ms-2">Đang tải dữ liệu...</strong>
          </div>
        </template>

        <template #cell(event_date)="data">
          <div class="text-nowrap">
            {{ formatDate(data.value) }}
          </div>
        </template>

        <template #cell(event_time)="data">
            <span class="text-muted">{{ data.value }}</span>
        </template>

        <template #cell(status)="data">
  <span>{{ mapStatusText(data.value) }}</span>
</template>

        
        <template #cell(actions)="data">
          <b-button
            variant="outline-primary"
            size="sm"
            class="action-button text-nowrap"
            :to="`/profileUser/booking-history/${data.item.booking_id}`" 
          >
            <i class="fas fa-eye me-1"></i> Chi tiết
          </b-button>
        </template>

      </b-table>
      
      <div class="d-flex justify-content-center mt-4" v-if="totalRows > perPage">
        <b-pagination
          v-model="currentPage"
          :total-rows="totalRows"
          :per-page="perPage"
          aria-controls="booking-table"
          first-number
          last-number
          pills
        ></b-pagination>
      </div>

    </b-card-body>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'BookingHistory',
  data() {
    return {
      isBusy: false,
      bookings: [],
      
      // Cấu hình cột hiển thị
      tableFields: [
        { 
            key: 'booking_id', 
            label: 'Mã', 
            sortable: true, 
            class: 'text-center font-weight-bold align-middle',
            thStyle: { width: '80px' } 
        },
        { 
            key: 'hall_name', 
            label: 'Sảnh tiệc', 
            sortable: true, 
            class: 'align-middle text-wrap-col', // Cho phép xuống dòng
            thStyle: { minWidth: '150px' }
        }, 
        { 
            key: 'event_date', 
            label: 'Ngày tổ chức', 
            sortable: true,
            class: 'align-middle',
            thStyle: { minWidth: '110px' }
        },
        { 
            key: 'event_time', 
            label: 'Giờ', 
            sortable: false,
            class: 'align-middle text-center' 
        },
        { 
            key: 'number_of_tables', 
            label: 'Bàn', 
            sortable: true, 
            class: 'text-center align-middle',
            thStyle: { width: '70px' }
        },
        { 
            key: 'price', 
            label: 'Tổng tiền', 
            sortable: true, 
            formatter: this.formatCurrency,
            class: 'text-end align-middle font-weight-bold text-success',
            thClass: 'text-end', 
            thStyle: { minWidth: '120px' }
        },
        { 
            key: 'status', 
            label: 'Trạng thái', 
            sortable: true, 
            class: 'text-center align-middle',
            thStyle: { minWidth: '130px' }
        },
        { 
            key: 'actions', 
            label: 'Chi tiết', 
            class: 'text-center align-middle',
            thStyle: { width: '100px' }
        }
      ],

      currentPage: 1,
      perPage: 10, 
      totalRows: 0,
      
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

    // Hàm map text hiển thị (Fix lỗi chữ hoa/thường)
    mapStatusText(status) {
        if (!status) return 'Chưa cập nhật';
        const s = String(status).toLowerCase(); // Chuyển về chữ thường
        
        const map = {
            'pending': 'Chờ duyệt',
            'confirmed': 'Đã xác nhận',
            'completed': 'Hoàn thành',
            'cancelled': 'Đã hủy',
            'deposit_paid': 'Đã cọc'
        };
        return map[s] || status;
    },

    // Hàm chọn màu sắc (Fix lỗi chữ hoa/thường)
    getStatusVariant(status) {
      if (!status) return 'secondary';
      const s = String(status).toLowerCase();
      
      if (s === 'completed') return 'primary'; // Xanh dương đậm
      if (s === 'confirmed' || s === 'deposit_paid') return 'success'; // Xanh lá
      if (s === 'cancelled') return 'danger'; // Đỏ
      if (s === 'pending') return 'warning'; // Vàng
      return 'secondary';
    },

    async fetchBookingHistory() {
      // Lấy User ID từ localStorage
      const userStr = localStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : null;

      if (!user || !user.user_id) {
          this.$bvToast.toast('Vui lòng đăng nhập lại.', { title: 'Lỗi', variant: 'danger' });
          return;
      }

      this.isBusy = true;

      try {
        const response = await axios.get(`${this.backendUrl}/api/booking-history`, {
            params: {
                user_id: user.user_id, 
                page: this.currentPage 
            }
        });

        // Xử lý dữ liệu trả về (hỗ trợ cả Array và Pagination Object)
        if (Array.isArray(response.data)) {
            this.bookings = response.data;
            this.totalRows = response.data.length;
        } else if (response.data.data) {
            this.bookings = response.data.data;
            this.totalRows = response.data.total;
        }

      } catch (error) {
        console.error("Lỗi tải dữ liệu:", error);
        this.$bvToast.toast('Không thể tải lịch sử đặt tiệc.', { title: 'Lỗi mạng', variant: 'danger' });
      } finally {
        this.isBusy = false;
      }
    }
  },
  created() {
    this.fetchBookingHistory();
  },
  watch: {
    currentPage() {
      // Nếu backend hỗ trợ phân trang server-side thì gọi lại fetchBookingHistory() tại đây
    }
  }
};
</script>

<style scoped>
.profile-title {
  font-family: 'Lora', serif;
  font-size: 1.8rem;
  font-weight: 700;
  color: #111827;
}

.title-decoration {
  height: 4px;
  width: 60px;
  background: linear-gradient(90deg, #3b82f6, #06b6d4);
  border-radius: 4px;
}

/* Style Badge */
.status-badge {
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.5em 0.8em;
  border-radius: 20px;
  letter-spacing: 0.3px;
}

/* Nút Action */
.action-button {
  font-size: 0.75rem;
  font-weight: 600;
}
</style>

<style>
/* CSS TOÀN CỤC CHO BẢNG */

/* Header bảng */
.custom-table-layout thead th {
  background-color: #f3f4f6 !important;
  color: #374151 !important;
  text-transform: uppercase;
  font-size: 0.75rem !important;
  letter-spacing: 0.5px;
  border-top: none !important;
  border-bottom: 2px solid #e5e7eb !important;
}

/* Cell padding */
.custom-table-layout td, 
.custom-table-layout th {
    padding: 0.75rem 0.5rem !important;
    font-size: 0.9rem;
}

/* Xử lý xuống dòng cho tên Sảnh */
.text-wrap-col {
    white-space: normal !important;
    max-width: 200px; 
}

/* Giữ các cột khác trên 1 dòng */
.text-nowrap {
    white-space: nowrap !important;
}

/* Hover effect */
.custom-table-layout tbody tr:hover {
    background-color: #f9fafb;
}
</style>