<template>
  <div class="profile-info-container">
    <!-- Header -->
    <div class="d-flex align-items-center justify-content-between mb-4">
      <h2 class="profile-title mb-0">Thông tin tài khoản</h2>
      <div class="title-decoration"></div>
    </div>

    <hr class="mb-4" />

    <!-- Loading -->
    <div v-if="isLoading" class="text-center text-muted py-5">
      <b-spinner variant="primary"></b-spinner>
      <p class="mt-2">Đang tải dữ liệu...</p>
    </div>

    <!-- Form -->
    <b-form v-else @submit.prevent="updateProfile" class="profile-form">
      
      <b-row>
        <!-- Họ và tên -->
        <b-col md="6" class="mb-4">
          <b-form-group label="Họ và tên" label-class="profile-label">
            <b-form-input
              v-model="profileForm.full_name"
              type="text"
              class="profile-input"
              placeholder="Nhập họ tên của bạn"
              :state="errors.full_name ? false : null">
            </b-form-input>
            <small v-if="errors.full_name" class="text-danger d-block mt-1">
              {{ errors.full_name }}
            </small>
          </b-form-group>
        </b-col>

        <!-- Email (Read-only) -->
        <b-col md="6" class="mb-4">
          <b-form-group label="Email" label-class="profile-label-readonly">
            <div class="profile-readonly">
              {{ readOnlyInfo.email }}
            </div>
          </b-form-group>
        </b-col>

        <!-- Địa chỉ -->
        <b-col md="6" class="mb-4">
          <b-form-group label="Địa chỉ" label-class="profile-label">
            <b-form-input
              v-model="profileForm.address"
              type="text"
              class="profile-input"
              placeholder="Nhập địa chỉ liên hệ"
              :state="errors.address ? false : null">
            </b-form-input>
            <small v-if="errors.address" class="text-danger d-block mt-1">
              {{ errors.address }}
            </small>
          </b-form-group>
        </b-col>

        <!-- Ngày tạo (Read-only) -->
        <b-col md="6" class="mb-4">
          <b-form-group label="Ngày tạo tài khoản" label-class="profile-label-readonly">
            <div class="profile-readonly">
              {{ readOnlyInfo.created_at }}
            </div>
          </b-form-group>
        </b-col>

      <!-- Số điện thoại -->
        <b-col md="6" class="mb-4">
          <b-form-group label="Số điện thoại" label-class="profile-label-readonly">
            <b-form-input
              v-model="profileForm.phone"
              type="text"
              class="profile-input"
              placeholder="Nhập số điện thoại"
              :state="errors.phone ? false : null">
            </b-form-input>
            <small v-if="errors.phone" class="text-danger d-block mt-1">
              {{ errors.phone }}
            </small>
          </b-form-group>
        </b-col>
    </b-row>

      <!-- Actions -->
      <hr class="my-4" />
      
      <div class="d-flex flex-column flex-sm-row gap-3">
        <b-button
          type="submit"
          variant="success"
          class="profile-btn-primary"
          :disabled="isUpdating">
          <span v-if="isUpdating">
            <b-spinner small class="me-2"></b-spinner>
            Đang cập nhật...
          </span>
          <span v-else>
            <i class="fas fa-save me-2"></i>
            Cập nhật thông tin
          </span>
        </b-button>

        <b-button
          type="button"
          variant="outline-danger"
          class="profile-btn-danger"
          @click="showDeleteModal">
          <i class="fas fa-trash-alt me-2"></i>
          Xóa tài khoản
        </b-button>
      </div>
    </b-form>

    <!-- Delete Confirmation Modal -->
    <b-modal
      v-model="showDeleteConfirm"
      title="Xác nhận Xóa tài khoản"
      centered
      @ok="handleDeleteAccount"
      ok-title="Xóa tài khoản"
      ok-variant="danger"
      cancel-title="Hủy">
      <div class="text-center py-3">
        <i class="fas fa-exclamation-triangle text-warning" style="font-size: 3rem;"></i>
        <p class="mt-3 mb-0 font-weight-bold">
          Bạn có chắc chắn muốn xóa tài khoản?
        </p>
        <p class="text-muted small mt-2">
          Hành động này không thể hoàn tác!
        </p>
      </div>
    </b-modal>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'ProfileInfo',
  data() {
    return {
      profileForm: {
        full_name: '',
        address: '',
        phone: '',
      },
      readOnlyInfo: {
        email: '',
        created_at: ''
      },
      errors: {
        full_name: '',
        address: '',
        phone: ''
      },
      isLoading: true,
      isUpdating: false,
      showDeleteConfirm: false,
      backendUrl: process.env.VUE_APP_API_URL || 'http://localhost:8088'
    };
  },
  mounted() {
    this.loadProfile();
  },
  methods: {
    async loadProfile() {
      this.isLoading = true;
      
      try {
        const token = localStorage.getItem('user_token');
        const response = await axios.get(this.backendUrl + '/api/profile', {
          headers: {
            'Authorization': 'Bearer ' + token
          }
        });

        const user = response.data;
        
        // Populate form
        this.profileForm.full_name = user.full_name || '';
        this.profileForm.address = user.address || '';
        
        // Read-only info
        this.readOnlyInfo.email = user.email || '';
        this.readOnlyInfo.phone = user.phone || 'Chưa cập nhật';
        
        if (user.created_at) {
          const date = new Date(user.created_at);
          this.readOnlyInfo.created_at = date.toLocaleDateString('vi-VN');
        } else {
          this.readOnlyInfo.created_at = 'Không rõ';
        }

      } catch (error) {
        console.error('Không thể lấy thông tin profile:', error);
        
        if (error.response && error.response.status === 401) {
          this.showErrorToast('Phiên đăng nhập đã hết hạn');
          localStorage.removeItem('user_token');
          localStorage.removeItem('user_info');
          this.$router.push('/login');
        } else {
          this.showErrorToast('Không thể tải thông tin. Vui lòng thử lại');
        }
      } finally {
        this.isLoading = false;
      }
    },

    validateForm() {
      let isValid = true;
      this.errors = {
        full_name: '',
        address: ''
      };

      // Validate full_name
      if (this.profileForm.full_name && this.profileForm.full_name.trim().length > 100) {
        this.errors.full_name = 'Họ tên không được vượt quá 100 ký tự';
        isValid = false;
      }

      // Validate address
      if (this.profileForm.address && this.profileForm.address.trim().length > 255) {
        this.errors.address = 'Địa chỉ không được vượt quá 255 ký tự';
        isValid = false;
      }

      return isValid;
    },

    async updateProfile() {
      if (!this.validateForm()) {
        this.showErrorToast('Vui lòng kiểm tra lại thông tin');
        return;
      }

      this.isUpdating = true;

      try {
        const token = localStorage.getItem('user_token');
        const dataToUpdate = {
          full_name: this.profileForm.full_name.trim(),
          address: this.profileForm.address.trim()
        };
        
        const response = await axios.put(
          this.backendUrl + '/api/profile', 
          dataToUpdate,
          {
            headers: {
              'Authorization': 'Bearer ' + token
            }
          }
        );

        // Update localStorage
        const updatedUser = response.data.user;
        localStorage.setItem('user_info', JSON.stringify(updatedUser));

        this.showSuccessToast('Cập nhật thông tin thành công!');
        
        // Reload to get fresh data
        this.loadProfile();

      } catch (error) {
        console.error('Update profile error:', error);
        
        let errorMsg = 'Có lỗi xảy ra. Vui lòng thử lại';
        if (error.response && error.response.data && error.response.data.message) {
          errorMsg = error.response.data.message;
        }
        
        this.showErrorToast(errorMsg);
      } finally {
        this.isUpdating = false;
      }
    },

    showDeleteModal() {
      this.showDeleteConfirm = true;
    },

    async handleDeleteAccount() {
      try {
        const token = localStorage.getItem('user_token');
        
        await axios.delete(this.backendUrl + '/api/profile', {
          headers: {
            'Authorization': 'Bearer ' + token
          }
        });

        this.showSuccessToast('Tài khoản đã được xóa');
        
        // Logout and redirect
        localStorage.removeItem('user_token');
        localStorage.removeItem('user_info');
        
        setTimeout(() => {
          this.$router.push('/login');
        }, 1500);

      } catch (error) {
        console.error('Delete account error:', error);
        
        let errorMsg = 'Không thể xóa tài khoản. Vui lòng thử lại';
        if (error.response && error.response.data && error.response.data.message) {
          errorMsg = error.response.data.message;
        }
        
        this.showErrorToast(errorMsg);
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
.profile-info-container {
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

.profile-label-readonly {
  font-size: 0.875rem;
  font-weight: 600;
  color: #6b7280;
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

/* Read-only fields */
.profile-readonly {
  padding: 0.75rem;
  background-color: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  color: #111827;
  font-weight: 500;
}

/* Buttons */
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

.profile-btn-danger {
  padding: 0.75rem 1.5rem;
  font-weight: 600;
  border-radius: 0.5rem;
  transition: all 0.2s ease;
}

.profile-btn-danger:hover {
  background-color: #fee2e2;
  border-color: #ef4444;
  color: #dc2626;
  transform: translateY(-1px);
}

/* Gap utility */
.gap-3 {
  gap: 1rem;
}

/* Responsive */
@media (max-width: 576px) {
  .profile-title {
    font-size: 1.5rem;
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