<template>
  <div class="register-page-container">
    <header class="border-bottom py-4">
      <b-container>
        <div class="font-cursive h1 text-dark">Wedding</div>
      </b-container>
    </header>

    <main class="py-5">
      <b-container>
        <b-row class="justify-content-center">
          <b-col md="6" lg="5">
            <h1 class="font-serif text-center display-4 mb-5">
              Tạo tài khoản
            </h1>

            <b-form @submit.prevent="handleRegister">

              <b-form-group label="Tên tài khoản" label-class="form-label">
                <b-form-input v-model="form.username" type="text" class="minimal-input" required></b-form-input>
              </b-form-group>

              <b-form-group label="Email" label-class="form-label" class="mt-4">
                <b-form-input v-model="form.email" type="email" class="minimal-input" required></b-form-input>
              </b-form-group>

              <b-form-group label="Số điện thoại" label-class="form-label" class="mt-4">
                <b-input-group>
                  <b-input-group-prepend class="minimal-prepend">
                    <b-input-group-text>+84</b-input-group-text>
                  </b-input-group-prepend>
                  <b-form-input v-model="form.phone" type="tel" placeholder="0123456789" class="minimal-input"
                    required></b-form-input>
                </b-input-group>
              </b-form-group>

              <b-form-group label="Mật khẩu" label-class="form-label" class="mt-4">
                <div class="position-relative">
                  <b-form-input v-model="form.password" :type="showPassword ? 'text' : 'password'"
                    class="minimal-input pe-5" required></b-form-input>

                  <i class="fas" :class="showPassword ? 'fa-eye-slash' : 'fa-eye'" @click="togglePassword"
                    style="position: absolute; right: 10px; top: 50%; transform: translateY(-50%); cursor: pointer; color: #6b7280;"></i>
                </div>
              </b-form-group>


              <b-form-group label="Xác nhận mật khẩu" label-class="form-label" class="mt-4">
                <b-form-input v-model="form.password_confirmation" type="password" class="minimal-input"
                  required></b-form-input>
              </b-form-group>

              <div v-if="apiError" class="text-danger my-3">
                {{ apiError }}
              </div>

              <b-button type="submit" class="minimal-button w-100 mt-4" :disabled="isLoading">
                <span v-if="isLoading">Đang xử lý...</span>
                <span v-else>TẠO TÀI KHOẢN</span>
              </b-button>
            </b-form>

            <div class="mt-4 text-center">
              <p class="text-muted">
                Đã có tài khoản?
                <router-link to="/login" class="text-primary font-weight-bold">
                  Đăng nhập ngay
                </router-link>
              </p>
            </div>

          </b-col>
        </b-row>
      </b-container>
    </main>
  </div>
</template>

<script>
// Import axios để gọi API
import axios from 'axios';

// PHẦN SCRIPT NÀY GIỮ NGUYÊN 100%
// Nó không liên quan đến giao diện
export default {
  name: 'register',
  data() {
    return {
      form: {
        name: '',
        email: '',
        password: '',
        questionpassword: '',
      },
      showPassword: false, // 👁 Ẩn/hiện mật khẩu
      apiError: null,
      isLoading: false
    };
  },
  methods: {
    togglePassword() {
      this.showPassword = !this.showPassword;
    },
    handleRegister() {
      this.apiError = null;
      this.isLoading = true;

      // SỬA LẠI ĐỂ KHỚP VỚI VUE CLI (thay vì Vite)
      const apiUrl = process.env.VUE_APP_API_URL || 'http://localhost:8088';

      axios.post(`${apiUrl}/api/register`, this.form)
        .then(response => {
          this.isLoading = false;
          alert('Đăng ký thành công! Bạn sẽ được chuyển đến trang đăng nhập.');

          // SỬA LẠI ĐỂ KHỚP VỚI ROUTER CỦA BẠN
          this.$router.push('/login');
        })
        .catch(error => {
          this.isLoading = false;
          if (error.response && error.response.status === 422) {
            const errors = error.response.data;
            const firstErrorKey = Object.keys(errors)[0];
            this.apiError = errors[firstErrorKey][0];
          } else {
            this.apiError = 'Đã có lỗi nghiêm trọng xảy ra. Vui lòng thử lại sau.';
            console.error('Lỗi đăng ký:', error);
          }
        });
    }
  }
};
</script>

<style scoped>
/* * 6. KHỐI CSS TÙY CHỈNH
 * Đây là nơi chúng ta "bắt chước" phong cách Tailwind
 */

/* Thêm font chữ đã import */
.font-cursive {
  font-family: 'Dancing Script', cursive;
  font-weight: 700;
}

.font-serif {
  font-family: 'Lora', serif;
  font-weight: 600;
}

/* Container chính, đảm bảo nền trắng */
.register-page-container {
  min-height: 100vh;
  background-color: #ffffff;
}

/* Style cho label của form */
.form-label {
  color: #4a5568;
  /* text-gray-700 */
  font-size: 0.875rem;
  /* text-sm */
  margin-bottom: 0.5rem;
  /* mb-2 */
}

/* Style cho ô input "tối giản" */
.minimal-input {
  background-color: #f3f4f6 !important;
  /* bg-gray-100 */
  border: 0 !important;
  border-radius: 0 !important;
  /* rounded-none */
  padding-top: 0.75rem !important;
  /* py-3 */
  padding-bottom: 0.75rem !important;
  /* py-3 */
  box-shadow: none !important;
  /* Tắt box-shadow của Bootstrap */
}

/* Style cho ô input khi được focus */
.minimal-input:focus {
  background-color: #f3f4f6 !important;
  border: 0 !important;
  box-shadow: 0 0 0 2px #60a5fa !important;
  /* focus:ring-2 focus:ring-blue-400 */
}

/* Style cho phần "+84" */
.minimal-prepend .input-group-text {
  background-color: #f3f4f6 !important;
  /* bg-gray-100 */
  border: 0 !important;
  border-radius: 0 !important;
  color: #4b5563;
  /* text-gray-600 */
}

/* Style cho nút bấm */
.minimal-button {
  background-color: #60a5fa !important;
  /* bg-blue-400 */
  border-color: #60a5fa !important;
  border-radius: 0 !important;
  /* rounded-none */
  text-transform: uppercase !important;
  font-weight: 600 !important;
  padding-top: 0.75rem !important;
  /* py-3 */
  padding-bottom: 0.75rem !important;
  transition: background-color 0.2s ease-in-out;
}

.minimal-button:hover {
  background-color: #3b82f6 !important;
  /* hover:bg-blue-500 */
  border-color: #3b82f6 !important;
}
</style>
