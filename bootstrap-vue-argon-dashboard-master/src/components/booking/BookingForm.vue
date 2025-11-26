<template>
  <form class="booking-page-form" @submit.prevent="submitBooking">
    <div class="booking-page-row">
      <div class="booking-page-group">
        <label>Họ và tên*</label>
        <input type="text" v-model="form.name" placeholder="Nhập họ tên" />
      </div>
      <div class="booking-page-group">
        <label>Số điện thoại*</label>
        <input type="text" v-model="form.phone" placeholder="Nhập SĐT" />
      </div>
      <div class="booking-page-group">
        <label>Email*</label>
        <input type="email" v-model="form.email" placeholder="Nhập email" />
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
      <textarea v-model="form.note" placeholder="Ghi chú hoặc yêu cầu đặc biệt"></textarea>
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
    <p v-if="successMessage" class="booking-page-success" v-html="successMessage"></p>

    <div class="booking-page-actions">
      <button type="button" class="booking-page-btn-draft" @click="openSuggestion">Gợi ý</button>
      <button type="submit" class="booking-page-btn-book">Đặt</button>
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
      successMessage: "",
      showSuggestionModal: false,
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
    saveDraft() {
      localStorage.setItem("booking_draft", JSON.stringify({
        restaurant_id: this.restaurant.restaurant_id,
        ...this.form,
        booking_foods: (this.selectedFoods || []).map(f => ({ food_id: f.food_id || f.id, price: f.price || null })),
        booking_services: (this.selectedServices || []).map(s => ({ service_id: s.service_id || s.id, price: s.price || null })),
      }));
      alert("Ý kiến đã được lưu tạm!");
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

      if (!this.form.name || !this.form.phone || !this.form.email) {
        this.formError = "Vui lòng điền đầy đủ Họ tên, SĐT và Email.";
        return;
      }
      if (!this.form.tables || this.form.tables < 1) {
        this.formError = "Vui lòng nhập số bàn hợp lệ (>=1).";
        return;
      }

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
        this.successMessage = "Đặt tiệc thành công!<br>đơn đặt đã thêm vào giỏ hàng.";
        // wait a moment so user sees the message, then navigate home
        setTimeout(() => {
          if (this.$router) this.$router.push('/home');
        }, 1200);
      } catch (err) {
        console.error("Lỗi đặt tiệc:", err);
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
