<template>
    <div class="verify-otp-page-container">
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
                            Xác thực OTP
                        </h1>
                        <p class="text-center text-muted mb-4">
                            Mã OTP đã được gửi đến email: <br>
                            <strong>{{ email }}</strong>
                        </p>
                        <p class="text-center text-muted small mb-5">
                            Mã có hiệu lực trong 5 phút
                        </p>

                        <b-form @submit.prevent="handleVerifyOtp">

                            <b-form-group label="Mã OTP (6 số)" label-class="form-label">
                                <b-form-input 
                                    v-model="otpCode" 
                                    type="text" 
                                    maxlength="6"
                                    class="minimal-input text-center otp-input"
                                    placeholder="000000"
                                    pattern="[0-9]{6}"
                                    required
                                    :disabled="isLoading"
                                    @input="formatOtpInput">
                                </b-form-input>
                            </b-form-group>

                            <div v-if="apiError" class="alert alert-danger mt-3" role="alert">
                                {{ apiError }}
                            </div>

                            <div v-if="successMessage" class="alert alert-success mt-3" role="alert">
                                {{ successMessage }}
                            </div>

                            <b-button 
                                type="submit" 
                                class="minimal-button w-100 mt-4" 
                                :disabled="isLoading || otpCode.length !== 6">
                                <span v-if="isLoading">
                                    <b-spinner small class="me-2"></b-spinner>
                                    Đang xác thực...
                                </span>
                                <span v-else>XÁC THỰC</span>
                            </b-button>
                        </b-form>

                        <div class="mt-4 text-center">
                            <p class="text-muted small">
                                Không nhận được mã?
                                <a 
                                    href="#" 
                                    @click.prevent="handleResendOtp" 
                                    class="text-primary font-weight-bold"
                                    :class="{ 'disabled-link': isResending || countdown > 0 }">
                                    <span v-if="countdown > 0">
                                        Gửi lại sau {{ countdown }}s
                                    </span>
                                    <span v-else-if="isResending">
                                        Đang gửi lại...
                                    </span>
                                    <span v-else>
                                        Gửi lại mã OTP
                                    </span>
                                </a>
                            </p>
                        </div>

                        <div class="mt-3 text-center">
                            <router-link to="/forgot-password" class="text-primary font-weight-bold">
                                <i class="fas fa-arrow-left me-2"></i>
                                Quay lại
                            </router-link>
                        </div>

                    </b-col>
                </b-row>
            </b-container>
        </main>
    </div>
</template>

<script>
import api from '@/api';

export default {
    name: 'VerifyOtp',
    data() {
        return {
            email: '',
            otpCode: '',
            apiError: null,
            successMessage: null,
            isLoading: false,
            isResending: false,
            countdown: 0,
            countdownTimer: null
        };
    },
    created() {
        // Lấy email từ query params
        this.email = this.$route.query.email;
        
        // Nếu không có email, redirect về forgot-password
        if (!this.email) {
            this.$router.push('/forgot-password');
        }
    },
    beforeUnmount() {
        // Clear countdown timer khi component bị destroy
        if (this.countdownTimer) {
            clearInterval(this.countdownTimer);
        }
    },
    methods: {
        formatOtpInput() {
            // Chỉ cho phép nhập số
            this.otpCode = this.otpCode.replace(/[^0-9]/g, '');
        },
        async handleVerifyOtp() {
            this.apiError = null;
            this.successMessage = null;
            this.isLoading = true;

            try {
                const response = await api.post('/password-reset/verify-otp', {
                    email: this.email,
                    otp_code: this.otpCode
                });

                this.isLoading = false;
                this.successMessage = response.data.message;

                // Chuyển sang trang reset password sau 1.5 giây
                setTimeout(() => {
                    this.$router.push({
                        name: 'ResetPassword',
                        query: { 
                            email: this.email,
                            otp: this.otpCode 
                        }
                    });
                }, 1500);

            } catch (error) {
                this.isLoading = false;
                if (error.response) {
                    if (error.response.status === 422) {
                        const errors = error.response.data.errors;
                        this.apiError = errors.otp_code ? errors.otp_code[0] : 'Mã OTP không hợp lệ';
                    } else if (error.response.status === 404) {
                        this.apiError = 'Mã OTP không tồn tại hoặc đã hết hạn';
                    } else if (error.response.status === 410) {
                        this.apiError = 'Mã OTP đã hết hạn. Vui lòng yêu cầu mã mới.';
                    } else if (error.response.status === 401) {
                        this.apiError = 'Mã OTP không chính xác. Vui lòng kiểm tra lại.';
                    } else {
                        this.apiError = error.response.data.message || 'Đã có lỗi xảy ra';
                    }
                } else {
                    this.apiError = 'Không thể kết nối đến server. Vui lòng thử lại sau.';
                }
            }
        },
        async handleResendOtp() {
            if (this.isResending || this.countdown > 0) return;

            this.apiError = null;
            this.successMessage = null;
            this.isResending = true;

            try {
                const response = await api.post('/password-reset/send-otp', {
                    email: this.email
                });

                this.isResending = false;
                this.successMessage = 'Mã OTP mới đã được gửi đến email của bạn';
                this.otpCode = ''; // Clear OTP input

                // Bắt đầu countdown 60 giây
                this.startCountdown(60);

            } catch (error) {
                this.isResending = false;
                if (error.response) {
                    this.apiError = error.response.data.message || 'Không thể gửi lại mã OTP';
                } else {
                    this.apiError = 'Không thể kết nối đến server';
                }
            }
        },
        startCountdown(seconds) {
            this.countdown = seconds;
            this.countdownTimer = setInterval(() => {
                this.countdown--;
                if (this.countdown <= 0) {
                    clearInterval(this.countdownTimer);
                }
            }, 1000);
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
.verify-otp-page-container {
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

/* OTP Input đặc biệt */
.otp-input {
    font-size: 1.5rem !important;
    font-weight: 600 !important;
    letter-spacing: 0.5rem !important;
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

/* Disabled link */
.disabled-link {
    opacity: 0.5;
    cursor: not-allowed !important;
    pointer-events: none;
}
</style>