<template>
  <div class="container mt-5">
    <h2>Lịch Sử Kho</h2>
    <table class="table table-bordered">
      <thead>
        <tr>
          <th>Ngày</th>
          <th>Hoạt động</th>
          <th>Nguyên liệu</th>
          <th>Số lượng</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(log, i) in lichSu" :key="i">
          <td>{{ log.ngay }}</td>
          <td>{{ log.hoatdong }}</td>
          <td>{{ log.ten }}</td>
          <td>{{ log.soluong }}</td>
        </tr>
      </tbody>
    </table>
    <b-button variant="secondary" @click="$router.push('/kho')">Quay lại</b-button>
  </div>
</template>

<script>
export default {
  data() {
    return {
      lichSu: [
        { ngay: "2025-10-01", hoatdong: "Nhập hàng", ten: "Gạo Nếp", soluong: 100 },
        { ngay: "2025-10-05", hoatdong: "Xuất hàng", ten: "Thịt Bò", soluong: 20 },
      ],
    };
  },
};
</script>
