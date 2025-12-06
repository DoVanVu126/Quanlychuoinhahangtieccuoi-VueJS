<template>
  <div class="container mt-5">
    <h2 class="mb-4 text-primary">👤 Sửa Người Dùng</h2>

    <!-- Thông báo lỗi tổng -->
    <div v-if="formError" class="alert alert-danger">
      {{ formError }}
    </div>

    <b-form @submit.prevent="updateUser">
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

      <!-- Phone -->
      <b-form-group label="Số điện thoại" label-for="phone">
        <b-form-input
          id="phone"
          type="tel"
          v-model.trim="form.phone"
          placeholder="Nhập số điện thoại"
          :class="{'is-invalid': errors.phone}"
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
        ></b-form-input>
        <div class="invalid-feedback" v-if="errors.address">{{ errors.address }}</div>
      </b-form-group>

      <!-- Role -->
      <b-form-group label="Vai trò" label-for="role">
        <b-form-select
          id="role"
          v-model="form.role"
          :class="{'is-invalid': errors.role}"
        >
          <b-form-select-option value="admin">Admin</b-form-select-option>
          <b-form-select-option value="staff">Nhân viên</b-form-select-option>
          <b-form-select-option value="customer">Khách hàng</b-form-select-option>
        </b-form-select>
        <div class="invalid-feedback" v-if="errors.role">{{ errors.role }}</div>
      </b-form-group>

      <!-- Ảnh đại diện hiện tại -->
      <b-form-group label="Ảnh đại diện hiện tại">
        <div v-if="form.image_url">
          <img
            :src="getImageUrl(form.image_url)"
            alt="Ảnh đại diện"
            class="rounded-circle shadow-sm border mb-2"
            style="width: 120px; height: 120px; object-fit: cover"
          />
        </div>
        <p v-else class="text-muted">Không có ảnh</p>

        <!-- Chọn ảnh mới -->
        <b-form-file
          v-model="form.newImage"
          accept="image/*"
          placeholder="Chọn ảnh mới nếu muốn thay"
          :class="{'is-invalid': errors.image}"
        ></b-form-file>
        <div class="invalid-feedback" v-if="errors.image">{{ errors.image }}</div>
      </b-form-group>

      <!-- Mật khẩu mới (tùy chọn) -->
      <b-form-group label="Mật khẩu mới (nếu muốn đổi)">
        <b-form-input
          type="password"
          v-model="form.password"
          :class="{'is-invalid': errors.password}"
        ></b-form-input>
        <div class="invalid-feedback" v-if="errors.password">{{ errors.password }}</div>
      </b-form-group>

      <!-- Nút thao tác -->
      <div class="d-flex gap-2 mt-3">
        <b-button type="submit" variant="primary">💾 Cập nhật</b-button>
        <b-button variant="secondary" @click="$router.push('/users')">Hủy</b-button>
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
        phone: "",
        address: "",
        role: "customer",
        image_url: null,
        newImage: null,
        password: "",
      },
      errors: {},
      formError: "",
    };
  },
  mounted() {
    this.loadUser();
  },
  methods: {
    async loadUser() {
      try {
        const res = await api.get(`/users/${this.$route.params.id}`);
        this.form = {
          username: res.data.username,
          email: res.data.email,
          phone: res.data.phone || "",
          address: res.data.address || "",
          role: res.data.role,
          image_url: res.data.image_url,
          newImage: null,
          password: "",
        };
      } catch (err) {
        console.error("❌ Không tải được người dùng:", err);
        alert("Không tải được thông tin người dùng!");
        this.$router.push("/users");
      }
    },

    getImageUrl(url) {
      if (!url) return null;
      if (url.startsWith("http")) return url;
      return `http://127.0.0.1:8088/${url.replace(/^\/+/, "")}`;
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

      // Phone
      if (this.form.phone && !/^\d{10,12}$/.test(this.form.phone)) {
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

      // Password mới
      if (this.form.password && this.form.password.length < 6) {
        this.errors.password = "Mật khẩu mới phải ít nhất 6 ký tự";
        isValid = false;
      }

      // Ảnh mới
      if (this.form.newImage && !this.form.newImage.type.startsWith("image/")) {
        this.errors.image = "Chỉ được chọn file ảnh";
        isValid = false;
      }

      if (!isValid) this.formError = "Vui lòng sửa các lỗi trước khi lưu";

      return isValid;
    },

    async updateUser() {
      if (!this.validateForm()) return;

      this.formError = "";

      try {
        const formData = new FormData();
        formData.append("username", this.form.username);
        formData.append("email", this.form.email);
        formData.append("role", this.form.role);
        formData.append("phone", this.form.phone);
        formData.append("address", this.form.address);

        if (this.form.password) formData.append("password", this.form.password);
        if (this.form.newImage) formData.append("image", this.form.newImage);

        await api.post(`/users/${this.$route.params.id}?_method=PUT`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        alert("✅ Cập nhật người dùng thành công!");
        this.$router.push("/users");
      } catch (err) {
        console.error(
          "❌ Lỗi cập nhật:",
          err.response && err.response.data ? err.response.data : err
        );
        this.formError = "Cập nhật thất bại!";
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
  color: #0069d9;
}
.b-form-group {
  margin-bottom: 1.2rem;
}
img {
  transition: 0.3s;
}
img:hover {
  transform: scale(1.05);
}
.is-invalid {
  border-color: #dc3545;
}
</style>
