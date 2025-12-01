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

              <!-- Username -->
              <b-form-group label="Tên tài khoản" label-class="form-label">
                <b-form-input 
                  v-model="form.username" 
                  type="text" 
                  class="minimal-input"
                  :class="{ 'is-invalid-custom': errors.username }"
                  placeholder="Chỉ chữ, số và dấu gạch dưới"
                  @input="validateUsername"
                  @blur="validateUsername">
                </b-form-input>
                <small v-if="errors.username" class="text-danger d-block mt-1">
                  {{ errors.username }}
                </small>
              </b-form-group>

              <!-- Email -->
              <b-form-group label="Email" label-class="form-label" class="mt-4">
                <b-form-input 
                  v-model="form.email" 
                  type="email" 
                  class="minimal-input"
                  :class="{ 'is-invalid-custom': errors.email }"
                  placeholder="example@email.com"
                  @input="validateEmail"
                  @blur="validateEmail">
                </b-form-input>
                <small v-if="errors.email" class="text-danger d-block mt-1">
                  {{ errors.email }}
                </small>
              </b-form-group>

              <!-- Phone -->
              <b-form-group label="Số điện thoại" label-class="form-label" class="mt-4">
                <b-input-group>
                  <b-input-group-prepend class="minimal-prepend">
                    <b-input-group-text>+84</b-input-group-text>
                  </b-input-group-prepend>
                  <b-form-input 
                    v-model="form.phone" 
                    type="tel" 
                    placeholder="0123456789" 
                    class="minimal-input"
                    :class="{ 'is-invalid-custom': errors.phone }"
                    maxlength="11"
                    pattern="[0-9]*"
                    inputmode="numeric"
                    @input="validatePhone"
                    @blur="validatePhone"
                    @keypress="onlyNumbers">
                  </b-form-input>
                </b-input-group>
                <small v-if="errors.phone" class="text-danger d-block mt-1">
                  {{ errors.phone }}
                </small>
              </b-form-group>

              <!-- Password -->
              <b-form-group label="Mật khẩu" label-class="form-label" class="mt-4">
                <div class="position-relative">
                  <b-form-input 
                    v-model="form.password" 
                    :type="showPassword ? 'text' : 'password'"
                    class="minimal-input pe-5"
                    :class="{ 'is-invalid-custom': errors.password }"
                    placeholder="Tối thiểu 8 ký tự"
                    @input="validatePassword"
                    @blur="validatePassword">
                  </b-form-input>
                  <i class="fas" 
                    :class="showPassword ? 'fa-eye-slash' : 'fa-eye'" 
                    @click="togglePassword"
                    style="position: absolute; right: 10px; top: 50%; transform: translateY(-50%); cursor: pointer; color: #6b7280;">
                  </i>
                </div>
                <small v-if="errors.password" class="text-danger d-block mt-1">
                  {{ errors.password }}
                </small>
              </b-form-group>

              <!-- Password Confirmation -->
              <b-form-group label="Xác nhận mật khẩu" label-class="form-label" class="mt-4">
                <div class="position-relative">
                  <b-form-input 
                    v-model="form.password_confirmation" 
                    :type="showPasswordConfirm ? 'text' : 'password'"
                    class="minimal-input pe-5"
                    :class="{ 'is-invalid-custom': errors.password_confirmation }"
                    placeholder="Nhập lại mật khẩu"
                    @input="validatePasswordConfirmation"
                    @blur="validatePasswordConfirmation">
                  </b-form-input>
                  <i class="fas" 
                    :class="showPasswordConfirm ? 'fa-eye-slash' : 'fa-eye'" 
                    @click="togglePasswordConfirm"
                    style="position: absolute; right: 10px; top: 50%; transform: translateY(-50%); cursor: pointer; color: #6b7280;">
                  </i>
                </div>
                <small v-if="errors.password_confirmation" class="text-danger d-block mt-1">
                  {{ errors.password_confirmation }}
                </small>
              </b-form-group>

              <b-button 
                type="submit" 
                class="minimal-button w-100 mt-4" 
                :disabled="isLoading || !isFormValid">
                <span v-if="isLoading">
                  <b-spinner small class="me-2"></b-spinner>
                  Đang xử lý...
                </span>
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
import axios from 'axios';

export default {
  name: 'register',
  data() {
    return {
      form: {
        username: '',
        email: '',
        phone: '',
        password: '',
        password_confirmation: '',
      },
      errors: {
        username: '',
        email: '',
        phone: '',
        password: '',
        password_confirmation: '',
      },
      showPassword: false,
      showPasswordConfirm: false,
      isLoading: false
    };
  },
  computed: {
    isFormValid() {
      return (
        this.form.username &&
        this.form.email &&
        this.form.phone &&
        this.form.password &&
        this.form.password_confirmation &&
        !this.errors.username &&
        !this.errors.email &&
        !this.errors.phone &&
        !this.errors.password &&
        !this.errors.password_confirmation
      );
    }
  },
  methods: {
    togglePassword() {
      this.showPassword = !this.showPassword;
    },
    togglePasswordConfirm() {
      this.showPasswordConfirm = !this.showPasswordConfirm;
    },

    // Chặn ký tự không phải số khi gõ
    onlyNumbers(event) {
      const charCode = event.which ? event.which : event.keyCode;
      // Cho phép: số (48-57), backspace, delete, tab, escape, enter, arrows
      if (
        (charCode < 48 || charCode > 57) && // Không phải số
        charCode !== 8 && // Backspace
        charCode !== 46 && // Delete
        charCode !== 9 && // Tab
        charCode !== 27 && // Escape
        charCode !== 13 // Enter
      ) {
        event.preventDefault();
      }
    },

    // Validation methods
    validateUsername() {
      const username = this.form.username;
      
      if (!username) {
        this.errors.username = 'Tên tài khoản là bắt buộc';
      } else if (username.length < 3) {
        this.errors.username = 'Tên tài khoản phải có ít nhất 3 ký tự';
      } else if (username.length > 50) {
        this.errors.username = 'Tên tài khoản không được vượt quá 50 ký tự';
      } else if (!/^[a-zA-Z0-9_]+$/.test(username)) {
        this.errors.username = 'Chỉ được chứa chữ cái, số và dấu gạch dưới';
      } else if (/<|>/.test(username)) {
        this.errors.username = 'Không được chứa ký tự đặc biệt';
      } else {
        this.errors.username = '';
      }
    },

    validateEmail() {
      const email = this.form.email;
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      
      if (!email) {
        this.errors.email = 'Email là bắt buộc';
      } else if (!emailRegex.test(email)) {
        this.errors.email = 'Email không đúng định dạng';
      } else if (email.length > 255) {
        this.errors.email = 'Email không được vượt quá 255 ký tự';
      } else if (/<|>/.test(email)) {
        this.errors.email = 'Email không hợp lệ';
      } else {
        this.errors.email = '';
      }
    },

    validatePhone() {
      // Chỉ cho phép nhập số, xóa tất cả ký tự khác
      this.form.phone = this.form.phone.replace(/[^0-9]/g, '');
      
      const phone = this.form.phone;
      
      if (!phone) {
        this.errors.phone = 'Số điện thoại là bắt buộc';
      } else if (phone.length < 9) {
        this.errors.phone = 'Số điện thoại phải có ít nhất 9 số';
      } else if (phone.length > 11) {
        this.errors.phone = 'Số điện thoại không được quá 11 số';
      } else {
        this.errors.phone = '';
      }
    },

    validatePassword() {
      const password = this.form.password;
      
      if (!password) {
        this.errors.password = 'Mật khẩu là bắt buộc';
      } else if (password.length < 8) {
        this.errors.password = 'Mật khẩu phải có ít nhất 8 ký tự';
      } else if (password.length > 255) {
        this.errors.password = 'Mật khẩu quá dài';
      } else if (/<|>/.test(password)) {
        this.errors.password = 'Mật khẩu không được chứa < hoặc >';
      } else {
        this.errors.password = '';
      }

      // Validate password confirmation nếu đã nhập
      if (this.form.password_confirmation) {
        this.validatePasswordConfirmation();
      }
    },

    validatePasswordConfirmation() {
      if (!this.form.password_confirmation) {
        this.errors.password_confirmation = 'Vui lòng xác nhận mật khẩu';
      } else if (this.form.password !== this.form.password_confirmation) {
        this.errors.password_confirmation = 'Mật khẩu không khớp';
      } else {
        this.errors.password_confirmation = '';
      }
    },

    showSuccessToast(message, countdown = 2) {
      let timeLeft = countdown;
      const toastId = `success-toast-${Date.now()}`;
      
      const showToast = () => {
        this.$bvToast.toast(`${message} Chuyển hướng sau ${timeLeft}s...`, {
          id: toastId,
          title: 'Đăng ký thành công',
          variant: 'success',
          solid: true,
          noAutoHide: true,
          toaster: 'b-toaster-top-center',
        });
      };

      showToast();

      const interval = setInterval(() => {
        timeLeft--;
        if (timeLeft > 0) {
          this.$bvToast.hide(toastId);
          showToast();
        } else {
          clearInterval(interval);
          this.$bvToast.hide(toastId);
        }
      }, 1000);
    },

    showErrorToast(message) {
      this.$bvToast.toast(message, {
        title: 'Lỗi',
        variant: 'danger',
        solid: true,
        autoHideDelay: 5000,
        toaster: 'b-toaster-top-center',
      });
    },

    handleRegister() {
      // Validate tất cả trước khi submit
      this.validateUsername();
      this.validateEmail();
      this.validatePhone();
      this.validatePassword();
      this.validatePasswordConfirmation();

      if (!this.isFormValid) {
        this.showErrorToast('Vui lòng kiểm tra lại thông tin');
        return;
      }

      this.isLoading = true;
      const apiUrl = process.env.VUE_APP_API_URL || 'http://localhost:8088';

      axios.post(`${apiUrl}/api/register`, this.form)
        .then(response => {
          this.isLoading = false;
          
          if (response.data.success) {
            this.showSuccessToast('Đăng ký thành công! Đang chuyển đến trang đăng nhập...');
            
            setTimeout(() => {
              this.$router.push('/login');
            }, 2000);
          }
        })
        .catch(error => {
          this.isLoading = false;
          
          if (error.response && error.response.status === 422) {
            const serverErrors = error.response.data.errors;
            
            // Hiển thị lỗi từ server
            for (let field in serverErrors) {
              if (Array.isArray(serverErrors[field])) {
                this.errors[field] = serverErrors[field][0];
                this.showErrorToast(serverErrors[field][0]);
              }
            }
          } else if (error.response && error.response.status === 500) {
            this.showErrorToast('Lỗi server. Vui lòng thử lại sau');
          } else {
            this.showErrorToast('Không thể kết nối đến server');
          }
          
          console.error('Lỗi đăng ký:', error);
        });
    }
  }
};
</script>

<style scoped>
/* Font chữ */
.font-cursive {
  font-family: 'Dancing Script', cursive;
  font-weight: 700;
}

.font-serif {
  font-family: 'Lora', serif;
  font-weight: 600;
}

/* Container */
.register-page-container {
  min-height: 100vh;
  background-color: #ffffff;
}

/* Label */
.form-label {
  color: #4a5568;
  font-size: 0.875rem;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

/* Input */
.minimal-input {
  background-color: #f3f4f6 !important;
  border: 0 !important;
  border-radius: 0 !important;
  padding-top: 0.75rem !important;
  padding-bottom: 0.75rem !important;
  box-shadow: none !important;
  transition: all 0.2s ease;
}

.minimal-input:focus {
  background-color: #f3f4f6 !important;
  border: 0 !important;
  box-shadow: 0 0 0 2px #60a5fa !important;
}

/* Input invalid */
.is-invalid-custom {
  box-shadow: 0 0 0 2px #ef4444 !important;
}

.is-invalid-custom:focus {
  box-shadow: 0 0 0 2px #dc2626 !important;
}

/* Prepend */
.minimal-prepend .input-group-text {
  background-color: #f3f4f6 !important;
  border: 0 !important;
  border-radius: 0 !important;
  color: #4b5563;
}

/* Button */
.minimal-button {
  background-color: #60a5fa !important;
  border-color: #60a5fa !important;
  border-radius: 0 !important;
  text-transform: uppercase !important;
  font-weight: 600 !important;
  padding-top: 0.75rem !important;
  padding-bottom: 0.75rem !important;
  transition: all 0.2s ease-in-out;
}

.minimal-button:hover:not(:disabled) {
  background-color: #3b82f6 !important;
  border-color: #3b82f6 !important;
}

.minimal-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>

<style>
/* Toast styles - Global */
.b-toaster-top-center {
  top: 20px !important;
}

.toast {
  border-radius: 0.5rem !important;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05) !important;
}

.toast-header {
  border-radius: 0.5rem 0.5rem 0 0 !important;
  font-weight: 600 !important;
}

.toast-body {
  font-size: 0.95rem !important;
  padding: 1rem !important;
}
</style>