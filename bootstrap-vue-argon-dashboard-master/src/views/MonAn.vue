<template>
  <div class="container py-4">
    <div class="d-flex justify-content-between align-items-center mb-5 mt-5">
      <h2 class="fw-bold text-success">
        <i class="fas fa-utensils me-3"></i> Quản lý món ăn
      </h2>

      <router-link to="/mon-an/them" class="btn btn-success shadow-sm">
        <i class="fas fa-plus me-2"></i> Thêm món ăn
      </router-link>
    </div>

    <div class="input-group mb-4 shadow-sm" style="max-width: 400px">
      <span class="input-group-text bg-success text-white">
        <i class="fas fa-search"></i>
      </span>
      <input
        type="text"
        class="form-control"
        placeholder="Tìm món ăn..."
        v-model="tuKhoa"
      />
    </div>

    <!-- Bảng danh sách món ăn -->
    <div class="table-responsive shadow-sm rounded-3">
      <table class="table align-middle table-hover mb-0">
        <thead class="table-success text-center">
          <tr>
            <th>STT</th>
            <th>Tên món ăn</th>
            <th>Giá</th>
            <th>Loại món ăn</th>
            <th>Mô tả</th>
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(mon, index) in monAnLoc"
            :key="mon.id"
            class="text-center"
          >
            <td class="fw-semibold">{{ index + 1 }}</td>
            <td>{{ mon.tenMon }}</td>
            <td class="text-success fw-semibold">
              {{ mon.gia.toLocaleString() }} đ
            </td>
            <td>
              <span
                class="badge rounded-pill"
                :class="{
                  'bg-primary': mon.loaiMon === 'Món chính',
                  'bg-warning text-dark': mon.loaiMon === 'Món canh',
                  'bg-info text-dark': mon.loaiMon === 'Món tráng miệng',
                }"
              >
                {{ mon.loaiMon }}
              </span>
            </td>
            <td class="text-muted">{{ mon.moTa }}</td>
            <td>
              <router-link
                :to="`/mon-an/sua/${mon.id}`"
                class="btn btn-outline-primary btn-sm me-2"
              >
                <i class="fas fa-edit"></i>
              </router-link>
              <button
                class="btn btn-outline-danger btn-sm"
                @click="xoaMon(mon.id)"
              >
                <i class="fas fa-trash"></i>
              </button>
            </td>
          </tr>

          <tr v-if="monAnLoc.length === 0">
            <td colspan="6" class="text-center text-muted py-4">
              <i class="fas fa-info-circle me-2"></i>
              Không tìm thấy món ăn nào.
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
export default {
  name: "MonAn",
  data() {
    return {
      tuKhoa: "",
      danhSachMon: [
        {
          id: 1,
          tenMon: "Cơm gà chiên giòn",
          gia: 45000,
          loaiMon: "Món chính",
          moTa: "Cơm gà giòn rụm, ăn kèm dưa leo và nước mắm tỏi ớt",
        },
        {
          id: 2,
          tenMon: "Canh chua cá lóc",
          gia: 30000,
          loaiMon: "Món canh",
          moTa: "Canh chua kiểu miền Tây thanh mát",
        },
        {
          id: 3,
          tenMon: "Chè đậu xanh nước cốt dừa",
          gia: 15000,
          loaiMon: "Món tráng miệng",
          moTa: "Chè ngọt dịu, béo thơm nước cốt dừa",
        },
      ],
    };
  },
  computed: {
    monAnLoc() {
      return this.danhSachMon.filter((mon) =>
        mon.tenMon.toLowerCase().includes(this.tuKhoa.toLowerCase())
      );
    },
  },
  methods: {
    xoaMon(id) {
      if (confirm("Bạn có chắc muốn xóa món này không?")) {
        this.danhSachMon = this.danhSachMon.filter((m) => m.id !== id);
        alert("Đã xóa món ăn thành công!");
      }
    },
  },
};
</script>

<style scoped>
.container {
  max-width: 1100px;
}

h2 {
  margin-top: 10px;
  margin-bottom: 10px;
}

.table {
  border-radius: 12px;
  overflow: hidden;
}

.table thead {
  font-size: 1rem;
}

.table tbody tr:hover {
  background-color: #f1fff3;
  transition: 0.2s;
}

input.form-control:focus {
  border-color: #28a745;
  box-shadow: 0 0 0 0.2rem rgba(40, 167, 69, 0.25);
}

.btn {
  transition: 0.2s;
}
.btn:hover {
  transform: scale(1.05);
}
</style>
