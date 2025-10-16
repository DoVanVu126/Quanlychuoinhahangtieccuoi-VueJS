<template>
  <div class="container py-5">
    <div class="card shadow-lg border-0 rounded-4 p-4">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h3 class="fw-bold text-primary mb-0">
          <i class="fas fa-edit me-2"></i> Sửa món ăn
        </h3>
        <router-link to="/mon-an" class="btn btn-outline-secondary btn-sm">
          <i class="fas fa-arrow-left me-2"></i> Quay lại
        </router-link>
      </div>

      <form @submit.prevent="capNhatMonAn">
        <div class="mb-3">
          <label class="form-label fw-semibold">Tên món ăn</label>
          <input
            v-model="monAn.tenMon"
            type="text"
            class="form-control form-control-lg rounded-3 shadow-sm"
            placeholder="Nhập tên món ăn..."
            required
          />
        </div>


        <div class="mb-3">
          <label class="form-label fw-semibold">Giá (VNĐ)</label>
          <input
            v-model="monAn.gia"
            type="number"
            class="form-control form-control-lg rounded-3 shadow-sm"
            placeholder="Nhập giá món ăn..."
            required
          />
        </div>


        <div class="mb-3">
          <label class="form-label fw-semibold">Loại món ăn</label>
          <select
            v-model="monAn.loaiMon"
            class="form-select form-select-lg rounded-3 shadow-sm"
            required
          >
            <option value="" disabled>-- Chọn loại món ăn --</option>
            <option value="Món chính">Món chính</option>
            <option value="Món phụ">Món phụ</option>
            <option value="Tráng miệng">Tráng miệng</option>
          </select>
        </div>


        <div class="mb-4">
          <label class="form-label fw-semibold">Mô tả</label>
          <textarea
            v-model="monAn.moTa"
            class="form-control rounded-3 shadow-sm"
            rows="3"
            placeholder="Nhập mô tả món ăn..."
          ></textarea>
        </div>


        <div class="text-end">
          <button type="submit" class="btn btn-success btn-lg px-4 shadow-sm me-2">
            <i class="fas fa-save me-2"></i> Lưu thay đổi
          </button>
          <router-link to="/mon-an" class="btn btn-outline-secondary btn-lg px-4 shadow-sm">
            <i class="fas fa-times me-2"></i> Hủy
          </router-link>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
export default {
  name: "SuaMonAn",
  data() {
    return {
      monAn: {
        id: null,
        tenMon: "",
        gia: "",
        loaiMon: "",
        moTa: ""
      }
    };
  },
  mounted() {
    const id = this.$route.params.id;
    // Giả lập dữ liệu (có thể thay bằng API thật)
    this.monAn = {
      id,
      tenMon: "Cơm chiên hải sản",
      gia: 55000,
      loaiMon: "Món chính",
      moTa: "Cơm chiên hải sản thơm ngon hấp dẫn"
    };
  },
  methods: {
    capNhatMonAn() {
      alert(`✅ Đã cập nhật món: ${this.monAn.tenMon}`);
      this.$router.push("/mon-an");
    }
  }
};
</script>

<style scoped>
.container {
  max-width: 700px;
}

.card {
  background: #ffffff;
  transition: 0.3s ease;
}

.card:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.08);
}

input:focus,
select:focus,
textarea:focus {
  border-color: #0d6efd !important;
  box-shadow: 0 0 0 0.2rem rgba(13, 110, 253, 0.25);
}

button {
  transition: 0.2s ease;
}
button:hover {
  transform: scale(1.03);
}
</style>
