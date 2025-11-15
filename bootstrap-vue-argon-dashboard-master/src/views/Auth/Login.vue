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

                            <!-- Login Field -->
                            <b-form-group label="Tên tài khoản hoặc Email" label-class="form-label">
                                <b-form-input 
                                    v-model="form.login" 
                                    type="text" 
                                    class="minimal-input"
                                    :class="{ 'is-invalid-custom': errors.login }"
                                    :state="errors.login ? false : null"
                                    placeholder="Nhập tài khoản hoặc email"
                                    @input="validateLogin"
                                    @blur="validateLogin">
                                </b-form-input>
                                <small v-if="errors.login" class="text-danger d-block mt-1">
                                    {{ errors.login }}
                                </small>
                            </b-form-group>

                            <!-- Password Field -->
                            <b-form-group label="Mật khẩu" label-class="form-label" class="mt-4">
                                <div class="position-relative">
                                    <b-form-input 
                                        v-model="form.password" 
                                        :type="showPassword ? 'text' : 'password'"
                                        class="minimal-input pe-5"
                                        :class="{ 'is-invalid-custom': errors.password }"
                                        placeholder="Nhập mật khẩu"
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

                            <div class="d-flex justify-content-between align-items-center mt-3">
                                <b-form-checkbox v-model="form.remember">
                                    <span class="text-muted">Nhớ tài khoản</span>
                                </b-form-checkbox>

                                <router-link to="/forgot-password" class="text-primary font-weight-bold small">
                                    Quên mật khẩu?
                                </router-link>
                            </div>

                            <b-button 
                                type="submit" 
                                class="minimal-button w-100 mt-4" 
                                :disabled="isLoading || !isFormValid">
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
            errors: {
                login: '',
                password: ''
            },
            showPassword: false,
            isLoading: false
        };
    },
    computed: {
        isFormValid() {
            return (
                this.form.login &&
                this.form.password &&
                !this.errors.login &&
                !this.errors.password
            );
        }
    },
    mounted() {
        this.loadRememberedAccount();
    },
    methods: {
        togglePassword() {
            this.showPassword = !this.showPassword;
        },

        // Validation methods
        validateLogin() {
            const login = this.form.login;
            
            if (!login) {
                this.errors.login = 'Tên tài khoản hoặc email là bắt buộc';
            } else if (login.length > 255) {
                this.errors.login = 'Tên đăng nhập quá dài';
            } else if (/<|>/.test(login)) {
                this.errors.login = 'Không được chứa ký tự đặc biệt';
            } else {
                this.errors.login = '';
            }
        },

        validatePassword() {
            const password = this.form.password;
            
            if (!password) {
                this.errors.password = 'Mật khẩu là bắt buộc';
            } else if (password.length > 255) {
                this.errors.password = 'Mật khẩu quá dài';
            } else {
                this.errors.password = '';
            }
        },

        loadRememberedAccount() {
            const rememberedLogin = localStorage.getItem('remembered_login');
            const rememberMe = localStorage.getItem('remember_me');

            if (rememberedLogin && rememberMe === 'true') {
                this.form.login = rememberedLogin;
                this.form.remember = true;
            }
        },

        handleRememberAccount() {
            if (this.form.remember) {
                localStorage.setItem('remembered_login', this.form.login);
                localStorage.setItem('remember_me', 'true');
            } else {
                localStorage.removeItem('remembered_login');
                localStorage.removeItem('remember_me');
            }
        },

        showSuccessToast(message) {
            this.$bvToast.toast(message, {
                title: 'Thành công',
                variant: 'success',
                solid: true,
                autoHideDelay: 2000,
                toaster: 'b-toaster-top-center',
            });
        },

        showErrorToast(message) {
            this.$bvToast.toast(message, {
                title: 'Lỗi đăng nhập',
                variant: 'danger',
                solid: true,
                autoHideDelay: 4000,
                toaster: 'b-toaster-top-center',
            });
        },

        handleLogin() {
            // Validate trước khi submit
            this.validateLogin();
            this.validatePassword();

            if (!this.isFormValid) {
                this.showErrorToast('Vui lòng kiểm tra lại thông tin đăng nhập');
                return;
            }

            this.isLoading = true;
            const apiUrl = process.env.VUE_APP_API_URL || 'http://localhost:8088';

            axios.post(`${apiUrl}/api/login`, {
                login: this.form.login,
                password: this.form.password
            })
                .then(response => {
                    this.isLoading = false;

                    if (response.data.success) {
                        const user = response.data.user;
                        const token = response.data.access_token;

                        // Lưu token & user vào localStorage
                        localStorage.setItem('user_token', token);
                        localStorage.setItem('user_info', JSON.stringify(user));

                        // Xử lý "Nhớ tài khoản"
                        this.handleRememberAccount();

                        // Hiển thị thông báo thành công
                        this.showSuccessToast('Chào mừng bạn quay trở lại!');

                        // Chuyển hướng đến dashboard
                        setTimeout(() => {
                            this.$router.push('/dashboard');
                        }, 1000);
                    }
                })
                .catch(error => {
                    this.isLoading = false;
                    
                    if (error.response) {
                        if (error.response.status === 422 || error.response.status === 401) {
                            const errorData = error.response.data;
                            
                            // Hiển thị lỗi từ server
                            if (errorData.errors) {
                                for (let field in errorData.errors) {
                                    if (Array.isArray(errorData.errors[field])) {
                                        this.errors[field] = errorData.errors[field][0];
                                    }
                                }
                            }
                            
                            const message = errorData.message || 'Tài khoản hoặc mật khẩu không chính xác';
                            this.showErrorToast(message);
                        } else if (error.response.status === 500) {
                            this.showErrorToast('Lỗi server. Vui lòng thử lại sau');
                        } else {
                            this.showErrorToast('Đã có lỗi xảy ra. Vui lòng thử lại');
                        }
                    } else {
                        this.showErrorToast('Không thể kết nối đến server');
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

/* Input invalid - CSS mạnh hơn */
.minimal-input.is-invalid-custom {
    box-shadow: 0 0 0 3px #ef4444 !important;
    background-color: #fef2f2 !important;
}

.minimal-input.is-invalid-custom:focus {
    box-shadow: 0 0 0 3px #dc2626 !important;
    background-color: #fef2f2 !important;
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