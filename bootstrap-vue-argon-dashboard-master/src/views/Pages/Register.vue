<template>
  <div class="register-page">
    <h2>Tạo tài khoản</h2>
    <input v-model="name" placeholder="Họ và tên" />
    <input v-model="email" placeholder="Email" />
    <input v-model="password" type="password" placeholder="Mật khẩu" />
    <button @click="register">Đăng ký</button>
  </div>
</template>

<script>
export default {
  data() {
    return { name: "", email: "", password: "" };
  },
  methods: {
    register() {
      // Giả lập tạo tài khoản
      const user = { name: this.name, email: this.email };
      localStorage.setItem("user", JSON.stringify(user));
      this.$router.push("/");
    },
  },
};
</script>
