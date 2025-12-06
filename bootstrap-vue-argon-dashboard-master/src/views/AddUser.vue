<template>
  <div class="container mt-5">
    <h2>Thêm User</h2>

    <!-- Loading -->
    <div v-if="loading" class="form-loading">
      <b-spinner style="width: 2.5rem; height: 2.5rem;" variant="success"></b-spinner>
      <span class="ml-2 loading-text">Đang xử lý...</span>
    </div>

    <!-- Thông báo lỗi tổng -->
    <div v-if="formError" class="alert alert-danger">
      {{ formError }}
    </div>

    <b-form @submit.prevent="addUser">
      <!-- Username -->
      <b-form-group label="Tên đăng nhập" label-for="username">
        <b-form-input
          id="username"
          v-model.trim="form.username"
          :class="{'is-invalid': errors.username}"
          required
        ></b-form-input>
        <div class="invalid-feedback" v-if="errors.username">{{ errors.username }}</div>
      </b-form-group>

      <!-- Email -->
      <b-form-group label="Email" label-for="email">
        <b-form-input
          id="email"
          type="email"
          v-model.trim="form.email"
          :class="{'is-invalid': errors.email}"
          required
        ></b-form-input>
        <div class="invalid-feedback" v-if="errors.email">{{ errors.email }}</div>
      </b-form-group>

      <!-- Password -->
      <b-form-group label="Mật khẩu" label-for="password">
        <b-form-input
          id="password"
          type="password"
          v-model="form.password"
          :class="{'is-invalid': errors.password}"
          required
        ></b-form-input>
        <div class="invalid-feedback" v-if="errors.password">{{ errors.password }}</div>
      </b-form-group>

      <!-- Phone -->
      <b-form-group label="Số điện thoại" label-for="phone">
        <b-form-input
          id="phone"
          type="tel"
          v-model.trim="form.phone"
          placeholder="Nhập số điện thoại"
          :class="{'is-invalid': errors.phone}"
          required
        ></b-form-input>
        <div class="invalid-feedback" v-if="errors.phone">{{ errors.phone }}</div>
      </b-form-group>

      <!-- Address -->
      <b-form-group label="Địa chỉ" label-for="address">
        <b-form-input
          id="address"
          type="text"
          v-model.trim="form.address"
          placeholder="Nhập địa chỉ"
          :class="{'is-invalid': errors.address}"
          required
        ></b-form-input>
        <div class="invalid-feedback" v-if="errors.address">{{ errors.address }}</div>
      </b-form-group>

      <!-- Role -->
      <b-form-group label="Vai trò" label-for="role">
        <b-form-select
          id="role"
          v-model="form.role"
          :options="roleOptions"
          :class="{'is-invalid': errors.role}"
          required
        ></b-form-select>
        <div class="invalid-feedback" v-if="errors.role">{{ errors.role }}</div>
      </b-form-group>

      <!-- Upload avatar -->
      <b-form-group label="Ảnh đại diện" label-for="image">
        <b-form-file
          id="image"
          @change="handleImageUpload"
          accept="image/*"
          browse-text="Chọn ảnh"
          placeholder="Chưa chọn ảnh nào"
        ></b-form-file>
        <div v-if="previewImage" class="mt-3 text-center">
          <img :src="previewImage" alt="Preview" class="img-thumbnail" style="max-width: 200px;" />
        </div>
        <div class="text-danger mt-1" v-if="errors.image">{{ errors.image }}</div>
      </b-form-group>

      <!-- Nút hành động -->
      <div class="d-flex justify-content-between">
        <b-button type="submit" variant="success">💾 Lưu</b-button>
        <b-button variant="secondary" @click="$router.push('/users')">⬅ Quay lại</b-button>
      </div>
    </b-form>
  </div>
</template>

<script>
import api from "@/api";

export default {
  data() {
    return {
      loading: false, // ✅ thêm loading
      form: {
        username: "",
        email: "",
        password: "",
        phone: "",
        address: "",
        role: "",
      },
      imageFile: null,
      previewImage: null,
      roleOptions: [
        { value: "admin", text: "Admin" },
        { value: "staff", text: "Nhân viên" },
        { value: "customer", text: "Khách hàng" },
      ],
      errors: {},
      formError: "",
    };
  },
  methods: {
    handleImageUpload(e) {
      const file = e.target.files[0];
      if (file) {
        if (!file.type.startsWith("image/")) {
          this.errors.image = "Chỉ được chọn file ảnh";
          return;
        }
        this.errors.image = "";
        this.imageFile = file;
        this.previewImage = URL.createObjectURL(file);
      }
    },

    validateForm() {
      this.errors = {};
      let isValid = true;

      // Username
      if (!this.form.username) {
        this.errors.username = "Tên đăng nhập bắt buộc";
        isValid = false;
      } else if (this.form.username.length < 3) {
        this.errors.username = "Tên đăng nhập ít nhất 3 ký tự";
        isValid = false;
      }

      // Email
      if (!this.form.email) {
        this.errors.email = "Email bắt buộc";
        isValid = false;
      } else if (!/\S+@\S+\.\S+/.test(this.form.email)) {
        this.errors.email = "Email không hợp lệ";
        isValid = false;
      }

      // Password
      if (!this.form.password) {
        this.errors.password = "Mật khẩu bắt buộc";
        isValid = false;
      } else if (this.form.password.length < 6) {
        this.errors.password = "Mật khẩu phải ít nhất 6 ký tự";
        isValid = false;
      }

      // Phone
      if (!this.form.phone) {
        this.errors.phone = "Số điện thoại bắt buộc";
        isValid = false;
      } else if (!/^\d{10,12}$/.test(this.form.phone)) {
        this.errors.phone = "Số điện thoại không hợp lệ (10-12 chữ số)";
        isValid = false;
      }

      // Address
      if (!this.form.address) {
        this.errors.address = "Địa chỉ bắt buộc";
        isValid = false;
      }

      // Role
      if (!this.form.role) {
        this.errors.role = "Chọn vai trò";
        isValid = false;
      }

      return isValid;
    },

    async addUser() {
      if (!this.validateForm()) {
        this.formError = "Vui lòng sửa các lỗi trước khi lưu";
        return;
      }
      this.formError = "";
      this.loading = true; // ✅ bật loading

      try {
        const formData = new FormData();
        formData.append("username", this.form.username);
        formData.append("email", this.form.email);
        formData.append("password", this.form.password);
        formData.append("role", this.form.role);
        formData.append("phone", this.form.phone);
        formData.append("address", this.form.address);
        if (this.imageFile) formData.append("image", this.imageFile);

        await api.post("/users", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        // ✅ toast thành công
        this.$bvToast.toast(`Thêm user thành công: ${this.form.username}`, {
          title: "✅ Thành công",
          variant: "success",
          solid: true,
          autoHideDelay: 3000,
        });

        setTimeout(() => {
          this.$router.push("/users");
        }, 1000);
      } catch (err) {
        let msg = "Thêm user thất bại";

        if (err.response) {
          if (err.response.status === 422 && err.response.data.errors) {
            msg = Object.values(err.response.data.errors).flat().join("\n");
          } else if (err.response.data.message) {
            msg = err.response.data.message;
          } else {
            msg = "Lỗi hệ thống";
          }
        } else {
          msg = "Không kết nối được server";
        }

        this.formError = msg;

        // ✅ toast lỗi
        this.$bvToast.toast(this.formError, {
          title: "❌ Thất bại",
          variant: "danger",
          solid: true,
          autoHideDelay: 4000,
        });
      } finally {
        this.loading = false; // ✅ tắt loading
      }
    },
  },
};
</script>

<style scoped>
.container {
  max-width: 700px;
}
h2 {
  font-weight: 600;
  margin-bottom: 20px;
}
.b-form-group {
  margin-bottom: 1.2rem;
}
.img-thumbnail {
  border-radius: 12px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
}
.text-danger {
  font-size: 0.85rem;
}
.is-invalid {
  border-color: #dc3545;
}

/* Loading spinner */
.form-loading {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: #d4edda;
  border-radius: 12px;
  margin-bottom: 15px;
}
.loading-text {
  font-size: 15px;
  font-weight: 600;
}
</style>
