<template>
    <div class="profile-page-container">
        <b-container class="py-5">
            <b-row>
                <b-col lg="3" md="4" class="mb-4">
                    <div class="sidebar-card">
                        <div class="text-center mb-4">

                            <div class="avatar-wrapper position-relative d-inline-block">
                                <div v-if="selectedImage" class="avatar-preview">
                                    <img :src="selectedImage" alt="Xem trước" class="avatar-image">
                                </div>

                                <div v-else-if="user && user.image_url" class="avatar-preview">
                                    <img :src="`${backendUrl}/storage/${user.image_url}`" alt="Avatar"
                                        class="avatar-image">
                                </div>

                                <div v-else class="avatar-placeholder">
                                    {{ getUserInitial() }}
                                </div>

                                <button @click="triggerFileInput" class="avatar-overlay">
                                    <i class="fas fa-camera me-2"></i>
                                    Thay đổi
                                </button>

                                <input ref="fileInput" type="file" accept="image/*" class="d-none"
                                    @change="handleFileChange" />
                            </div>

                            <h4 class="mt-3 mb-0 font-weight-bold">
                                Xin chào {{ user ? user.username : '' }}
                            </h4>
                        </div>

                        <b-nav vertical class="sidebar-nav">
                            <b-nav-item to="/profileUser/info" exact class="sidebar-nav-item">
                                <i class="fas fa-user me-2"></i> Thông tin cá nhân
                            </b-nav-item>
                            <b-nav-item to="/profileUser/change-password" class="sidebar-nav-item">
                                <i class="fas fa-lock me-2"></i> Đổi mật khẩu
                            </b-nav-item>
                            <b-nav-item to="/profileUser/payment-history" class="sidebar-nav-item">
                                <i class="fas fa-credit-card me-2"></i> Lịch sử thanh toán
                            </b-nav-item>
                            <b-nav-item to="/profileUser/booking-history" class="sidebar-nav-item">
                                <i class="fas fa-list me-2"></i> Lịch sử đặt tiệc
                            </b-nav-item>
                            <b-nav-item @click="showHomeModal" class="sidebar-nav-item text-primary">
                                <i class="fas fa-home me-2"></i> Về trang chủ
                            </b-nav-item>
                        </b-nav>
                    </div>
                </b-col>

                <b-col lg="9" md="8">
                    <div class="content-card">
                        <router-view @user-updated="loadUserInfo" />
                    </div>
                </b-col>
            </b-row>
        </b-container>

        <b-modal v-model="showHomeConfirm" title="Xác nhận điều hướng" centered @ok="handleGoHome"
            ok-title="Về trang chủ" ok-variant="primary" cancel-title="Hủy">
            <p class="mb-0">Bạn có muốn quay về trang chủ không?</p>
        </b-modal>
    </div>
</template>

<script>
import api from '@/api';

export default {
    name: 'ProfileLayout',
    data() {
        return {
            user: null,
            backendUrl: process.env.VUE_APP_API_URL || 'http://localhost:8088',
            selectedImage: null,
            showHomeConfirm: false,
        };
    },
    mounted() {
        this.checkAuth();
        this.loadUserInfo();
    },
    methods: {
        checkAuth() {
            const token = localStorage.getItem('token');
            const user = localStorage.getItem('user');
            if (!token || !user) {
                this.$router.push('/login');
            }
        },

        getUserInitial() {
            if (this.user && this.user.username) {
                return this.user.username.charAt(0).toUpperCase();
            }
            return 'A';
        },

        loadUserInfo() {
            const userInfo = localStorage.getItem('user');
            if (userInfo) {
                this.user = JSON.parse(userInfo);
            }
        },

        triggerFileInput() {
            this.$refs.fileInput.click();
        },

        // --- HÀM UPLOAD AVATAR ĐÃ SỬA ---
        async handleFileChange(event) {
            const file = event.target.files[0];
            if (!file) {
                this.selectedImage = null;
                return;
            }

            // Validate loại file
            if (!file.type.startsWith('image/')) {
                this.showErrorToast('Vui lòng chọn file ảnh');
                return;
            }

            // Validate dung lượng (5MB)
            if (file.size > 5 * 1024 * 1024) {
                this.showErrorToast('Ảnh không được vượt quá 5MB');
                return;
            }

            // Hiển thị preview ngay lập tức
            this.selectedImage = URL.createObjectURL(file);

            // Chuẩn bị FormData
            const formData = new FormData();
            // QUAN TRỌNG: Key phải là 'avatar' khớp với Backend Validator
            formData.append('avatar', file);

            try {
                // Gọi API: POST /users/{id}/avatar
                const response = await api.post(
                    `/api/users/${this.user.user_id}/avatar`,
                    formData,
                    {
                        headers: {
                            'Content-Type': 'multipart/form-data'
                        }
                    }
                );

                // Cập nhật lại user info từ response
                const oldUser = JSON.parse(localStorage.getItem('user')) || {};
                // Backend trả về: { success: true, user: {...} }
                // Merge dữ liệu cũ với dữ liệu mới (chứa image_url mới)
                const updatedUser = { ...oldUser, ...response.data.user };

                this.user = updatedUser;
                localStorage.setItem('user', JSON.stringify(updatedUser));

                this.showSuccessToast('Cập nhật ảnh đại diện thành công!');
                this.selectedImage = null; // Reset preview để dùng ảnh thật từ server lần sau

            } catch (error) {
                console.error('Lỗi upload avatar:', error);

                let message = 'Upload thất bại. Vui lòng thử lại.';
                if (error.response && error.response.data && error.response.data.errors) {
                    // Lấy lỗi đầu tiên từ mảng errors của Laravel
                    message = Object.values(error.response.data.errors)[0][0];
                } else if (error.response && error.response.data && error.response.data.message) {
                    message = error.response.data.message;
                }

                this.showErrorToast(message);
                this.selectedImage = null; // Xóa preview nếu lỗi
            }
        },

        showHomeModal() {
            this.showHomeConfirm = true;
        },

        handleGoHome() {
            this.$router.push('/home');
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
/* (Giữ nguyên phần Style như cũ) */
.profile-page-container {
    min-height: 100vh;
    background-color: #f8f9fa;
}

.sidebar-card {
    background: white;
    border: 1px solid #e0e0e0;
    border-radius: 1rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    padding: 1.5rem;
}

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
    cursor: pointer;
}

.sidebar-nav-item.active {
    background-color: #dcfce7;
    color: #16a34a;
    font-weight: 600;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.content-card {
    background: white;
    border: 1px solid #e0e0e0;
    border-radius: 1rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    padding: 2rem;
    min-height: 500px;
}

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
.b-toaster-top-center {
    top: 20px !important;
}
</style>