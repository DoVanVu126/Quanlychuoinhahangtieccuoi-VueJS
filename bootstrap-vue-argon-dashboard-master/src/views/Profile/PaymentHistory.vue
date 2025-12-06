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
        id="payment-table"
        :items="payments"
        :fields="tableFields"
        :busy="isBusy"
        responsive="sm"
        hover
        show-empty
        empty-text="Bạn chưa có giao dịch nào."
        class="payment-table custom-table-layout"
      >
        <template #table-busy>
          <div class="text-center text-primary my-2">
            <b-spinner class="align-middle"></b-spinner>
            <strong class="ms-2">Đang tải dữ liệu...</strong>
          </div>
        </template>

        <template #cell(created_at)="data">
           <div class="text-nowrap">{{ formatDate(data.value) }}</div>
           <small class="text-muted">{{ formatTime(data.value) }}</small>
        </template>

        <template #cell(amount)="data">
          <span class="text-dark font-weight-bold text-success">
            {{ formatCurrency(data.value) }}
          </span>
        </template>

        <template #cell(status)="data">
          <span>{{ mapStatusText(data.value) }}</span>
        </template>
        
        <template #cell(actions)="data">
          <b-button
            variant="outline-primary"
            size="sm"
            class="action-button text-nowrap"
            :to="`/profileUser/payment-history/${data.item.id}`" 
            >
            <i class="fas fa-file-invoice me-1"></i> Hóa đơn
          </b-button>
        </template>

      </b-table>
      
      <div class="d-flex justify-content-center mt-4" v-if="totalRows > perPage">
        <b-pagination
            v-model="currentPage"
            :total-rows="totalRows"
            :per-page="perPage"
            aria-controls="payment-table"
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
  name: 'PaymentHistory',
  data() {
    return {
      isBusy: false,
      payments: [],
      
      // Mapping cột (Lấy dữ liệu từ Booking nhưng hiển thị tên cột kiểu Thanh toán)
      tableFields: [
        { key: 'id', label: 'Mã GD', sortable: true, class: 'text-center font-weight-bold align-middle', thStyle: { width: '80px' } },
        { key: 'created_at', label: 'Thời gian tạo', sortable: true, class: 'align-middle' },
        { key: 'service', label: 'Nội dung thanh toán', class: 'align-middle text-wrap-col' },
        { key: 'amount', label: 'Số tiền', sortable: true, class: 'text-end align-middle', thClass: 'text-end' },
        { key: 'status', label: 'Trạng thái', class: 'text-center align-middle' },
        { key: 'actions', label: 'Chi tiết', class: 'text-center align-middle', thStyle: { width: '100px' } }
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
        return new Date(dateString).toLocaleDateString('vi-VN');
    },
    formatTime(dateString) {
        if (!dateString) return '';
        return new Date(dateString).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'});
    },
    mapStatusText(status) {
        const map = {
            'pending': 'Chờ thanh toán', // Map lại text cho phù hợp ngữ cảnh thanh toán
            'confirmed': 'Đã cọc',
            'completed': 'Đã thanh toán',
            'cancelled': 'Đã hủy',
            'deposit_paid': 'Đã cọc'
        };
        return map[status] || status;
    },
    getStatusVariant(status) {
        const s = status ? status.toLowerCase() : '';
        if (s === 'completed') return 'success'; // Hoàn thành = Xanh (Đã trả tiền)
        if (s === 'confirmed' || s === 'deposit_paid') return 'info';
        if (s === 'cancelled') return 'danger';
        return 'warning'; // Pending = Vàng (Chưa trả)
    },

    async fetchPaymentHistory() {
      const userStr = localStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : null;

      if (!user || !user.user_id) {
         this.$bvToast.toast('Vui lòng đăng nhập lại.', { title: 'Lỗi', variant: 'danger' });
         return;
      }

      this.isBusy = true;
      try {
        // Gọi API Booking History (Tái sử dụng)
        const response = await axios.get(`${this.backendUrl}/api/booking-history`, {
             params: { user_id: user.user_id }
        });

        let rawData = [];
        if (Array.isArray(response.data)) {
            rawData = response.data;
        } else if (response.data.data) {
            rawData = response.data.data;
        }

        // MAP DỮ LIỆU BOOKING -> PAYMENT
        this.payments = rawData.map(item => ({
            id: item.booking_id,
            created_at: item.created_at || item.event_date, // Ưu tiên ngày tạo đơn
            service: `Thanh toán tiệc ${item.event_type} (${item.hall_name || 'Sảnh ?'})`,
            amount: item.price,
            status: item.status
        }));
        
        this.totalRows = this.payments.length;

      } catch (error) {
        console.error("Lỗi tải lịch sử thanh toán:", error);
      } finally {
        this.isBusy = false;
      }
    }
  },
  created() {
    this.fetchPaymentHistory();
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
.status-badge {
  font-size: 0.7rem;
  font-weight: 600;
  padding: 0.4em 0.8em;
  border-radius: 20px;
}
.action-button {
  font-size: 0.75rem;
  font-weight: 600;
}
</style>

<style>
/* Style chung cho bảng (giống BookingHistory để đồng bộ) */
.custom-table-layout thead th {
  background-color: #f3f4f6 !important;
  color: #374151 !important;
  text-transform: uppercase;
  font-size: 0.75rem !important;
  border-bottom: 2px solid #e5e7eb !important;
}
.text-wrap-col {
    white-space: normal !important;
    max-width: 250px;
}
</style>