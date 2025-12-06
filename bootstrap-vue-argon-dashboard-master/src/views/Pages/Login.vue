<template>
  <div class="loginpage-container">
    <div class="loginpage-box">
      <h2 class="loginpage-title">Đăng nhập</h2>

      <!-- Thông báo lỗi -->
      <p v-if="errorMessage" class="loginpage-error">{{ errorMessage }}</p>

      <input
        v-model="email"
        type="text"
        class="loginpage-input"
        placeholder="Email"
      />

      <!-- Nhóm mật khẩu + icon show/hide -->
      <div class="loginpage-password-group">
        <input
          v-model="password"
          :type="showPassword ? 'text' : 'password'"
          class="loginpage-input"
          placeholder="Mật khẩu"
        />
        <span class="loginpage-eye" @click="showPassword = !showPassword">
          {{ showPassword ? "👁️" : "👁️‍🗨️" }}
        </span>
      </div>

      <button @click="login" class="loginpage-btn" :disabled="loading">
        {{ loading ? "Đang xử lý..." : "Đăng nhập" }}
      </button>
    </div>
  </div>
</template>

<script>
import axios from "@/axios"; // nếu bạn đã cấu hình axios baseURL

export default {
  data() {
    return {
      email: "",
      password: "",
      showPassword: false, // 👁️ Thêm biến show mật khẩu
      errorMessage: "",
      loading: false,
    };
  },

  methods: {
    async login() {
      this.errorMessage = "";
      this.loading = true;

      try {
        const res = await axios.post("/login", {
          email: this.email,
          password: this.password,
        });

        localStorage.setItem("user", JSON.stringify(res.data.user));
        localStorage.setItem("token", res.data.token);

        this.$router.push("/home");
      } catch (error) {
        this.errorMessage =
          (error.response &&
            error.response.data &&
            error.response.data.message) ||
          "Đăng nhập thất bại!";
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>

<style scoped>
/* ================================
   LOGIN PAGE CSS (ĐẶT TÊN RIÊNG)
   ================================ */
.loginpage-container {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #f3f4f6;
}

.loginpage-box {
  width: 350px;
  padding: 30px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  animation: loginpageFadeIn 0.4s ease;
}

@keyframes loginpageFadeIn {
  from {
    opacity: 0;
    transform: translateY(15px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.loginpage-title {
  text-align: center;
  margin-bottom: 20px;
}

.loginpage-input {
  width: 100%;
  padding: 12px;
  margin-bottom: 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 15px;
  transition: 0.25s;
}

.loginpage-input:focus {
  border-color: #4f46e5;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.2);
  outline: none;
}

/* Nhóm chứa input + icon */
.loginpage-password-group {
  position: relative;
  width: 100%;
}

/* Icon con mắt */
.loginpage-eye {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  cursor: pointer;
  font-size: 18px;
  opacity: 0.6;
  transition: 0.25s;
}

.loginpage-eye:hover {
  opacity: 1;
}

.loginpage-btn {
  width: 100%;
  padding: 12px;
  background: #4f46e5;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
  transition: 0.25s;
}

.loginpage-btn:hover {
  background: #4338ca;
}

.loginpage-btn:disabled {
  opacity: 0.6;
  cursor: default;
}

.loginpage-error {
  color: #dc2626;
  margin-bottom: 10px;
  text-align: center;
}
</style>
