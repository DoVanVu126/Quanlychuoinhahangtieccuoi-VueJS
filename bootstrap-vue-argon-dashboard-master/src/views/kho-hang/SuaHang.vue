<template>
  <div class="container mt-5">
    <h2>Sửa Hàng</h2>
    <b-form @submit.prevent="handleUpdate">
      <b-form-group label="Tên hàng">
        <b-form-input v-model="hang.ten"></b-form-input>
      </b-form-group>
      <b-form-group label="Tồn kho">
        <b-form-input type="number" v-model="hang.ton"></b-form-input>
      </b-form-group>
      <b-form-group label="Đơn vị tính">
        <b-form-input v-model="hang.dvt"></b-form-input>
      </b-form-group>
      <b-form-group label="Lô hàng">
        <b-form-input v-model="hang.lo"></b-form-input>
      </b-form-group>
      <b-form-group label="Hạn sử dụng">
        <b-form-input type="date" v-model="hang.hsd"></b-form-input>
      </b-form-group>

      <b-button type="submit" variant="primary">Cập nhật</b-button>
      <b-button variant="secondary" @click="$router.push('/kho')">Hủy</b-button>
    </b-form>
  </div>
</template>

<script>
export default {
  data() {
    return {
      hang: {},
    };
  },
  mounted() {
    const ma = this.$route.query.ma;
    this.hang = { ma, ten: "Thịt Bò Thăn", ton: 150, dvt: "KG", lo: "L01", hsd: "2025-09-27" };
  },
  methods: {
    handleUpdate() {
      alert("Cập nhật thành công cho mã: " + this.hang.ma);
      this.$router.push("/kho");
    },
  },
};
</script>
