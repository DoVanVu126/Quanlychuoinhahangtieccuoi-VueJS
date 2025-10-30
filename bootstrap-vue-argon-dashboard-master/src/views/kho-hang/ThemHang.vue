<template>
  <div class="container mt-5">
    <h2>Thêm Nguyên Liệu</h2>
    <b-form @submit.prevent="handleSubmit">
      <b-form-group label="Tên nguyên liệu">
        <b-form-input v-model="hang.ten" required></b-form-input>
      </b-form-group>

      <b-form-group label="Số lượng tồn">
        <b-form-input type="number" v-model="hang.ton" required></b-form-input>
      </b-form-group>

      <b-form-group label="Đơn vị tính">
        <b-form-input v-model="hang.dvt" required></b-form-input>
      </b-form-group>

      <b-form-group label="Lô hàng">
        <b-form-input v-model="hang.lo" required></b-form-input>
      </b-form-group>

      <b-form-group label="Hạn sử dụng">
        <b-form-input type="date" v-model="hang.hsd" required></b-form-input>
      </b-form-group>

      <b-button type="submit" variant="success">Lưu</b-button>
      <b-button variant="secondary" @click="$router.push('/kho')">Quay lại</b-button>
    </b-form>
  </div>
</template>

<script>
export default {
  data() {
    return {
      hang: { ten: "", ton: 0, dvt: "", lo: "", hsd: "" },
    };
  },
  methods: {
    handleSubmit() {
      alert("Đã thêm hàng: " + this.hang.ten);
      this.$router.push("/kho");
    },
  },
};
</script>
