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

    <!-- Nếu đã đăng nhập -->
    <div class="container-fluid py-4" v-else>
      <button class="btn btn-secondary mb-3 back-btn" @click="$router.push('/home')">
        ← Quay về Home
      </button>

      <h2 class="text-center mb-5">🍽️ Giỏ hàng của bạn</h2>

      <div class="row gx-4">
        <!-- Danh sách booking -->
        <div class="col-lg-8 col-md-7 mb-4">
          <h4 class="section-title mb-3">Danh sách Sảnh & Booking</h4>
          <div class="row gx-3 gy-3">
            <div class="col-md-6" v-for="b in bookings" :key="b.booking_id">
              <div class="card booking-card h-100 p-3 shadow-sm">
                <p><strong>Nhà hàng:</strong> {{ b.restaurant_name || getRestaurantName(b.restaurant_id) }}</p>
                <h5>{{ b.hall_name || 'Sảnh #' + b.hall_id }}</h5>
                <p><strong>Loại sự kiện:</strong> {{ b.event_type }}</p>
                <p><strong>Ngày:</strong> {{ formatDate(b.event_date) }} | <strong>Giờ:</strong> {{ b.event_time }}</p>
                <p><strong>Số bàn:</strong> {{ b.number_of_tables }}</p>
                <p><strong>Trạng thái:</strong> <span :class="statusClass(b.status)">{{ b.status }}</span></p>
                <p><strong>Ghi chú:</strong> {{ b.notes || 'Không có' }}</p>
                <p><strong>Giá:</strong> {{ formatMoney(Number(b.price || 0)) }} đ</p>
                <div class="d-flex gap-2">
                  <button class="btn btn-outline-primary flex-grow-1" @click="addToCart(b)">
                    <i class="fas fa-cart-plus"></i> Thêm vào giỏ
                  </button>
                  <button class="btn btn-outline-danger flex-grow-1" @click="cancelBooking(b.booking_id)">
                    <i class="fas fa-ban"></i> Hủy
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Giỏ hàng -->
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
                  <small>{{ formatMoney(Number(item.price || 0)) }} đ</small>
                  <div v-if="item.restaurant_name" class="text-muted small">({{ item.restaurant_name }})</div>
                </div>
                <button class="btn btn-sm btn-danger" @click="removeItem(index)">X</button>
              </li>
            </ul>

            <div class="mb-3" v-if="cart.length > 0">
              <label class="form-label">Chọn hoặc nhập mã khuyến mãi</label>
              <select class="form-select mb-2" v-model="selectedPromo" @change="applyDiscountFromSelect">
                <option value="">-- Không dùng mã --</option>
                <option
                  v-for="p in userSavedPromotions"
                  :key="p.user_promotion_id"
                  :value="JSON.stringify(p)"
                  :disabled="usedPromoCodes.includes(p.promotion_code)"
                >
                  {{ p.promotion_code }} - {{ p.title }}
                  <span v-if="usedPromoCodes.includes(p.promotion_code)"> (Đã dùng)</span>
                </option>
              </select>

              <div class="input-group">
                <input type="text" class="form-control" placeholder="Nhập mã khuyến mãi" v-model="promoInput">
                <button class="btn btn-primary" @click="applyPromoInput">Áp dụng</button>
              </div>

              <div v-if="promoPercent > 0" class="text-info mt-1">
                ⭐ Giảm: <strong>{{ promoPercent }}%</strong>
              </div>
            </div>

            <div v-if="discountAmount > 0" class="alert alert-success py-2">
              Bạn được giảm: <strong>{{ formatMoney(discountAmount) }} đ</strong>
            </div>

            <!-- Giảm giá membership -->
            <div v-if="membershipDiscount > 0" class="alert alert-info py-2">
  Giảm giá hội viên ({{ membership.level }} - {{ membershipDiscountPercent }}%):
  <strong>-{{ formatMoney(membershipDiscount) }} đ</strong>
</div>

            <div class="border-top pt-3 mt-3">
              <p>Tạm tính: <strong>{{ formatMoney(total) }} đ</strong></p>
              <p>Phụ thu dịch vụ (10%): <strong>{{ formatMoney(serviceFee) }} đ</strong></p>
              <p v-if="discountAmount > 0">Giảm giá mã khuyến mãi: <strong class="text-success">-{{ formatMoney(discountAmount) }} đ</strong></p>
              <h4 class="text-success">Tổng: {{ formatMoney(finalTotal) }} đ</h4>

              <button class="btn btn-success w-100 my-2" @click="checkout">Thanh toán</button>
              <button class="btn btn-outline-danger w-100" @click="clearCart">Xóa giỏ</button>
            </div>

            <p class="mt-2 text-muted small text-center">
              Giỏ hàng lưu trong trình duyệt, mã khuyến mãi và ưu đãi hội viên được áp dụng tự động.
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
      user: storedUser && storedUser.user_id ? storedUser : null,
      bookings: [],
      restaurants: [],
      userSavedPromotions: [],
      selectedPromo: "",
      promoInput: "",
      discountAmount: 0,
      promoPercent: 0,
      usedPromoCodes: JSON.parse(localStorage.getItem("usedPromoCodes")) || [],
      membership: null,
      membershipDiscountPercent: 0
    };
  },
  computed: {
    total() { return this.cart.reduce((sum, i) => sum + Number(i.price || 0), 0); },
    serviceFee() { return Math.round(this.total * 0.1); },
    membershipDiscount() {
      if (!this.membership || !this.membershipDiscountPercent) return 0;
      const subtotal = this.total + this.serviceFee - this.discountAmount;
      return Math.round(subtotal * (this.membershipDiscountPercent / 100));
    },
    finalTotal() { return Math.max(0, this.total + this.serviceFee - this.discountAmount - this.membershipDiscount); }
  },
  methods: {
    formatMoney(v) { return Number(v).toLocaleString("vi-VN"); },
    formatDate(d) { return new Date(d).toLocaleDateString("vi-VN"); },
    statusClass(status) {
      if (status === "pending") return "text-warning";
      if (status === "confirmed") return "text-success";
      if (status === "cancelled") return "text-danger";
      return "";
    },
    addToCart(item) {
      if (!this.user) return alert("Bạn cần đăng nhập!");
      this.cart.push({
        name: item.hall_name || "Sảnh #" + item.hall_id,
        restaurant_name: item.restaurant_name || this.getRestaurantName(item.restaurant_id),
        restaurant_id: Number(item.restaurant_id),
        price: Number(item.price || 0)
      });
      this.saveCart();
      this.loadUserPromotions();
    },
    removeItem(index) { this.cart.splice(index, 1); this.saveCart(); this.loadUserPromotions(); },
    clearCart() {
      this.cart = [];
      this.saveCart();
      this.loadUserPromotions();
      this.selectedPromo = "";
      this.promoInput = "";
      this.discountAmount = 0;
      this.promoPercent = 0;
    },
    saveCart() { localStorage.setItem("cart", JSON.stringify(this.cart)); },
    getRestaurantName(id) {
      const r = this.restaurants.find(r => r.restaurant_id == id);
      return r ? r.name : "Không có";
    },
    async fetchBookings() {
      if (!this.user) return;
      try {
        const res = await api.get(`/bookings/user?user_id=${this.user.user_id}`);
        this.bookings = Array.isArray(res.data)
          ? res.data.map(b => ({ ...b, hall_name: b.hall_name || "Sảnh #" + b.hall_id, price: Number(b.price || 0) }))
          : [];
      } catch (err) { console.error(err); }
    },
    async fetchRestaurants() {
      try {
        const res = await api.get("/restaurants");
        this.restaurants = Array.isArray(res.data) ? res.data : [];
      } catch (err) { console.error(err); }
    },
    async loadUserPromotions() {
      if (!this.user || this.cart.length === 0) {
        this.userSavedPromotions = [];
        return;
      }
      try {
        const res = await api.get(`/user-promotions?user_id=${this.user.user_id}`);
        const restaurantIdsInCart = this.cart.map(i => Number(i.restaurant_id));
        this.userSavedPromotions = (res.data || []).filter(p =>
          restaurantIdsInCart.includes(Number(p.restaurant_id))
        );
      } catch (err) { console.error(err); }
    },
    async fetchMembership() {
      if (!this.user) return;
      try {
        const res = await api.get(`/membership/${this.user.user_id}`);
        this.membership = res.data.membership;
        this.membershipDiscountPercent = res.data.discount;
      } catch (err) { console.error(err); }
    },
    applyDiscount(promo) {
      const subtotal = this.total + this.serviceFee;
      const discountValue = parseFloat(promo.discount_value);
      if (promo.discount_type === "percent") {
        this.promoPercent = discountValue;
        this.discountAmount = Math.round(subtotal * (discountValue / 100));
      } else {
        this.promoPercent = 0;
        this.discountAmount = discountValue;
      }
      if (this.discountAmount > subtotal) this.discountAmount = subtotal;
    },
    applyDiscountFromSelect() {
      if (!this.selectedPromo) {
        this.discountAmount = 0;
        this.promoPercent = 0;
        return;
      }
      const promo = JSON.parse(this.selectedPromo);
      if (this.usedPromoCodes.includes(promo.promotion_code)) {
        alert("⚠ Mã này đã được sử dụng, không thể áp dụng lại.");
        this.selectedPromo = "";
        this.discountAmount = 0;
        this.promoPercent = 0;
        return;
      }
      this.applyDiscount(promo);
    },
    applyPromoInput() {
      if (!this.promoInput || this.cart.length === 0) {
        this.discountAmount = 0;
        this.promoPercent = 0;
        return;
      }
      const promoItem = this.userSavedPromotions.find(
        p => p.promotion_code.toLowerCase() === this.promoInput.trim().toLowerCase()
      );
      if (!promoItem) {
        alert("Mã khuyến mãi không hợp lệ hoặc không áp dụng cho giỏ hàng hiện tại.");
        this.discountAmount = 0;
        this.promoPercent = 0;
        return;
      }
      if (this.usedPromoCodes.includes(promoItem.promotion_code)) {
        alert("⚠ Mã này đã được sử dụng, không thể áp dụng lại.");
        this.promoInput = "";
        return;
      }
      this.selectedPromo = JSON.stringify(promoItem);
      this.applyDiscount(promoItem);
      alert(`Áp dụng mã ${promoItem.promotion_code} thành công!`);
    },
    checkout() {
      if (this.cart.length === 0) return alert("Giỏ hàng trống!");

      if (this.selectedPromo) {
        const appliedPromo = JSON.parse(this.selectedPromo);
        this.usedPromoCodes.push(appliedPromo.promotion_code);
        localStorage.setItem("usedPromoCodes", JSON.stringify(this.usedPromoCodes));
        alert(`Thanh toán thành công! Mã ${appliedPromo.promotion_code} đã được áp dụng và không thể dùng lại.`);
      } else {
        alert("Thanh toán thành công!");
      }

      this.cart = [];
      this.saveCart();
      this.selectedPromo = "";
      this.promoInput = "";
      this.discountAmount = 0;
      this.promoPercent = 0;
      this.loadUserPromotions();
    },
    async cancelBooking(bookingId) {
      if (!confirm("Bạn có chắc chắn muốn hủy đặt tiệc này?")) return;

      try {
        await api.delete(`/bookings/${bookingId}`);
        alert("Hủy đặt tiệc thành công!");
        this.fetchBookings(); // reload danh sách booking
      } catch (err) {
        console.error(err);
        alert("Hủy đặt tiệc thất bại!");
      }
    }
  },
  mounted() {
    if (!this.user) {
      setTimeout(() => this.$router.push("/login"), 800);
    } else {
      this.fetchRestaurants();
      this.fetchBookings();
      this.loadUserPromotions();
      this.fetchMembership(); // fetch membership khi mounted
    }
  }
};
</script>

<style scoped>
.cart-page { min-height: 100vh; }
.booking-card, .cart-card { border-radius: 10px; }
.back-btn { margin-bottom: 1rem; }
</style>
