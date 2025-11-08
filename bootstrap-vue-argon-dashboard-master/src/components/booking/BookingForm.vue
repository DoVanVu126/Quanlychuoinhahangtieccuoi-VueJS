<template>
  <form class="booking-form">
    <div class="form-row">
      <div class="form-group">
        <label>Họ và tên*</label>
        <input type="text" v-model="form.name" placeholder="Nhập họ tên" />
      </div>
      <div class="form-group">
        <label>Số điện thoại*</label>
        <input type="text" v-model="form.phone" placeholder="Nhập SĐT" />
      </div>
      <div class="form-group">
        <label>Email*</label>
        <input type="email" v-model="form.email" placeholder="Nhập email" />
      </div>
    </div>

    <div class="form-row">
      <div class="form-group">
        <label>Loại tiệc*</label>
        <select v-model="form.type">
          <option>Đám cưới</option>
          <option>Hội nghị</option>
          <option>Tiệc sinh nhật</option>
        </select>
      </div>
      <div class="form-group">
        <label>Số lượng bàn*</label>
        <input type="number" v-model="form.tables" placeholder="Nhập số bàn" />
      </div>
      <div class="form-group">
        <label>Thời gian*</label>
        <select v-model="form.time">
          <option>9h-13h</option>
          <option>14h-18h</option>
          <option>18h-22h</option>
        </select>
      </div>
    </div>

    <div class="form-group">
      <label>Nội dung*</label>
      <textarea v-model="form.note" placeholder="Ghi chú hoặc yêu cầu đặc biệt"></textarea>
    </div>

    <div class="booking-actions">
      <button type="button" class="btn-send">Gửi ý</button>
      <button type="submit" class="btn-book">Đặt</button>
    </div>
  </form>
</template>

<script>
export default {
  name: "BookingForm",
  data() {
    return {
      form: {
        name: "",
        phone: "",
        email: "",
        type: "Đám cưới",
        tables: "",
        time: "9h-13h",
        note: "",
      },
    };
  },
};
</script>
