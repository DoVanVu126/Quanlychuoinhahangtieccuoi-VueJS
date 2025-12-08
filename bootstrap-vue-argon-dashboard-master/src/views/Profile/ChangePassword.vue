<template>
    <div class="change-password-container">
        <div class="d-flex align-items-center justify-content-between mb-4">
            <h2 class="profile-title mb-0">Đổi mật khẩu</h2>
            <div class="title-decoration"></div>
        </div>

        <hr class="mb-4" />

        <b-form @submit.prevent="handleChangePassword" class="password-form">

            <h6 class="text-muted mb-4">Bảo mật tài khoản</h6>

            <b-form-group label="Mật khẩu cũ" label-class="profile-label" class="mb-4">
                <div class="position-relative">
                    <b-form-input v-model="passwordForm.current_password"
                        :type="showCurrentPassword ? 'text' : 'password'" class="profile-input pe-5"
                        :class="{ 'is-invalid-custom': errors.current_password }"
                        :state="errors.current_password ? false : null" placeholder="Nhập mật khẩu hiện tại"
                        @input="clearError('current_password')">
                    </b-form-input>
                    <i class="fas" :class="showCurrentPassword ? 'fa-eye-slash' : 'fa-eye'"
                        @click="showCurrentPassword = !showCurrentPassword"
                        style="position: absolute; right: 10px; top: 50%; transform: translateY(-50%); cursor: pointer; color: #6b7280;">
                    </i>
                </div>
                <small v-if="errors.current_password" class="text-danger d-block mt-1">
                    {{ errors.current_password }}
                </small>
            </b-form-group>

            <b-form-group label="Mật khẩu mới" label-class="profile-label" class="mb-4">
                <div class="position-relative">
                    <b-form-input v-model="passwordForm.new_password" :type="showNewPassword ? 'text' : 'password'"
                        class="profile-input pe-5" :class="{ 'is-invalid-custom': errors.new_password }"
                        :state="errors.new_password ? false : null" placeholder="Tối thiểu 8 ký tự"
                        @input="validateNewPassword">
                    </b-form-input>
                    <i class="fas" :class="showNewPassword ? 'fa-eye-slash' : 'fa-eye'"
                        @click="showNewPassword = !showNewPassword"
                        style="position: absolute; right: 10px; top: 50%; transform: translateY(-50%); cursor: pointer; color: #6b7280;">
                    </i>
                </div>
                <small v-if="errors.new_password" class="text-danger d-block mt-1">
                    {{ errors.new_password }}
                </small>

                <div v-if="passwordForm.new_password" class="mt-2">
                    <div class="d-flex align-items-center">
                        <small class="text-muted me-2">Độ mạnh:</small>
                        <div class="flex-grow-1">
                            <b-progress :max="100" height="5px">
                                <b-progress-bar :value="passwordStrength.value" :variant="passwordStrength.color">
                                </b-progress-bar>
                            </b-progress>
                        </div>
                        <small class="ms-2" :class="'text-' + passwordStrength.color">
                            {{ passwordStrength.text }}
                        </small>
                    </div>
                </div>
            </b-form-group>

            <b-form-group label="Xác nhận mật khẩu mới" label-class="profile-label" class="mb-4">
                <div class="position-relative">
                    <b-form-input v-model="passwordForm.new_password_confirmation"
                        :type="showConfirmPassword ? 'text' : 'password'" class="profile-input pe-5"
                        :class="{ 'is-invalid-custom': errors.new_password_confirmation }"
                        :state="errors.new_password_confirmation ? false : null" placeholder="Nhập lại mật khẩu mới"
                        @input="validateConfirmPassword">
                    </b-form-input>
                    <i class="fas" :class="showConfirmPassword ? 'fa-eye-slash' : 'fa-eye'"
                        @click="showConfirmPassword = !showConfirmPassword"
                        style="position: absolute; right: 10px; top: 50%; transform: translateY(-50%); cursor: pointer; color: #6b7280;">
                    </i>
                </div>
                <small v-if="errors.new_password_confirmation" class="text-danger d-block mt-1">
                    {{ errors.new_password_confirmation }}
                </small>

                <div v-if="passwordForm.new_password_confirmation" class="mt-2">
                    <small :class="passwordsMatch ? 'text-success' : 'text-danger'">
                        <i class="fas" :class="passwordsMatch ? 'fa-check-circle' : 'fa-times-circle'"></i>
                        {{ passwordsMatch ? 'Mật khẩu khớp' : 'Mật khẩu không khớp' }}
                    </small>
                </div>
            </b-form-group>

            <hr class="my-4" />

            <div class="text-left">
                <b-button type="submit" variant="success" class="profile-btn-primary"
                    :disabled="isUpdating || !isFormValid">
                    <span v-if="isUpdating">
                        <b-spinner small class="me-2"></b-spinner>
                        Đang lưu...
                    </span>
                    <span v-else>
                        <i class="fas fa-lock me-2"></i>
                        Xác nhận đổi mật khẩu
                    </span>
                </b-button>
            </div>
        </b-form>
    </div>
</template>

<script>
import axios from 'axios';

export default {
    name: 'ChangePassword',
    data() {
        return {
            passwordForm: {
                current_password: '',
                new_password: '',
                new_password_confirmation: ''
            },
            errors: {
                current_password: '',
                new_password: '',
                new_password_confirmation: ''
            },
            showCurrentPassword: false,
            showNewPassword: false,
            showConfirmPassword: false,
            isUpdating: false,
            backendUrl: process.env.VUE_APP_API_URL || 'http://localhost:8088'
        };
    },
    computed: {
        passwordsMatch() {
            if (!this.passwordForm.new_password_confirmation) return true;
            return this.passwordForm.new_password === this.passwordForm.new_password_confirmation;
        },

        passwordStrength() {
            const password = this.passwordForm.new_password;
            if (!password) return { value: 0, color: 'secondary', text: '' };

            let strength = 0;

            if (password.length >= 8) strength += 25;
            if (password.length >= 12) strength += 25;
            if (/[a-z]/.test(password)) strength += 12.5;
            if (/[A-Z]/.test(password)) strength += 12.5;
            if (/[0-9]/.test(password)) strength += 12.5;
            if (/[^A-Za-z0-9]/.test(password)) strength += 12.5;

            if (strength < 40) return { value: strength, color: 'danger', text: 'Yếu' };
            if (strength < 70) return { value: strength, color: 'warning', text: 'Trung bình' };
            return { value: strength, color: 'success', text: 'Mạnh' };
        },

        isFormValid() {
            return (
                this.passwordForm.current_password &&
                this.passwordForm.new_password &&
                this.passwordForm.new_password_confirmation &&
                this.passwordsMatch &&
                this.passwordForm.new_password.length >= 8 &&
                !this.errors.current_password &&
                !this.errors.new_password &&
                !this.errors.new_password_confirmation
            );
        }
    },
    methods: {
        clearError(field) {
            this.errors[field] = '';
        },

        validateNewPassword() {
            const password = this.passwordForm.new_password;
            const current_password = this.passwordForm.current_password;

            if (!password) {
                this.errors.new_password = 'Mật khẩu mới là bắt buộc';
            } else if (password.length < 8) {
                this.errors.new_password = 'Mật khẩu phải có ít nhất 8 ký tự';
            } else if (password.length > 255) {
                this.errors.new_password = 'Mật khẩu quá dài';
            } else if (/<|>/.test(password)) {
                this.errors.new_password = 'Mật khẩu không được chứa < hoặc >';
            } else if (current_password && password === current_password) {
                this.errors.new_password = 'Mật khẩu mới không được trùng với mật khẩu cũ.';
            } else {
                this.errors.new_password = '';
            }

            if (this.passwordForm.new_password_confirmation) {
                this.validateConfirmPassword();
            }
        },

        validateConfirmPassword() {
            if (!this.passwordForm.new_password_confirmation) {
                this.errors.new_password_confirmation = 'Vui lòng xác nhận mật khẩu';
            } else if (this.passwordForm.new_password !== this.passwordForm.new_password_confirmation) {
                this.errors.new_password_confirmation = 'Mật khẩu không khớp';
            } else {
                this.errors.new_password_confirmation = '';
            }
        },

        async handleChangePassword() {
            // Validate tất cả
            if (!this.passwordForm.current_password) {
                this.errors.current_password = 'Mật khẩu cũ là bắt buộc';
            }
            this.validateNewPassword();
            this.validateConfirmPassword();

            if (!this.isFormValid) {
                this.showErrorToast('Vui lòng kiểm tra lại thông tin');
                return;
            }

            // --- 1. LẤY TOKEN TỪ LOCALSTORAGE (SỬA LỖI 401) ---
            const token = localStorage.getItem('token');
            if (!token) {
                this.showErrorToast('Bạn chưa đăng nhập hoặc phiên làm việc đã hết hạn.');
                // Có thể redirect về trang login ở đây: this.$router.push('/login');
                return;
            }

            this.isUpdating = true;

            try {
                // --- 2. GỬI KÈM TOKEN VÀO HEADER ---
                const response = await axios.put(
                    this.backendUrl + '/api/changePassword',
                    this.passwordForm,
                    {
                        headers: {
                            'Authorization': `Bearer ${token}` // QUAN TRỌNG
                        }
                    }
                );

                const message = response.data.message || 'Đổi mật khẩu thành công!';
                this.showSuccessToast(message);

                // Reset form
                this.passwordForm.current_password = '';
                this.passwordForm.new_password = '';
                this.passwordForm.new_password_confirmation = '';
                this.errors = {};

            } catch (error) {
                console.error('Lỗi đổi mật khẩu:', error);

                if (error.response) {
                    // Lỗi 422 (Validation)
                    if (error.response.status === 422) {
                        const serverErrors = error.response.data.errors;

                        for (let field in serverErrors) {
                            if (Array.isArray(serverErrors[field])) {
                                this.errors[field] = serverErrors[field][0];
                            }
                        }

                        // Ưu tiên hiển thị lỗi "Mật khẩu cũ"
                        if (serverErrors.current_password) {
                            this.showErrorToast(serverErrors.current_password[0]);
                        } else {
                            this.showErrorToast('Dữ liệu không hợp lệ. Vui lòng kiểm tra lại');
                        }

                    } 
                    // Lỗi 401 (Unauthorized - Token sai/hết hạn)
                    else if (error.response.status === 401) {
                        this.showErrorToast('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.');
                        // Xóa token cũ để người dùng đăng nhập lại
                        localStorage.removeItem('token');
                        localStorage.removeItem('user');
                        setTimeout(() => this.$router.push('/login'), 2000);
                    } 
                    else {
                        this.showErrorToast('Đã xảy ra lỗi. Vui lòng thử lại');
                    }
                } else {
                    this.showErrorToast('Không thể kết nối đến server');
                }

            } finally {
                this.isUpdating = false;
            }
        },

        showSuccessToast(message) {
            this.$bvToast.toast(message, {
                title: 'Thành công',
                variant: 'success',
                solid: true,
                autoHideDelay: 3000,
                toaster: 'b-toaster-top-center',
            });
        },

        showErrorToast(message) {
            this.$bvToast.toast(message, {
                title: 'Lỗi',
                variant: 'danger',
                solid: true,
                autoHideDelay: 4000,
                toaster: 'b-toaster-top-center',
            });
        }
    }
};
</script>

<style scoped>
.change-password-container {
    animation: fade-in 0.4s ease;
}

@keyframes fade-in {
    from {
        opacity: 0;
        transform: translateY(10px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

/* Header */
.profile-title {
    font-family: 'Lora', serif;
    font-size: 2rem;
    font-weight: 600;
    color: #1f2937;
}

.title-decoration {
    height: 4px;
    width: 64px;
    background: linear-gradient(to right, #86efac, #60a5fa);
    border-radius: 9999px;
}

/* Labels */
.profile-label {
    font-size: 0.875rem;
    font-weight: 600;
    color: #374151;
    margin-bottom: 0.5rem;
}

/* Inputs */
.profile-input {
    padding: 0.75rem;
    border: 1px solid #d1d5db;
    border-radius: 0.5rem;
    transition: all 0.2s ease;
}

.profile-input:focus {
    border-color: #86efac;
    box-shadow: 0 0 0 3px rgba(134, 239, 172, 0.2);
}

/* Input invalid - CSS mạnh hơn */
.profile-input.is-invalid-custom {
    box-shadow: 0 0 0 3px #ef4444 !important;
    background-color: #fef2f2 !important;
}

.profile-input.is-invalid-custom:focus {
    box-shadow: 0 0 0 3px #dc2626 !important;
    background-color: #fef2f2 !important;
}

/* Button */
.profile-btn-primary {
    padding: 0.75rem 1.5rem;
    font-weight: 600;
    border-radius: 0.5rem;
    background: linear-gradient(to right, #86efac, #4ade80);
    border: none;
    transition: all 0.2s ease;
}

.profile-btn-primary:hover:not(:disabled) {
    background: linear-gradient(to right, #4ade80, #22c55e);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(74, 222, 128, 0.3);
}

.profile-btn-primary:disabled {
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