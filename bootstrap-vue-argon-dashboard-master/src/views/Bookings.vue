<template>
  <div class="container mt-4">
    <h2 class="mb-3 text-center">Danh sách người dùng</h2>

    <table class="table table-bordered table-striped">
      <thead class="table-dark">
        <tr>
          <th>ID</th>
          <th>Tên đăng nhập</th>
          <th>Email</th>
          <th>Ảnh đại diện</th>
          <th>Vai trò</th>
          <th>Ngày tạo</th>
        </tr>
      </thead>

      <tbody>
        <tr v-for="user in users" :key="user.user_id">
          <td>{{ user.user_id }}</td>
          <td>{{ user.username }}</td>
          <td>{{ user.email }}</td>
          <td>
            <img
              v-if="user.image_url"
              :src="user.image_url"
              alt="Avatar"
              width="60"
              height="60"
              class="rounded-circle"
            />
            <span v-else>Không có</span>
          </td>
          <td>{{ user.role }}</td>
          <td>{{ formatDate(user.created_at) }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "Users",
  data() {
    return { users: [] };
  },
  mounted() {
    axios
      .get("http://localhost:8088/users")
      .then((res) => (this.users = res.data))
      .catch((err) => console.error("Lỗi:", err));
  },
};
</script>
