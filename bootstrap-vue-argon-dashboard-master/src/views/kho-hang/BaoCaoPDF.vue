<template>
  <div class="container mt-5 text-center">
    <h2>Xuất Báo Cáo Kho PDF</h2>
    <p>Nhấn nút dưới đây để xuất báo cáo kho thành file PDF.</p>
    <b-button variant="success" @click="xuatPDF">Xuất PDF</b-button>
    <b-button variant="secondary" @click="$router.push('/kho')">Quay lại</b-button>
  </div>
</template>

<script>
export default {
  methods: {
    xuatPDF() {
      alert("Đang xuất báo cáo PDF...");
    },
  },
};
</script>
