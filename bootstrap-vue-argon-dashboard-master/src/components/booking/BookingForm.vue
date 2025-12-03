<template>
  <form class="booking-page-form" @submit.prevent="submitBooking">
    <div class="booking-page-row">
      <div class="booking-page-group">
        <label>Họ và tên*</label>
        <input type="text" v-model="form.name" placeholder="Nhập họ tên" readonly />
      </div>
      <div class="booking-page-group">
        <label>Số điện thoại*</label>
        <input type="text" v-model="form.phone" placeholder="Nhập SĐT" readonly />
      </div>
      <div class="booking-page-group">
        <label>Email*</label>
        <input type="email" v-model="form.email" placeholder="Nhập email" readonly />
      </div>
    </div>
    <!-- Giá được lấy từ sảnh đã chọn; không hiển thị trường giá ở giao diện -->

    <div class="booking-page-row">
      <div class="booking-page-group">
        <label>Loại tiệc*</label>
        <select v-model="form.type">
          <option>Đám cưới</option>
          <option>Hội nghị</option>
          <option>Tiệc sinh nhật</option>
          <option>Khác</option>
        </select>
      </div>
      <div class="booking-page-group">
        <label>Số lượng bàn*</label>
        <input type="number" v-model.number="form.tables" placeholder="Nhập số bàn" min="1" />
      </div>
      <div class="booking-page-group">
        <label>Thời gian*</label>
        <select v-model="form.time">
          <option>9:00:00</option>
          <option>16:00:00</option>
        </select>
      </div>
    </div>

    <div class="booking-page-group">
      <label>Nội dung*</label>
      <textarea v-model="form.note" placeholder="Ghi chú hoặc yêu cầu đặc biệt" @input="onNoteInput"></textarea>
      <div class="note-hint">{{ form.note.length }} / 255 ký tự</div>
      <p v-if="noteError" class="booking-note-error">{{ noteError }}</p>
    </div>

    <div class="booking-page-row">
      <div class="booking-page-group">
        <label>Ngày đặt</label>
        <input type="date" v-model="form.startDate" />
      </div>
      <div class="booking-page-group">
        <label>Ngày trả</label>
        <input type="date" v-model="form.endDate" />
      </div>
    </div>

    <p v-if="formError" class="booking-page-error">{{ formError }}</p>

    <!-- Loading overlay while booking request is in-flight -->
    <div v-if="loadingBooking" class="bf-loading-overlay" aria-hidden="true">
      <div class="bf-loading-spinner" role="status" aria-label="Đang xử lý"></div>
    </div>

    <!-- Success dialog shown briefly on success -->
    <div v-if="showSuccessDialog" class="bf-success-dialog" role="dialog" aria-modal="true">
      <div class="bf-success-inner">
        <h3>Đặt tiệc thành công !!!</h3>
        <p>Đơn đặt của bạn đã được thêm vào giỏ hàng.</p>
      </div>
    </div>

    <div class="booking-page-actions">
      <button type="button" class="booking-page-btn-draft" @click="openSuggestion" :disabled="loadingBooking">Gợi ý</button>
      <button type="submit" class="booking-page-btn-book" :disabled="Boolean(noteError) || loadingBooking">Đặt</button>
    </div>
    <SuggestionModal v-if="showSuggestionModal" :restaurant-id="restaurant && (restaurant.restaurant_id || restaurant.id)" @apply-package="onApplyPackage" @close="showSuggestionModal = false" />
  </form>
</template>

<script>
import axios from "axios";
import SuggestionModal from '@/components/booking/SuggestionModal.vue';

export default {
  name: "BookingForm",
  components: { SuggestionModal },
  props: {
    user: { type: Object, default: null },
    restaurant: { type: Object, required: true },
    startDate: { type: String, default: "" },
    endDate: { type: String, default: "" },
    selectedHall: { type: Object, default: null }, // 👈 nhận sảnh chọn
    selectedFoods: { type: Array, default: () => [] },
    selectedServices: { type: Array, default: () => [] },
    suggestedEventType: { type: String, default: null },
    suggestedNumberOfTables: { type: [Number, String], default: null },
  },

  data() {
    return {
      form: {
        name: "",
        phone: "",
        email: "",
        price: "",
        type: "Đám cưới",
        tables: 1,
        time: "9:00:00",
        note: "",
        startDate: this.startDate || "",
        endDate: this.endDate || "",
      },
      // do not shadow prop `selectedHall`
      formError: "",
      noteError: "",
      successMessage: "",
      showSuggestionModal: false,
      loadingBooking: false,
      showSuccessDialog: false,
    };
  },
  created() {
    if (this.user) {
      this.form.name = this.user.username || "";
      this.form.phone = this.user.phone || "";
      this.form.email = this.user.email || "";
    }
  },
  watch: {
    startDate(newVal) { this.form.startDate = newVal; },
    endDate(newVal) { this.form.endDate = newVal; },
    'form.note'(newVal) {
      if (!newVal || newVal.length <= 255) this.noteError = '';
    },
    // update price when selected hall prop changes
    selectedHall(newHall) {
      if (newHall && newHall.price) this.form.price = newHall.price;
    }
    ,
    suggestedEventType: {
      handler(newVal) {
        if (newVal) this.form.type = newVal;
      },
      immediate: true,
    },
    suggestedNumberOfTables: {
      handler(newVal) {
        if (newVal !== null && newVal !== undefined) {
          const n = Number(newVal);
          if (!isNaN(n)) this.form.tables = n;
        }
      },
      immediate: true,
    }
  },
  methods: {
    // Validate booking before submitting. Returns { valid: boolean, message: string }
    validateBooking() {
      // basic required contact fields
      if (!this.form.name || !this.form.phone || !this.form.email) {
        return { valid: false, message: "Vui lòng điền đầy đủ Họ tên, SĐT và Email." };
      }

      // selected hall required
      if (!this.selectedHall) {
        return { valid: false, message: "Vui lòng chọn sảnh trước khi đặt." };
      }

      // at least one food required
      if (!this.selectedFoods || this.selectedFoods.length === 0) {
        return { valid: false, message: "Vui lòng chọn ít nhất một món ăn." };
      }

      // tables
      if (!this.form.tables || this.form.tables < 1) {
        return { valid: false, message: "Vui lòng nhập số bàn hợp lệ (>=1)." };
      }
      // maximum tables limit
      if (Number(this.form.tables) > 1000) {
        return { valid: false, message: "Số lượng bàn không được lớn hơn 1000." };
      }

      // note length
      if (this.form.note && this.form.note.length > 255) {
        return { valid: false, message: "Nội dung không được quá 255 ký tự." };
      }

      // date validation
      const today = new Date().toISOString().substr(0, 10);
      const s = this.form.startDate;
      const e = this.form.endDate;
      if (!s || !e) {
        return { valid: false, message: "Vui lòng chọn Ngày đặt và Ngày trả." };
      }
      if (s > e) {
        return { valid: false, message: 'Ngày đặt không được sau ngày trả' };
      }
      if (s < today || e < today) {
        return { valid: false, message: 'Ngày đặt/Ngày trả không được trước ngày hiện tại' };
      }
      try {
        const sd = new Date(s);
        const ed = new Date(e);
        const diffMs = ed.getTime() - sd.getTime();
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        if (diffDays > 14) {
          return { valid: false, message: 'Ngày trả không được quá 2 tuần so với ngày đặt' };
        }
      } catch (err) {
        // ignore parse errors
      }

      return { valid: true, message: "" };
    },
    saveDraft() {
      localStorage.setItem("booking_draft", JSON.stringify({
        restaurant_id: this.restaurant.restaurant_id,
        ...this.form,
        booking_foods: (this.selectedFoods || []).map(f => ({ food_id: f.food_id || f.id, price: f.price || null })),
        booking_services: (this.selectedServices || []).map(s => ({ service_id: s.service_id || s.id, price: s.price || null })),
      }));
      alert("Ý kiến đã được lưu tạm!");
    },

    onNoteInput() {
      // live validation for note length
      if (this.form.note && this.form.note.length > 255) {
        this.noteError = 'Nội dung không được quá 255 ký tự.';
      } else {
        this.noteError = '';
      }
    },
    openSuggestion() {
      this.showSuggestionModal = true;
    },
    onApplyPackage(pkg) {
      // emit selected package to parent page to apply the package selections
      this.$emit('apply-package', pkg);
      this.showSuggestionModal = false;
    },
    async submitBooking() {
      this.formError = "";
      this.successMessage = "";
      if (this.selectedHall) {
        this.form.price = this.selectedHall.price;
      } else {
        this.form.price = 0; // hoặc giữ nguyên giá nhập tay
      }

      // run validation helper
      const v = this.validateBooking();
      if (!v.valid) {
        this.formError = v.message;
        return;
      }

      // show loading overlay
      this.loadingBooking = true;

      // build arrays of ids
      const foodIds = (this.selectedFoods || [])
        .map(f => f.food_id ? f.food_id : f.id)
        .filter(id => id != null);

      const serviceIds = (this.selectedServices || [])
        .map(s => s.service_id ? s.service_id : s.id)
        .filter(id => id != null);

      const payload = {
        restaurant_id: this.restaurant.restaurant_id,
        hall_id: this.selectedHall ? this.selectedHall.hall_id : null,
        event_type: this.form.type,
        event_time: this.form.time,
        event_date: this.form.startDate,
        return_date: this.form.endDate,
        number_of_tables: this.form.tables,
        price: this.selectedHall ? this.selectedHall.price : this.form.price,
        notes: this.form.note,
        user_id: this.user ? this.user.user_id : null,

        food_ids: foodIds,
        service_ids: serviceIds,

        booking_foods: (this.selectedFoods || []).map(f => ({
          food_id: f.food_id ? f.food_id : f.id,
          price: f.price ? f.price : null,
          quantity: f.quantity ? f.quantity : 1
        })),

        booking_services: (this.selectedServices || []).map(s => ({
          service_id: s.service_id ? s.service_id : s.id,
          price: s.price ? s.price : null
        }))
      };

      console.log("Payload sẽ gửi:", payload);
      try {
        const token = localStorage.getItem("token");
        const headers = token && token !== "undefined" ? { Authorization: `Bearer ${token}` } : {};
        const res = await axios.post("http://localhost:8088/api/bookings", payload, { headers });

        // hide loading and show success dialog for ~3s
        this.loadingBooking = false;
        this.showSuccessDialog = true;
        setTimeout(() => {
          this.showSuccessDialog = false;
          if (this.$router) this.$router.push('/home');
        }, 3000);
      } catch (err) {
        console.error("Lỗi đặt tiệc:", err);
        this.loadingBooking = false;
        if (err.response && err.response.data && err.response.data.message) {
          this.formError = err.response.data.message;
        } else {
          this.formError = "Có lỗi khi đặt tiệc. Vui lòng thử lại.";
        }
      }
    },
  },
};
</script>
<style src="../../assets/css/booking-form.css"></style>

<style scoped>
/* BookingForm loading overlay and success dialog */
.bf-loading-overlay {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0,0,0,0.45);
  z-index: 99999; /* very high to ensure visibility */
  pointer-events: auto;
}
.bf-loading-spinner {
  width: 96px;
  height: 96px;
  border-radius: 50%;
  border: 10px solid rgba(255,255,255,0.15);
  border-top-color: #06b6d4; /* cyan-400 */
  animation: bf-spin 0.8s linear infinite;
  box-shadow: 0 10px 40px rgba(0,0,0,0.25);
}
@keyframes bf-spin { to { transform: rotate(360deg); } }

.bf-success-dialog {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100000;
}
.bf-success-inner {
  background: #ffffff;
  padding: 28px 36px;
  border-radius: 12px;
  box-shadow: 0 20px 60px rgba(2,6,23,0.35);
  text-align: center;
  width: 460px;
  max-width: calc(100% - 40px);
}
.bf-success-inner h3 {
  margin: 0 0 8px;
  color: #065f46;
  font-size: 22px;
  font-weight: 700;
}
.bf-success-inner p {
  margin: 0;
  color: #065f46;
  font-size: 16px;
}

.booking-note-error { color: #dc2626; margin-top: 6px; font-weight: 600; }
</style>
