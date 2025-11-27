<template>
    <div class="forgot-password-page-container">
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
                            Quên mật khẩu
                        </h1>
                        <p class="text-center text-muted mb-5">
                            Nhập email của bạn để nhận mã OTP
                        </p>

                        <b-form @submit.prevent="handleSendOtp">

                            <b-form-group label="Email" label-class="form-label">
                                <b-form-input 
                                    v-model="email" 
                                    type="email" 
                                    class="minimal-input"
                                    placeholder="Nhập địa chỉ email của bạn" 
                                    required
                                    :disabled="isLoading">
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
                                :disabled="isLoading">
                                <span v-if="isLoading">
                                    <b-spinner small class="me-2"></b-spinner>
                                    Đang gửi...
                                </span>
                                <span v-else>GỬI MÃ OTP</span>
                            </b-button>
                        </b-form>

                        <div class="mt-4 text-center">
                            <router-link to="/login" class="text-primary font-weight-bold">
                                <i class="fas fa-arrow-left me-2"></i>
                                Quay lại đăng nhập
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
    name: 'ForgotPassword',
    data() {
        return {
            email: '',
            apiError: null,
            successMessage: null,
            isLoading: false
        };
    },
    methods: {
        async handleSendOtp() {
            this.apiError = null;
            this.successMessage = null;
            this.isLoading = true;

            try {
                const response = await api.post('/password-reset/send-otp', {
                    email: this.email
                });

                this.isLoading = false;
                this.successMessage = response.data.message;

                // Chuyển sang trang verify OTP sau 2 giây
                setTimeout(() => {
                    this.$router.push({
                        name: 'VerifyOtp',
                        query: { email: this.email }
                    });
                }, 2000);

            } catch (error) {
                this.isLoading = false;
                if (error.response) {
                    if (error.response.status === 422) {
                        const errors = error.response.data.errors;
                        this.apiError = errors.email ? errors.email[0] : 'Email không hợp lệ';
                    } else if (error.response.status === 500) {
                        this.apiError = 'Không thể gửi email. Vui lòng kiểm tra cấu hình email server.';
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
.forgot-password-page-container {
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