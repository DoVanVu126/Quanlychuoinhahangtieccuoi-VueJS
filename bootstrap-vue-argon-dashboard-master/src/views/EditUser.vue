<template>
  <div class="container mt-5">
    <h2 class="mb-4 text-primary">👤 Sửa Người Dùng</h2>

    <b-form @submit.prevent="updateUser">
      <!-- Tên đăng nhập -->
      <b-form-group label="Tên đăng nhập">
        <b-form-input v-model="form.username" required></b-form-input>
      </b-form-group>

      <!-- Email -->
      <b-form-group label="Email">
        <b-form-input type="email" v-model="form.email" required></b-form-input>
      </b-form-group>

      <!-- Phone -->
      <b-form-group label="Số điện thoại">
        <b-form-input type="tel" v-model="form.phone" placeholder="Nhập số điện thoại"></b-form-input>
      </b-form-group>

      <!-- Address -->
      <b-form-group label="Địa chỉ">
        <b-form-input type="text" v-model="form.address" placeholder="Nhập địa chỉ"></b-form-input>
      </b-form-group>

      <!-- Vai trò -->
      <b-form-group label="Vai trò">
        <b-form-select v-model="form.role">
          <b-form-select-option value="admin">Admin</b-form-select-option>
          <b-form-select-option value="staff">Nhân viên</b-form-select-option>
          <b-form-select-option value="customer">Khách hàng</b-form-select-option>
        </b-form-select>
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
        ></b-form-file>
      </b-form-group>

      <!-- Mật khẩu mới (tùy chọn) -->
      <b-form-group label="Mật khẩu mới (nếu muốn đổi)">
        <b-form-input type="password" v-model="form.password"></b-form-input>
      </b-form-group>

      <!-- Nút thao tác -->
      <div class="d-flex gap-2 mt-3">
        <b-button type="submit" variant="primary">💾 Cập nhật</b-button>
        <b-button variant="secondary" @click="$router.push('/users')">
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
    };
  },
  mounted() {
    this.loadUser();
  },
  methods: {
    // ✅ Lấy thông tin người dùng theo ID
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

    // ✅ Hiển thị đúng URL ảnh
    getImageUrl(url) {
      if (!url) return null;
      if (url.startsWith("http")) return url;
      return `http://127.0.0.1:8088/${url.replace(/^\/+/, "")}`;
    },

    // ✅ Cập nhật người dùng (gửi FormData để upload ảnh)
    async updateUser() {
      try {
        const formData = new FormData();
        formData.append("username", this.form.username);
        formData.append("email", this.form.email);
        formData.append("role", this.form.role);
        formData.append("phone", this.form.phone);
        formData.append("address", this.form.address);

        if (this.form.password) {
          formData.append("password", this.form.password);
        }
        if (this.form.newImage) {
          formData.append("image", this.form.newImage);
        }

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

        alert("Cập nhật thất bại!");
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
</style>
