<template>
  <div class="container mt-5 text-center">
    <h2 class="text-danger">Xóa Nguyên Liệu</h2>
    <p v-if="ma">Bạn có chắc chắn muốn xóa hàng <strong>{{ ma }}</strong> không?</p>
    <p v-else class="text-danger">Không tìm thấy mã hàng!</p>
    <b-button variant="danger" @click="xoa" :disabled="!ma || !isAuthenticated || loading">Xóa</b-button>
    <b-button variant="secondary" @click="$router.push('/kho')">Hủy</b-button>
    <div v-if="!isAuthenticated" class="alert alert-warning mt-3">
      Bạn cần đăng nhập để thực hiện thao tác này.
    </div>
    <div v-if="error" class="alert alert-danger mt-3">{{ error }}</div>
  </div>
</template>

<script>
import api from '@/api';

export default {
  data() {
    return {
      ma: "",
      isAuthenticated: false,
      loading: false,
      error: null,
    };
  },
  mounted() {
    this.ma = this.$route.query.ma;
    // Kiểm tra token xác thực (ví dụ lưu ở localStorage)
    const token = localStorage.getItem('user_token');
    this.isAuthenticated = !!token;
    if (!this.isAuthenticated) {
      // Nếu không có token, chuyển về trang đăng nhập sau 1s
      setTimeout(() => {
        this.$router.replace('/login');
      }, 1000);
    }
  },
  methods: {
    async xoa() {
      if (!this.isAuthenticated) {
        alert('Bạn chưa đăng nhập!');
        return;
      }
      if (!this.ma) {
        this.error = 'Không tìm thấy mã hàng!';
        return;
      }
      this.loading = true;
      this.error = null;
      try {
        const token = localStorage.getItem('user_token');
        // Gọi API xóa, gửi token trong header Authorization
        await api.delete(`/inventories/${this.ma}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        alert("Đã xóa hàng mã: " + this.ma);
        this.$router.push("/kho");
      } catch (err) {
        if (err.response && err.response.status === 401) {
          this.error = 'Phiên đăng nhập hết hạn hoặc không hợp lệ!';
          setTimeout(() => this.$router.replace('/login'), 1500);
        } else {
          this.error = 'Lỗi xóa hàng. Vui lòng thử lại!';
        }
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>
