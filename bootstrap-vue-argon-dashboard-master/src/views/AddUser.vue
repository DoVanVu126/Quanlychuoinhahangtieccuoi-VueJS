<template>
  <div class="container mt-5">
    <h2>Thêm User</h2>
    <b-form @submit.prevent="addUser">
      <!-- Username -->
      <b-form-group label="Tên đăng nhập">
        <b-form-input v-model="form.username" required></b-form-input>
      </b-form-group>

      <!-- Email -->
      <b-form-group label="Email">
        <b-form-input type="email" v-model="form.email" required></b-form-input>
      </b-form-group>

      <!-- Password -->
      <b-form-group label="Mật khẩu">
        <b-form-input type="password" v-model="form.password" required></b-form-input>
      </b-form-group>

      <!-- Phone -->
      <b-form-group label="Số điện thoại">
        <b-form-input type="tel" v-model="form.phone" placeholder="Nhập số điện thoại"></b-form-input>
      </b-form-group>

      <!-- Address -->
      <b-form-group label="Địa chỉ">
        <b-form-input type="text" v-model="form.address" placeholder="Nhập địa chỉ"></b-form-input>
      </b-form-group>

      <!-- Role -->
      <b-form-group label="Vai trò">
        <b-form-select v-model="form.role" :options="roleOptions" required></b-form-select>
      </b-form-group>

      <!-- Upload avatar -->
      <b-form-group label="Ảnh đại diện">
        <b-form-file
          @change="handleImageUpload"
          accept="image/*"
          browse-text="Chọn ảnh"
          placeholder="Chưa chọn ảnh nào"
        ></b-form-file>

        <!-- Preview ảnh -->
        <div v-if="previewImage" class="mt-3 text-center">
          <img :src="previewImage" alt="Preview" class="img-thumbnail" style="max-width: 200px;" />
        </div>
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
      form: {
        username: "",
        email: "",
        password: "",
        phone: "",
        address: "",
        role: "customer",
      },
      imageFile: null,
      previewImage: null,
      roleOptions: [
        { value: "admin", text: "Admin" },
        { value: "staff", text: "Nhân viên" },
        { value: "customer", text: "Khách hàng" },
      ],
    };
  },
  methods: {
    handleImageUpload(e) {
      const file = e.target.files[0];
      if (file) {
        this.imageFile = file;
        this.previewImage = URL.createObjectURL(file);
      }
    },
    async addUser() {
      try {
        const formData = new FormData();
        // Gửi dữ liệu, đảm bảo không undefined
        formData.append("username", this.form.username || "");
        formData.append("email", this.form.email || "");
        formData.append("password", this.form.password || "");
        formData.append("role", this.form.role || "customer");
        formData.append("phone", this.form.phone || "");
        formData.append("address", this.form.address || "");
        if (this.imageFile) formData.append("image", this.imageFile);

        const res = await api.post("/users", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        alert("✅ Đã thêm user: " + this.form.username);
        this.$router.push("/users");
      } catch (err) {
        // 🔹 Log lỗi chi tiết để biết field nào sai
        console.error("❌ Lỗi thêm user:", err.response ? err.response.data : err);
        if (err.response && err.response.data && err.response.data.errors) {
          const errors = err.response.data.errors;
          let msg = Object.keys(errors)
            .map(key => `${key}: ${errors[key].join(", ")}`)
            .join("\n");
          alert("Thêm user thất bại:\n" + msg);
        } else {
          alert("Thêm user thất bại! Kiểm tra console để xem chi tiết.");
        }
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
</style>
