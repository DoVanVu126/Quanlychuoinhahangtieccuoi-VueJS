<template>
  <div class="cart-page">
    <HomeHeader />

		<div v-if="!user" class="alert-not-login text-center p-4">
			<p>{{ $t('cart_empty_login_required') }}</p>
			<div class="d-flex justify-content-center gap-3 mt-2">
				<button class="btn btn-primary" @click="$router.push('/login')">{{ $t('login_btn') }}</button>
				<button class="btn btn-outline-primary" @click="$router.push('/register')">{{ $t('register_btn') }}</button>
			</div>
		</div>

        <div class="container-fluid py-4" v-else>
			<button class="btn btn-secondary mb-3 back-btn" @click="$router.push('/home')">
				← {{ $t('intro') }}
			</button>

			<h2 class="text-center mb-5">🍽️ {{ $t('cart_title') }}</h2>

      <div class="row gx-4">
                <div class="col-lg-8 col-md-7 mb-4">
		  <h4 class="section-title mb-3">{{ $t('cart_title') }}</h4>
          <div class="row gx-3 gy-3">
            <div class="col-md-6" v-for="b in bookings" :key="b.booking_id">
              <div class="card booking-card h-100 p-3 shadow-sm">
				<p><strong>{{ $t('profile') }}:</strong> {{ b.restaurant_name || getRestaurantName(b.restaurant_id) }}</p>
                <h5>{{ b.hall_name || 'Sảnh #' + b.hall_id }}</h5>
                <p><strong>Loại sự kiện:</strong> {{ b.event_type }}</p>
                <p><strong>Ngày:</strong> {{ formatDate(b.event_date) }} | <strong>Giờ:</strong> {{ b.event_time }}</p>
                <p><strong>Số bàn:</strong> {{ b.number_of_tables }}</p>
                <p><strong>Trạng thái:</strong> <span :class="statusClass(b.status)">{{ b.status }}</span></p>
				<p><strong>{{ $t('no_data') }}:</strong> {{ b.notes || $t('no_data') }}</p>
                <p><strong>Giá:</strong> {{ formatMoney(Number(b.price || 0)) }} đ</p>
                <button class="btn btn-outline-primary w-100 mt-2" @click="addToCart(b)">
                  <i class="fas fa-cart-plus"></i> Thêm vào giỏ
                </button>
              </div>
            </div>
            </div>
        </div>

                <div class="col-lg-4 col-md-5 mb-4">
          <div class="card cart-card p-3 shadow-sm">
			<h4 class="section-title mb-3">{{ $t('cart') }}</h4>

						<div v-if="cart.length === 0" class="text-center text-muted py-3">
							{{ $t('no_data') }}
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
			  <label class="form-label">{{ $t('see_more') }}</label>

                            <select class="form-select mb-2" v-model="selectedPromo" @change="applyDiscountFromSelect">
				<option value="">-- {{ $t('no_data') }} --</option>
                <option
  v-for="p in userSavedPromotions"
 :key="p.user_promotion_id"
 :value="JSON.stringify(p)"
>
                  {{ p.promotion_code }} - {{ p.title }}
                </option>
              </select>

                            <div class="input-group">
								<input type="text" class="form-control" :placeholder="$t('see_more')" v-model="promoInput">
								<button class="btn btn-primary" @click="applyPromoInput">{{ $t('checkout') }}</button>
              </div>

              <div v-if="promoPercent > 0" class="text-info mt-1">
                ⭐ Giảm: <strong>{{ promoPercent }}%</strong>
              </div>
            </div>

						<div v-if="discountAmount > 0" class="alert alert-success py-2">
							{{ $t('success_alert') }}: <strong>{{ formatMoney(discountAmount) }} đ</strong>
						</div>

            <div class="border-top pt-3 mt-3">
							<p>{{ $t('payment_note_prefix') }}: <strong>{{ formatMoney(total) }} đ</strong></p>
							<p>{{ $t('payment_methods') }} (10%): <strong>{{ formatMoney(serviceFee) }} đ</strong></p>
							<p v-if="discountAmount > 0">{{ $t('payment_note_prefix') }}: <strong class="text-success">-{{ formatMoney(discountAmount) }} đ</strong></p>

							<h4 class="text-success">{{ $t('total_label') }} {{ formatMoney(finalTotal) }} đ</h4>

							<button class="btn btn-success w-100 my-2" @click="goToCheckout">{{ $t('checkout') }}</button>
							<button class="btn btn-outline-danger w-100" @click="clearCart">{{ $t('delete_all') }}</button>
            </div>

            <p class="mt-2 text-muted small text-center">
			{{ $t('cart_note_saved') }}
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
      promoPercent: 0
    };
  },
  computed: {
    total() { return this.cart.reduce((sum, i) => sum + Number(i.price || 0), 0); },
    serviceFee() { return Math.round(this.total * 0.1); },
    finalTotal() { return Math.max(0, this.total + this.serviceFee - this.discountAmount); }
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
			if (!this.user) {
				// Thông báo khi chưa đăng nhập
				alert("Bạn cần đăng nhập!");
				return;
			}
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
        console.log("Filtered promotions:", this.userSavedPromotions);
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
				// Thông báo khi mã khuyến mãi không hợp lệ
				alert("Mã khuyến mãi không hợp lệ hoặc không áp dụng cho giỏ hàng hiện tại.");
				this.discountAmount = 0;
				this.promoPercent = 0;
				return;
			}

	this.selectedPromo = JSON.stringify(promoItem);
	this.applyDiscount(promoItem);
	// Không cần alert khi áp dụng mã thành công
    },
    async goToCheckout() {
			// Chỉ chuyển hướng sang trang thanh toán, không xác nhận thanh toán ở đây
			if (this.cart.length === 0) {
				// Thông báo khi giỏ hàng trống
				alert('Giỏ hàng đang trống.');
				return;
			}
			this.saveCart();
			localStorage.setItem('payment_total', String(this.finalTotal));
			localStorage.setItem('payment_cart', JSON.stringify(this.cart));
			try {
				this.$router.push({ name: 'Payment' });
			} catch (err) {
				this.$router.push('/thanh-toan');
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
    }
  }
};
</script>

<style scoped>
.cart-page { min-height: 100vh; }
.booking-card, .cart-card { border-radius: 10px; }
.back-btn { margin-bottom: 1rem; }
</style>