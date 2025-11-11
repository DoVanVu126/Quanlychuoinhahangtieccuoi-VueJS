<template>
  <b-container fluid class="mt-5 mb-5">
    <b-row class="justify-content-center">
      <b-col lg="5" md="7">
        <b-card no-body class="bg-secondary shadow border-0">
          
          <b-card-header class="bg-transparent pb-5">
            <div class="text-muted text-center mt-2 h1">
              Đăng ký tài khoản
            </div>
          </b-card-header>

          <b-card-body class="px-lg-5 py-lg-5">
            <b-form role="form" @submit.prevent="handleRegister">
              
              <b-form-group label="Tên đăng nhập">
                <b-form-input
                  v-model="form.username"
                  type="text"
                  placeholder="Nhập tên đăng nhập"
                  required
                ></b-form-input>
              </b-form-group>

              <b-form-group label="Email">
                <b-form-input
                  v-model="form.email"
                  type="email"
                  placeholder="Nhập email"
                  required
                ></b-form-input>
              </b-form-group>

              <b-form-group label="Số điện thoại">
                <b-form-input
                  v-model="form.phone"
                  type="tel"
                  placeholder="Nhập số điện thoại"
                  required
                ></b-form-input>
              </b-form-group>

              <b-form-group label="Mật khẩu">
                <b-form-input
                  v-model="form.password"
                  type="password"
                  placeholder="Nhập mật khẩu (tối thiểu 8 ký tự)"
                  required
                ></b-form-input>
              </b-form-group>

              <b-form-group label="Xác nhận mật khẩu">
                <b-form-input
                  v-model="form.password_confirmation"
                  type="password"
                  placeholder="Nhập lại mật khẩu"
                  required
                ></b-form-input>
              </b-form-group>
              
              <div v-if="apiError" class="text-danger my-3">
                {{ apiError }}
              </div>

              <div class="text-center">
                <b-button type="submit" variant="primary" class="my-4" :disabled="isLoading">
                  <span v-if="isLoading">Đang xử lý...</span>
                  <span v-else>Tạo tài khoản</span>
                </b-button>
              </div>
            </b-form>
          </b-card-body>
        </b-card>
      </b-col>
    </b-row>
  </b-container>
</template>

<script>
// Import axios để gọi API
import axios from 'axios';

export default {
  name: 'register',
  data() {
    return {
      // Dùng 'form' object để gom nhóm dữ liệu
      // Các key (username, email...) PHẢI KHỚP với API
      form: {
        username: '',
        email: '',
        phone: '',
        password: '',
        password_confirmation: '' // Phải có key này để qua mặt validation 'confirmed'
      },
      apiError: null, // Dùng để lưu thông báo lỗi từ server
      isLoading: false // Dùng để vô hiệu hóa nút bấm khi đang gửi
    };
  },
  methods: {
    handleRegister() {
      // 1. Reset lỗi và đặt trạng thái loading
      this.apiError = null;
      this.isLoading = true;

      // 2. Lấy URL API từ file .env.local
      // (Nếu không có, nó sẽ dùng địa chỉ dự phòng)
      const apiUrl = process.env.VUE_APP_API_URL || 'http://localhost:8088';

      

      // 3. Gửi yêu cầu POST đến API
      axios.post(`${apiUrl}/api/register`, this.form)
        .then(response => {
          // 4. Xử lý khi ĐĂNG KÝ THÀNH CÔNG
          this.isLoading = false;
          
          console.log(response.data); // In ra console để xem
          alert('Đăng ký thành công! Bạn sẽ được chuyển đến trang đăng nhập.');
          
          // Chuyển hướng người dùng đến trang đăng nhập
          this.$router.push('/login'); 
        })
        .catch(error => {
          // 5. Xử lý khi CÓ LỖI
          this.isLoading = false;

          if (error.response && error.response.status === 422) {
            // Lỗi 422: Lỗi Validation (do người dùng nhập sai)
            // Lấy object 'errors' từ Laravel trả về
            const errors = error.response.data;
            
            // Lấy key của lỗi đầu tiên (ví dụ: 'email')
            const firstErrorKey = Object.keys(errors)[0];
            
            // Gán thông báo lỗi đầu tiên (ví dụ: "The email has already been taken.")
            this.apiError = errors[firstErrorKey][0];
            
          } else {
            // Lỗi server 500 hoặc lỗi mạng
            this.apiError = 'Đã có lỗi nghiêm trọng xảy ra. Vui lòng thử lại sau.';
            console.error('Lỗi đăng ký:', error);
          }
        });
    }
  }
};
</script>

<style>
/* Bạn có thể thêm CSS tùy chỉnh ở đây nếu cần */
</style>