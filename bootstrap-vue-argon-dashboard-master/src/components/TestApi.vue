<template>
  <div>
    <h2>Dữ liệu từ Laravel API:</h2>
    <pre>{{ data }}</pre>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '../api' // 🔹 import file api.js bạn đã tạo

const data = ref(null)

onMounted(async () => {
  try {
    const res = await api.get('/test') // 🔹 gọi API Laravel
    data.value = res.data
  } catch (err) {
    console.error(err)
  }
})
</script>
