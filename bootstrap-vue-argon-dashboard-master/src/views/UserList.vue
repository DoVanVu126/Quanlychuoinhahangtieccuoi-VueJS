<template>
  <div>
    <h3>Danh sách người dùng</h3>
    <ul>
      <li v-for="user in users" :key="user.id">{{ user.name }}</li>
    </ul>
  </div>
</template>

<script>
import api from '../api.js';

export default {
  data() {
    return { users: [] };
  },
  mounted() {
    api.get('/users')
      .then(res => {
        this.users = res.data;
      })
      .catch(err => console.error('Lỗi:', err));
  }
};
</script>
