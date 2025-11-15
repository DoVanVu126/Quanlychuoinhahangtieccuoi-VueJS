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
          <option>9h-13h</option>
          <option>14h-18h</option>
          <option>18h-22h</option>
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
    <p v-if="successMessage" class="booking-page-success">{{ successMessage }}</p>

    <div class="booking-page-actions">
      <button type="button" class="booking-page-btn-draft" @click="saveDraft">Gửi ý</button>
      <button type="submit" class="booking-page-btn-book">Đặt</button>
    </div>
  </form>
</template>

<script>
import axios from "axios";

export default {
  name: "BookingForm",
  props: {
    user: { type: Object, default: null },
    restaurant: { type: Object, required: true },
    startDate: { type: String, default: "" },
    endDate: { type: String, default: "" },
  },
  data() {
    return {
      form: {
        name: "",
        phone: "",
        email: "",
        type: "Đám cưới",
        tables: 1,
        time: "9h-13h",
        note: "",
        startDate: this.startDate || "",
        endDate: this.endDate || "",
      },
      formError: "",
      successMessage: "",
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
  },
  methods: {
    saveDraft() {
      localStorage.setItem("booking_draft", JSON.stringify({
        restaurant_id: this.restaurant.restaurant_id,
        ...this.form
      }));
      alert("Ý kiến đã được lưu tạm!");
    },
    async submitBooking() {
      this.formError = "";
      this.successMessage = "";

      if (!this.form.name || !this.form.phone || !this.form.email) {
        this.formError = "Vui lòng điền đầy đủ Họ tên, SĐT và Email.";
        return;
      }
      if (!this.form.tables || this.form.tables < 1) {
        this.formError = "Vui lòng nhập số bàn hợp lệ (>=1).";
        return;
      }

      const payload = {
        restaurant_id: this.restaurant.restaurant_id,
        name: this.form.name,
        phone: this.form.phone,
        email: this.form.email,
        type: this.form.type,
        tables: this.form.tables,
        time: this.form.time,
        note: this.form.note,
        start_date: this.form.startDate,
        end_date: this.form.endDate,
        user_id: this.user ? this.user.user_id : null,
      };

      try {
        const token = localStorage.getItem("token");
        const headers = token && token !== "undefined" ? { Authorization: `Bearer ${token}` } : {};
        const res = await axios.post("http://localhost:8088/api/bookings", payload, { headers });
        this.successMessage = "Đặt tiệc thành công!";
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
