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

      <!-- Ảnh đại diện -->
      <b-form-group label="Ảnh đại diện">
        <!-- Preview ảnh mới nếu có -->
        <div v-if="previewImage" class="mb-2 text-center">
          <p>Ảnh mới:</p>
          <img
            :src="previewImage"
            alt="Preview"
            class="rounded-circle shadow-sm border"
            style="width: 120px; height: 120px; object-fit: cover"
          />
        </div>

        <!-- Ảnh hiện tại nếu chưa chọn ảnh mới -->
        <div v-else-if="form.image_url" class="mb-2 text-center">
          <p>Ảnh hiện tại:</p>
          <img
            :src="getImageUrl(form.image_url)"
            alt="Ảnh đại diện"
            class="rounded-circle shadow-sm border"
            style="width: 120px; height: 120px; object-fit: cover"
          />
        </div>
        <p v-else class="text-muted text-center">Không có ảnh</p>

        <!-- Chọn ảnh mới -->
        <b-form-file
          accept="image/*"
          placeholder="Chọn ảnh mới nếu muốn thay"
          :class="{'is-invalid': errors.image}"
          @change="handleImageUpload"
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
        <b-button type="submit" variant="primary" :disabled="loading">
          <span v-if="loading">💾 Đang xử lý...</span>
          <span v-else>💾 Cập nhật</span>
        </b-button>
        <b-button variant="secondary" @click="$router.push('/users')" :disabled="loading">
          Hủy
        </b-button>
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
      previewImage: null,
      formError: "",
      errors: {},
      loading: false,
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
        alert("❌ Lỗi khi tải dữ liệu người dùng!");
        this.$router.push("/users");
      }
    },

    getImageUrl(url) {
      if (!url) return null;
      if (url.startsWith("http")) return url;
      return `http://127.0.0.1:8088/${url.replace(/^\/+/, "")}`;
    },

    handleImageUpload(e) {
      const file = e.target.files[0];
      if (file) {
        if (!file.type.startsWith("image/")) {
          this.errors.image = "Chỉ được chọn file ảnh";
          e.target.value = null;
          return;
        }
        this.errors.image = "";
        this.form.newImage = file;
        this.previewImage = URL.createObjectURL(file);
      } else {
        this.form.newImage = null;
        this.previewImage = null;
      }
    },

    validateForm() {
      const f = this.form;
      const errors = [];

      f.username = (f.username || "").trim();
      f.email = (f.email || "").trim();
      f.phone = (f.phone || "").trim();
      f.address = (f.address || "").trim();

      if (!f.username) errors.push("Tên đăng nhập không được để trống.");
      else if (f.username.length < 3) errors.push("Tên đăng nhập ít nhất 3 ký tự.");

      if (!f.email) errors.push("Email không được để trống.");
      else if (!/\S+@\S+\.\S+/.test(f.email)) errors.push("Email không hợp lệ.");

      if (f.phone && !/^\d{10,12}$/.test(f.phone)) errors.push("Số điện thoại không hợp lệ (10-12 chữ số).");

      if (!f.address) errors.push("Địa chỉ không được để trống.");

      if (!f.role) errors.push("Chọn vai trò.");

      if (f.password && f.password.length < 6) errors.push("Mật khẩu mới phải ít nhất 6 ký tự.");

      if (f.newImage && !f.newImage.type.startsWith("image/")) errors.push("File tải lên phải là ảnh.");

      return errors;
    },

    async updateUser() {
      this.errors = {};
      this.formError = "";
      const errors = this.validateForm();

      if (errors.length) {
        this.formError = "❌ " + errors.join("\n");
        this.$bvToast.toast(this.formError, {
          title: "❌ Lỗi",
          variant: "danger",
          solid: true,
          autoHideDelay: 4000,
        });
        return;
      }

      this.loading = true;
      try {
        const formData = new FormData();
        ["username","email","phone","address","role"].forEach(key => formData.append(key, this.form[key]));
        if (this.form.password) formData.append("password", this.form.password);
        if (this.form.newImage) formData.append("image", this.form.newImage);

        const res = await api.post(`/users/${this.$route.params.id}?_method=PUT`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        this.$bvToast.toast(res.data.message || "Cập nhật thành công!", {
          title: "✅ Thành công",
          variant: "success",
          solid: true,
          autoHideDelay: 3000,
        });

        setTimeout(() => this.$router.push("/users"), 1000);
      } catch (err) {
        let msg = "Lỗi hệ thống";
        if (err.response && err.response.data) {
          if (err.response.status === 422 && err.response.data.errors) {
            const backendErrors = err.response.data.errors;
            for (let key in backendErrors) this.errors[key] = backendErrors[key][0];
            msg = "Dữ liệu không hợp lệ, vui lòng kiểm tra lại!";
          } else if (err.response.data.message) {
            msg = err.response.data.message;
          }
        }
        this.formError = "❌ " + msg;
        this.$bvToast.toast(this.formError, {
          title: "❌ Thất bại",
          variant: "danger",
          solid: true,
          autoHideDelay: 4000,
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
