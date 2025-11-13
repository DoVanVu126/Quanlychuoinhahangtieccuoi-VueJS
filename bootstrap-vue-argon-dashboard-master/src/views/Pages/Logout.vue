<template>
    <div class="logout-page-container">
        <header class="border-bottom py-4">
            <b-container>
                <div class="font-cursive h1 text-dark mb-0">Wedding</div>
            </b-container>
        </header>

        <main class="py-5">
            <b-container>
                <b-row class="justify-content-center">
                    <b-col md="6" lg="5">

                        <div class="text-center mb-4">
                            <i class="fas fa-sign-out-alt text-primary" style="font-size: 4rem;"></i>
                        </div>

                        <h1 class="font-serif text-center display-4 mb-3">
                            Đăng xuất
                        </h1>
                        <p class="text-center text-muted mb-5">
                            Bạn có chắc chắn muốn đăng xuất?
                        </p>

                        <!-- Checkbox quên tài khoản đã lưu -->
                        <div v-if="hasRememberedAccount" class="mb-4">
                            <b-card class="border-0 bg-light">
                                <b-form-checkbox v-model="forgetRememberedAccount">
                                    <span class="text-dark">
                                        Quên tài khoản đã lưu 
                                        <strong>"{{ rememberedLogin }}"</strong>
                                    </span>
                                </b-form-checkbox>
                                <small class="text-muted d-block mt-2">
                                    Nếu chọn, bạn sẽ cần nhập lại tên tài khoản/email khi đăng nhập lần sau
                                </small>
                            </b-card>
                        </div>

                        <div class="d-flex gap-3">
                            <b-button 
                                variant="outline-secondary" 
                                class="flex-fill outline-button"
                                @click="cancelLogout">
                                <i class="fas fa-arrow-left me-2"></i>
                                HỦY
                            </b-button>

                            <b-button 
                                variant="danger" 
                                class="flex-fill danger-button"
                                @click="confirmLogout"
                                :disabled="isLoggingOut">
                                <span v-if="isLoggingOut">
                                    <b-spinner small class="me-2"></b-spinner>
                                    Đang xử lý...
                                </span>
                                <span v-else>
                                    <i class="fas fa-sign-out-alt me-2"></i>
                                    ĐĂNG XUẤT
                                </span>
                            </b-button>
                        </div>

                    </b-col>
                </b-row>
            </b-container>
        </main>
    </div>
</template>

<script>
export default {
    name: 'Logout',
    data() {
        return {
            forgetRememberedAccount: false,
            hasRememberedAccount: false,
            rememberedLogin: '',
            isLoggingOut: false
        };
    },
    mounted() {
        // Kiểm tra xem có tài khoản đã lưu không
        this.checkRememberedAccount();
    },
    methods: {
        /**
         * Kiểm tra localStorage xem có tài khoản đã lưu không
         */
        checkRememberedAccount() {
            const rememberedLogin = localStorage.getItem('remembered_login');
            const rememberMe = localStorage.getItem('remember_me');

            if (rememberedLogin && rememberMe === 'true') {
                this.hasRememberedAccount = true;
                this.rememberedLogin = rememberedLogin;
            }
        },

        /**
         * Hủy đăng xuất, quay lại trang trước
         */
        cancelLogout() {
            this.$router.go(-1); // Quay lại trang trước đó
        },

        /**
         * Xác nhận đăng xuất
         */
        confirmLogout() {
            this.isLoggingOut = true;

            // Simulate loading để UX mượt hơn
            setTimeout(() => {
                // 1. Xóa token và user info
                localStorage.removeItem('user_token');
                localStorage.removeItem('user_info');

                // 2. Xóa tài khoản đã nhớ (nếu user chọn quên)
                if (this.forgetRememberedAccount) {
                    localStorage.removeItem('remembered_login');
                    localStorage.removeItem('remember_me');
                }

                // 3. Hiển thị thông báo
                this.$bvToast.toast('Bạn đã đăng xuất thành công', {
                    title: 'Đăng xuất',
                    variant: 'success',
                    solid: true,
                    autoHideDelay: 2000
                });

                this.isLoggingOut = false;

                // 4. Chuyển hướng về trang login
                this.$router.push('/login');
            }, 500);
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
.logout-page-container {
    min-height: 100vh;
    background-color: #ffffff;
}

/* Button outline */
.outline-button {
    border-radius: 0 !important;
    text-transform: uppercase !important;
    font-weight: 600 !important;
    padding-top: 0.75rem !important;
    padding-bottom: 0.75rem !important;
    transition: all 0.2s ease-in-out;
}

.outline-button:hover {
    background-color: #6c757d !important;
    border-color: #6c757d !important;
    color: white !important;
}

/* Button danger */
.danger-button {
    background-color: #dc3545 !important;
    border-color: #dc3545 !important;
    border-radius: 0 !important;
    text-transform: uppercase !important;
    font-weight: 600 !important;
    padding-top: 0.75rem !important;
    padding-bottom: 0.75rem !important;
    transition: background-color 0.2s ease-in-out;
}

.danger-button:hover:not(:disabled) {
    background-color: #c82333 !important;
    border-color: #bd2130 !important;
}

.danger-button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

/* Gap utility for flex */
.gap-3 {
    gap: 1rem;
}
</style>