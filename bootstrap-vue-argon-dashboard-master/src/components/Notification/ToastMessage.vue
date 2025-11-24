<template>
  <div class="toast-container">
    <div
      v-for="(toast, index) in toasts"
      :key="toast.id"
      :class="['toast', toast.type]"
    >
      <strong>{{ toast.title }}</strong>
      <p>{{ toast.message }}</p>
      <button @click="removeToast(index)">×</button>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      toasts: []
    };
  },
  methods: {
    addToast(toast) {
      toast.id = Date.now();
      this.toasts.push(toast);

      // 3 giây tự động ẩn
      setTimeout(() => {
        const i = this.toasts.findIndex(t => t.id === toast.id);
        if (i !== -1) this.toasts.splice(i, 1);
      }, 3000);
    },
    removeToast(index) {
      this.toasts.splice(index, 1);
    }
  }
};
</script>

<style scoped>
.toast-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 9999;
}

.toast {
  background: #fff;
  padding: 10px 15px;
  margin-bottom: 10px;
  border-radius: 6px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.2);
  min-width: 250px;
  position: relative;
}

.toast button {
  position: absolute;
  top: 5px;
  right: 8px;
  border: none;
  background: transparent;
  font-size: 16px;
  cursor: pointer;
}

.toast.success { border-left: 4px solid #28a745; }
.toast.info { border-left: 4px solid #007bff; }
.toast.warning { border-left: 4px solid #ffc107; }
.toast.error { border-left: 4px solid #dc3545; }
</style>
