<template>
  <div class="cart-page">
    <HomeHeader />

    <!-- Nếu chưa đăng nhập -->
    <div v-if="!user" class="alert-not-login text-center p-4">
      <p>Bạn cần đăng nhập để xem giỏ hàng.</p>
      <div class="d-flex justify-content-center gap-3 mt-2">
        <button class="btn btn-primary" @click="$router.push('/login')">Đăng nhập</button>
        <button class="btn btn-outline-primary" @click="$router.push('/register')">Đăng ký</button>
      </div>
    </div>

    <div class="container-fluid py-4">
      <!-- Nút quay lại Home -->
      <button class="btn btn-secondary mb-3 back-btn" @click="$router.push('/home')">
        ← Quay về Home
      </button>

      <h2 class="text-center mb-5">🍽️ Quản lý Đặt Tiệc - Giỏ hàng</h2>

      <div v-if="user" class="row gx-4">
        <!-- LIST BOOKING / SẢNH -->
        <div class="col-lg-8 col-md-7 mb-4">
          <h4 class="section-title mb-3">Danh sách Sảnh & Booking</h4>
          <div class="row gx-3 gy-3">
            <div class="col-md-6" v-for="b in bookings" :key="b.booking_id">
              <div class="card booking-card h-100 p-3 shadow-sm">
                <h5>{{ b.hall_name || 'Sảnh #' + b.hall_id }}</h5>
                <p><strong>Loại sự kiện:</strong> {{ b.event_type }}</p>
                <p><strong>Ngày:</strong> {{ formatDate(b.event_date) }} | <strong>Giờ:</strong> {{ b.event_time }}</p>
                <p><strong>Số bàn:</strong> {{ b.number_of_tables }}</p>
                <p><strong>Trạng thái:</strong> <span :class="statusClass(b.status)">{{ b.status }}</span></p>
                <p><strong>Ghi chú:</strong> {{ b.notes || 'Không có' }}</p>
                <button class="btn btn-outline-primary w-100 mt-2" @click="addToCart(b)">
                  <i class="fas fa-cart-plus"></i> Thêm vào giỏ
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- GIỎ HÀNG -->
        <div class="col-lg-4 col-md-5 mb-4">
          <div class="card cart-card p-3 shadow-sm">
            <h4 class="section-title mb-3">Giỏ hàng</h4>

            <div v-if="cart.length === 0" class="text-center text-muted py-3">
              Chưa có mục nào trong giỏ.
            </div>

            <ul class="list-group mb-3" v-else>
              <li class="list-group-item d-flex justify-content-between align-items-center" v-for="(item,index) in cart" :key="index">
                <div>
                  <strong>{{ item.name }}</strong><br/>
                  <small>{{ formatMoney(item.price) }} đ</small>
                </div>
                <button class="btn btn-sm btn-danger" @click="removeItem(index)">X</button>
              </li>
            </ul>

            <div class="border-top pt-3 mt-3">
              <p>Tạm tính: <strong>{{ formatMoney(total) }} đ</strong></p>
              <p>Phụ thu dịch vụ (10%): <strong>{{ formatMoney(serviceFee) }} đ</strong></p>
              <h4 class="text-success">Tổng: {{ formatMoney(total + serviceFee) }} đ</h4>

              <button class="btn btn-success w-100 my-2">Thanh toán</button>
              <button class="btn btn-outline-danger w-100" @click="clearCart">Xóa giỏ</button>
            </div>

            <p class="mt-2 text-muted small text-center">
              Ghi chú: Giỏ hàng lưu trong trình duyệt, bạn có thể tải lại trang mà không mất dữ liệu.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import api from "@/api";
import HomeHeader from "@/components/Home/HomeHeader.vue";

export default {
  components: { HomeHeader },
  data() {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    return {
      cart: JSON.parse(localStorage.getItem("cart")) || [],
      user: (storedUser && storedUser.user_id && storedUser.username) ? storedUser : null,
      bookings: [],
    };
  },
  computed: {
    total() { return this.cart.reduce((sum, i) => sum + i.price, 0); },
    serviceFee() { return Math.round(this.total * 0.1); },
  },
  methods: {
    formatMoney(value) { return value.toLocaleString("vi-VN"); },
    formatDate(date) { return new Date(date).toLocaleDateString("vi-VN"); },
    statusClass(status) {
      if(status==='pending') return 'text-warning';
      if(status==='confirmed') return 'text-success';
      if(status==='cancelled') return 'text-danger';
      return '';
    },
    removeItem(index) { this.cart.splice(index,1); this.saveCart(); },
    clearCart() { this.cart = []; this.saveCart(); },
    saveCart() { localStorage.setItem("cart", JSON.stringify(this.cart)); },
    addToCart(item) {
      if (!this.user) {
        alert("Bạn cần đăng nhập trước khi thêm vào giỏ hàng!");
        return;
      }
      this.cart.push({ name: item.hall_name || 'Sảnh #' + item.hall_id, price: item.price || 0 });
      this.saveCart();
    },
    async fetchBookings() {
      if (!this.user || !this.user.user_id) return;
      try {
        const res = await api.get(`/bookings/user?user_id=${this.user.user_id}`);
        this.bookings = Array.isArray(res.data)
          ? res.data.map(b => ({ ...b, hall_name: b.hall_name || 'Sảnh #' + b.hall_id, notes: b.notes || '' }))
          : [];
      } catch (err) { console.error(err); }
    }
  },
  mounted() {
    if (!this.user) {
      setTimeout(() => this.$router.push("/login"), 1000); // tự chuyển sau 1s
    } else {
      this.fetchBookings();
    }
  }
};
</script>

<style scoped>
.cart-page {
  min-height: 100vh;
  background-color: #f5f6fa;
}

/* Thông báo chưa đăng nhập */
.alert-not-login {
  background-color: #fff3cd;
  color: #856404;
  border-radius: 12px;
  margin: 20px auto;
  max-width: 500px;
  box-shadow: 0 4px 8px rgba(0,0,0,0.05);
}

/* Section title */
.section-title { font-weight: 600; font-size: 1.15rem; }

/* Booking card nhỏ lại, không hover */
.booking-card {
  border-radius: 12px;
  background-color: #fff;
  padding: 0.8rem;
  margin-bottom: 1rem; /* cách nhau card trên/dưới */
}

/* Cart card nhỏ */
.cart-card {
  border-radius: 12px;
  background-color: #fff;
  padding: 1rem;
  margin-top: 1rem; /* cách Booking card */
}

/* Buttons */
.btn { border-radius: 8px; }

/* Back button đẹp hơn */
.back-btn {
  margin-bottom: 1rem;
  background-color: #17a2b8;
  color: #fff;
  border: none;
  font-weight: 500;
  padding: 0.5rem 1rem;
}
.back-btn:hover { background-color: #138496; color: #fff; }

/* Status colors */
.text-warning { color: #ffc107; font-weight: 500; }
.text-success { color: #28a745; font-weight: 500; }
.text-danger { color: #dc3545; font-weight: 500; }
</style>
