<template>
  <div>
    <h2>Danh sách người dùng</h2>
    <ul>
      <li v-for="user in users" :key="user.id">
        {{ user.name }} - {{ user.email }}
      </li>
    </ul>
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
