<template>
    <div class="login-page-container">
        <header class="border-bottom py-4">
            <b-container>
                <div class="font-cursive h1 text-dark mb-0">Wedding</div>
            </b-container>
        </header>

        <main class="py-5">
            <b-container>
                <b-row class="justify-content-center">
                    <b-col md="6" lg="5">

                        <h1 class="font-serif text-center display-4 mb-5">
                            Đăng nhập
                        </h1>

                        <b-form @submit.prevent="handleLogin">

                            <b-form-group label="Tên tài khoản hoặc Email" label-class="form-label">
                                <b-form-input 
                                    v-model="form.login" 
                                    type="text" 
                                    class="minimal-input"
                                    placeholder="Nhập tài khoản hoặc email" 
                                    required>
                                </b-form-input>
                            </b-form-group>

                            <b-form-group label="Mật khẩu" label-class="form-label" class="mt-4">
                                <div class="position-relative">
                                    <b-form-input 
                                        v-model="form.password" 
                                        :type="showPassword ? 'text' : 'password'"
                                        class="minimal-input pe-5" 
                                        placeholder="Nhập mật khẩu"
                                        required>
                                    </b-form-input>

                                    <!-- Biểu tượng con mắt -->
                                    <i class="fas" 
                                        :class="showPassword ? 'fa-eye-slash' : 'fa-eye'"
                                        @click="togglePassword"
                                        style="position: absolute; right: 10px; top: 50%; transform: translateY(-50%); cursor: pointer; color: #6b7280;">
                                    </i>
                                </div>
                            </b-form-group>

                            <div class="d-flex justify-content-between align-items-center mt-3">
                                <b-form-checkbox v-model="form.remember">
                                    <span class="text-muted">Nhớ tài khoản</span>
                                </b-form-checkbox>

                                <router-link to="/forgot-password" class="text-primary font-weight-bold small">
                                    Quên mật khẩu?
                                </router-link>
                            </div>

                            <div v-if="apiError" class="alert alert-danger mt-3" role="alert">
                                {{ apiError }}
                            </div>

                            <b-button type="submit" class="minimal-button w-100 mt-4" :disabled="isLoading">
                                <span v-if="isLoading">
                                    <b-spinner small class="me-2"></b-spinner>
                                    Đang xử lý...
                                </span>
                                <span v-else>ĐĂNG NHẬP</span>
                            </b-button>
                        </b-form>

                        <div class="mt-4 text-center">
                            <p class="text-muted">
                                Chưa có tài khoản?
                                <router-link to="/register" class="text-primary font-weight-bold">
                                    Đăng ký ngay
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
    name: 'login',
    data() {
        return {
            form: {
                login: '',
                password: '',
                remember: false
            },
            showPassword: false,
            apiError: null,
            isLoading: false
        };
    },
    mounted() {
        // Khi component được mount, kiểm tra localStorage
        this.loadRememberedAccount();
    },
    methods: {
        togglePassword() {
            this.showPassword = !this.showPassword;
        },

        /**
         * Load tài khoản đã lưu từ localStorage
         */
        loadRememberedAccount() {
            const rememberedLogin = localStorage.getItem('remembered_login');
            const rememberMe = localStorage.getItem('remember_me');

            if (rememberedLogin && rememberMe === 'true') {
                this.form.login = rememberedLogin;
                this.form.remember = true;
            }
        },

        /**
         * Lưu hoặc xóa tài khoản khỏi localStorage
         */
        handleRememberAccount() {
            if (this.form.remember) {
                // Lưu username/email vào localStorage
                localStorage.setItem('remembered_login', this.form.login);
                localStorage.setItem('remember_me', 'true');
            } else {
                // Xóa thông tin đã lưu
                localStorage.removeItem('remembered_login');
                localStorage.removeItem('remember_me');
            }
        },

        handleLogin() {
            this.apiError = null;
            this.isLoading = true;

            const apiUrl = process.env.VUE_APP_API_URL || 'http://localhost:8088';

            axios.post(`${apiUrl}/api/login`, {
                login: this.form.login,
                password: this.form.password
            })
                .then(response => {
                    this.isLoading = false;

                    const user = response.data.user;
                    const token = response.data.access_token;

                    // Lưu token & user vào localStorage
                    localStorage.setItem('user_token', token);
                    localStorage.setItem('user_info', JSON.stringify(user));

                    // Xử lý "Nhớ tài khoản"
                    this.handleRememberAccount();

                    // Hiển thị thông báo thành công
                    this.$bvToast.toast('Chào mừng bạn quay trở lại!', {
                        title: 'Đăng nhập thành công',
                        variant: 'success',
                        solid: true,
                        autoHideDelay: 3000
                    });

                    // Chuyển hướng đến dashboard
                    this.$router.push('/dashboard');
                })
                .catch(error => {
                    this.isLoading = false;
                    if (error.response && error.response.status === 422) {
                        this.apiError = 'Tài khoản hoặc mật khẩu không chính xác.';
                    } else {
                        this.apiError = 'Đã có lỗi nghiêm trọng xảy ra. Vui lòng thử lại sau.';
                    }
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

/* Nền trang */
.login-page-container {
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