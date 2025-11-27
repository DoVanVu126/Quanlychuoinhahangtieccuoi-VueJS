<template>
    <div class="profile-page-container">
        <b-container class="py-5">
            <b-row>

                <!-- Sidebar -->
                <b-col lg="3" md="4" class="mb-4">
                    <div class="sidebar-card">
                        <div class="text-center mb-4">

                            <!-- Avatar -->
                            <div class="avatar-wrapper position-relative d-inline-block">
                                <div v-if="selectedImage" class="avatar-preview">
                                    <img :src="selectedImage" alt="Xem trước" class="avatar-image">
                                </div>

                                <div v-else-if="user && user.image_url" class="avatar-preview">
                                    <img :src="backendUrl + user.image_url" alt="Avatar" class="avatar-image">
                                </div>

                                <div v-else class="avatar-placeholder">
                                    {{ getUserInitial() }}
                                </div>

                                <button 
                                    @click="triggerFileInput"
                                    class="avatar-overlay">
                                    <i class="fas fa-camera me-2"></i>
                                    Thay đổi
                                </button>
                                
                                <input 
                                    ref="fileInput" 
                                    type="file" 
                                    accept="image/*" 
                                    class="d-none"
                                    @change="handleFileChange" 
                                />
                            </div>

                            <!-- Username -->
                            <h4 class="mt-3 mb-0 font-weight-bold">Xin chào {{ user ? user.username : '' }}</h4>
                        </div>

                        <!-- Navigation -->
                        <b-nav vertical class="sidebar-nav">
                            <b-nav-item 
                                :to="{ name: 'Profile' }"
                                exact
                                class="sidebar-nav-item">
                                <i class="fas fa-user me-2"></i>
                                Thông tin cá nhân
                            </b-nav-item>

                            <b-nav-item 
                                :to="{ name: 'ChangePassword' }"
                                class="sidebar-nav-item">
                                <i class="fas fa-lock me-2"></i>
                                Đổi mật khẩu
                            </b-nav-item>

                            <b-nav-item 
                                :to="{ name: 'PaymentHistory' }"
                                class="sidebar-nav-item">
                                <i class="fas fa-credit-card me-2"></i>
                                Lịch sử thanh toán
                            </b-nav-item>

                            <b-nav-item 
                                :to="{ name: 'BookingHistory' }"
                                class="sidebar-nav-item">
                                <i class="fas fa-list me-2"></i>
                                Lịch sử đặt tiệc
                            </b-nav-item>

                            <b-nav-item 
                                @click="showLogoutModal"
                                class="sidebar-nav-item sidebar-nav-logout">
                                <i class="fas fa-sign-out-alt me-2"></i>
                                Đăng xuất
                            </b-nav-item>
                        </b-nav>
                    </div>
                </b-col>

                <!-- Main Content -->
                <b-col lg="9" md="8">
                    <div class="content-card">
                        <router-view />
                    </div>
                </b-col>

            </b-row>
        </b-container>

        <!-- Logout Confirmation Modal -->
        <b-modal
            v-model="showLogoutConfirm"
            title="Xác nhận Đăng xuất"
            centered
            @ok="handleConfirmLogout"
            ok-title="Đăng xuất"
            ok-variant="danger"
            cancel-title="Hủy">
            <p class="mb-0">Bạn có chắc chắn muốn đăng xuất khỏi tài khoản này?</p>
        </b-modal>
    </div>
</template>

<script>
import axios from 'axios';

export default {
    name: 'ProfileLayout',
    data() {
        return {
            user: null,
            backendUrl: process.env.VUE_APP_API_URL || 'http://localhost:8088',
            selectedImage: null,
            showLogoutConfirm: false,
        };
    },
    mounted() {
        this.loadUserInfo();
    },
    methods: {
        getUserInitial() {
            if (this.user && this.user.username) {
                return this.user.username.charAt(0).toUpperCase();
            }
            return 'A';
        },

        loadUserInfo() {
            const userInfo = localStorage.getItem('user_info');
            if (userInfo) {
                this.user = JSON.parse(userInfo);
            }
        },

        triggerFileInput() {
            this.$refs.fileInput.click();
        },

        async handleFileChange(event) {
            const file = event.target.files[0];
            if (!file) {
                this.selectedImage = null;
                return;
            }

            // Validate file
            if (!file.type.startsWith('image/')) {
                this.showErrorToast('Vui lòng chọn file ảnh');
                return;
            }

            if (file.size > 5 * 1024 * 1024) { // 5MB
                this.showErrorToast('Ảnh không được vượt quá 5MB');
                return;
            }

            // Preview
            this.selectedImage = URL.createObjectURL(file);

            // Upload
            const formData = new FormData();
            formData.append('avatar', file);

            try {
                const token = localStorage.getItem('user_token');
                const response = await axios.post(
                    this.backendUrl + '/api/profile/avatar', 
                    formData,
                    {
                        headers: {
                            'Content-Type': 'multipart/form-data',
                            'Authorization': 'Bearer ' + token
                        }
                    }
                );

                // Update user info
                this.user = response.data.user;
                localStorage.setItem('user_info', JSON.stringify(response.data.user));

                this.showSuccessToast('Cập nhật avatar thành công!');
                this.selectedImage = null;

            } catch (error) {
                console.error('Lỗi upload avatar:', error);
                let message = 'Upload thất bại. Vui lòng thử lại.';
                if (error.response && error.response.data && error.response.data.message) {
                    message = error.response.data.message;
                }
                this.showErrorToast(message);
                this.selectedImage = null;
            }
        },

        showLogoutModal() {
            this.showLogoutConfirm = true;
        },

        async handleConfirmLogout() {
            try {
                const token = localStorage.getItem('user_token');
                await axios.post(
                    this.backendUrl + '/api/logout',
                    {},
                    {
                        headers: {
                            'Authorization': 'Bearer ' + token
                        }
                    }
                );
            } catch (e) {
                console.warn("Lỗi khi gọi API logout, vẫn tiếp tục logout ở client");
            }

            // Clear localStorage
            localStorage.removeItem('user_token');
            localStorage.removeItem('user_info');

            this.showSuccessToast('Đã đăng xuất thành công');

            setTimeout(() => {
                this.$router.push('/login');
            }, 1000);
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
.profile-page-container {
    min-height: 100vh;
    background-color: #f8f9fa;
}

/* Sidebar Card */
.sidebar-card {
    background: white;
    border: 1px solid #e0e0e0;
    border-radius: 1rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    padding: 1.5rem;
}

/* Avatar */
.avatar-wrapper {
    width: 128px;
    height: 128px;
    margin: 0 auto;
}

.avatar-image {
    width: 128px;
    height: 128px;
    border-radius: 50%;
    object-fit: cover;
    border: 4px solid #86efac;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.avatar-placeholder {
    width: 128px;
    height: 128px;
    border-radius: 50%;
    background: linear-gradient(135deg, #86efac 0%, #60a5fa 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 3rem;
    font-weight: bold;
    color: white;
    border: 4px solid #86efac;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.avatar-preview {
    position: relative;
}

.avatar-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background: rgba(0, 0, 0, 0.6);
    color: white;
    border: none;
    font-size: 0.875rem;
    font-weight: 600;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.2s ease;
    cursor: pointer;
}

.avatar-wrapper:hover .avatar-overlay {
    opacity: 1;
}

/* Navigation */
.sidebar-nav {
    margin-top: 2rem;
}

.sidebar-nav-item {
    padding: 0.75rem 1rem;
    margin-bottom: 0.5rem;
    border-radius: 0.5rem;
    color: #4b5563;
    transition: all 0.2s ease;
    font-weight: 500;
}

.sidebar-nav-item:hover {
    background-color: #dcfce7;
    transform: translateX(3px);
    text-decoration: none;
}

.sidebar-nav-item.active {
    background-color: #dcfce7;
    color: #16a34a;
    font-weight: 600;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.sidebar-nav-logout {
    color: #dc2626;
}

.sidebar-nav-logout:hover {
    background-color: #fee2e2;
}

/* Content Card */
.content-card {
    background: white;
    border: 1px solid #e0e0e0;
    border-radius: 1rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    padding: 2rem;
    min-height: 500px;
}

/* Responsive */
@media (max-width: 768px) {
    .sidebar-card {
        margin-bottom: 1.5rem;
    }

    .avatar-wrapper {
        width: 100px;
        height: 100px;
    }

    .avatar-image,
    .avatar-placeholder {
        width: 100px;
        height: 100px;
        font-size: 2.5rem;
    }
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