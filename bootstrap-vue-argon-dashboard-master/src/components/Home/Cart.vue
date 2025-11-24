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

    <div class="container-fluid py-4" v-if="user">
      <!-- Nút quay lại Home -->
      <button class="btn btn-secondary mb-3 back-btn" @click="$router.push('/home')">
        ← Quay về Home
      </button>

      <h2 class="text-center mb-5">🍽️ Quản lý Đặt Tiệc - Giỏ hàng</h2>

      <div class="row gx-4">
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
              <li class="list-group-item d-flex justify-content-between align-items-center"
                  v-for="(item,index) in cart" :key="index">
                <div>
                  <strong>{{ item.name }}</strong><br/>
                  <small>{{ formatMoney(item.price) }} đ</small>
                </div>
                <button class="btn btn-sm btn-danger" @click="removeItem(index)">X</button>
              </li>
            </ul>

            <!-- CHỌN KHUYẾN MÃI -->
            <div class="mb-3">
              <label class="form-label">Mã khuyến mãi</label>
              <select class="form-select" v-model="selectedPromo" @change="applyPromotion">
                <option value="">-- Không dùng mã --</option>
                <option
                  v-for="p in promotions"
                  :key="p.promotion_id"
                  :value="JSON.stringify(p)"
                >
                  {{ p.promotion_code }} - {{ p.title }}
                </option>
              </select>

              <!-- HIỂN THỊ PHẦN TRĂM GIẢM -->
              <div v-if="promoPercent > 0" class="text-info mt-1">
                ⭐ Giảm: <strong>{{ promoPercent }}%</strong>
              </div>
            </div>

            <!-- HIỂN THỊ SỐ TIỀN GIẢM -->
            <div v-if="discountAmount > 0" class="alert alert-success py-2">
              Bạn được giảm: <strong>{{ formatMoney(discountAmount) }} đ</strong>
            </div>

            <div class="border-top pt-3 mt-3">
              <p>Tạm tính: <strong>{{ formatMoney(total) }} đ</strong></p>
              <p>Phụ thu dịch vụ (10%): <strong>{{ formatMoney(serviceFee) }} đ</strong></p>
              <p v-if="discountAmount > 0">Giảm giá:
                <strong class="text-success">-{{ formatMoney(discountAmount) }} đ</strong>
              </p>

              <h4 class="text-success">
                Tổng: {{ formatMoney(finalTotal) }} đ
              </h4>

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

      /* 🎁 KHUYẾN MÃI */
      promotions: [],
      selectedPromo: "",
      discountAmount: 0,
      promoPercent: 0, // ⭐ lưu phần trăm giảm
    };
  },
  computed: {
    total() { return this.cart.reduce((sum, i) => sum + i.price, 0); },
    serviceFee() { return Math.round(this.total * 0.1); },
    finalTotal() {
      return Math.max(0, this.total + this.serviceFee - this.discountAmount);
    }
  },
  methods: {
    formatMoney(v) { return v.toLocaleString("vi-VN"); },
    formatDate(d) { return new Date(d).toLocaleDateString("vi-VN"); },

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
      if (!this.user) return alert("Bạn cần đăng nhập!");
      this.cart.push({
        name: item.hall_name || 'Sảnh #' + item.hall_id,
        price: item.price || 0
      });
      this.saveCart();
    },

    /* 📌 LẤY KHUYẾN MÃI */
    async fetchPromotions() {
      try {
        const res = await api.get("/promotions/all");
        this.promotions = res.data.data || [];
      } catch (err) {
        console.error("Lỗi tải khuyến mãi:", err);
      }
    },

    /* 🎁 ÁP DỤNG MÃ KHUYẾN MÃI */
    applyPromotion() {
      if (!this.selectedPromo) {
        this.discountAmount = 0;
        this.promoPercent = 0;
        return;
      }

      const promo = JSON.parse(this.selectedPromo);

      this.discountAmount = 0;
      this.promoPercent = 0;

      const subtotal = this.total + this.serviceFee;

      if (promo.discount_type === "percent") {
        this.promoPercent = promo.discount_value; // ⭐ lưu % để hiển thị
        this.discountAmount = Math.round(subtotal * (promo.discount_value / 100));
      } else {
        this.discountAmount = promo.discount_value;
      }
    },

    async fetchBookings() {
      if (!this.user || !this.user.user_id) return;
      try {
        const res = await api.get(`/bookings/user?user_id=${this.user.user_id}`);
        this.bookings = Array.isArray(res.data)
          ? res.data.map(b => ({ ...b, hall_name: b.hall_name || 'Sảnh #' + b.hall_id }))
          : [];
      } catch (err) { console.error(err); }
    }
  },
  mounted() {
    if (!this.user) {
      setTimeout(() => this.$router.push("/login"), 800);
    } else {
      this.fetchBookings();
      this.fetchPromotions();
    }
  }
};
</script>

<style scoped>
.cart-page { background: #f5f6fa; min-height: 100vh; }

.booking-card, .cart-card {
  border-radius: 12px;
  background: #fff;
}

.back-btn {
  background: #17a2b8;
  color: #fff;
  font-weight: 500;
}
</style>
