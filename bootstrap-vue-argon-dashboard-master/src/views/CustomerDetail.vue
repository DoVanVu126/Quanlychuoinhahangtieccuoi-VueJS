<template>
  <div>
    <base-header class="pb-6 pb-8 pt-5 pt-md-8 bg-gradient-primary">
      <div class="container-fluid">
        <div class="header-body text-white">
          <div class="d-flex align-items-center">
            <button class="btn btn-secondary btn-sm mr-3" @click="$router.go(-1)">
              <i class="fas fa-arrow-left"></i>
            </button>
            <div>
              <h2 class="text-white font-weight-bold mb-0">Chi tiết Khách hàng #{{ id }}</h2>
              <p class="text-light mb-0" v-if="customer">
                {{ customer.username }} - {{ customer.email }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </base-header>

    <div class="container-fluid mt--7">
      
      <div v-if="loading" class="text-center py-5">
        <b-spinner variant="light" label="Loading..."></b-spinner>
      </div>

      <div v-else>
        <div class="card shadow mb-4">
          <div class="card-header border-0">
            <h3 class="mb-0">Lịch sử Đặt tiệc (Bookings)</h3>
          </div>
          <div class="table-responsive">
            <table class="table align-items-center table-flush">
              <thead class="thead-light">
                <tr>
                  <th>Mã Booking</th>
                  <th>Loại tiệc</th>
                  <th>Ngày tổ chức</th>
                  <th>Sảnh</th>
                  <th>Trạng thái</th>
                  <th>Tổng tiền</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="b in bookings" :key="b.id">
                  <td>#{{ b.id }}</td>
                  <td>{{ b.event_type }}</td>
                  <td>{{ formatDate(b.event_date) }}</td>
                  <td>{{ b.hall_name || 'Chưa chọn' }}</td>
                  <td>
                    <span class="badge" :class="getStatusClass(b.status)">{{ b.status }}</span>
                  </td>
                  <td>{{ formatMoney(b.total_amount) }}</td>
                </tr>
                <tr v-if="bookings.length === 0">
                  <td colspan="6" class="text-center text-muted">Khách hàng này chưa đặt tiệc nào.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="card shadow">
          <div class="card-header border-0">
            <h3 class="mb-0">Lịch sử Thanh toán (Payments)</h3>
          </div>
          <div class="table-responsive">
            <table class="table align-items-center table-flush">
              <thead class="thead-light">
                <tr>
                  <th>Mã GD</th>
                  <th>Thuộc Booking</th>
                  <th>Số tiền</th>
                  <th>Phương thức</th>
                  <th>Ngày thanh toán</th>
                  <th>Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="p in payments" :key="p.id">
                  <td>{{ p.transaction_code || '#' + p.id }}</td>
                  <td><router-link :to="`/bookings/${p.booking_id}`">#{{ p.booking_id }}</router-link></td>
                  <td class="font-weight-bold">{{ formatMoney(p.amount) }}</td>
                  <td>{{ p.payment_method }}</td>
                  <td>{{ formatDate(p.payment_date) }}</td>
                  <td>
                    <span class="badge badge-success">Thành công</span>
                  </td>
                </tr>
                <tr v-if="payments.length === 0">
                  <td colspan="6" class="text-center text-muted">Chưa có giao dịch thanh toán nào.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script>
import api from "@/api";

export default {
  data() {
    return {
      id: this.$route.params.id, // Lấy ID từ URL
      customer: null,
      bookings: [],
      payments: [],
      loading: true
    };
  },
  async created() {
    try {
      // Gọi API lấy chi tiết (Backend phải làm API này)
      const res = await api.get(`/customers/${this.id}/details`);
      this.customer = res.data.customer;
      this.bookings = res.data.bookings;
      this.payments = res.data.payments;
    } catch (error) {
      console.error(error);
      this.$bvToast.toast('Không thể tải dữ liệu chi tiết.', {
        title: 'Lỗi', variant: 'danger', solid: true
      });
    } finally {
      this.loading = false;
    }
  },
  methods: {
    formatDate(d) {
      if(!d) return '';
      return new Date(d).toLocaleDateString('vi-VN');
    },
    formatMoney(v) {
      return Number(v).toLocaleString('vi-VN') + ' đ';
    },
    getStatusClass(status) {
      if(status === 'confirmed') return 'badge-success';
      if(status === 'pending') return 'badge-warning';
      if(status === 'cancelled') return 'badge-danger';
      return 'badge-secondary';
    }
  }
};
</script>