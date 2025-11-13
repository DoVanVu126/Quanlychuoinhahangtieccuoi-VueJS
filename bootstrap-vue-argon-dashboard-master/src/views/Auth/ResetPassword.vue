<template>
    <div class="reset-password-page-container">
        <header class="border-bottom py-4">
            <b-container>
                <div class="font-cursive h1 text-dark mb-0">Wedding</div>
            </b-container>
        </header>

        <main class="py-5">
            <b-container>
                <b-row class="justify-content-center">
                    <b-col md="6" lg="5">

                        <h1 class="font-serif text-center display-4 mb-3">
                            Đặt lại mật khẩu
                        </h1>
                        <p class="text-center text-muted mb-5">
                            Nhập mật khẩu mới cho tài khoản của bạn
                        </p>

                        <b-form @submit.prevent="handleResetPassword">

                            <b-form-group label="Mật khẩu mới" label-class="form-label">
                                <div class="position-relative">
                                    <b-form-input 
                                        v-model="form.password" 
                                        :type="showPassword ? 'text' : 'password'"
                                        class="minimal-input pe-5"
                                        placeholder="Nhập mật khẩu mới (tối thiểu 8 ký tự)"
                                        required
                                        minlength="8"
                                        :disabled="isLoading">
                                    </b-form-input>
                                    <i class="fas" 
                                        :class="showPassword ? 'fa-eye-slash' : 'fa-eye'"
                                        @click="togglePassword"
                                        style="position: absolute; right: 10px; top: 50%; transform: translateY(-50%); cursor: pointer; color: #6b7280;">
                                    </i>
                                </div>
                                <small class="text-muted">Mật khẩu phải có ít nhất 8 ký tự</small>
                            </b-form-group>

                            <b-form-group label="Xác nhận mật khẩu mới" label-class="form-label" class="mt-4">
                                <div class="position-relative">
                                    <b-form-input 
                                        v-model="form.password_confirmation" 
                                        :type="showPasswordConfirm ? 'text' : 'password'"
                                        class="minimal-input pe-5"
                                        placeholder="Nhập lại mật khẩu mới"
                                        required
                                        minlength="8"
                                        :disabled="isLoading">
                                    </b-form-input>
                                    <i class="fas" 
                                        :class="showPasswordConfirm ? 'fa-eye-slash' : 'fa-eye'"
                                        @click="togglePasswordConfirm"
                                        style="position: absolute; right: 10px; top: 50%; transform: translateY(-50%); cursor: pointer; color: #6b7280;">
                                    </i>
                                </div>
                            </b-form-group>

                            <!-- Password strength indicator -->
                            <div v-if="form.password" class="mt-3">
                                <div class="d-flex align-items-center">
                                    <small class="text-muted me-2">Độ mạnh:</small>
                                    <div class="flex-grow-1">
                                        <b-progress :max="100" height="5px">
                                            <b-progress-bar 
                                                :value="passwordStrength.value" 
                                                :variant="passwordStrength.color">
                                            </b-progress-bar>
                                        </b-progress>
                                    </div>
                                    <small class="ms-2" :class="`text-${passwordStrength.color}`">
                                        {{ passwordStrength.text }}
                                    </small>
                                </div>
                            </div>

                            <!-- Password match indicator -->
                            <div v-if="form.password_confirmation" class="mt-2">
                                <small :class="passwordsMatch ? 'text-success' : 'text-danger'">
                                    <i class="fas" :class="passwordsMatch ? 'fa-check-circle' : 'fa-times-circle'"></i>
                                    {{ passwordsMatch ? 'Mật khẩu khớp' : 'Mật khẩu không khớp' }}
                                </small>
                            </div>

                            <div v-if="apiError" class="alert alert-danger mt-3" role="alert">
                                {{ apiError }}
                            </div>

                            <div v-if="successMessage" class="alert alert-success mt-3" role="alert">
                                {{ successMessage }}
                            </div>

                            <b-button 
                                type="submit" 
                                class="minimal-button w-100 mt-4" 
                                :disabled="isLoading || !passwordsMatch || form.password.length < 8">
                                <span v-if="isLoading">
                                    <b-spinner small class="me-2"></b-spinner>
                                    Đang xử lý...
                                </span>
                                <span v-else>ĐẶT LẠI MẬT KHẨU</span>
                            </b-button>
                        </b-form>

                    </b-col>
                </b-row>
            </b-container>
        </main>
    </div>
</template>

<script>
import api from '@/api';

export default {
    name: 'ResetPassword',
    data() {
        return {
            email: '',
            otpCode: '',
            form: {
                password: '',
                password_confirmation: ''
            },
            showPassword: false,
            showPasswordConfirm: false,
            apiError: null,
            successMessage: null,
            isLoading: false
        };
    },
    computed: {
        passwordsMatch() {
            if (!this.form.password_confirmation) return true;
            return this.form.password === this.form.password_confirmation;
        },
        passwordStrength() {
            const password = this.form.password;
            if (!password) return { value: 0, color: 'secondary', text: '' };

            let strength = 0;
            
            // Length check
            if (password.length >= 8) strength += 25;
            if (password.length >= 12) strength += 25;
            
            // Contains lowercase
            if (/[a-z]/.test(password)) strength += 12.5;
            
            // Contains uppercase
            if (/[A-Z]/.test(password)) strength += 12.5;
            
            // Contains numbers
            if (/[0-9]/.test(password)) strength += 12.5;
            
            // Contains special characters
            if (/[^A-Za-z0-9]/.test(password)) strength += 12.5;

            if (strength < 40) return { value: strength, color: 'danger', text: 'Yếu' };
            if (strength < 70) return { value: strength, color: 'warning', text: 'Trung bình' };
            return { value: strength, color: 'success', text: 'Mạnh' };
        }
    },
    created() {
        // Lấy email và OTP từ query params
        this.email = this.$route.query.email;
        this.otpCode = this.$route.query.otp;
        
        // Nếu không có email hoặc OTP, redirect về forgot-password
        if (!this.email || !this.otpCode) {
            this.$router.push('/forgot-password');
        }
    },
    methods: {
        togglePassword() {
            this.showPassword = !this.showPassword;
        },
        togglePasswordConfirm() {
            this.showPasswordConfirm = !this.showPasswordConfirm;
        },
        async handleResetPassword() {
            // Validate passwords match
            if (!this.passwordsMatch) {
                this.apiError = 'Mật khẩu xác nhận không khớp';
                return;
            }

            this.apiError = null;
            this.successMessage = null;
            this.isLoading = true;

            try {
                const response = await api.post('/password-reset/reset', {
                    email: this.email,
                    otp_code: this.otpCode,
                    password: this.form.password,
                    password_confirmation: this.form.password_confirmation
                });

                this.isLoading = false;
                this.successMessage = response.data.message;

                // Chuyển về trang login sau 2 giây
                setTimeout(() => {
                    this.$router.push({
                        name: 'Login',
                        query: { 
                            message: 'Đặt lại mật khẩu thành công. Vui lòng đăng nhập với mật khẩu mới.' 
                        }
                    });
                }, 2000);

            } catch (error) {
                this.isLoading = false;
                if (error.response) {
                    if (error.response.status === 422) {
                        const errors = error.response.data.errors;
                        if (errors.password) {
                            this.apiError = errors.password[0];
                        } else if (errors.otp_code) {
                            this.apiError = errors.otp_code[0];
                        } else {
                            this.apiError = 'Dữ liệu không hợp lệ';
                        }
                    } else if (error.response.status === 404) {
                        this.apiError = 'Mã OTP không tồn tại';
                    } else if (error.response.status === 410) {
                        this.apiError = 'Mã OTP đã hết hạn. Vui lòng yêu cầu mã mới.';
                    } else if (error.response.status === 401) {
                        this.apiError = 'Mã OTP không chính xác';
                    } else {
                        this.apiError = error.response.data.message || 'Đã có lỗi xảy ra';
                    }
                } else {
                    this.apiError = 'Không thể kết nối đến server. Vui lòng thử lại sau.';
                }
            }
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

/* Nền trang */
.reset-password-page-container {
    min-height: 100vh;
    background-color: #ffffff;
}

/* Label */
.form-label {
    color: #4a5568;
    font-size: 0.875rem;
    margin-bottom: 0.5rem;
}

/* Input */
.minimal-input {
    background-color: #f3f4f6 !important;
    border: 0 !important;
    border-radius: 0 !important;
    padding-top: 0.75rem !important;
    padding-bottom: 0.75rem !important;
    box-shadow: none !important;
}

.minimal-input:focus {
    background-color: #f3f4f6 !important;
    border: 0 !important;
    box-shadow: 0 0 0 2px #60a5fa !important;
}

.minimal-input:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

/* Nút bấm */
.minimal-button {
    background-color: #60a5fa !important;
    border-color: #60a5fa !important;
    border-radius: 0 !important;
    text-transform: uppercase !important;
    font-weight: 600 !important;
    padding-top: 0.75rem !important;
    padding-bottom: 0.75rem !important;
    transition: background-color 0.2s ease-in-out;
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