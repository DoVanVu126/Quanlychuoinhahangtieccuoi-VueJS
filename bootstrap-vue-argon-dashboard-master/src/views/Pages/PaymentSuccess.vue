<template>
  <div class="success-container">
    <div class="success-card">
      <h2>{{ $t('payment_success_title') }}</h2>
      <p>{{ $t('payment_success_msg') }}</p>
      <router-link to="/" class="btn btn-primary">{{ $t('intro') }}</router-link>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PaymentSuccess'
};
</script>

<style scoped>
.success-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 80vh;
  background: #f8f9fa;
}
.success-card {
  background: #fff;
  padding: 2rem 2.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 16px rgba(0,0,0,0.08);
  min-width: 350px;
  text-align: center;
}
.btn-primary {
  margin-top: 1.5rem;
  width: 100%;
  font-size: 1.1rem;
}
</style>
