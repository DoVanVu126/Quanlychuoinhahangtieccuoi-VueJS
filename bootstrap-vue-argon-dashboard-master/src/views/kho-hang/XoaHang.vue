<template>
  <div class="container mt-5 text-center">
    <h2 class="text-danger">Xóa Nguyên Liệu</h2>
    <p>Bạn có chắc chắn muốn xóa hàng <strong>{{ ma }}</strong> không?</p>

    <b-button variant="danger" @click="xoa">Xóa</b-button>
    <b-button variant="secondary" @click="$router.push('/kho')">Hủy</b-button>
  </div>
</template>

<script>
export default {
  data() {
    return { ma: "" };
  },
  mounted() {
    this.ma = this.$route.query.ma;
  },
  methods: {
    xoa() {
      alert("Đã xóa hàng mã: " + this.ma);
      this.$router.push("/kho");
    },
  },
};
</script>
