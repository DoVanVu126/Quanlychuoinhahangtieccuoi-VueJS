<template>
  <div class="p-4">
    <h3>Danh sách người dùng</h3>
    <ul v-if="users.length">
      <li v-for="user in users" :key="user.id">{{ user.name }}</li>
    </ul>
    <p v-else>Đang tải...</p>
  </div>
</template>

<script>
import api from '../axios.js'

export default {
  data() {
    return {
      users: [],
    }
  },
  mounted() {
    this.loadUsers()
  },
  methods: {
    async loadUsers() {
      try {
        const res = await api.get('/users')
        this.users = res.data
      } catch (err) {
        console.error('Lỗi tải dữ liệu:', err)
      }
    }
  }
}
</script>
