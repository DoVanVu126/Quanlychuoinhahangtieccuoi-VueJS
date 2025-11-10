<template>
  <div class="services">
    <h2>Danh sách dịch vụ</h2>
    <div v-if="loading">Đang tải...</div>
    <div v-else-if="error">{{ error }}</div>
    <div v-else>
      <div v-for="service in services" :key="service.service_id" class="service-card">
        <img :src="service.image_url || placeholder" alt="Service Image" class="service-img"/>
        <h3>{{ service.name }}</h3>
        <p>{{ service.description }}</p>
        <p>Giá: {{ service.price }} VND</p>
        <p>Trạng thái: {{ service.status }}</p>
        <p>Nhà hàng: {{ service.restaurant?.name || 'Chưa có' }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const services = ref([])
const loading = ref(true)
const error = ref(null)
const placeholder = 'https://via.placeholder.com/200x200?text=No+Image'

const fetchServices = async () => {
  try {
    const res = await axios.get('http://localhost:8088/api/services')
    services.value = res.data
  } catch (err) {
    error.value = 'Lấy danh sách dịch vụ thất bại'
    console.error(err)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchServices()
})
</script>

<style scoped>
.services {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.service-card {
  border: 1px solid #ccc;
  padding: 16px;
  border-radius: 8px;
}
.service-img {
  width: 200px;
  height: 200px;
  object-fit: cover;
}
</style>
