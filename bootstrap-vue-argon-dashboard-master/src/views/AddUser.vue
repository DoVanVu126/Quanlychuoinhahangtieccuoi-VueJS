<template>
  <div class="container mt-5">
    <h2 class="text-primary mb-4">Thêm User</h2>

    <!-- Thông báo lỗi tổng -->
    <div v-if="formError" class="alert alert-danger">{{ formError }}</div>

    <b-form @submit.prevent="addUser" enctype="multipart/form-data">
      <!-- Username -->
      <b-form-group label="Tên đăng nhập">
        <b-form-input
          v-model.trim="form.username"
          :class="{ 'is-invalid': errors.username }"
          placeholder="Nhập tên đăng nhập"
        />
        <div class="invalid-feedback" v-if="errors.username">{{ errors.username }}</div>
      </b-form-group>

      <!-- Email -->
      <b-form-group label="Email">
        <b-form-input
          type="email"
          v-model.trim="form.email"
          :class="{ 'is-invalid': errors.email }"
          placeholder="Nhập email"
        />
        <div class="invalid-feedback" v-if="errors.email">{{ errors.email }}</div>
      </b-form-group>

      <!-- Password -->
      <b-form-group label="Mật khẩu">
        <b-form-input
          type="password"
          v-model="form.password"
          :class="{ 'is-invalid': errors.password }"
          placeholder="Nhập mật khẩu"
        />
        <div class="invalid-feedback" v-if="errors.password">{{ errors.password }}</div>
      </b-form-group>

      <!-- Phone -->
      <b-form-group label="Số điện thoại">
        <b-form-input
          type="tel"
          v-model.trim="form.phone"
          :class="{ 'is-invalid': errors.phone }"
          placeholder="Nhập số điện thoại"
        />
        <div class="invalid-feedback" v-if="errors.phone">{{ errors.phone }}</div>
      </b-form-group>

      <!-- Address -->
      <b-form-group label="Địa chỉ">
        <b-form-input
          type="text"
          v-model.trim="form.address"
          :class="{ 'is-invalid': errors.address }"
          placeholder="Nhập địa chỉ"
        />
        <div class="invalid-feedback" v-if="errors.address">{{ errors.address }}</div>
      </b-form-group>

      <!-- Role -->
      <b-form-group label="Vai trò">
        <b-form-select
          v-model="form.role"
          :options="roleOptions"
          :class="{ 'is-invalid': errors.role }"
        />
        <div class="invalid-feedback" v-if="errors.role">{{ errors.role }}</div>
      </b-form-group>

      <!-- Ảnh đại diện -->
      <b-form-group label="Ảnh đại diện">
        <b-form-file
          accept="image/*"
          @change="handleImageUpload"
          :class="{ 'is-invalid': errors.image }"
          placeholder="Chọn file ảnh..."
        />
        <div class="invalid-feedback" v-if="errors.image">{{ errors.image }}</div>

        <div v-if="previewImage" class="mt-3 text-center">
          <img :src="previewImage" alt="Preview" class="img-thumbnail" style="max-width: 200px" />
        </div>
      </b-form-group>

      <!-- Nút hành động -->
      <div class="d-flex justify-content-between align-items-center">
        <b-button type="submit" variant="success" :disabled="loading">
          <span v-if="!loading">💾 Lưu</span>
          <span v-else class="d-flex align-items-center">
            <span class="spinner-border spinner-border-sm mr-2"></span>
            Đang lưu...
          </span>
        </b-button>
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
      form: {
        username: "",
        email: "",
        password: "",
        phone: "",
        address: "",
        role: "",
      },
      roleOptions: [
        { value: "admin", text: "Admin" },
        { value: "staff", text: "Nhân viên" },
        { value: "customer", text: "Khách hàng" },
      ],
      imageFile: null,
      previewImage: null,
      errors: {},
      formError: "",
      loading: false,
    };
  },
  methods: {
    handleImageUpload(e) {
      const file = e.target.files[0];
      if (!file) {
        this.imageFile = null;
        this.previewImage = null;
        return;
      }
      if (!file.type.startsWith("image/")) {
        this.errors.image = "File không phải ảnh";
        return;
      }
      this.errors.image = "";
      this.imageFile = file;
      this.previewImage = URL.createObjectURL(file);
    },

    validateForm() {
      this.errors = {};
      let ok = true;

      if (!this.form.username || this.form.username.length < 3) {
        this.errors.username = "Tên đăng nhập ít nhất 3 ký tự";
        ok = false;
      }
      if (!this.form.email || !/\S+@\S+\.\S+/.test(this.form.email)) {
        this.errors.email = "Email không hợp lệ";
        ok = false;
      }
      if (!this.form.password || this.form.password.length < 6) {
        this.errors.password = "Mật khẩu ít nhất 6 ký tự";
        ok = false;
      }
      if (!this.form.phone || !/^\d{10,12}$/.test(this.form.phone)) {
        this.errors.phone = "Số điện thoại không hợp lệ (10-12 chữ số)";
        ok = false;
      }
      if (!this.form.address) {
        this.errors.address = "Địa chỉ bắt buộc";
        ok = false;
      }
      if (!this.form.role) {
        this.errors.role = "Chọn vai trò";
        ok = false;
      }
      if (this.imageFile && !this.imageFile.type.startsWith("image/")) {
        this.errors.image = "File không hợp lệ";
        ok = false;
      }

      if (!ok) this.formError = "Vui lòng kiểm tra dữ liệu!";
      return ok;
    },

    async addUser() {
      if (!this.validateForm()) return;

      this.loading = true;
      this.formError = "";

      try {
        const formData = new FormData();
        for (const key in this.form) formData.append(key, this.form[key]);
        if (this.imageFile) formData.append("image", this.imageFile);

        await api.post("/users", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        this.$bvToast.toast(`Thêm user thành công: ${this.form.username}`, {
          title: "Thành công",
          variant: "success",
          solid: true,
        });

        setTimeout(() => this.$router.push("/users"), 1000);
      } catch (err) {
        if (err.response && err.response.status === 422 && err.response.data.errors) {
          const backendErrors = err.response.data.errors;
          for (const k in backendErrors) this.errors[k] = backendErrors[k][0];
          this.formError = "Dữ liệu không hợp lệ!";
        } else if (err.response && err.response.data.message) {
          this.formError = err.response.data.message;
        } else {
          this.formError = "Lỗi hệ thống!";
        }

        this.$bvToast.toast(this.formError, {
          title: "❌ Thất bại",
          variant: "danger",
          solid: true,
        });
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>

<style scoped>
.container {
  max-width: 700px;
}
.img-thumbnail {
  border-radius: 12px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.2);
}
.is-invalid {
  border-color: #dc3545;
}
</style>
